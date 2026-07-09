"""
Regression tests for the Admin Portal's Students/Teachers directory:
GET /admin-portal/students/, /admin-portal/students/<id>/,
/admin-portal/teachers/, /admin-portal/teachers/<id>/, and
/admin-portal/departments/ -- previously there was no way for an admin to
list or drill into an individual student/teacher's full profile; the only
option was the generic /admin-portal/users/ list (name/email/role only).

Run with:
    python manage.py test portal.tests.test_admin_directory
"""
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import connection
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_admin(username="dir_test_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


class AdminDirectoryTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()

        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('DirTest', 'A') RETURNING id")
            self.class_a = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('DirTest', 'B') RETURNING id")
            self.class_b = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_subject (name, subject_code) VALUES ('Dir Subject', 'DIR101') RETURNING id")
            self.subject_id = cursor.fetchone()[0]

        self.student = User.objects.create_user(
            username="dir_student", password="x", email="dir_student@edunova.edu",
            first_name="Dir", last_name="Student",
        )
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_student_profile (user_id, admission_number) VALUES (%s, 'DIR-STU-001')",
                [self.student.id],
            )
            cursor.execute(
                "INSERT INTO portal_student_enrollment (student_id, class_id, academic_year, roll_number) "
                "VALUES (%s, %s, '2025-26', 7)",
                [self.student.id, self.class_a],
            )

        self.teacher = User.objects.create_user(
            username="dir_teacher", password="x", email="dir_teacher@edunova.edu",
            first_name="Dir", last_name="Teacher",
        )
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_teacher_profile (user_id, employee_code, department) VALUES (%s, 'DIR-EMP-001', 'Mathematics')",
                [self.teacher.id],
            )
            cursor.execute(
                "INSERT INTO portal_academic_allocation (class_id, subject_id, teacher_id) VALUES (%s, %s, %s)",
                [self.class_a, self.subject_id, self.teacher.id],
            )

    # --- Students ---

    def test_student_list_returns_created_student(self):
        resp = self.client.get("/api/admin-portal/students/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 200)
        rows = resp.json()
        match = next((r for r in rows if r["id"] == self.student.id), None)
        self.assertIsNotNone(match)
        self.assertEqual(match["admission_number"], "DIR-STU-001")
        self.assertEqual(match["class_name"], "DirTest-A")

    def test_student_list_filters_by_class(self):
        resp = self.client.get(f"/api/admin-portal/students/?class_id={self.class_b}", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 200)
        ids = [r["id"] for r in resp.json()]
        self.assertNotIn(self.student.id, ids)

        resp = self.client.get(f"/api/admin-portal/students/?class_id={self.class_a}", **_auth_header(self.admin))
        ids = [r["id"] for r in resp.json()]
        self.assertIn(self.student.id, ids)

    def test_student_detail_returns_full_profile(self):
        resp = self.client.get(f"/api/admin-portal/students/{self.student.id}/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["admission_number"], "DIR-STU-001")
        self.assertEqual(data["roll_number"], 7)
        self.assertTrue(data["is_active"])

    def test_student_detail_404_for_missing_user(self):
        resp = self.client.get("/api/admin-portal/students/999999/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 404)

    # --- Teachers ---

    def test_teacher_list_returns_created_teacher(self):
        resp = self.client.get("/api/admin-portal/teachers/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 200)
        rows = resp.json()
        match = next((r for r in rows if r["id"] == self.teacher.id), None)
        self.assertIsNotNone(match)
        self.assertEqual(match["department"], "Mathematics")

    def test_teacher_list_filters_by_department(self):
        resp = self.client.get("/api/admin-portal/teachers/?department=Science", **_auth_header(self.admin))
        ids = [r["id"] for r in resp.json()]
        self.assertNotIn(self.teacher.id, ids)

        resp = self.client.get("/api/admin-portal/teachers/?department=Mathematics", **_auth_header(self.admin))
        ids = [r["id"] for r in resp.json()]
        self.assertIn(self.teacher.id, ids)

    def test_teacher_list_filters_by_class(self):
        resp = self.client.get(f"/api/admin-portal/teachers/?class_id={self.class_b}", **_auth_header(self.admin))
        ids = [r["id"] for r in resp.json()]
        self.assertNotIn(self.teacher.id, ids)

        resp = self.client.get(f"/api/admin-portal/teachers/?class_id={self.class_a}", **_auth_header(self.admin))
        ids = [r["id"] for r in resp.json()]
        self.assertIn(self.teacher.id, ids)

    def test_teacher_detail_includes_allocations(self):
        resp = self.client.get(f"/api/admin-portal/teachers/{self.teacher.id}/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["employee_code"], "DIR-EMP-001")
        self.assertEqual(len(data["classes"]), 1)
        self.assertEqual(data["classes"][0]["class_name"], "DirTest-A")

    def test_teacher_detail_404_for_missing_user(self):
        resp = self.client.get("/api/admin-portal/teachers/999999/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 404)

    # --- Departments ---

    def test_departments_list_includes_seeded_department(self):
        resp = self.client.get("/api/admin-portal/departments/", **_auth_header(self.admin))
        self.assertEqual(resp.status_code, 200)
        self.assertIn("Mathematics", resp.json())

    # --- RBAC ---

    def test_non_admin_cannot_list_students(self):
        student_token = _auth_header(self.student)
        resp = self.client.get("/api/admin-portal/students/", **student_token)
        self.assertEqual(resp.status_code, 403)
