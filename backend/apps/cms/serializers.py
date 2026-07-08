from rest_framework import serializers
from .models import (
    SchoolSettings, Campus, AcademicProgram, Department, LeadershipMember,
    SchoolStat, WhyChooseItem, TechnologyPartner, CMSPage, NewsPost, Event,
    GalleryAlbum, GalleryImage, Achievement, Testimonial, FAQ, Document,
    JobPosting, ContactSubmission, ScholarshipInfo,
)


class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = "__all__"


class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = "__all__"


class AcademicProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicProgram
        fields = "__all__"


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class LeadershipMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadershipMember
        fields = "__all__"


class SchoolStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolStat
        fields = "__all__"


class WhyChooseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyChooseItem
        fields = "__all__"


class TechnologyPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnologyPartner
        fields = "__all__"


class CMSPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CMSPage
        fields = "__all__"


class NewsPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsPost
        fields = "__all__"


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


class GalleryImageSerializer(serializers.ModelSerializer):
    album_name = serializers.CharField(source="album.name", read_only=True)

    class Meta:
        model = GalleryImage
        fields = ["id", "album", "album_name", "image", "caption", "uploaded_at"]


class GalleryAlbumSerializer(serializers.ModelSerializer):
    images = GalleryImageSerializer(many=True, read_only=True)

    class Meta:
        model = GalleryAlbum
        fields = ["id", "name", "images"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = "__all__"


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = "__all__"


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = "__all__"


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ["id", "name", "email", "phone", "message", "submitted_at"]
        read_only_fields = ["id", "submitted_at"]


class ScholarshipInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipInfo
        fields = "__all__"
