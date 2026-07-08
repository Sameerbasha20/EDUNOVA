from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
from .models import (
    SchoolSettings, Campus, AcademicProgram, Department, LeadershipMember,
    SchoolStat, WhyChooseItem, TechnologyPartner, CMSPage, NewsPost, Event,
    GalleryAlbum, GalleryImage, Achievement, Testimonial, FAQ, Document,
    JobPosting, ContactSubmission, ScholarshipInfo,
)
from . import serializers as ser


class PublicReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Base for public marketing-site content — explicitly AllowAny regardless of the project-wide default."""
    permission_classes = [AllowAny]


class SchoolSettingsViewSet(PublicReadOnlyViewSet):
    """Singleton — frontend calls /api/cms/settings/1/ or /api/cms/settings/ and takes first result."""
    queryset = SchoolSettings.objects.all()
    serializer_class = ser.SchoolSettingsSerializer


class CampusViewSet(PublicReadOnlyViewSet):
    queryset = Campus.objects.all()
    serializer_class = ser.CampusSerializer


class AcademicProgramViewSet(PublicReadOnlyViewSet):
    queryset = AcademicProgram.objects.all()
    serializer_class = ser.AcademicProgramSerializer


class DepartmentViewSet(PublicReadOnlyViewSet):
    queryset = Department.objects.all()
    serializer_class = ser.DepartmentSerializer


class LeadershipMemberViewSet(PublicReadOnlyViewSet):
    queryset = LeadershipMember.objects.all()
    serializer_class = ser.LeadershipMemberSerializer


class SchoolStatViewSet(PublicReadOnlyViewSet):
    queryset = SchoolStat.objects.all()
    serializer_class = ser.SchoolStatSerializer


class WhyChooseItemViewSet(PublicReadOnlyViewSet):
    queryset = WhyChooseItem.objects.all()
    serializer_class = ser.WhyChooseItemSerializer


class TechnologyPartnerViewSet(PublicReadOnlyViewSet):
    queryset = TechnologyPartner.objects.all()
    serializer_class = ser.TechnologyPartnerSerializer


class CMSPageViewSet(PublicReadOnlyViewSet):
    queryset = CMSPage.objects.all()
    serializer_class = ser.CMSPageSerializer
    lookup_field = "slug"


class NewsPostViewSet(PublicReadOnlyViewSet):
    queryset = NewsPost.objects.filter(is_published=True)
    serializer_class = ser.NewsPostSerializer
    lookup_field = "slug"


class EventViewSet(PublicReadOnlyViewSet):
    queryset = Event.objects.all()
    serializer_class = ser.EventSerializer


class GalleryAlbumViewSet(PublicReadOnlyViewSet):
    queryset = GalleryAlbum.objects.all()
    serializer_class = ser.GalleryAlbumSerializer


class GalleryImageViewSet(PublicReadOnlyViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = ser.GalleryImageSerializer


class AchievementViewSet(PublicReadOnlyViewSet):
    queryset = Achievement.objects.all()
    serializer_class = ser.AchievementSerializer


class TestimonialViewSet(PublicReadOnlyViewSet):
    queryset = Testimonial.objects.filter(is_featured=True)
    serializer_class = ser.TestimonialSerializer


class FAQViewSet(PublicReadOnlyViewSet):
    queryset = FAQ.objects.all()
    serializer_class = ser.FAQSerializer


class DocumentViewSet(PublicReadOnlyViewSet):
    serializer_class = ser.DocumentSerializer

    def get_queryset(self):
        qs = Document.objects.all()
        audience = self.request.query_params.get("audience")
        if audience:
            qs = qs.filter(audience=audience)
        return qs


class JobPostingViewSet(PublicReadOnlyViewSet):
    queryset = JobPosting.objects.filter(is_open=True)
    serializer_class = ser.JobPostingSerializer


class ScholarshipInfoViewSet(PublicReadOnlyViewSet):
    queryset = ScholarshipInfo.objects.all()
    serializer_class = ser.ScholarshipInfoSerializer


class ContactSubmissionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Public: write-only. Contact page POSTs here; nothing is exposed to read publicly."""
    permission_classes = [AllowAny]
    queryset = ContactSubmission.objects.all()
    serializer_class = ser.ContactSubmissionSerializer
