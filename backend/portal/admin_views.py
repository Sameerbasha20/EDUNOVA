import json
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import DataError, IntegrityError, connection, transaction
from django.utils.crypto import get_random_string
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admissions.models import AdmissionEnquiry
from .roles import IsAdmin, get_role, log_action
from .views import row, rows, serialise, table_exists, student_profile_payload
from .teacher_views import teacher_classes, teacher_profile_payload

User = get_user_model()

# Excludes visually confusable characters (0/O, 1/l/I) -- these temp
# passwords are read off a screen and hand-typed into a login form, so a
# normal random charset silently produces unloginable accounts.
_TEMP_PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"


def _generate_temp_password():
    return get_random_string(10, allowed_chars=_TEMP_PASSWORD_CHARS)


class AdminMixin:
    permission_classes = [IsAdmin]


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class AdminDashboardView(AdminMixin, APIView):
    def get(self, request):
        def count(table, where=""):
            if not table_exists(table):
                return 0
            r = row(f"SELECT COUNT(*)::int AS c FROM {table} {where}")
            return r["c"] if r else 0

        pending_admissions = AdmissionEnquiry.objects.exclude(status__in=["Confirmed", "Rejected"]).count()
        total_students = count("portal_student_profile")
        total_teachers = count("portal_teacher_profile")
        total_parents = count("portal_parent_profile")
        total_employees = count("portal_employee")
        open_leaves = count("portal_leave", "WHERE status='Pending'")
        fee_collected_month = 0
        if table_exists("portal_payment"):
            r = row(
                "SELECT COALESCE(SUM(amount_paid),0)::float AS total FROM portal_payment "
                "WHERE status='Success' AND date_trunc('month', paid_at) = date_trunc('month', now())"
            )
            fee_collected_month = r["total"] if r else 0
        library_out = count("portal_library_transaction", "WHERE return_date IS NULL")
        recent_admissions = list(
            AdmissionEnquiry.objects.order_by("-submitted_at").values(
                "registration_number", "applicant_name", "target_class", "status", "submitted_at"
            )[:8]
        )
        return Response(serialise({
            "pending_admissions": pending_admissions,
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_parents": total_parents,
            "total_employees": total_employees,
            "open_leaves": open_leaves,
            "fee_collected_this_month": fee_collected_month,
            "library_books_out": library_out,
            "recent_admissions": recent_admissions,
        }))


# ---------------------------------------------------------------------------
# Admissions workflow (Registered -> Verification -> Screening -> Fee_Pending
# -> Confirmed/Rejected), including credential generation on Confirmed.
# ---------------------------------------------------------------------------
NEXT_STATUS = {
    "Registered": "Verification",
    "Verification": "Screening",
    "Screening": "Fee_Pending",
    "Fee_Pending": "Confirmed",
}


def _unique_username(base):
    base = (base or "user").lower().replace(" ", ".")
    candidate = base
    i = 1
    while User.objects.filter(username=candidate).exists():
        i += 1
        candidate = f"{base}{i}"
    return candidate


def _ensure_group(name):
    grp, _ = Group.objects.get_or_create(name=name)
    return grp


def current_academic_year():
    """Indian school year convention: April-March, expressed as 'YYYY-YY'."""
    today = date.today()
    start_year = today.year if today.month >= 4 else today.year - 1
    return f"{start_year}-{(start_year + 1) % 100:02d}"


def _enroll_student_in_class(student, class_id):
    """Idempotent: enrolls a student into a class for the current academic
    year with an auto-assigned roll number. Returns (class_name, error) --
    exactly one of the two will be non-None. No-op (None, None) if class_id
    is falsy, so callers can pass an optional/blank value through directly."""
    if not class_id:
        return None, None
    if not (table_exists("portal_student_enrollment") and table_exists("portal_class")):
        return None, "Portal schema has not been applied."
    class_row = row("SELECT id, name, section FROM portal_class WHERE id=%s", [class_id])
    if not class_row:
        return None, "Class not found."
    academic_year = current_academic_year()
    next_roll = row(
        "SELECT COALESCE(MAX(roll_number), 0) + 1 AS n FROM portal_student_enrollment "
        "WHERE class_id=%s AND academic_year=%s",
        [class_id, academic_year],
    )["n"]
    with connection.cursor() as cursor:
        # A student can only have one active class per academic year. If
        # they already have an enrollment for this year in a *different*
        # class, update it in place instead of inserting a second row --
        # otherwise current_class_for_student() is left to silently guess
        # between two enrollments via ORDER BY ... LIMIT 1 (found live in
        # QA testing: two students each ended up with two different active
        # classes for the same year, see qa_test_report.md TC-EXPL-01).
        cursor.execute(
            "UPDATE portal_student_enrollment SET class_id=%s, roll_number=%s "
            "WHERE student_id=%s AND academic_year=%s AND class_id <> %s",
            [class_id, next_roll, student.id, academic_year, class_id],
        )
        cursor.execute(
            "INSERT INTO portal_student_enrollment (student_id, class_id, academic_year, roll_number) "
            "VALUES (%s,%s,%s,%s) ON CONFLICT (student_id, class_id, academic_year) DO NOTHING",
            [student.id, class_id, academic_year, next_roll],
        )
    return f"{class_row['name']}-{class_row['section']}", None


def _generate_credentials(enquiry, class_id=None, route_id=None, vehicle_id=None, pickup_point=None):
    """Creates a Parent account (if needed) + Student account for a Confirmed
    admission enquiry, and links both back onto portal_* tables. Idempotent:
    if the enquiry already has student_user_id/parent_user_id set, does
    nothing and returns the existing accounts.

    If class_id is given, also enrolls the student into that class for the
    current academic year (portal_student_enrollment) -- this is the pivot
    the rest of daily operations (fees, timetable, LMS access) already
    derive live from, so assigning a class here is what actually activates
    them, not a separate step per downstream feature.

    If route_id and vehicle_id are given, also creates a
    portal_transport_allocation row -- unlike class/fees/LMS, transport has
    no live-derived fallback, so it only happens when the admin explicitly
    picks a route/vehicle at confirmation time (normally because the
    enquiry's needs_transport flag was set at intake)."""
    if enquiry.student_user_id:
        student = User.objects.filter(id=enquiry.student_user_id).first()
        parent = User.objects.filter(id=enquiry.parent_user_id).first() if enquiry.parent_user_id else None
        return student, parent, None

    temp_password = _generate_temp_password()
    parent_temp_password = _generate_temp_password()

    with transaction.atomic():
        parent = User.objects.filter(email__iexact=enquiry.parent_email).first()
        parent_is_new = parent is None
        if parent is None:
            parent = User.objects.create_user(
                username=_unique_username(enquiry.parent_email.split("@")[0]),
                email=enquiry.parent_email,
                password=parent_temp_password,
                first_name=enquiry.parent_name.split(" ")[0] if enquiry.parent_name else "",
                last_name=" ".join(enquiry.parent_name.split(" ")[1:]) if enquiry.parent_name else "",
            )
            _ensure_group("Parent")
            parent.groups.add(Group.objects.get(name="Parent"))

        student_username = _unique_username(f"{enquiry.applicant_name}.{enquiry.registration_number[-4:]}")
        student = User.objects.create_user(
            username=student_username,
            email=f"{student_username}@students.edunova.edu",
            password=temp_password,
            first_name=enquiry.applicant_name.split(" ")[0] if enquiry.applicant_name else "",
            last_name=" ".join(enquiry.applicant_name.split(" ")[1:]) if enquiry.applicant_name else "",
        )
        _ensure_group("Student")
        student.groups.add(Group.objects.get(name="Student"))

        with connection.cursor() as cursor:
            if table_exists("portal_user_profile"):
                cursor.execute(
                    "INSERT INTO portal_user_profile (user_id, user_type) VALUES (%s,'Parent') "
                    "ON CONFLICT (user_id) DO NOTHING",
                    [parent.id],
                )
                cursor.execute(
                    "INSERT INTO portal_user_profile (user_id, user_type) VALUES (%s,'Student') "
                    "ON CONFLICT (user_id) DO NOTHING",
                    [student.id],
                )
            if table_exists("portal_parent_profile"):
                parent_code = f"PAR-{get_random_string(8).upper()}"
                cursor.execute(
                    "INSERT INTO portal_parent_profile (user_id, address, parent_code) VALUES (%s,%s,%s) "
                    "ON CONFLICT (user_id) DO NOTHING",
                    [parent.id, enquiry.address, parent_code],
                )
            if table_exists("portal_student_profile"):
                admission_number = f"STU-{enquiry.registration_number[-8:]}"
                cursor.execute(
                    "INSERT INTO portal_student_profile (user_id, parent_id, admission_number, date_of_birth, gender) "
                    "VALUES (%s,%s,%s,%s,%s) ON CONFLICT (user_id) DO NOTHING",
                    [student.id, parent.id, admission_number, enquiry.date_of_birth, enquiry.gender],
                )

            class_name, class_assignment_error = _enroll_student_in_class(student, class_id)

            transport_assigned = None
            transport_assignment_error = None
            if route_id and vehicle_id:
                if table_exists("portal_transport_allocation") and table_exists("portal_route") and table_exists("portal_vehicle"):
                    route_row = row("SELECT route_name FROM portal_route WHERE id=%s", [route_id])
                    vehicle_row = row("SELECT vehicle_number FROM portal_vehicle WHERE id=%s", [vehicle_id])
                    if route_row and vehicle_row:
                        cursor.execute(
                            "INSERT INTO portal_transport_allocation (student_id, vehicle_id, route_id, pickup_point) "
                            "VALUES (%s,%s,%s,%s) ON CONFLICT (student_id) DO NOTHING",
                            [student.id, vehicle_id, route_id, pickup_point or enquiry.preferred_pickup_point],
                        )
                        transport_assigned = f"{route_row['route_name']} ({vehicle_row['vehicle_number']})"
                    else:
                        transport_assignment_error = "Route or vehicle not found."
                else:
                    transport_assignment_error = "Portal schema has not been applied."

        enquiry.student_user_id = student.id
        enquiry.parent_user_id = parent.id
        enquiry.save(update_fields=["student_user_id", "parent_user_id"])

    credentials = {
        "student_username": student.username,
        "student_temp_password": temp_password,
        "parent_username": parent.username,
        "parent_temp_password": parent_temp_password if parent_is_new else None,
        "parent_account_reused": not parent_is_new,
        "class_assigned": class_name,
        "class_assignment_error": class_assignment_error,
        "transport_assigned": transport_assigned,
        "transport_assignment_error": transport_assignment_error,
    }
    return student, parent, credentials


def assign_role_id(user, role, department=None):
    """Create (or backfill) the role-specific profile row with a fresh ID
    number for a user who doesn't already have one: admission_number
    (Student), employee_code (Teacher), parent_code (Parent). Idempotent --
    returns the existing id_number untouched if one is already set. Returns
    None for roles with no such concept (Admin/Employee)."""
    if role == "Student" and table_exists("portal_student_profile"):
        existing = row("SELECT admission_number FROM portal_student_profile WHERE user_id=%s", [user.id])
        if existing:
            return existing["admission_number"]
        admission_number = f"STU-{get_random_string(8).upper()}"
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_student_profile (user_id, admission_number) VALUES (%s,%s)",
                [user.id, admission_number],
            )
        return admission_number

    if role == "Teacher" and table_exists("portal_teacher_profile"):
        existing = row("SELECT employee_code, department FROM portal_teacher_profile WHERE user_id=%s", [user.id])
        if existing and existing["employee_code"]:
            if department and not existing.get("department"):
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE portal_teacher_profile SET department=%s WHERE user_id=%s",
                        [department, user.id],
                    )
            return existing["employee_code"]
        employee_code = f"EMP-{get_random_string(8).upper()}"
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_teacher_profile (user_id, employee_code, department) VALUES (%s,%s,%s) "
                "ON CONFLICT (user_id) DO UPDATE SET employee_code=EXCLUDED.employee_code, "
                "department=COALESCE(EXCLUDED.department, portal_teacher_profile.department)",
                [user.id, employee_code, department],
            )
        return employee_code

    if role == "Parent" and table_exists("portal_parent_profile"):
        existing = row("SELECT parent_code FROM portal_parent_profile WHERE user_id=%s", [user.id])
        if existing and existing["parent_code"]:
            return existing["parent_code"]
        parent_code = f"PAR-{get_random_string(8).upper()}"
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_parent_profile (user_id, parent_code) VALUES (%s,%s) "
                "ON CONFLICT (user_id) DO UPDATE SET parent_code=EXCLUDED.parent_code",
                [user.id, parent_code],
            )
        return parent_code

    return None


class AdmissionListView(AdminMixin, APIView):
    def get(self, request):
        qs = AdmissionEnquiry.objects.all().order_by("-submitted_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        data = list(qs.values(
            "registration_number", "applicant_name", "date_of_birth", "gender", "target_class",
            "parent_name", "parent_phone", "parent_email", "scholarship_applied", "status",
            "rejection_reason", "submitted_at", "needs_transport", "preferred_pickup_point",
        ))
        return Response(serialise(data))


class AdmissionActionView(AdminMixin, APIView):
    """POST { action: 'advance' | 'reject' | 'confirm', reason?, class_id?,
    route_id?, vehicle_id?, pickup_point? } to move an application through
    Verification -> Screening -> Fee_Pending -> Confirmed, or reject it at
    any stage. Advancing to Confirmed generates student+parent logins;
    class_id also enrolls the student into that class (which is what
    actually makes their fees, timetable, and LMS access apply -- those are
    computed live from class enrollment, not separate steps); route_id +
    vehicle_id also creates a transport allocation (normally only relevant
    when the enquiry's needs_transport flag was set at intake)."""

    def post(self, request, registration_number):
        try:
            enquiry = AdmissionEnquiry.objects.get(registration_number=registration_number)
        except AdmissionEnquiry.DoesNotExist:
            return Response({"detail": "Application not found."}, status=404)

        action = request.data.get("action")
        if action == "reject":
            enquiry.status = "Rejected"
            enquiry.rejection_reason = request.data.get("reason", "")
            enquiry.reviewed_by = request.user.get_full_name() or request.user.username
            enquiry.save()
            log_action(request.user, "admission.reject", "admission", registration_number, {"reason": enquiry.rejection_reason})
            return Response(serialise({"status": enquiry.status}))

        if action == "advance":
            nxt = NEXT_STATUS.get(enquiry.status)
            if not nxt:
                return Response({"detail": f"Cannot advance from status '{enquiry.status}'."}, status=400)
            enquiry.status = nxt
            enquiry.reviewed_by = request.user.get_full_name() or request.user.username
            enquiry.save()
            log_action(request.user, "admission.advance", "admission", registration_number, {"to": nxt})
            payload = {"status": enquiry.status}
            if nxt == "Confirmed":
                class_id = request.data.get("class_id")
                route_id = request.data.get("route_id")
                vehicle_id = request.data.get("vehicle_id")
                pickup_point = request.data.get("pickup_point")
                student, parent, credentials = _generate_credentials(
                    enquiry, class_id=class_id, route_id=route_id, vehicle_id=vehicle_id, pickup_point=pickup_point,
                )
                if credentials:
                    payload["credentials"] = credentials
                    log_action(request.user, "admission.credentials_generated", "admission", registration_number,
                               {"student_username": credentials["student_username"]})
            return Response(serialise(payload))

        return Response({"detail": "Unknown action. Use 'advance' or 'reject'."}, status=400)


# ---------------------------------------------------------------------------
# Users / RBAC
# ---------------------------------------------------------------------------
class UserListView(AdminMixin, APIView):
    def get(self, request):
        role_filter = request.query_params.get("role")
        data = rows(
            """
            SELECT u.id, u.username, u.email, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS name,
                   u.is_active, u.date_joined,
                   COALESCE(p.user_type, 'Student') AS role
            FROM auth_user u
            LEFT JOIN portal_user_profile p ON p.user_id = u.id
            ORDER BY u.date_joined DESC
            """
        ) if table_exists("portal_user_profile") else rows(
            "SELECT id, username, email, COALESCE(first_name || ' ' || last_name, username) AS name, "
            "is_active, date_joined, 'Student' AS role FROM auth_user ORDER BY date_joined DESC"
        )
        if role_filter:
            data = [d for d in data if d["role"] == role_filter]
        return Response(serialise(data))

    def post(self, request):
        """Create a user of any role with a temporary password."""
        d = request.data
        role = d.get("role")
        if role not in ("Student", "Teacher", "Parent", "Admin", "Employee"):
            return Response({"detail": "role must be one of Student/Teacher/Parent/Admin/Employee."}, status=400)
        if User.objects.filter(email__iexact=d.get("email", "")).exists():
            return Response({"detail": "A user with this email already exists."}, status=400)

        department = (d.get("department") or "").strip()
        class_id = d.get("class_id")
        subject_id = d.get("subject_id")
        if role == "Teacher":
            if not department:
                return Response({"detail": "department is required for Teacher accounts."}, status=400)
            if not class_id or not subject_id:
                return Response(
                    {"detail": "class_id and subject_id are required to assign the new teacher to a class/subject."},
                    status=400,
                )
            if table_exists("portal_class") and not row("SELECT 1 AS ok FROM portal_class WHERE id=%s", [class_id]):
                return Response({"detail": "Invalid class_id."}, status=400)
            if table_exists("portal_subject") and not row("SELECT 1 AS ok FROM portal_subject WHERE id=%s", [subject_id]):
                return Response({"detail": "Invalid subject_id."}, status=400)

        temp_password = _generate_temp_password()
        username = _unique_username(d.get("username") or d.get("email", "user").split("@")[0])
        user = User.objects.create_user(
            username=username,
            email=d.get("email"),
            password=temp_password,
            first_name=d.get("first_name", ""),
            last_name=d.get("last_name", ""),
            is_staff=(role == "Admin"),
        )
        _ensure_group(role)
        user.groups.add(Group.objects.get(name=role))
        if table_exists("portal_user_profile"):
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO portal_user_profile (user_id, user_type, phone_number) VALUES (%s,%s,%s) "
                    "ON CONFLICT (user_id) DO UPDATE SET user_type=EXCLUDED.user_type",
                    [user.id, role, d.get("phone_number", "")],
                )
        id_number = assign_role_id(user, role, department=department if role == "Teacher" else None)
        if role == "Teacher" and table_exists("portal_academic_allocation"):
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO portal_academic_allocation (class_id, subject_id, teacher_id) VALUES (%s,%s,%s) "
                    "ON CONFLICT (class_id, subject_id, teacher_id) DO NOTHING",
                    [class_id, subject_id, user.id],
                )
        class_name = class_assignment_error = None
        if role == "Student":
            class_name, class_assignment_error = _enroll_student_in_class(user, class_id)
        log_action(request.user, "user.create", "user", user.id, {"role": role, "id_number": id_number})
        return Response({
            "id": user.id, "username": user.username, "temp_password": temp_password,
            "role": role, "id_number": id_number,
            "class_assigned": class_name, "class_assignment_error": class_assignment_error,
        })


class UserDetailView(AdminMixin, APIView):
    def patch(self, request, user_id):
        try:
            target = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)
        if "is_active" in request.data:
            target.is_active = bool(request.data["is_active"])
            target.save(update_fields=["is_active"])
            log_action(request.user, "user.set_active", "user", user_id, {"is_active": target.is_active})
        if "role" in request.data:
            new_role = request.data["role"]
            if new_role not in ("Student", "Teacher", "Parent", "Admin", "Employee"):
                return Response({"detail": "Invalid role."}, status=400)
            target.groups.clear()
            target.groups.add(_ensure_group(new_role))
            if table_exists("portal_user_profile"):
                with connection.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO portal_user_profile (user_id, user_type) VALUES (%s,%s) "
                        "ON CONFLICT (user_id) DO UPDATE SET user_type=EXCLUDED.user_type",
                        [user_id, new_role],
                    )
            id_number = assign_role_id(target, new_role)
            log_action(request.user, "user.set_role", "user", user_id, {"role": new_role, "id_number": id_number})
        return Response({"detail": "Updated."})

    def post(self, request, user_id):
        """Admin-triggered password reset."""
        try:
            target = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)
        temp_password = _generate_temp_password()
        target.set_password(temp_password)
        target.save(update_fields=["password"])
        log_action(request.user, "user.reset_password", "user", user_id, {})
        return Response({"detail": "Password reset.", "temp_password": temp_password})


class RolesView(AdminMixin, APIView):
    def get(self, request):
        roles = ["Student", "Teacher", "Parent", "Admin", "Employee"]
        counts = {}
        for r in roles:
            grp = Group.objects.filter(name=r).first()
            counts[r] = grp.user_set.count() if grp else 0
        return Response(counts)


class StudentListView(AdminMixin, APIView):
    """All students, optionally filtered by ?class_id=. Each row includes
    their current class (latest academic_year enrollment) for the class
    filter dropdown on the frontend."""

    def get(self, request):
        if not table_exists("portal_student_profile"):
            return Response([])
        class_id = request.query_params.get("class_id")
        sql = """
            SELECT u.id, COALESCE(NULLIF(trim(u.first_name || ' ' || u.last_name), ''), u.username) AS name,
                   u.email, u.is_active,
                   sp.admission_number, sp.status,
                   c.id AS class_id, (c.name || '-' || c.section) AS class_name, e.roll_number
            FROM auth_user u
            JOIN portal_student_profile sp ON sp.user_id = u.id
            -- A user demoted away from Student (role change) keeps their
            -- historical portal_student_profile row, but must stop showing
            -- up in the live Students directory.
            JOIN portal_user_profile p ON p.user_id = u.id AND p.user_type = 'Student'
            LEFT JOIN LATERAL (
                SELECT * FROM portal_student_enrollment se
                WHERE se.student_id = u.id ORDER BY se.academic_year DESC, se.id DESC LIMIT 1
            ) e ON true
            LEFT JOIN portal_class c ON c.id = e.class_id
        """
        params = []
        if class_id:
            sql += " WHERE c.id = %s"
            params.append(class_id)
        sql += " ORDER BY u.first_name, u.last_name, u.username"
        return Response(serialise(rows(sql, params)))


class StudentDetailView(AdminMixin, APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Student not found."}, status=404)
        return Response(student_profile_payload(user))


class TeacherListView(AdminMixin, APIView):
    """All teachers, optionally filtered by ?department= and/or ?class_id=
    (the latter via their portal_academic_allocation rows)."""

    def get(self, request):
        if not table_exists("portal_teacher_profile"):
            return Response([])
        department = request.query_params.get("department")
        class_id = request.query_params.get("class_id")
        sql = """
            SELECT DISTINCT u.id, COALESCE(NULLIF(trim(u.first_name || ' ' || u.last_name), ''), u.username) AS name,
                   u.email, u.is_active,
                   tp.employee_code, tp.department, tp.qualification, tp.specialization
            FROM auth_user u
            JOIN portal_teacher_profile tp ON tp.user_id = u.id
            -- A user demoted away from Teacher (role change) keeps their
            -- historical portal_teacher_profile row, but must stop showing
            -- up in the live Teachers directory.
            JOIN portal_user_profile p ON p.user_id = u.id AND p.user_type = 'Teacher'
        """
        conditions = []
        params = []
        if class_id and table_exists("portal_academic_allocation"):
            sql += " JOIN portal_academic_allocation aa ON aa.teacher_id = u.id"
            conditions.append("aa.class_id = %s")
            params.append(class_id)
        if department:
            conditions.append("tp.department = %s")
            params.append(department)
        if conditions:
            sql += " WHERE " + " AND ".join(conditions)
        sql += " ORDER BY name"
        return Response(serialise(rows(sql, params)))


class TeacherDetailView(AdminMixin, APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Teacher not found."}, status=404)
        payload = teacher_profile_payload(user)
        payload["classes"] = teacher_classes(user.id)
        return Response(payload)


class DepartmentListView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_teacher_profile"):
            return Response([])
        data = rows(
            "SELECT DISTINCT department FROM portal_teacher_profile "
            "WHERE department IS NOT NULL AND department <> '' ORDER BY department"
        )
        return Response([d["department"] for d in data])


# ---------------------------------------------------------------------------
# Generic small CRUD helper for simple lookup-style portal_* tables
# ---------------------------------------------------------------------------
class SimpleTableView(AdminMixin, APIView):
    table = None
    columns = ()          # columns accepted on create, in order
    order_by = "id"

    def get(self, request):
        if not table_exists(self.table):
            return Response([])
        return Response(serialise(rows(f"SELECT * FROM {self.table} ORDER BY {self.order_by}")))

    def post(self, request):
        if not table_exists(self.table):
            return Response({"detail": "Table not found. Apply the schema extension SQL first."}, status=400)
        # "" for an optional numeric/date/FK field (e.g. warden_id left blank)
        # is not a valid value for those column types -- treat it as "not
        # provided" the same way None is, instead of sending literal "" to
        # Postgres and letting it reject the whole insert.
        values = [None if request.data.get(c) == "" else request.data.get(c) for c in self.columns]
        placeholders = ",".join(["%s"] * len(self.columns))
        col_sql = ",".join(self.columns)
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"INSERT INTO {self.table} ({col_sql}) VALUES ({placeholders}) RETURNING id", values)
                new_id = cursor.fetchone()[0]
        except IntegrityError:
            # A duplicate unique value (ISBN, barcode, subject code, vehicle
            # number, ...) previously bubbled up as an unhandled 500 with a
            # raw Django debug traceback instead of a normal validation error.
            return Response({"detail": "A record with one of these unique values already exists."}, status=400)
        except DataError:
            # e.g. non-numeric text in an integer field, malformed date.
            return Response({"detail": "One of the fields has an invalid value for its type."}, status=400)
        log_action(request.user, f"{self.table}.create", self.table, new_id, dict(zip(self.columns, [str(v) for v in values])))
        return Response({"id": new_id, "detail": "Created."})


class ClassView(SimpleTableView):
    table = "portal_class"
    columns = ("name", "section", "curriculum", "room_number")
    order_by = "name, section"


class SubjectView(SimpleTableView):
    table = "portal_subject"
    columns = ("name", "subject_code", "type")
    order_by = "name"


class VehicleView(SimpleTableView):
    table = "portal_vehicle"
    columns = ("vehicle_number", "capacity", "driver_id", "gps_device_id", "maintenance_status")
    order_by = "vehicle_number"


class RouteView(SimpleTableView):
    table = "portal_route"
    columns = ("route_name", "start_point", "end_point")
    order_by = "route_name"


class TransportAllocationView(SimpleTableView):
    table = "portal_transport_allocation"
    columns = ("student_id", "vehicle_id", "route_id", "pickup_point")
    order_by = "id"


class FeeStructureView(SimpleTableView):
    table = "portal_fee_structure"
    columns = ("class_id", "term_name", "tuition_fee", "transport_fee", "hostel_fee", "total_amount")
    order_by = "class_id"


class PaymentListView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_payment"):
            return Response([])
        data = rows(
            """
            SELECT p.id, p.transaction_id, p.amount_paid, p.status, p.paid_at,
                   COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name,
                   fs.term_name
            FROM portal_payment p
            JOIN auth_user u ON u.id = p.student_id
            JOIN portal_fee_structure fs ON fs.id = p.fee_structure_id
            ORDER BY p.paid_at DESC LIMIT 200
            """
        )
        return Response(serialise(data))


# ---------------------------------------------------------------------------
# Library — barcode lookup, issue/return with automatic fine calculation
# ---------------------------------------------------------------------------
FINE_PER_DAY = 5  # rupees/day late, beyond due_date


class LibraryBookView(SimpleTableView):
    table = "portal_book"
    columns = ("title", "author", "isbn", "barcode_id", "quantity", "available_quantity", "book_type", "digital_file_url")
    order_by = "title"

    def get(self, request):
        barcode = request.query_params.get("barcode")
        if barcode:
            if not table_exists("portal_book"):
                return Response(None)
            book = row("SELECT * FROM portal_book WHERE barcode_id=%s OR isbn=%s", [barcode, barcode])
            return Response(serialise(book))
        return super().get(request)


class LibraryIssueView(AdminMixin, APIView):
    def post(self, request):
        if not table_exists("portal_library_transaction"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        book_id = request.data.get("book_id")
        borrower_id = request.data.get("borrower_id")
        if not book_id or not borrower_id:
            return Response({"detail": "book_id and borrower_id are required."}, status=400)
        try:
            days = int(request.data.get("loan_days", 14))
        except (TypeError, ValueError):
            return Response({"detail": "loan_days must be a number."}, status=400)
        if not row("SELECT 1 AS ok FROM auth_user WHERE id=%s", [borrower_id]):
            return Response({"detail": "Borrower not found."}, status=400)
        due = date.today() + timedelta(days=days)
        # SELECT ... FOR UPDATE inside the transaction so two concurrent issues
        # for the last copy of a book can't both read available_quantity=1 and
        # both succeed -- the second request blocks until the first commits,
        # then sees the decremented value.
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("SELECT available_quantity FROM portal_book WHERE id=%s FOR UPDATE", [book_id])
                    book_row = cursor.fetchone()
                    if not book_row:
                        return Response({"detail": "Book not found."}, status=404)
                    if book_row[0] < 1:
                        return Response({"detail": "No copies available."}, status=400)
                    cursor.execute(
                        "INSERT INTO portal_library_transaction (book_id, borrower_id, due_date) VALUES (%s,%s,%s) RETURNING id",
                        [book_id, borrower_id, due],
                    )
                    tid = cursor.fetchone()[0]
                    cursor.execute("UPDATE portal_book SET available_quantity = available_quantity - 1 WHERE id=%s", [book_id])
        except DataError:
            return Response({"detail": "Invalid book_id."}, status=400)
        log_action(request.user, "library.issue", "book", book_id, {"borrower_id": borrower_id, "due_date": str(due)})
        return Response({"id": tid, "due_date": due.isoformat(), "detail": "Book issued."})


class LibraryReturnView(AdminMixin, APIView):
    def post(self, request, transaction_id):
        if not table_exists("portal_library_transaction"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        today = date.today()
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT book_id, due_date, return_date FROM portal_library_transaction WHERE id=%s FOR UPDATE",
                    [transaction_id],
                )
                txn_row = cursor.fetchone()
                if not txn_row:
                    return Response({"detail": "Transaction not found."}, status=404)
                book_id, due_date, return_date = txn_row
                if return_date:
                    return Response({"detail": "Already returned."}, status=400)
                late_days = max(0, (today - due_date).days)
                fine = late_days * FINE_PER_DAY
                cursor.execute(
                    "UPDATE portal_library_transaction SET return_date=%s, fine_amount=%s WHERE id=%s",
                    [today, fine, transaction_id],
                )
                cursor.execute("UPDATE portal_book SET available_quantity = available_quantity + 1 WHERE id=%s", [book_id])
        log_action(request.user, "library.return", "transaction", transaction_id, {"fine": fine})
        return Response({"detail": "Book returned.", "late_days": late_days, "fine_amount": fine})


# ---------------------------------------------------------------------------
# Notices (broadcast) — reuses portal_notification
# ---------------------------------------------------------------------------
class NoticeBroadcastView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_notification"):
            return Response([])
        return Response(serialise(rows("SELECT * FROM portal_notification ORDER BY created_at DESC LIMIT 100")))

    def post(self, request):
        if not table_exists("portal_notification"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        d = request.data
        if not d.get("title") or not d.get("message"):
            return Response({"detail": "title and message are required."}, status=400)
        target_class_id = d.get("target_class_id") or None
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO portal_notification (sender_id, recipient_type, target_class_id, title, message) "
                    "VALUES (%s,%s,%s,%s,%s) RETURNING id",
                    [request.user.id, d.get("recipient_type", "All"), target_class_id, d.get("title"), d.get("message")],
                )
                nid = cursor.fetchone()[0]
        except (IntegrityError, DataError):
            return Response({"detail": "Invalid target_class_id."}, status=400)
        log_action(request.user, "notice.broadcast", "notification", nid, {"recipient_type": d.get("recipient_type", "All")})
        return Response({"id": nid, "detail": "Notice sent."})


# ---------------------------------------------------------------------------
# Leave approvals (all staff/student leave requests, Admin can approve/reject)
# ---------------------------------------------------------------------------
class LeaveApprovalListView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_leave"):
            return Response([])
        status_filter = request.query_params.get("status", "Pending")
        data = rows(
            """
            SELECT l.id, l.leave_type, l.start_date, l.end_date, l.reason, l.status,
                   COALESCE(u.first_name || ' ' || u.last_name, u.username) AS applicant_name
            FROM portal_leave l JOIN auth_user u ON u.id = l.user_id
            WHERE (%s = '' OR l.status = %s) ORDER BY l.start_date DESC
            """,
            [status_filter or "", status_filter or ""],
        )
        return Response(serialise(data))

    def post(self, request, leave_id):
        if not table_exists("portal_leave"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        decision = request.data.get("decision")
        if decision not in ("Approved", "Rejected"):
            return Response({"detail": "decision must be Approved or Rejected."}, status=400)
        leave = row("SELECT status FROM portal_leave WHERE id=%s", [leave_id])
        if not leave:
            return Response({"detail": "Leave request not found."}, status=404)
        if leave["status"] != "Pending":
            return Response({"detail": f"Already {leave['status'].lower()}."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE portal_leave SET status=%s, approved_by=%s WHERE id=%s",
                [decision, request.user.id, leave_id],
            )
        log_action(request.user, "leave.decide", "leave", leave_id, {"decision": decision})
        return Response({"detail": f"Leave {decision.lower()}."})


# ---------------------------------------------------------------------------
# Reports / analytics (basic)
# ---------------------------------------------------------------------------
class ReportsView(AdminMixin, APIView):
    def get(self, request):
        report = {}
        if table_exists("portal_attendance"):
            report["attendance_by_class"] = rows(
                """
                SELECT c.name || '-' || c.section AS class_name,
                       ROUND(AVG(CASE WHEN a.status='Present' THEN 100 ELSE 0 END), 1) AS attendance_pct
                FROM portal_attendance a JOIN portal_class c ON c.id = a.class_id
                GROUP BY c.name, c.section ORDER BY c.name
                """
            )
        if table_exists("portal_payment"):
            report["fee_collection_by_month"] = rows(
                """
                SELECT to_char(paid_at, 'YYYY-MM') AS month, SUM(amount_paid)::float AS total
                FROM portal_payment WHERE status='Success'
                GROUP BY month ORDER BY month DESC LIMIT 12
                """
            )
        if table_exists("portal_result"):
            report["average_marks_by_subject"] = rows(
                """
                SELECT s.name AS subject_name, ROUND(AVG(r.marks_obtained), 1) AS average_marks
                FROM portal_result r
                JOIN portal_exam_schedule e ON e.id = r.exam_schedule_id
                JOIN portal_subject s ON s.id = e.subject_id
                GROUP BY s.name ORDER BY s.name
                """
            )
        return Response(serialise(report))


# ---------------------------------------------------------------------------
# Audit log (read-only view of every admin write above)
# ---------------------------------------------------------------------------
class AuditLogListView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_audit_log"):
            return Response([])
        data = rows(
            """
            SELECT a.id, a.action, a.target_type, a.target_id, a.details, a.created_at,
                   COALESCE(u.first_name || ' ' || u.last_name, u.username, 'System') AS actor_name
            FROM portal_audit_log a LEFT JOIN auth_user u ON u.id = a.actor_id
            ORDER BY a.created_at DESC LIMIT 300
            """
        )
        return Response(serialise(data))


# ---------------------------------------------------------------------------
# Basic data export — a pragmatic stand-in for the "Backup" module. This is
# NOT a substitute for real automated, encrypted, offsite daily backups
# (see the security notes for that); it just lets an admin download a JSON
# snapshot of the operational tables on demand.
# ---------------------------------------------------------------------------
EXPORT_TABLES = [
    "portal_class", "portal_subject", "portal_student_profile", "portal_teacher_profile",
    "portal_parent_profile", "portal_employee", "portal_fee_structure", "portal_payment",
    "portal_book", "portal_library_transaction", "portal_vehicle", "portal_route",
    "portal_student_enrollment", "portal_exam_schedule", "portal_result", "portal_hall_ticket",
    "portal_hostel", "portal_room", "portal_hostel_allocation", "portal_inventory",
    "portal_visitor_log", "portal_alumni", "portal_medical_log",
    "portal_course", "portal_course_content", "portal_quiz", "portal_quiz_question",
    "portal_assignment", "portal_assignment_submission", "portal_forum_topic",
    "portal_forum_post", "portal_digital_note", "portal_course_progress",
    "portal_audit_log",
]


class BackupExportView(AdminMixin, APIView):
    def get(self, request):
        snapshot = {}
        for t in EXPORT_TABLES:
            if table_exists(t):
                snapshot[t] = rows(f"SELECT * FROM {t}")
        log_action(request.user, "backup.export", "database", "-", {"tables": list(snapshot.keys())})
        return Response(serialise({"generated_at": date.today().isoformat(), "tables": snapshot}))
