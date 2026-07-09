"""
Regression tests for transport assignment on admission confirmation. The
public admission form now captures needs_transport + preferred_pickup_point
at intake; confirming the admission lets the admin resolve that into an
actual portal_transport_allocation row (route_id + vehicle_id are real FKs
the admin picks -- the enquiry itself only ever has free-text intent, same
reasoning as target_class).

Run with:
    python manage.py test portal.tests.test_admission_transport_assignment
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


def _make_admin(username="admission_transport_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


def _make_enquiry(tag, needs_transport=True):
    return AdmissionEnquiry.objects.create(
        applicant_name=f"Transport Assign Student {tag}",
        date_of_birth=date(2013, 5, 1),
        gender="Female",
        target_class="Grade 6",
        parent_name=f"Transport Assign Parent {tag}",
        parent_phone="9999999999",
        parent_email=f"transport.assign.parent.{tag}@edunova.edu",
        address="123 Test Street",
        status="Fee_Pending",
        needs_transport=needs_transport,
        preferred_pickup_point="Near Test Circle",
    )


class AdmissionTransportAssignmentTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_route (route_name, start_point, end_point) VALUES ('Route T', 'A', 'B') RETURNING id")
            self.route_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO portal_vehicle (vehicle_number, capacity) VALUES ('BUS-T-1', 40) RETURNING id")
            self.vehicle_id = cursor.fetchone()[0]

    def _advance(self, enquiry, **extra):
        payload = {"action": "advance", **extra}
        return self.client.post(
            f"/api/admin-portal/admissions/{enquiry.registration_number}/action/",
            data=payload,
            content_type="application/json",
            **_auth_header(self.admin),
        )

    def test_needs_transport_and_pickup_point_are_captured_at_intake(self):
        enquiry = _make_enquiry("a")
        self.assertTrue(enquiry.needs_transport)
        self.assertEqual(enquiry.preferred_pickup_point, "Near Test Circle")

    def test_confirming_with_route_and_vehicle_creates_allocation(self):
        enquiry = _make_enquiry("b")
        resp = self._advance(enquiry, route_id=self.route_id, vehicle_id=self.vehicle_id)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["credentials"]["transport_assigned"], "Route T (BUS-T-1)")
        self.assertIsNone(data["credentials"]["transport_assignment_error"])

        enquiry.refresh_from_db()
        row = connection.cursor()
        row.execute(
            "SELECT vehicle_id, route_id, pickup_point FROM portal_transport_allocation WHERE student_id=%s",
            [enquiry.student_user_id],
        )
        result = row.fetchone()
        self.assertIsNotNone(result)
        self.assertEqual(result[0], self.vehicle_id)
        self.assertEqual(result[1], self.route_id)
        self.assertEqual(result[2], "Near Test Circle")

    def test_confirming_without_transport_fields_still_creates_accounts(self):
        enquiry = _make_enquiry("c")
        resp = self._advance(enquiry)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNone(data["credentials"]["transport_assigned"])
        self.assertIsNone(data["credentials"]["transport_assignment_error"])
        self.assertTrue(data["credentials"]["student_username"])

    def test_confirming_with_invalid_route_still_creates_accounts(self):
        enquiry = _make_enquiry("d")
        resp = self._advance(enquiry, route_id=999999, vehicle_id=self.vehicle_id)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNone(data["credentials"]["transport_assigned"])
        self.assertEqual(data["credentials"]["transport_assignment_error"], "Route or vehicle not found.")
        self.assertTrue(data["credentials"]["student_username"])
