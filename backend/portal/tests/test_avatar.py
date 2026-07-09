"""
Regression tests for profile picture upload/replace/delete
(POST/DELETE /api/profile/avatar/). Hits real Supabase Storage (the
student-avatars bucket) since there's no mocking layer for it in this
codebase -- consistent with how the rest of this test suite runs against
the real configured database rather than a fake.

Run with:
    python manage.py test portal.tests.test_avatar
"""
import io

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _png_bytes():
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), color="blue").save(buf, format="PNG")
    return buf.getvalue()


class AvatarTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.user = User.objects.create_user(
            username="avatar_test_user", password="TestPass@99", email="avatar_test_user@edunova.edu"
        )
        group, _ = Group.objects.get_or_create(name="Student")
        self.user.groups.add(group)

    def tearDown(self):
        # Best-effort cleanup so repeated runs don't accumulate files.
        self.client.delete("/api/profile/avatar/", **_auth_header(self.user))

    def test_upload_sets_avatar_url(self):
        upload = SimpleUploadedFile("test.png", _png_bytes(), content_type="image/png")
        resp = self.client.post("/api/profile/avatar/", data={"avatar": upload}, **_auth_header(self.user))
        self.assertEqual(resp.status_code, 200)
        url = resp.json()["avatar_url"]
        self.assertIn("student-avatars", url)

        profile = self.client.get("/api/student/profile/", **_auth_header(self.user))
        self.assertEqual(profile.json()["avatar_url"], url)

    def test_reupload_replaces_previous(self):
        upload1 = SimpleUploadedFile("first.png", _png_bytes(), content_type="image/png")
        resp1 = self.client.post("/api/profile/avatar/", data={"avatar": upload1}, **_auth_header(self.user))
        url1 = resp1.json()["avatar_url"]

        upload2 = SimpleUploadedFile("second.png", _png_bytes(), content_type="image/png")
        resp2 = self.client.post("/api/profile/avatar/", data={"avatar": upload2}, **_auth_header(self.user))
        url2 = resp2.json()["avatar_url"]

        # Same stable per-user path -- replaces rather than accumulating.
        self.assertEqual(url1.split("?")[0], url2.split("?")[0])

    def test_rejects_non_image_upload(self):
        upload = SimpleUploadedFile("notanimage.txt", b"hello world", content_type="text/plain")
        resp = self.client.post("/api/profile/avatar/", data={"avatar": upload}, **_auth_header(self.user))
        self.assertEqual(resp.status_code, 400)

    def test_upload_requires_a_file(self):
        resp = self.client.post("/api/profile/avatar/", data={}, **_auth_header(self.user))
        self.assertEqual(resp.status_code, 400)

    def test_delete_clears_avatar_url(self):
        upload = SimpleUploadedFile("test.png", _png_bytes(), content_type="image/png")
        self.client.post("/api/profile/avatar/", data={"avatar": upload}, **_auth_header(self.user))

        resp = self.client.delete("/api/profile/avatar/", **_auth_header(self.user))
        self.assertEqual(resp.status_code, 200)

        profile = self.client.get("/api/student/profile/", **_auth_header(self.user))
        self.assertIsNone(profile.json()["avatar_url"])

    def test_upload_requires_authentication(self):
        upload = SimpleUploadedFile("test.png", _png_bytes(), content_type="image/png")
        resp = self.client.post("/api/profile/avatar/", data={"avatar": upload})
        self.assertEqual(resp.status_code, 401)
