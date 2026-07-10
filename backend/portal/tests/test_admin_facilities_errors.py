"""
Regression tests for admin/facilities write endpoints that raised an
unhandled IntegrityError/DataError/ValueError on bad input instead of a
clean 400 -- same root-cause class already fixed in SimpleTableView.post,
found in production-readiness audit across LibraryIssueView,
NoticeBroadcastView, RoomView, HostelAllocationView, InventoryView.patch,
AlumniView, MedicalLogView -- plus LeaveApprovalListView's missing
existence/already-decided check, and the role-change directory-listing
bug (a demoted Teacher/Student kept showing up in the Teachers/Students
directory because those list views never checked the user's *current*
role, only whether a historical profile row existed).

Run with:
    python manage.py test portal.tests.test_admin_facilities_errors
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.db import connection
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_admin(username="facilities_err_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


def _make_user(username, role):
    user = User.objects.create_user(username=username, password="TestPass@99", email=f"{username}@edunova.edu")
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)
    return user


class AdminFacilitiesErrorHandlingTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()
        self.student = _make_user("facilities_err_student", "Student")
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_book (title, author, isbn, barcode_id, quantity, available_quantity) "
                "VALUES ('Err Book','Author','ERR-ISBN-1','ERR-BC-1',3,3) RETURNING id"
            )
            self.book_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_hostel (name, type) VALUES ('Err Hostel', 'Boys') RETURNING id")
            self.hostel_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_room (hostel_id, room_number, capacity) VALUES (%s,'101',1) RETURNING id",
                [self.hostel_id],
            )
            self.room_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_leave (user_id, leave_type, start_date, end_date, reason) "
                "VALUES (%s,'Sick','2026-01-01','2026-01-02','test') RETURNING id",
                [self.student.id],
            )
            self.leave_id = cursor.fetchone()[0]

    # --- Library issue ---

    def test_issue_with_invalid_borrower_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": self.book_id, "borrower_id": 999999},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_issue_with_non_numeric_loan_days_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": self.book_id, "borrower_id": self.student.id, "loan_days": "abc"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    # --- Notices ---

    def test_notice_with_blank_target_class_is_accepted(self):
        resp = self.client.post(
            "/api/admin-portal/notices/",
            data={"title": "Hi", "message": "Body", "target_class_id": ""},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)

    def test_notice_without_title_returns_400(self):
        resp = self.client.post(
            "/api/admin-portal/notices/",
            data={"message": "Body"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    # --- Rooms / hostel allocation ---

    def test_room_with_invalid_hostel_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/rooms/",
            data={"hostel_id": 999999, "room_number": "1"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_hostel_allocation_with_invalid_student_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/hostel-allocations/",
            data={"student_id": 999999, "room_id": self.room_id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    # --- Hostel/library race-condition locking (SELECT ... FOR UPDATE) ---
    # These don't exercise true concurrency (Django's test client is
    # single-threaded), but they pin down that the FOR-UPDATE refactor kept
    # the same capacity/availability/already-done business rules intact.

    def test_hostel_allocation_rejected_once_room_at_capacity(self):
        first = self.client.post(
            "/api/admin-portal/hostel-allocations/",
            data={"student_id": self.student.id, "room_id": self.room_id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(first.status_code, 200)

        second_student = _make_user("facilities_err_student2", "Student")
        second = self.client.post(
            "/api/admin-portal/hostel-allocations/",
            data={"student_id": second_student.id, "room_id": self.room_id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(second.status_code, 400)

    def test_cannot_vacate_the_same_allocation_twice(self):
        alloc = self.client.post(
            "/api/admin-portal/hostel-allocations/",
            data={"student_id": self.student.id, "room_id": self.room_id},
            content_type="application/json",
            **_auth_header(self.admin),
        ).json()

        first = self.client.post(f"/api/admin-portal/hostel-allocations/{alloc['id']}/vacate/", **_auth_header(self.admin))
        self.assertEqual(first.status_code, 200)

        second = self.client.post(f"/api/admin-portal/hostel-allocations/{alloc['id']}/vacate/", **_auth_header(self.admin))
        self.assertEqual(second.status_code, 400)

    def test_library_issue_rejected_once_no_copies_left(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_book (title, author, isbn, barcode_id, quantity, available_quantity) "
                "VALUES ('Single Copy','Author','ERR-ISBN-2','ERR-BC-2',1,1) RETURNING id"
            )
            single_book_id = cursor.fetchone()[0]

        first = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": single_book_id, "borrower_id": self.student.id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(first.status_code, 200)

        second_student = _make_user("facilities_err_student3", "Student")
        second = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": single_book_id, "borrower_id": second_student.id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(second.status_code, 400)

    def test_cannot_return_the_same_book_transaction_twice(self):
        issue = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": self.book_id, "borrower_id": self.student.id},
            content_type="application/json",
            **_auth_header(self.admin),
        ).json()

        first = self.client.post(f"/api/admin-portal/library/return/{issue['id']}/", **_auth_header(self.admin))
        self.assertEqual(first.status_code, 200)

        second = self.client.post(f"/api/admin-portal/library/return/{issue['id']}/", **_auth_header(self.admin))
        self.assertEqual(second.status_code, 400)

    # --- Inventory ---

    def test_inventory_adjust_with_non_numeric_delta_returns_400_not_500(self):
        resp = self.client.patch(
            "/api/admin-portal/inventory/",
            data={"id": 1, "quantity_delta": "abc"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    # --- Alumni / medical ---

    def test_alumni_with_invalid_student_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/alumni/",
            data={"student_id": 999999, "graduation_year": 2026},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_medical_log_with_invalid_student_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/medical-logs/",
            data={"student_id": 999999, "symptoms": "x"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    # --- Leave approval correctness ---

    def test_deciding_nonexistent_leave_returns_404(self):
        resp = self.client.post(
            "/api/admin-portal/leaves/999999/decide/",
            data={"decision": "Approved"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 404)

    def test_cannot_redecide_an_already_decided_leave(self):
        first = self.client.post(
            f"/api/admin-portal/leaves/{self.leave_id}/decide/",
            data={"decision": "Approved"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(first.status_code, 200)

        second = self.client.post(
            f"/api/admin-portal/leaves/{self.leave_id}/decide/",
            data={"decision": "Rejected"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(second.status_code, 400)

    # --- Role-change directory consistency ---

    def test_demoted_teacher_disappears_from_teacher_directory(self):
        teacher = _make_user("facilities_err_teacher", "Teacher")
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_user_profile (user_id, user_type) VALUES (%s,'Teacher') "
                "ON CONFLICT (user_id) DO UPDATE SET user_type=EXCLUDED.user_type",
                [teacher.id],
            )
            cursor.execute(
                "INSERT INTO portal_teacher_profile (user_id, employee_code) VALUES (%s,'ERR-EMP-1')",
                [teacher.id],
            )

        before = self.client.get("/api/admin-portal/teachers/", **_auth_header(self.admin))
        self.assertIn(teacher.id, [t["id"] for t in before.json()])

        resp = self.client.patch(
            f"/api/admin-portal/users/{teacher.id}/",
            data={"role": "Parent"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)

        after = self.client.get("/api/admin-portal/teachers/", **_auth_header(self.admin))
        self.assertNotIn(teacher.id, [t["id"] for t in after.json()])
