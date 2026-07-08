import uuid
from django.db import models


def generate_registration_number():
    return f"ADM-{uuid.uuid4().hex[:10].upper()}"


class AdmissionEnquiry(models.Model):
    """
    Public 'Online Admission Registration Form' — matches:
    - Flowchart Doc, Section 2 (Website Visitor): Fill Online Registration
      Form -> Form Data Valid? -> Application Queued for Admin Review ->
      Admin Approves? -> Rejection Notice / Student+Parent Credentials Generated
    - Schema Doc, Module F, table #29 'admissions' (status enum extended
      with 'Rejected' since the flowchart requires a rejection branch that
      the original 5-state enum didn't account for).
    """
    STATUS_CHOICES = [
        ("Registered", "Registered"),
        ("Verification", "Verification"),
        ("Screening", "Screening"),
        ("Fee_Pending", "Fee_Pending"),
        ("Confirmed", "Confirmed"),
        ("Rejected", "Rejected"),
    ]

    registration_number = models.CharField(
        max_length=100, unique=True, default=generate_registration_number, editable=False
    )
    applicant_name = models.CharField(max_length=150)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=20, blank=True)

    # target_class_id -> FK to academics.Classes once that app exists;
    # stored as plain text here since the public portal doesn't own the
    # Classes table (that lives in the core ERP backend, built later).
    target_class = models.CharField(max_length=50, help_text="Class applied for, e.g. 'Grade 6'")

    parent_name = models.CharField(max_length=150)
    parent_phone = models.CharField(max_length=20)
    parent_email = models.EmailField()
    address = models.TextField(blank=True)

    scholarship_applied = models.BooleanField(default=False)
    id_proof_document = models.FileField(upload_to="admissions/documents/", blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Registered")
    reviewed_by = models.CharField(max_length=150, blank=True, help_text="Admin username/name — FK to core.User once auth app is wired in")
    rejection_reason = models.TextField(blank=True)

    # Set once by the Admin Portal when this application is Confirmed and a
    # Student + Parent login is generated — makes credential generation
    # idempotent (never double-creates accounts for the same enquiry) and
    # lets the Admin Portal trace enquiry -> account.
    student_user_id = models.IntegerField(null=True, blank=True)
    parent_user_id = models.IntegerField(null=True, blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.applicant_name} ({self.registration_number}) — {self.status}"
