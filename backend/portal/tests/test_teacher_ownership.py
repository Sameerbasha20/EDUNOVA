"""
Regression tests for the teacher class/subject allocation-ownership gap:
attendance, homework, assignments, exams, marks-entry, and the class roster
used to accept a client-supplied class_id/subject_id/exam_schedule_id/
assignment_id with no check that the requesting teacher is actually
allocated to teach that class -- any teacher could read or write another
teacher's class just by guessing/enumerating an id.

Run with:
    python manage.py test portal.tests.test_teacher_ownership
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


def _make_teacher(username):
    user = User.objects.create_user(username=username, password="TestPass@99", email=f"{username}@edunova.edu")
    group, _ = Group.objects.get_or_create(name="Teacher")
    user.groups.add(group)
    return user


class TeacherClassOwnershipTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.owner = _make_teacher("ownership_teacher_owner")
        self.intruder = _make_teacher("ownership_teacher_intruder")
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_class (name, section) VALUES ('OwnershipTest', 'X') RETURNING id"
            )
            self.class_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_subject (name, subject_code) VALUES ('Ownership Subject', 'OWN101') RETURNING id"
            )
            self.subject_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_academic_allocation (class_id, subject_id, teacher_id) VALUES (%s,%s,%s)",
                [self.class_id, self.subject_id, self.owner.id],
            )
            cursor.execute(
                "INSERT INTO portal_exam_schedule (class_id, subject_id, teacher_id, exam_name, exam_date) "
                "VALUES (%s,%s,%s,'Unit_Test_1', current_date) RETURNING id",
                [self.class_id, self.subject_id, self.owner.id],
            )
            self.exam_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_assignment (class_id, subject_id, teacher_id, title, description, due_date) "
                "VALUES (%s,%s,%s,'Ownership Assignment','test',current_date) RETURNING id",
                [self.class_id, self.subject_id, self.owner.id],
            )
            self.assignment_id = cursor.fetchone()[0]

    def test_intruder_cannot_view_roster(self):
        resp = self.client.get(f"/api/teacher/classes/{self.class_id}/roster/", **_auth_header(self.intruder))
        self.assertEqual(resp.status_code, 403)

    def test_owner_can_view_roster(self):
        resp = self.client.get(f"/api/teacher/classes/{self.class_id}/roster/", **_auth_header(self.owner))
        self.assertNotEqual(resp.status_code, 403)

    def test_intruder_cannot_mark_attendance(self):
        resp = self.client.post(
            "/api/teacher/attendance/",
            data={"class_id": self.class_id, "date": "2026-01-01", "records": []},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 403)

    def test_owner_can_mark_attendance(self):
        resp = self.client.post(
            "/api/teacher/attendance/",
            data={"class_id": self.class_id, "date": "2026-01-01", "records": []},
            content_type="application/json",
            **_auth_header(self.owner),
        )
        self.assertNotEqual(resp.status_code, 403)

    def test_intruder_cannot_assign_homework(self):
        resp = self.client.post(
            "/api/teacher/homework/",
            data={"class_id": self.class_id, "subject_id": self.subject_id, "title": "x", "due_date": "2026-01-01"},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 403)

    def test_intruder_cannot_create_assignment(self):
        resp = self.client.post(
            "/api/teacher/assignments/",
            data={"class_id": self.class_id, "subject_id": self.subject_id, "title": "x", "due_date": "2026-01-01T00:00:00Z"},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 403)

    def test_intruder_cannot_schedule_exam(self):
        resp = self.client.post(
            "/api/teacher/exams/",
            data={"class_id": self.class_id, "subject_id": self.subject_id, "exam_name": "Unit_Test_2", "exam_date": "2026-01-01"},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 403)

    def test_intruder_cannot_view_others_marks_entry(self):
        resp = self.client.get(
            f"/api/teacher/marks-entry/?exam_schedule_id={self.exam_id}", **_auth_header(self.intruder)
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIsNone(resp.json()["exam"])

    def test_intruder_cannot_submit_others_marks(self):
        resp = self.client.post(
            "/api/teacher/marks-entry/",
            data={"exam_schedule_id": self.exam_id, "entries": [{"student": self.intruder.id, "marks_obtained": 99}]},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 404)

    def test_intruder_cannot_view_others_assignment_submissions(self):
        resp = self.client.get(
            f"/api/teacher/assignments/{self.assignment_id}/submissions/", **_auth_header(self.intruder)
        )
        self.assertEqual(resp.status_code, 403)

    def test_intruder_cannot_grade_others_assignment_submission(self):
        resp = self.client.patch(
            f"/api/teacher/assignments/{self.assignment_id}/submissions/1/",
            data={"marks_obtained": 100},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 403)

    def test_intruder_cannot_view_performance_analytics(self):
        resp = self.client.get(
            f"/api/teacher/performance/?class_id={self.class_id}&subject_id={self.subject_id}",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 403)
