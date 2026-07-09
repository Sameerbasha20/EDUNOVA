"""
Regression tests for JWT refresh-token rotation, blacklist-on-rotation, and
logout: previously SIMPLE_JWT had no rotation/blacklist configured and there
was no /api/auth/logout/ endpoint at all -- a refresh token copied out of
browser storage (XSS, shared device, browser extension) stayed valid for
the full 7-day lifetime even after the legitimate user logged out, because
"logout" only cleared localStorage client-side and never told the backend.

Run with:
    python manage.py test portal.tests.test_auth_session_security
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _make_user(username="session_sec_user"):
    return User.objects.create_user(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


class RefreshRotationTests(TestCase):
    def setUp(self):
        self.user = _make_user()

    def test_refresh_returns_a_new_refresh_token(self):
        original = RefreshToken.for_user(self.user)
        resp = self.client.post(
            "/api/auth/refresh/", data={"refresh": str(original)}, content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertNotEqual(data["refresh"], str(original))

    def test_old_refresh_token_is_blacklisted_after_use(self):
        original = RefreshToken.for_user(self.user)
        first = self.client.post(
            "/api/auth/refresh/", data={"refresh": str(original)}, content_type="application/json",
        )
        self.assertEqual(first.status_code, 200)

        # Reusing the same (now-rotated) refresh token must fail.
        second = self.client.post(
            "/api/auth/refresh/", data={"refresh": str(original)}, content_type="application/json",
        )
        self.assertEqual(second.status_code, 401)


class LogoutTests(TestCase):
    def setUp(self):
        self.user = _make_user("logout_sec_user")

    def test_logout_blacklists_the_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        resp = self.client.post(
            "/api/auth/logout/", data={"refresh": str(refresh)}, content_type="application/json",
        )
        self.assertEqual(resp.status_code, 205)

        # The token logout just blacklisted must now be rejected everywhere.
        reuse = self.client.post(
            "/api/auth/refresh/", data={"refresh": str(refresh)}, content_type="application/json",
        )
        self.assertEqual(reuse.status_code, 401)

    def test_logout_without_a_token_does_not_error(self):
        resp = self.client.post("/api/auth/logout/", data={}, content_type="application/json")
        self.assertEqual(resp.status_code, 205)

    def test_logout_with_garbage_token_does_not_error(self):
        resp = self.client.post(
            "/api/auth/logout/", data={"refresh": "not-a-real-token"}, content_type="application/json",
        )
        self.assertEqual(resp.status_code, 205)
