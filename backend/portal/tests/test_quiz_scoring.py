"""
Regression test for QuizDetailView.post(), which used to unconditionally
return {"score": 0, "detail": "..."} regardless of the student's actual
answers -- the frontend reads result.percentage/passed/total/score, none of
which existed in that response, so every quiz submission rendered
"undefined%" and "Not passed" no matter what the student picked.

portal_quiz_question.correct_answer already existed in the schema, unused.

Run with:
    python manage.py test portal.tests.test_quiz_scoring
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


class QuizScoringTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.student = User.objects.create_user(
            username="quiz_student", password="TestPass@99", email="quiz_student@edunova.edu"
        )
        group, _ = Group.objects.get_or_create(name="Student")
        self.student.groups.add(group)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_quiz (title, duration_minutes, passing_score) "
                "VALUES ('Scoring Test Quiz', 10, 50) RETURNING id"
            )
            self.quiz_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_quiz_question (quiz_id, question_text, options, correct_answer) "
                "VALUES (%s, 'Q1', '{\"A\":\"Right\",\"B\":\"Wrong\"}'::jsonb, 'A') RETURNING id",
                [self.quiz_id],
            )
            self.q1_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_quiz_question (quiz_id, question_text, options, correct_answer) "
                "VALUES (%s, 'Q2', '{\"A\":\"Wrong\",\"B\":\"Right\"}'::jsonb, 'B') RETURNING id",
                [self.quiz_id],
            )
            self.q2_id = cursor.fetchone()[0]

    def _submit(self, answers):
        return self.client.post(
            f"/api/student/quizzes/{self.quiz_id}/",
            data={"answers": answers},
            content_type="application/json",
            **_auth_header(self.student),
        )

    def test_all_correct_passes(self):
        resp = self._submit({str(self.q1_id): "A", str(self.q2_id): "B"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["score"], 2)
        self.assertEqual(data["total"], 2)
        self.assertEqual(data["percentage"], 100)
        self.assertTrue(data["passed"])

    def test_all_wrong_fails(self):
        resp = self._submit({str(self.q1_id): "B", str(self.q2_id): "A"})
        data = resp.json()
        self.assertEqual(data["score"], 0)
        self.assertEqual(data["percentage"], 0)
        self.assertFalse(data["passed"])

    def test_partial_score_matches_passing_threshold(self):
        # 1/2 correct = 50%, quiz passing_score is 50 -> exactly passes
        resp = self._submit({str(self.q1_id): "A", str(self.q2_id): "A"})
        data = resp.json()
        self.assertEqual(data["score"], 1)
        self.assertEqual(data["percentage"], 50)
        self.assertTrue(data["passed"])

    def test_missing_answers_scored_as_wrong_not_crashed(self):
        resp = self._submit({})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["score"], 0)
        self.assertFalse(data["passed"])
