"""
Regression tests for parent-portal IDOR gaps found in the production-
readiness audit: PtmBookingView.post and MessageThreadView.post both let a
parent target an arbitrary teacher_id/receiver with zero check that the
teacher actually teaches one of their children's classes -- a parent could
book a meeting with or message any user in the system just by supplying
any id. ChildFeesPayView.post also had no check that the fee_structure
belonged to the child's class, and no duplicate-payment guard.

Run with:
    python manage.py test portal.tests.test_parent_ownership
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


def _make_user(username, role):
    user = User.objects.create_user(username=username, password="TestPass@99", email=f"{username}@edunova.edu")
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)
    return user


class ParentOwnershipTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.parent = _make_user("par_own_parent", "Parent")
        self.child = _make_user("par_own_child", "Student")
        self.unrelated_teacher = _make_user("par_own_unrelated_teacher", "Teacher")
        self.real_teacher = _make_user("par_own_real_teacher", "Teacher")
        self.other_student = _make_user("par_own_other_student", "Student")

        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('ParOwn', 'A') RETURNING id")
            self.class_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('ParOwnOther', 'B') RETURNING id")
            self.other_class_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_subject (name, subject_code) VALUES ('Par Own Subject', 'PAROWN1') RETURNING id")
            self.subject_id = cursor.fetchone()[0]

            cursor.execute(
                "INSERT INTO portal_student_profile (user_id, admission_number, parent_id) VALUES (%s,'PAR-OWN-STU',%s)",
                [self.child.id, self.parent.id],
            )
            cursor.execute(
                "INSERT INTO portal_student_enrollment (student_id, class_id, academic_year) VALUES (%s,%s,'2025-26')",
                [self.child.id, self.class_id],
            )
            cursor.execute(
                "INSERT INTO portal_academic_allocation (class_id, subject_id, teacher_id) VALUES (%s,%s,%s)",
                [self.class_id, self.subject_id, self.real_teacher.id],
            )
            cursor.execute(
                "INSERT INTO portal_fee_structure (class_id, term_name, total_amount) VALUES (%s,'Term 1',1000) RETURNING id",
                [self.class_id],
            )
            self.fee_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO portal_fee_structure (class_id, term_name, total_amount) VALUES (%s,'Term 1',1000) RETURNING id",
                [self.other_class_id],
            )
            self.other_class_fee_id = cursor.fetchone()[0]

    # --- PTM booking ---

    def test_cannot_book_ptm_with_unrelated_teacher(self):
        resp = self.client.post(
            "/api/parent/ptm/",
            data={"teacher_id": self.unrelated_teacher.id, "meeting_date": "2026-01-01", "time_slot": "10:00"},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 403)

    def test_can_book_ptm_with_real_teacher(self):
        resp = self.client.post(
            "/api/parent/ptm/",
            data={"teacher_id": self.real_teacher.id, "student_id": self.child.id, "meeting_date": "2026-01-01", "time_slot": "10:00"},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 200)

    def test_cannot_book_ptm_naming_another_parents_child(self):
        resp = self.client.post(
            "/api/parent/ptm/",
            data={"teacher_id": self.real_teacher.id, "student_id": self.other_student.id, "meeting_date": "2026-01-01", "time_slot": "10:00"},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 403)

    # --- Messaging ---

    def test_cannot_message_unrelated_teacher(self):
        resp = self.client.post(
            "/api/parent/messages/",
            data={"receiver": self.unrelated_teacher.id, "message_text": "hello"},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 403)

    def test_can_message_real_teacher(self):
        resp = self.client.post(
            "/api/parent/messages/",
            data={"receiver": self.real_teacher.id, "message_text": "hello"},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 200)

    # --- Fee payment ---

    def test_cannot_pay_fee_from_another_class(self):
        resp = self.client.post(
            "/api/parent/fees/pay/",
            data={"child_id": self.child.id, "fee_structure_id": self.other_class_fee_id},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 400)

    def test_can_pay_own_child_fee(self):
        resp = self.client.post(
            "/api/parent/fees/pay/",
            data={"child_id": self.child.id, "fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(resp.status_code, 200)

    def test_cannot_pay_the_same_fee_twice(self):
        first = self.client.post(
            "/api/parent/fees/pay/",
            data={"child_id": self.child.id, "fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(first.status_code, 200)

        second = self.client.post(
            "/api/parent/fees/pay/",
            data={"child_id": self.child.id, "fee_structure_id": self.fee_id},
            content_type="application/json",
            **_auth_header(self.parent),
        )
        self.assertEqual(second.status_code, 400)
        self.assertEqual(second.json()["detail"], "This fee has already been paid.")
