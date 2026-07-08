from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from .models import AdmissionEnquiry
from .serializers import AdmissionEnquirySerializer


class AdmissionEnquiryViewSet(mixins.CreateModelMixin,
                               mixins.RetrieveModelMixin,
                               viewsets.GenericViewSet):
    """
    POST /api/admissions/enquiries/            -> submit new application
    GET  /api/admissions/enquiries/{reg_no}/    -> applicant checks own status
    (Admin review/approve/reject happens in the Admin Panel app, not here —
    this app is public-facing only, matching the Flowchart's Visitor scope.)
    """
    queryset = AdmissionEnquiry.objects.all()
    serializer_class = AdmissionEnquirySerializer
    lookup_field = "registration_number"
    permission_classes = [AllowAny]
