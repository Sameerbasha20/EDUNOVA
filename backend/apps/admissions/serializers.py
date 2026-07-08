from rest_framework import serializers
from .models import AdmissionEnquiry


class AdmissionEnquirySerializer(serializers.ModelSerializer):
    """Public-facing serializer: applicants can CREATE and can check their
    own status by registration_number, but cannot set status/review fields."""
    class Meta:
        model = AdmissionEnquiry
        fields = [
            "id", "registration_number", "applicant_name", "date_of_birth",
            "gender", "target_class", "parent_name", "parent_phone",
            "parent_email", "address", "scholarship_applied",
            "id_proof_document", "status", "submitted_at",
        ]
        read_only_fields = ["id", "registration_number", "status", "submitted_at"]
