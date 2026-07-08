"""
Tests for the OTP authentication flow.

Run with:
    python manage.py test portal.tests.test_auth
"""
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse

User = get_user_model()

LOGIN_URL = "/api/auth/login/"
VERIFY_URL = "/api/auth/verify-otp/"
RESEND_URL = "/api/auth/resend-otp/"


def _make_user(username="testuser", password="TestPass@99", email="test@edunova.edu", active=True):
    user = User.objects.create_user(username=username, password=password, email=email)
    user.is_active = active
    user.save()
    return user


class LoginStep1Tests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = _make_user()

    def tearDown(self):
        cache.clear()

    @patch("portal.services.email_service.send_login_otp_email")
    def test_valid_credentials_sends_email(self, mock_send):
        resp = self.client.post(LOGIN_URL, {"email": "test@edunova.edu", "password": "TestPass@99"}, content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("user_id", resp.json())
        self.assertEqual(resp.json()["detail"], "OTP sent successfully.")
        mock_send.assert_called_once()

    @patch("portal.services.email_service.send_login_otp_email")
    def test_otp_not_in_response(self, mock_send):
        resp = self.client.post(LOGIN_URL, {"email": "test@edunova.edu", "password": "TestPass@99"}, content_type="application/json")
        self.assertNotIn("otp", resp.json())
        self.assertNotIn("dev_otp", resp.json())

    @patch("portal.services.email_service.send_login_otp_email")
    def test_login_by_username(self, mock_send):
        resp = self.client.post(LOGIN_URL, {"email": "testuser", "password": "TestPass@99"}, content_type="application/json")
        self.assertEqual(resp.status_code, 200)

    def test_wrong_password_returns_400(self):
        resp = self.client.post(LOGIN_URL, {"email": "test@edunova.edu", "password": "WrongPass"}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    def test_unknown_user_returns_400(self):
        resp = self.client.post(LOGIN_URL, {"email": "nobody@edunova.edu", "password": "TestPass@99"}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    def test_inactive_user_returns_400(self):
        inactive = _make_user(username="inactive", email="inactive@edunova.edu", active=False)
        resp = self.client.post(LOGIN_URL, {"email": "inactive@edunova.edu", "password": "TestPass@99"}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    @patch("portal.services.email_service.send_login_otp_email", side_effect=RuntimeError("SMTP down"))
    def test_smtp_failure_returns_500(self, mock_send):
        resp = self.client.post(LOGIN_URL, {"email": "test@edunova.edu", "password": "TestPass@99"}, content_type="application/json")
        self.assertEqual(resp.status_code, 500)
        self.assertEqual(resp.json()["detail"], "Unable to send verification email.")


class OtpVerifyTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = _make_user()

    def tearDown(self):
        cache.clear()

    def _store_otp(self, otp="654321"):
        cache.set(f"portal_login_otp:{self.user.id}", otp, 300)
        return otp

    def test_valid_otp_returns_jwt(self):
        otp = self._store_otp()
        resp = self.client.post(VERIFY_URL, {"user_id": self.user.id, "otp": otp}, content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertIn("user", data)

    def test_invalid_otp_returns_400(self):
        self._store_otp("654321")
        resp = self.client.post(VERIFY_URL, {"user_id": self.user.id, "otp": "000000"}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    def test_expired_otp_returns_400(self):
        # No OTP stored — simulates expiry
        resp = self.client.post(VERIFY_URL, {"user_id": self.user.id, "otp": "123456"}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    def test_otp_consumed_after_use(self):
        otp = self._store_otp()
        self.client.post(VERIFY_URL, {"user_id": self.user.id, "otp": otp}, content_type="application/json")
        # Second attempt with same OTP must fail
        resp = self.client.post(VERIFY_URL, {"user_id": self.user.id, "otp": otp}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    def test_missing_fields_returns_400(self):
        resp = self.client.post(VERIFY_URL, {"user_id": self.user.id}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)


class ResendOtpTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = _make_user()

    def tearDown(self):
        cache.clear()

    @patch("portal.services.email_service.send_login_otp_email")
    def test_resend_sends_new_email(self, mock_send):
        cache.set(f"portal_login_otp:{self.user.id}", "111111", 300)
        resp = self.client.post(RESEND_URL, {"user_id": self.user.id}, content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["detail"], "OTP resent successfully.")
        mock_send.assert_called_once()

    @patch("portal.services.email_service.send_login_otp_email")
    def test_resend_invalidates_previous_otp(self, mock_send):
        old_otp = "111111"
        cache.set(f"portal_login_otp:{self.user.id}", old_otp, 300)
        self.client.post(RESEND_URL, {"user_id": self.user.id}, content_type="application/json")

        # Old OTP must no longer work
        resp = self.client.post(VERIFY_URL, {"user_id": self.user.id, "otp": old_otp}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    @patch("portal.services.email_service.send_login_otp_email")
    def test_resend_otp_not_in_response(self, mock_send):
        resp = self.client.post(RESEND_URL, {"user_id": self.user.id}, content_type="application/json")
        self.assertNotIn("otp", resp.json())
        self.assertNotIn("dev_otp", resp.json())

    def test_resend_unknown_user_returns_404(self):
        resp = self.client.post(RESEND_URL, {"user_id": 99999}, content_type="application/json")
        self.assertEqual(resp.status_code, 404)

    @patch("portal.services.email_service.send_login_otp_email", side_effect=RuntimeError("SMTP down"))
    def test_resend_smtp_failure_returns_500(self, mock_send):
        resp = self.client.post(RESEND_URL, {"user_id": self.user.id}, content_type="application/json")
        self.assertEqual(resp.status_code, 500)
