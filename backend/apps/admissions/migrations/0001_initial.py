import uuid

import django.core.files.storage
from django.db import migrations, models

import apps.admissions.models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AdmissionEnquiry",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("registration_number", models.CharField(default=apps.admissions.models.generate_registration_number, editable=False, max_length=100, unique=True)),
                ("applicant_name", models.CharField(max_length=150)),
                ("date_of_birth", models.DateField()),
                ("gender", models.CharField(blank=True, max_length=20)),
                ("target_class", models.CharField(help_text="Class applied for, e.g. 'Grade 6'", max_length=50)),
                ("parent_name", models.CharField(max_length=150)),
                ("parent_phone", models.CharField(max_length=20)),
                ("parent_email", models.EmailField(max_length=254)),
                ("address", models.TextField(blank=True)),
                ("scholarship_applied", models.BooleanField(default=False)),
                ("id_proof_document", models.FileField(blank=True, null=True, upload_to="admissions/documents/")),
                ("status", models.CharField(choices=[("Registered", "Registered"), ("Verification", "Verification"), ("Screening", "Screening"), ("Fee_Pending", "Fee_Pending"), ("Confirmed", "Confirmed"), ("Rejected", "Rejected")], default="Registered", max_length=20)),
                ("reviewed_by", models.CharField(blank=True, help_text="Admin username/name — FK to core.User once auth app is wired in", max_length=150)),
                ("rejection_reason", models.TextField(blank=True)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-submitted_at"],
            },
        ),
    ]
