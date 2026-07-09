"""
Regression tests for id_proof_document upload validation on the PUBLIC,
unauthenticated admission form (POST /api/admissions/enquiries/, AllowAny):
previously this FileField had no extension allowlist and no size limit at
all, meaning any anonymous visitor could upload an arbitrarily large file
of any type (disk-exhaustion DoS, or storing executable/script content)
with zero login required.

Run with:
    python manage.py test portal.tests.test_admission_document_upload
"""
from datetime import date

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

VALID_FIELDS = {
    "applicant_name": "Doc Upload Student",
    "date_of_birth": date(2013, 5, 1).isoformat(),
    "gender": "Female",
    "target_class": "Grade 6",
    "parent_name": "Doc Upload Parent",
    "parent_phone": "9999999999",
    "parent_email": "doc.upload.parent@edunova.edu",
    "address": "123 Test Street",
}


class AdmissionDocumentUploadTests(TestCase):
    def test_pdf_under_size_limit_is_accepted(self):
        doc = SimpleUploadedFile("id.pdf", b"%PDF-1.4 fake pdf content", content_type="application/pdf")
        resp = self.client.post("/api/admissions/enquiries/", data={**VALID_FIELDS, "id_proof_document": doc})
        self.assertEqual(resp.status_code, 201, resp.content)

    def test_disallowed_extension_is_rejected(self):
        doc = SimpleUploadedFile("id.exe", b"MZ fake executable content", content_type="application/octet-stream")
        resp = self.client.post(
            "/api/admissions/enquiries/",
            data={**VALID_FIELDS, "parent_email": "doc.upload.parent2@edunova.edu", "id_proof_document": doc},
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("id_proof_document", resp.json())

    def test_oversized_file_is_rejected(self):
        oversized = SimpleUploadedFile("id.pdf", b"0" * (5 * 1024 * 1024 + 1), content_type="application/pdf")
        resp = self.client.post(
            "/api/admissions/enquiries/",
            data={**VALID_FIELDS, "parent_email": "doc.upload.parent3@edunova.edu", "id_proof_document": oversized},
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("id_proof_document", resp.json())

    def test_submission_without_any_document_still_works(self):
        # id_proof_document is optional (blank=True) -- must not be silently
        # made required as a side effect of adding validators.
        resp = self.client.post(
            "/api/admissions/enquiries/",
            data={**VALID_FIELDS, "parent_email": "doc.upload.parent4@edunova.edu"},
        )
        self.assertEqual(resp.status_code, 201, resp.content)
