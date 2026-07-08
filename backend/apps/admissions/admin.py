from django.contrib import admin
from .models import AdmissionEnquiry


@admin.register(AdmissionEnquiry)
class AdmissionEnquiryAdmin(admin.ModelAdmin):
    list_display = ["registration_number", "applicant_name", "target_class", "status", "submitted_at"]
    list_filter = ["status", "scholarship_applied"]
    search_fields = ["applicant_name", "registration_number", "parent_email"]
    readonly_fields = ["registration_number", "submitted_at", "updated_at"]
