"""
Regression tests for SimpleTableView.post() (the shared base class behind
classes, subjects, vehicles, routes, transport-allocations, fee-structures,
library books, and hostels): a duplicate unique value (ISBN, barcode,
subject code, class name+section, ...) previously raised an unhandled
IntegrityError -> raw Django debug traceback / HTTP 500, instead of a clean
validation error the frontend could show to the user.

Run with:
    python manage.py test portal.tests.test_admin_crud_errors
"""
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_admin(username="crud_err_admin"):
    return User.objects.create_superuser(username=username, password="TestPass@99", email=f"{username}@edunova.edu")


class SimpleTableViewIntegrityErrorTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.admin = _make_admin()

    def test_duplicate_book_isbn_returns_400_not_500(self):
        payload = {
            "title": "Dup Book", "author": "Dup Author", "isbn": "CRUD-ERR-ISBN-1",
            "barcode_id": "CRUD-ERR-BC-1", "quantity": 1, "available_quantity": 1,
            "book_type": "Physical", "digital_file_url": "",
        }
        first = self.client.post("/api/admin-portal/library/books/", data=payload, content_type="application/json", **_auth_header(self.admin))
        self.assertEqual(first.status_code, 200)

        second = self.client.post("/api/admin-portal/library/books/", data=payload, content_type="application/json", **_auth_header(self.admin))
        self.assertEqual(second.status_code, 400)
        self.assertIn("already exists", second.json()["detail"])

    def test_duplicate_class_name_section_returns_400_not_500(self):
        payload = {"name": "CrudErr", "section": "Z", "curriculum": "CBSE", "room_number": "1"}
        first = self.client.post("/api/admin-portal/classes/", data=payload, content_type="application/json", **_auth_header(self.admin))
        self.assertEqual(first.status_code, 200)

        second = self.client.post("/api/admin-portal/classes/", data=payload, content_type="application/json", **_auth_header(self.admin))
        self.assertEqual(second.status_code, 400)

    def test_duplicate_subject_code_returns_400_not_500(self):
        payload = {"name": "Crud Err Subject", "subject_code": "CRUDERR1", "type": "Theory"}
        first = self.client.post("/api/admin-portal/subjects/", data=payload, content_type="application/json", **_auth_header(self.admin))
        self.assertEqual(first.status_code, 200)

        second = self.client.post("/api/admin-portal/subjects/", data=payload, content_type="application/json", **_auth_header(self.admin))
        self.assertEqual(second.status_code, 400)

    def test_issue_nonexistent_book_returns_404(self):
        resp = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": 999999, "borrower_id": self.admin.id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 404)

    def test_issue_book_with_no_copies_returns_400(self):
        payload = {
            "title": "No Copies Book", "author": "Author", "isbn": "CRUD-ERR-ISBN-2",
            "barcode_id": "CRUD-ERR-BC-2", "quantity": 0, "available_quantity": 0,
            "book_type": "Physical", "digital_file_url": "",
        }
        created = self.client.post("/api/admin-portal/library/books/", data=payload, content_type="application/json", **_auth_header(self.admin))
        book_id = created.json()["id"]

        resp = self.client.post(
            "/api/admin-portal/library/issue/",
            data={"book_id": book_id, "borrower_id": self.admin.id},
            content_type="application/json",
            **_auth_header(self.admin),
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["detail"], "No copies available.")
