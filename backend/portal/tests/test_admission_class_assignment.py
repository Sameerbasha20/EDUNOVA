"""
Regression tests for automatic class assignment on admission confirmation:
previously, confirming an admission (Fee_Pending -> Confirmed) created the
Student + Parent accounts but never enrolled the student into any class --
`target_class` on the enquiry is free text, never resolved to a real
portal_class row. Since fees, timetable, and LMS access are all computed
live from portal_student_enrollment, a student with no class enrollment
had none of those working either, even though their account existed.

Run with:
    python manage.py test portal.tests.test_admission_class_assignment
"""
from datetime import date

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import connection
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.admissions.models import AdmissionEnquiry

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_admin(username="admission_class_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


def _make_enquiry(tag):
    return AdmissionEnquiry.objects.create(
        applicant_name=f"Class Assign Student {tag}",
        date_of_birth=date(2013, 5, 1),
        gender="Female",
        target_class="Grade 6",
        parent_name=f"Class Assign Parent {tag}",
        parent_phone="9999999999",
        parent_email=f"class.assign.parent.{tag}@edunova.edu",
        address="123 Test Street",
        status="Fee_Pending",
    )


class AdmissionClassAssignmentTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('Grade 6', 'A') RETURNING id")
            self.class_id = cursor.fetchone()[0]

    def _advance(self, enquiry, class_id=None):
        payload = {"action": "advance"}
        if class_id is not None:
            payload["class_id"] = class_id
        return self.client.post(
            f"/api/admin-portal/admissions/{enquiry.registration_number}/action/",
            data=payload,
            content_type="application/json",
            **_auth_header(self.admin),
        )

    def test_confirming_with_class_id_creates_enrollment(self):
        enquiry = _make_enquiry("a")
        resp = self._advance(enquiry, class_id=self.class_id)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["credentials"]["class_assigned"], "Grade 6-A")
        self.assertIsNone(data["credentials"]["class_assignment_error"])

        enquiry.refresh_from_db()
        row = connection.cursor()
        row.execute(
            "SELECT class_id, roll_number FROM portal_student_enrollment WHERE student_id=%s",
            [enquiry.student_user_id],
        )
        result = row.fetchone()
        self.assertIsNotNone(result)
        self.assertEqual(result[0], self.class_id)
        self.assertGreaterEqual(result[1], 1)

    def test_confirming_without_class_id_still_creates_accounts(self):
        enquiry = _make_enquiry("b")
        resp = self._advance(enquiry)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNone(data["credentials"]["class_assigned"])
        self.assertIsNone(data["credentials"]["class_assignment_error"])
        self.assertTrue(data["credentials"]["student_username"])

    def test_confirming_with_invalid_class_id_still_creates_accounts(self):
        enquiry = _make_enquiry("c")
        resp = self._advance(enquiry, class_id=999999)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNone(data["credentials"]["class_assigned"])
        self.assertEqual(data["credentials"]["class_assignment_error"], "Class not found.")
        self.assertTrue(data["credentials"]["student_username"])

    def test_reenrolling_in_a_different_class_updates_in_place_not_duplicates(self):
        # QA testing found two students live with two active enrollments for
        # the same academic year in different classes -- current_class_for_
        # student() then silently guessed between them via ORDER BY id DESC.
        # _enroll_student_in_class must never leave a student with more than
        # one enrollment row per academic year.
        from portal.admin_views import _enroll_student_in_class

        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_class (name, section) VALUES ('Grade 6', 'B') RETURNING id")
            other_class_id = cursor.fetchone()[0]

        student = User.objects.create_user(username="reenroll_student", password="x", email="reenroll@edunova.edu")

        class_name, error = _enroll_student_in_class(student, self.class_id)
        self.assertIsNone(error)
        self.assertEqual(class_name, "Grade 6-A")

        class_name, error = _enroll_student_in_class(student, other_class_id)
        self.assertIsNone(error)
        self.assertEqual(class_name, "Grade 6-B")

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT class_id FROM portal_student_enrollment WHERE student_id=%s",
                [student.id],
            )
            rows = cursor.fetchall()
        self.assertEqual(len(rows), 1, "student must have exactly one enrollment row for the academic year")
        self.assertEqual(rows[0][0], other_class_id)

    def test_roll_numbers_increment_within_same_class_and_year(self):
        first = _make_enquiry("d")
        second = _make_enquiry("e")
        r1 = self._advance(first, class_id=self.class_id).json()
        r2 = self._advance(second, class_id=self.class_id).json()

        rows = connection.cursor()
        rows.execute(
            "SELECT student_id, roll_number FROM portal_student_enrollment WHERE class_id=%s ORDER BY roll_number",
            [self.class_id],
        )
        results = rows.fetchall()
        roll_numbers = [r[1] for r in results]
        self.assertEqual(len(roll_numbers), len(set(roll_numbers)), "roll numbers must be unique per class/year")
