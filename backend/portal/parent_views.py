from uuid import uuid4

from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response

from .views import table_exists, rows, row, serialise, current_class_for_student
from .roles import IsParent, log_action


class ParentMixin:
    permission_classes = [IsParent]


def _children(parent_id):
    """All students linked to this parent via portal_student_profile.parent_id."""
    if not table_exists("portal_student_profile"):
        return []
    return rows(
        """
        SELECT u.id, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS name,
               sp.admission_number, sp.qr_id_code, sp.date_of_birth, sp.gender, sp.status
        FROM portal_student_profile sp
        JOIN auth_user u ON u.id = sp.user_id
        WHERE sp.parent_id = %s
        ORDER BY u.first_name
        """,
        [parent_id],
    )


def _assert_own_child(parent_id, child_id):
    """Returns True only if child_id genuinely belongs to this parent — every
    child-scoped endpoint below must call this before touching any data, or a
    parent could read another family's records just by changing a query param."""
    if not child_id or not table_exists("portal_student_profile"):
        return False
    hit = row("SELECT 1 AS ok FROM portal_student_profile WHERE user_id=%s AND parent_id=%s", [child_id, parent_id])
    return bool(hit)


class ParentProfileView(ParentMixin, APIView):
    def get(self, request):
        u = request.user
        profile = {
            "id": u.id,
            "name": u.get_full_name().strip() or u.username,
            "email": u.email,
            "user_type": "Parent",
            "phone_number": "",
            "father_name": "",
            "mother_name": "",
            "emergency_contact": "",
            "address": "",
            "is_verified": False,
        }
        if table_exists("portal_user_profile"):
            p = row("SELECT phone_number FROM portal_user_profile WHERE user_id=%s", [u.id])
            if p:
                profile.update(p)
        if table_exists("portal_parent_profile"):
            pp = row(
                "SELECT father_name, mother_name, emergency_contact, address, is_verified "
                "FROM portal_parent_profile WHERE user_id=%s",
                [u.id],
            )
            if pp:
                profile.update(pp)
        profile["children"] = _children(u.id)
        return Response(serialise(profile))


class ParentDashboardView(ParentMixin, APIView):
    def get(self, request):
        pid = request.user.id
        children = _children(pid)
        summary = []
        for c in children:
            cid = c["id"]
            cls = current_class_for_student(cid)
            att = None
            if table_exists("portal_attendance"):
                stats = row(
                    "SELECT COUNT(*)::int total, SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)::int present "
                    "FROM portal_attendance WHERE student_id=%s",
                    [cid],
                )
                if stats and stats["total"]:
                    att = round((stats["present"] or 0) * 100 / stats["total"], 1)
            pending_fees = 0
            if cls and table_exists("portal_fee_structure"):
                pf = row(
                    """
                    SELECT COUNT(*)::int AS count FROM portal_fee_structure fs
                    WHERE fs.class_id=%s AND NOT EXISTS (
                      SELECT 1 FROM portal_payment p WHERE p.fee_structure_id=fs.id AND p.student_id=%s AND p.status='Success'
                    )
                    """,
                    [cls["class_id"], cid],
                )
                pending_fees = pf["count"] if pf else 0
            summary.append({
                **c,
                "class_name": cls["class_name"] if cls else "Not assigned",
                "attendance_percentage": att,
                "pending_fee_items": pending_fees,
            })
        unread_messages = 0
        if table_exists("portal_message"):
            m = row("SELECT COUNT(*)::int AS count FROM portal_message WHERE receiver_id=%s AND is_read=false", [pid])
            unread_messages = m["count"] if m else 0
        return Response(serialise({"children": summary, "unread_messages": unread_messages}))


class ChildrenListView(ParentMixin, APIView):
    def get(self, request):
        return Response(serialise(_children(request.user.id)))


class ChildAttendanceView(ParentMixin, APIView):
    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        month = request.query_params.get("month")
        sql = "SELECT id, date, status, remarks FROM portal_attendance WHERE student_id=%s"
        params = [child_id]
        if month:
            sql += " AND to_char(date, 'YYYY-MM')=%s"
            params.append(month)
        sql += " ORDER BY date DESC"
        records = rows(sql, params) if table_exists("portal_attendance") else []
        summary = {"present": 0, "absent": 0, "late": 0, "medical_leave": 0, "percentage": None}
        for r in records:
            key = str(r["status"]).lower()
            if key in summary:
                summary[key] += 1
        if records:
            summary["percentage"] = round(summary["present"] * 100 / len(records), 1)
        return Response(serialise({"summary": summary, "records": records}))


class ChildHomeworkView(ParentMixin, APIView):
    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        cls = current_class_for_student(child_id)
        if not cls or not table_exists("portal_homework"):
            return Response([])
        data = rows(
            """
            SELECT h.id, h.title, h.description, h.assigned_date, h.due_date, s.name AS subject_name,
                   (h.due_date < current_date) AS is_overdue
            FROM portal_homework h JOIN portal_subject s ON s.id=h.subject_id
            WHERE h.class_id=%s ORDER BY h.due_date DESC
            """,
            [cls["class_id"]],
        )
        return Response(serialise(data))


class ChildResultsView(ParentMixin, APIView):
    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_result"):
            return Response([])
        data = rows(
            """
            SELECT r.id, r.marks_obtained, r.rank_position, r.grade_letter, r.remarks,
                   ROUND((r.marks_obtained / NULLIF(e.max_marks,0)) * 100, 1) AS percentage,
                   json_build_object('id', e.id, 'exam_name', e.exam_name, 'max_marks', e.max_marks, 'subject_name', s.name) AS exam
            FROM portal_result r
            JOIN portal_exam_schedule e ON e.id=r.exam_schedule_id
            JOIN portal_subject s ON s.id=e.subject_id
            WHERE r.student_id=%s ORDER BY e.exam_date DESC
            """,
            [child_id],
        )
        return Response(serialise(data))


class ChildFeesView(ParentMixin, APIView):
    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        cls = current_class_for_student(child_id)
        pending, history = [], []
        if cls and table_exists("portal_fee_structure"):
            pending = rows(
                """
                SELECT fs.id, fs.term_name, fs.tuition_fee, fs.transport_fee, fs.hostel_fee, fs.total_amount
                FROM portal_fee_structure fs
                WHERE fs.class_id=%s AND NOT EXISTS (
                  SELECT 1 FROM portal_payment p WHERE p.fee_structure_id=fs.id AND p.student_id=%s AND p.status='Success'
                ) ORDER BY fs.id
                """,
                [cls["class_id"], child_id],
            )
        if table_exists("portal_payment"):
            history = rows(
                """
                SELECT p.id, p.transaction_id, p.amount_paid, p.status, p.paid_at,
                       json_build_object('id', fs.id, 'term_name', fs.term_name, 'total_amount', fs.total_amount) AS fee_structure_detail
                FROM portal_payment p JOIN portal_fee_structure fs ON fs.id=p.fee_structure_id
                WHERE p.student_id=%s ORDER BY p.paid_at DESC
                """,
                [child_id],
            )
        return Response(serialise({"pending": pending, "payment_history": history}))


class ChildFeesPayView(ParentMixin, APIView):
    def post(self, request):
        child_id = request.data.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_payment"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        fee_id = request.data.get("fee_structure_id")
        method = request.data.get("payment_method") or "Online"
        fee = row("SELECT total_amount FROM portal_fee_structure WHERE id=%s", [fee_id])
        if not fee:
            return Response({"detail": "Invalid fee."}, status=400)
        tx = f"EDN-{uuid4().hex[:10].upper()}"
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO portal_payment (student_id, fee_structure_id, transaction_id, amount_paid, payment_method, status)
                VALUES (%s,%s,%s,%s,%s,'Success') RETURNING id
                """,
                [child_id, fee_id, tx, fee["total_amount"], method],
            )
            pid = cursor.fetchone()[0]
        log_action(request.user, "fee.pay", "student", child_id, {"transaction_id": tx, "amount": str(fee["total_amount"])})
        return Response({"detail": "Payment recorded successfully.", "id": pid, "transaction_id": tx})


class ChildDocumentsView(ParentMixin, APIView):
    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_certificate"):
            return Response([])
        return Response(serialise(rows(
            "SELECT id, certificate_type, issued_date, file_url FROM portal_certificate WHERE student_id=%s ORDER BY issued_date DESC",
            [child_id],
        )))


class ChildTransportView(ParentMixin, APIView):
    """Bus route/pickup info + most recent known GPS ping for the child's bus."""

    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_transport_allocation"):
            return Response({"allocation": None, "last_location": None})
        alloc = row(
            """
            SELECT ta.pickup_point, v.id AS vehicle_id, v.vehicle_number, v.maintenance_status,
                   r.route_name, r.start_point, r.end_point,
                   COALESCE(du.first_name || ' ' || du.last_name, du.username) AS driver_name
            FROM portal_transport_allocation ta
            JOIN portal_vehicle v ON v.id = ta.vehicle_id
            JOIN portal_route r ON r.id = ta.route_id
            LEFT JOIN auth_user du ON du.id = v.driver_id
            WHERE ta.student_id = %s
            """,
            [child_id],
        )
        last_location = None
        if alloc and table_exists("portal_live_bus_log"):
            last_location = row(
                "SELECT latitude, longitude, updated_at FROM portal_live_bus_log WHERE vehicle_id=%s ORDER BY updated_at DESC LIMIT 1",
                [alloc["vehicle_id"]],
            )
        return Response(serialise({"allocation": alloc, "last_location": last_location}))


class TeacherContactsView(ParentMixin, APIView):
    """Teachers currently teaching any of this parent's children — the valid
    set of people a parent may message or book a PTM slot with."""

    def get(self, request):
        pid = request.user.id
        if not table_exists("portal_academic_allocation"):
            return Response([])
        data = rows(
            """
            SELECT DISTINCT u.id, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS name,
                   s.name AS subject_name, c.name || '-' || c.section AS class_name
            FROM portal_student_profile sp
            JOIN portal_student_enrollment se ON se.student_id = sp.user_id
            JOIN portal_academic_allocation aa ON aa.class_id = se.class_id
            JOIN auth_user u ON u.id = aa.teacher_id
            JOIN portal_subject s ON s.id = aa.subject_id
            JOIN portal_class c ON c.id = aa.class_id
            WHERE sp.parent_id = %s
            ORDER BY name
            """,
            [pid],
        )
        return Response(serialise(data))


class MessageThreadView(ParentMixin, APIView):
    def get(self, request):
        pid = request.user.id
        other = request.query_params.get("with")
        if not table_exists("portal_message"):
            return Response([])
        if other:
            data = rows(
                """
                SELECT m.id, m.sender_id AS sender, m.receiver_id AS receiver, m.message_text, m.created_at
                FROM portal_message m
                WHERE (m.sender_id=%s AND m.receiver_id=%s) OR (m.sender_id=%s AND m.receiver_id=%s)
                ORDER BY m.created_at
                """,
                [pid, other, other, pid],
            )
        else:
            data = rows(
                """
                SELECT DISTINCT ON (CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END)
                       m.id, m.sender_id AS sender, m.receiver_id AS receiver, m.message_text, m.created_at
                FROM portal_message m
                WHERE m.sender_id=%s OR m.receiver_id=%s
                ORDER BY CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END, m.created_at DESC
                """,
                [pid, pid, pid, pid],
            )
        return Response(serialise(data))

    def post(self, request):
        if not table_exists("portal_message"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_message (sender_id, receiver_id, message_text) VALUES (%s,%s,%s) RETURNING id",
                [request.user.id, request.data.get("receiver"), request.data.get("message_text")],
            )
            mid = cursor.fetchone()[0]
        return Response({"id": mid, "detail": "Message sent."})


class NotificationListView(ParentMixin, APIView):
    def get(self, request):
        pid = request.user.id
        children = _children(pid)
        class_ids = [c.get("class_id") for c in [current_class_for_student(c["id"]) or {} for c in children] if c.get("class_id")]
        if table_exists("portal_notification"):
            sql = "SELECT n.id, n.title, n.message, n.created_at FROM portal_notification n WHERE n.recipient_type IN ('All','Parent')"
            params = []
            if class_ids:
                sql += " OR n.target_class_id = ANY(%s)"
                params.append(class_ids)
            sql += " ORDER BY n.created_at DESC LIMIT 50"
            return Response(serialise(rows(sql, params)))
        return Response([])


class LeaveRequestView(ParentMixin, APIView):
    """Parent submits/views leave requests on behalf of a child."""

    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_leave"):
            return Response([])
        return Response(serialise(rows(
            "SELECT id, leave_type, start_date, end_date, reason, status FROM portal_leave WHERE user_id=%s ORDER BY start_date DESC",
            [child_id],
        )))

    def post(self, request):
        child_id = request.data.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_leave"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO portal_leave (user_id, leave_type, start_date, end_date, reason, submitted_by)
                VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
                """,
                [child_id, request.data.get("leave_type"), request.data.get("start_date"),
                 request.data.get("end_date"), request.data.get("reason"), request.user.id],
            )
            lid = cursor.fetchone()[0]
        return Response({"id": lid, "detail": "Leave request submitted."})


class PtmBookingView(ParentMixin, APIView):
    def get(self, request):
        if not table_exists("portal_ptm_booking"):
            return Response([])
        data = rows(
            """
            SELECT b.id, b.meeting_date, b.time_slot, b.status, b.parent_notes,
                   COALESCE(tu.first_name || ' ' || tu.last_name, tu.username) AS teacher_name,
                   COALESCE(su.first_name || ' ' || su.last_name, su.username) AS student_name
            FROM portal_ptm_booking b
            JOIN auth_user tu ON tu.id = b.teacher_id
            LEFT JOIN auth_user su ON su.id = b.student_id
            WHERE b.parent_id = %s ORDER BY b.meeting_date DESC
            """,
            [request.user.id],
        )
        return Response(serialise(data))

    def post(self, request):
        if not table_exists("portal_ptm_booking"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        data = request.data
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO portal_ptm_booking (parent_id, teacher_id, student_id, meeting_date, time_slot, parent_notes)
                VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
                """,
                [request.user.id, data.get("teacher_id"), data.get("student_id"),
                 data.get("meeting_date"), data.get("time_slot"), data.get("parent_notes", "")],
            )
            bid = cursor.fetchone()[0]
        return Response({"id": bid, "detail": "Meeting requested."})


class FeedbackView(ParentMixin, APIView):
    def get(self, request):
        if not table_exists("portal_parent_feedback"):
            return Response([])
        return Response(serialise(rows(
            "SELECT id, category, feedback_text, status, created_at FROM portal_parent_feedback WHERE parent_id=%s ORDER BY created_at DESC",
            [request.user.id],
        )))

    def post(self, request):
        if not table_exists("portal_parent_feedback"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_parent_feedback (parent_id, category, feedback_text) VALUES (%s,%s,%s) RETURNING id",
                [request.user.id, request.data.get("category", "General"), request.data.get("feedback_text")],
            )
            fid = cursor.fetchone()[0]
        return Response({"id": fid, "detail": "Feedback submitted."})
