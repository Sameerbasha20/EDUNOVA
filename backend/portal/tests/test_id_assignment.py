"""
Regression tests for ID-number auto-assignment: every Student/Teacher/Parent
account should get an admission_number/employee_code/parent_code, whether
created through the Admin Portal's "create user" flow or a role change --
previously neither path created the role-specific profile row at all, so
these accounts had no ID and (for Student/Parent) no profile row whatsoever.

Run with:
    python manage.py test portal.tests.test_id_assignment
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.db import connection
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from portal.admin_views import assign_role_id

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_admin(username="id_test_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


class AssignRoleIdTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.student = User.objects.create_user(username="id_student", password="x", email="id_student@edunova.edu")
        self.teacher = User.objects.create_user(username="id_teacher", password="x", email="id_teacher@edunova.edu")
        self.parent = User.objects.create_user(username="id_parent", password="x", email="id_parent@edunova.edu")

    def test_assigns_admission_number_to_student(self):
        id_number = assign_role_id(self.student, "Student")
        self.assertTrue(id_number.startswith("STU-"))
        row = connection.cursor()
        row.execute("SELECT admission_number FROM portal_student_profile WHERE user_id=%s", [self.student.id])
        self.assertEqual(row.fetchone()[0], id_number)

    def test_assigns_employee_code_to_teacher(self):
        id_number = assign_role_id(self.teacher, "Teacher")
        self.assertTrue(id_number.startswith("EMP-"))
        row = connection.cursor()
        row.execute("SELECT employee_code FROM portal_teacher_profile WHERE user_id=%s", [self.teacher.id])
        self.assertEqual(row.fetchone()[0], id_number)

    def test_assigns_parent_code_to_parent(self):
        id_number = assign_role_id(self.parent, "Parent")
        self.assertTrue(id_number.startswith("PAR-"))
        row = connection.cursor()
        row.execute("SELECT parent_code FROM portal_parent_profile WHERE user_id=%s", [self.parent.id])
        self.assertEqual(row.fetchone()[0], id_number)

    def test_idempotent_does_not_reassign(self):
        first = assign_role_id(self.student, "Student")
        second = assign_role_id(self.student, "Student")
        self.assertEqual(first, second)

    def test_admin_role_has_no_id_number(self):
        self.assertIsNone(assign_role_id(self.parent, "Admin"))


class UserCreationAssignsIdTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('IdTest', 'X') RETURNING id")
            self.class_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_subject (name, subject_code) VALUES ('Id Test Subject', 'IDT101') RETURNING id")
            self.subject_id = cursor.fetchone()[0]

    def test_create_teacher_via_admin_portal_gets_employee_code(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={
                "role": "Teacher", "email": "new.teacher.idtest@edunova.edu", "first_name": "New", "last_name": "Teacher",
                "department": "Mathematics", "class_id": self.class_id, "subject_id": self.subject_id,
            },
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["id_number"].startswith("EMP-"))
        row = connection.cursor()
        row.execute("SELECT department FROM portal_teacher_profile WHERE employee_code=%s", [data["id_number"]])
        self.assertEqual(row.fetchone()[0], "Mathematics")
        row.execute(
            "SELECT 1 FROM portal_academic_allocation WHERE class_id=%s AND subject_id=%s AND teacher_id=%s",
            [self.class_id, self.subject_id, data["id"]],
        )
        self.assertIsNotNone(row.fetchone())

    def test_create_teacher_without_department_is_rejected(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={
                "role": "Teacher", "email": "no.department.idtest@edunova.edu", "first_name": "No", "last_name": "Department",
                "class_id": self.class_id, "subject_id": self.subject_id,
            },
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_create_teacher_without_assignment_is_rejected(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={
                "role": "Teacher", "email": "no.assignment.idtest@edunova.edu", "first_name": "No", "last_name": "Assignment",
                "department": "Science",
            },
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_create_teacher_with_invalid_class_is_rejected(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={
                "role": "Teacher", "email": "bad.class.idtest@edunova.edu", "first_name": "Bad", "last_name": "Class",
                "department": "Science", "class_id": 999999, "subject_id": self.subject_id,
            },
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_create_parent_via_admin_portal_gets_parent_code(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={"role": "Parent", "email": "new.parent.idtest@edunova.edu", "first_name": "New", "last_name": "Parent"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["id_number"].startswith("PAR-"))

    def test_create_student_via_admin_portal_gets_admission_number(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={"role": "Student", "email": "new.student.idtest@edunova.edu", "first_name": "New", "last_name": "Student"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["id_number"].startswith("STU-"))
        self.assertIsNone(data["class_assigned"])
        self.assertIsNone(data["class_assignment_error"])

    def test_create_student_with_class_id_enrolls_them(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={
                "role": "Student", "email": "with.class.idtest@edunova.edu", "first_name": "With", "last_name": "Class",
                "class_id": self.class_id,
            },
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["class_assigned"], "IdTest-X")
        self.assertIsNone(data["class_assignment_error"])

        row = connection.cursor()
        row.execute("SELECT class_id FROM portal_student_enrollment WHERE student_id=%s", [data["id"]])
        self.assertEqual(row.fetchone()[0], self.class_id)

    def test_create_student_with_invalid_class_id_still_succeeds(self):
        resp = self.client.post(
            "/api/admin-portal/users/",
            data={
                "role": "Student", "email": "bad.class.student.idtest@edunova.edu", "first_name": "Bad", "last_name": "Class",
                "class_id": 999999,
            },
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["id_number"].startswith("STU-"))
        self.assertIsNone(data["class_assigned"])
        self.assertEqual(data["class_assignment_error"], "Class not found.")
