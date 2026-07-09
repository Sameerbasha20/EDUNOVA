"""
Regression tests for student-facing IDOR gaps found in the production-
readiness audit: AssignmentSubmitView, QuizDetailView (GET+POST), and
InitiatePaymentView all trusted a client-supplied id (assignment_id,
quiz_id, fee_structure_id) with no check that it actually belonged to a
class the requesting student is enrolled in -- any authenticated student
could submit/view/pay against another class's data just by
guessing/incrementing an id, the same category of bug already found and
fixed for teachers (see test_teacher_ownership.py).

Run with:
    python manage.py test portal.tests.test_student_ownership
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


def _make_student(username):
    user = User.objects.create_user(username=username, password="TestPass@99", email=f"{username}@edunova.edu")
    group, _ = Group.objects.get_or_create(name="Student")
    user.groups.add(group)
    return user


class StudentOwnershipTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.owner = _make_student("stu_ownership_owner")
        self.intruder = _make_student("stu_ownership_intruder")

        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('StuOwnA', 'A') RETURNING id")
            self.class_a = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('StuOwnB', 'B') RETURNING id")
            self.class_b = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_subject (name, subject_code) VALUES ('Stu Own Subject', 'STUOWN1') RETURNING id")
            self.subject_id = cursor.fetchone()[0]

            cursor.execute(
                "INSERT INTO portal_student_enrollment (student_id, class_id, academic_year) VALUES (%s,%s,'2025-26')",
                [self.owner.id, self.class_a],
            )
            cursor.execute(
                "INSERT INTO portal_student_enrollment (student_id, class_id, academic_year) VALUES (%s,%s,'2025-26')",
                [self.intruder.id, self.class_b],
            )

            cursor.execute(
                "INSERT INTO portal_assignment (class_id, subject_id, title, description, due_date) "
                "VALUES (%s,%s,'Class A Assignment','test',current_date) RETURNING id",
                [self.class_a, self.subject_id],
            )
            self.assignment_id = cursor.fetchone()[0]

            cursor.execute(
                "INSERT INTO portal_course (subject_id, class_id, title) VALUES (%s,%s,'Class A Course') RETURNING id",
                [self.subject_id, self.class_a],
            )
            self.course_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_quiz (course_id, title, duration_minutes, passing_score) "
                "VALUES (%s,'Class A Quiz',10,40) RETURNING id",
                [self.course_id],
            )
            self.quiz_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_quiz_question (quiz_id, question_text, options, correct_answer) "
                "VALUES (%s,'2+2?','{\"a\":\"3\",\"b\":\"4\"}','b')",
                [self.quiz_id],
            )

            cursor.execute(
                "INSERT INTO portal_fee_structure (class_id, term_name, total_amount) VALUES (%s,'Term 1',1000) RETURNING id",
                [self.class_a],
            )
            self.fee_id = cursor.fetchone()[0]

    # --- Assignment submission ---

    def test_intruder_cannot_submit_assignment_from_another_class(self):
        resp = self.client.post(
            f"/api/student/assignments/{self.assignment_id}/submit/",
            data={"submission_url": "http://example.com/x.pdf"},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 404)

    def test_owner_can_submit_own_assignment(self):
        resp = self.client.post(
            f"/api/student/assignments/{self.assignment_id}/submit/",
            data={"submission_url": "http://example.com/x.pdf"},
            content_type="application/json",
            **_auth_header(self.owner),
        )
        self.assertEqual(resp.status_code, 200)

    # --- Quiz ---

    def test_intruder_cannot_view_quiz_from_another_class(self):
        resp = self.client.get(f"/api/student/quizzes/{self.quiz_id}/", **_auth_header(self.intruder))
        self.assertEqual(resp.status_code, 404)

    def test_intruder_cannot_submit_quiz_from_another_class(self):
        resp = self.client.post(
            f"/api/student/quizzes/{self.quiz_id}/",
            data={"answers": {}},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 404)

    def test_owner_can_view_and_submit_own_quiz(self):
        resp = self.client.get(f"/api/student/quizzes/{self.quiz_id}/", **_auth_header(self.owner))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()["questions"]), 1)

        resp = self.client.post(
            f"/api/student/quizzes/{self.quiz_id}/",
            data={"answers": {}},
            content_type="application/json",
            **_auth_header(self.owner),
        )
        self.assertEqual(resp.status_code, 200)

    # --- Payment ---

    def test_intruder_cannot_pay_fee_from_another_class(self):
        resp = self.client.post(
            "/api/student/fees/pay/",
            data={"fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.intruder),
        )
        self.assertEqual(resp.status_code, 400)

    def test_owner_can_pay_own_fee(self):
        resp = self.client.post(
            "/api/student/fees/pay/",
            data={"fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.owner),
        )
        self.assertEqual(resp.status_code, 200)

    def test_owner_cannot_pay_the_same_fee_twice(self):
        first = self.client.post(
            "/api/student/fees/pay/",
            data={"fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.owner),
        )
        self.assertEqual(first.status_code, 200)

        second = self.client.post(
            "/api/student/fees/pay/",
            data={"fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.owner),
        )
        self.assertEqual(second.status_code, 400)
        self.assertEqual(second.json()["detail"], "This fee has already been paid.")
