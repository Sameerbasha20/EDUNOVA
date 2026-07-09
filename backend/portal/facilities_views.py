"""Facilities & back-office modules added after the initial client review:
Hostel, Inventory, Visitor Management, Alumni Registry, Medical Records.

Follows the same conventions as admin_views.py / views.py / parent_views.py:
raw SQL against portal_* tables (no ORM models — see portal/models.py for why),
role resolved server-side via portal.roles, every admin write logged via
log_action(). Kept in its own file so the five new modules are easy to find
and don't bloat admin_views.py further.
"""
from datetime import date

from django.db import DataError, IntegrityError, connection
from rest_framework.response import Response
from rest_framework.views import APIView

from .admin_views import AdminMixin, SimpleTableView
from .parent_views import ParentMixin, _assert_own_child
from .roles import log_action
from .views import StudentOnlyMixin, row, rows, serialise, table_exists

# =============================================================================
# HOSTEL
# =============================================================================
class HostelView(SimpleTableView):
    table = "portal_hostel"
    columns = ("name", "type", "warden_id")
    order_by = "name"


class RoomView(AdminMixin, APIView):
    """GET ?hostel_id= to scope to one hostel; POST to add a room."""

    def get(self, request):
        if not table_exists("portal_room"):
            return Response([])
        hostel_id = request.query_params.get("hostel_id")
        sql = (
            "SELECT r.*, h.name AS hostel_name FROM portal_room r "
            "JOIN portal_hostel h ON h.id = r.hostel_id"
        )
        params = []
        if hostel_id:
            sql += " WHERE r.hostel_id=%s"
            params.append(hostel_id)
        sql += " ORDER BY h.name, r.room_number"
        return Response(serialise(rows(sql, params)))

    def post(self, request):
        if not table_exists("portal_room"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        d = request.data
        if not d.get("hostel_id") or not table_exists("portal_hostel") or not row("SELECT 1 AS ok FROM portal_hostel WHERE id=%s", [d.get("hostel_id")]):
            return Response({"detail": "Invalid hostel_id."}, status=400)
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO portal_room (hostel_id, room_number, capacity) VALUES (%s,%s,%s) RETURNING id",
                    [d.get("hostel_id"), d.get("room_number"), d.get("capacity", 1)],
                )
                new_id = cursor.fetchone()[0]
        except (IntegrityError, DataError):
            return Response({"detail": "A room with this number already exists in this hostel."}, status=400)
        log_action(request.user, "hostel.room.create", "portal_room", new_id, dict(d))
        return Response({"id": new_id, "detail": "Room added."})


class HostelAllocationView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_hostel_allocation"):
            return Response([])
        return Response(serialise(rows(
            """
            SELECT a.id, a.allocated_date, a.vacated_date,
                   COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name,
                   r.room_number, h.name AS hostel_name
            FROM portal_hostel_allocation a
            JOIN auth_user u ON u.id = a.student_id
            JOIN portal_room r ON r.id = a.room_id
            JOIN portal_hostel h ON h.id = r.hostel_id
            WHERE a.vacated_date IS NULL
            ORDER BY h.name, r.room_number
            """
        )))

    def post(self, request):
        """Allocate a student to a room. Rejects if the room is already full."""
        if not table_exists("portal_hostel_allocation"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        student_id = request.data.get("student_id")
        room_id = request.data.get("room_id")
        if not student_id or not row("SELECT 1 AS ok FROM auth_user WHERE id=%s", [student_id]):
            return Response({"detail": "Student not found."}, status=400)
        room = row("SELECT capacity, occupied_beds FROM portal_room WHERE id=%s", [room_id])
        if not room:
            return Response({"detail": "Room not found."}, status=404)
        if room["occupied_beds"] >= room["capacity"]:
            return Response({"detail": "Room is already at full capacity."}, status=400)
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO portal_hostel_allocation (student_id, room_id) VALUES (%s,%s) RETURNING id",
                    [student_id, room_id],
                )
                alloc_id = cursor.fetchone()[0]
                cursor.execute("UPDATE portal_room SET occupied_beds = occupied_beds + 1 WHERE id=%s", [room_id])
        except IntegrityError:
            return Response({"detail": "This student is already allocated to this room today."}, status=400)
        log_action(request.user, "hostel.allocate", "student", student_id, {"room_id": room_id})
        return Response({"id": alloc_id, "detail": "Student allocated to room."})


class HostelVacateView(AdminMixin, APIView):
    def post(self, request, allocation_id):
        if not table_exists("portal_hostel_allocation"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        alloc = row("SELECT room_id, vacated_date FROM portal_hostel_allocation WHERE id=%s", [allocation_id])
        if not alloc:
            return Response({"detail": "Allocation not found."}, status=404)
        if alloc["vacated_date"]:
            return Response({"detail": "Already vacated."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE portal_hostel_allocation SET vacated_date=%s WHERE id=%s",
                [date.today(), allocation_id],
            )
            cursor.execute(
                "UPDATE portal_room SET occupied_beds = GREATEST(occupied_beds - 1, 0) WHERE id=%s",
                [alloc["room_id"]],
            )
        log_action(request.user, "hostel.vacate", "allocation", allocation_id, {})
        return Response({"detail": "Room vacated."})


class StudentHostelView(StudentOnlyMixin, APIView):
    """A student's own current room, if any."""

    def get(self, request):
        if not table_exists("portal_hostel_allocation"):
            return Response(None)
        data = row(
            """
            SELECT r.room_number, h.name AS hostel_name, h.type, a.allocated_date
            FROM portal_hostel_allocation a
            JOIN portal_room r ON r.id = a.room_id
            JOIN portal_hostel h ON h.id = r.hostel_id
            WHERE a.student_id=%s AND a.vacated_date IS NULL
            """,
            [request.user.id],
        )
        return Response(serialise(data))


class ChildHostelView(ParentMixin, APIView):
    """A parent's view of their child's current hostel room."""

    def get(self, request):
        child_id = request.query_params.get("child_id")
        if not _assert_own_child(request.user.id, child_id):
            return Response({"detail": "Not your child, or child not found."}, status=403)
        if not table_exists("portal_hostel_allocation"):
            return Response(None)
        data = row(
            """
            SELECT r.room_number, h.name AS hostel_name, h.type, a.allocated_date
            FROM portal_hostel_allocation a
            JOIN portal_room r ON r.id = a.room_id
            JOIN portal_hostel h ON h.id = r.hostel_id
            WHERE a.student_id=%s AND a.vacated_date IS NULL
            """,
            [child_id],
        )
        return Response(serialise(data))


# =============================================================================
# INVENTORY
# =============================================================================
class InventoryView(AdminMixin, APIView):
    """GET ?department= to filter; PATCH via item id in the body for quantity
    adjustments (simple stock in/out), POST to add a new item line."""

    def get(self, request):
        if not table_exists("portal_inventory"):
            return Response([])
        department = request.query_params.get("department")
        sql = "SELECT * FROM portal_inventory"
        params = []
        if department:
            sql += " WHERE department=%s"
            params.append(department)
        sql += " ORDER BY department, item_name"
        return Response(serialise(rows(sql, params)))

    def post(self, request):
        if not table_exists("portal_inventory"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        d = request.data
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_inventory (item_name, category, quantity, department) "
                "VALUES (%s,%s,%s,%s) RETURNING id",
                [d.get("item_name"), d.get("category", "General"), d.get("quantity", 0), d.get("department", "Administration")],
            )
            new_id = cursor.fetchone()[0]
        log_action(request.user, "inventory.create", "portal_inventory", new_id, dict(d))
        return Response({"id": new_id, "detail": "Item added."})

    def patch(self, request):
        """Body: {id, quantity_delta} — adjusts stock up or down."""
        if not table_exists("portal_inventory"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        item_id = request.data.get("id")
        try:
            delta = int(request.data.get("quantity_delta", 0))
        except (TypeError, ValueError):
            return Response({"detail": "quantity_delta must be a number."}, status=400)
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE portal_inventory SET quantity = GREATEST(quantity + %s, 0), updated_at = now() "
                    "WHERE id=%s RETURNING quantity",
                    [delta, item_id],
                )
                result = cursor.fetchone()
        except DataError:
            return Response({"detail": "Invalid item id."}, status=400)
        if not result:
            return Response({"detail": "Item not found."}, status=404)
        log_action(request.user, "inventory.adjust", "portal_inventory", item_id, {"delta": delta})
        return Response({"quantity": result[0], "detail": "Stock updated."})


# =============================================================================
# VISITOR MANAGEMENT
# =============================================================================
class VisitorLogView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_visitor_log"):
            return Response([])
        only_open = request.query_params.get("open") == "true"
        sql = (
            "SELECT v.*, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS host_name "
            "FROM portal_visitor_log v LEFT JOIN auth_user u ON u.id = v.host_user_id"
        )
        if only_open:
            sql += " WHERE v.check_out_time IS NULL"
        sql += " ORDER BY v.check_in_time DESC LIMIT 200"
        return Response(serialise(rows(sql)))

    def post(self, request):
        if not table_exists("portal_visitor_log"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        d = request.data
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_visitor_log (visitor_name, purpose, host_user_id, id_proof_type) "
                "VALUES (%s,%s,%s,%s) RETURNING id, check_in_time",
                [d.get("visitor_name"), d.get("purpose"), d.get("host_user_id") or None, d.get("id_proof_type", "Other")],
            )
            new_id, check_in = cursor.fetchone()
        log_action(request.user, "visitor.checkin", "portal_visitor_log", new_id, {"visitor_name": d.get("visitor_name")})
        return Response({"id": new_id, "check_in_time": check_in.isoformat(), "detail": "Visitor checked in."})


class VisitorCheckoutView(AdminMixin, APIView):
    def post(self, request, visitor_id):
        if not table_exists("portal_visitor_log"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        visitor = row("SELECT check_out_time FROM portal_visitor_log WHERE id=%s", [visitor_id])
        if not visitor:
            return Response({"detail": "Visitor log not found."}, status=404)
        if visitor["check_out_time"]:
            return Response({"detail": "Already checked out."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute("UPDATE portal_visitor_log SET check_out_time = now() WHERE id=%s", [visitor_id])
        log_action(request.user, "visitor.checkout", "portal_visitor_log", visitor_id, {})
        return Response({"detail": "Visitor checked out."})


# =============================================================================
# ALUMNI REGISTRY
# =============================================================================
class AlumniView(AdminMixin, APIView):
    def get(self, request):
        if not table_exists("portal_alumni"):
            return Response([])
        year = request.query_params.get("graduation_year")
        sql = (
            "SELECT a.*, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name, u.email "
            "FROM portal_alumni a JOIN auth_user u ON u.id = a.student_id"
        )
        params = []
        if year:
            sql += " WHERE a.graduation_year=%s"
            params.append(year)
        sql += " ORDER BY a.graduation_year DESC, student_name"
        return Response(serialise(rows(sql, params)))

    def post(self, request):
        if not table_exists("portal_alumni"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        d = request.data
        student_id = d.get("student_id")
        if not student_id or not row("SELECT 1 AS ok FROM auth_user WHERE id=%s", [student_id]):
            return Response({"detail": "Student not found."}, status=400)
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO portal_alumni (student_id, graduation_year, current_occupation, higher_studies_details) "
                    "VALUES (%s,%s,%s,%s) ON CONFLICT (student_id) DO UPDATE SET "
                    "graduation_year=EXCLUDED.graduation_year, current_occupation=EXCLUDED.current_occupation, "
                    "higher_studies_details=EXCLUDED.higher_studies_details RETURNING id",
                    [student_id, d.get("graduation_year"), d.get("current_occupation"), d.get("higher_studies_details")],
                )
                new_id = cursor.fetchone()[0]
        except DataError:
            return Response({"detail": "Invalid graduation_year."}, status=400)
        log_action(request.user, "alumni.upsert", "portal_alumni", new_id, dict(d))
        return Response({"id": new_id, "detail": "Alumni record saved."})


# =============================================================================
# MEDICAL RECORDS
# =============================================================================
class MedicalLogView(AdminMixin, APIView):
    """Admin/nurse-facing: list (optionally by student) + create."""

    def get(self, request):
        if not table_exists("portal_medical_log"):
            return Response([])
        student_id = request.query_params.get("student_id")
        sql = (
            "SELECT m.*, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name "
            "FROM portal_medical_log m JOIN auth_user u ON u.id = m.student_id"
        )
        params = []
        if student_id:
            sql += " WHERE m.student_id=%s"
            params.append(student_id)
        sql += " ORDER BY m.visit_date DESC LIMIT 200"
        return Response(serialise(rows(sql, params)))

    def post(self, request):
        if not table_exists("portal_medical_log"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        d = request.data
        student_id = d.get("student_id")
        if not student_id or not row("SELECT 1 AS ok FROM auth_user WHERE id=%s", [student_id]):
            return Response({"detail": "Student not found."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_medical_log (student_id, symptoms, treatment_given, doctor_notes, recorded_by) "
                "VALUES (%s,%s,%s,%s,%s) RETURNING id",
                [student_id, d.get("symptoms"), d.get("treatment_given"), d.get("doctor_notes"), request.user.id],
            )
            new_id = cursor.fetchone()[0]
        log_action(request.user, "medical.log.create", "portal_medical_log", new_id, {"student_id": student_id})
        return Response({"id": new_id, "detail": "Medical record saved."})


class StudentMedicalView(StudentOnlyMixin, APIView):
    """Read-only — a student can see their own medical visit history."""

    def get(self, request):
        if not table_exists("portal_medical_log"):
            return Response([])
        return Response(serialise(rows(
            "SELECT id, visit_date, symptoms, treatment_given, doctor_notes FROM portal_medical_log "
            "WHERE student_id=%s ORDER BY visit_date DESC",
            [request.user.id],
        )))
