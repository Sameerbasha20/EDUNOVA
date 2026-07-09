"""
Regression tests for exam_extras_views.py (rank lists, report cards):
unlike admin_views.py, this file never imported/caught DataError -- a
non-numeric exam_schedule_id/class_id/student_id raised an unhandled
"invalid input syntax for integer" -> 500 instead of a clean 400. Same
root-cause class already fixed across admin_views.py/facilities_views.py
this session, just missed in this file.

Run with:
    python manage.py test portal.tests.test_exam_extras_errors
"""
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_admin(username="exam_extras_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


class ExamExtrasErrorHandlingTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()

    def test_rank_list_get_with_non_numeric_id_returns_400_not_500(self):
        resp = self.client.get(
            "/api/admin-portal/rank-list/?exam_schedule_id=not-a-number", **_auth_header(self.admin)
        )
        self.assertEqual(resp.status_code, 400)

    def test_rank_list_post_with_non_numeric_id_returns_400_not_500(self):
        resp = self.client.post(
            "/api/admin-portal/rank-list/",
            data={"exam_schedule_id": "not-a-number"},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_overall_rank_list_with_non_numeric_class_returns_400_not_500(self):
        resp = self.client.get(
            "/api/admin-portal/rank-list/overall/?class_id=not-a-number&exam_name=Unit_Test_1",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)

    def test_report_card_with_non_numeric_student_returns_400_not_500(self):
        resp = self.client.get(
            "/api/admin-portal/report-card/?student_id=not-a-number&exam_name=Unit_Test_1",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)
