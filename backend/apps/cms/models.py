from django.db import models


class SchoolSettings(models.Model):
    """Singleton: Legal Name, Brand Name, Tagline, Domain, Industry, Established,
    Headquarters, Student/Staff Strength (fallback if live counts unavailable)."""
    legal_name = models.CharField(max_length=255, default="EduNova Global Academy Private Limited")
    brand_name = models.CharField(max_length=100, blank=True)
    tagline = models.CharField(max_length=255, default="Inspiring Minds. Building Futures.")
    website_domain = models.CharField(max_length=255, blank=True)
    company_type = models.CharField(max_length=255, default="Private Limited Educational Institution")
    established_year = models.PositiveIntegerField(default=2015)
    headquarters_address = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    def __str__(self):
        return self.legal_name


class Campus(models.Model):
    """Branch Campuses list."""
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    is_headquarters = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class AcademicProgram(models.Model):
    """Pre Primary, Middle School, High School, Senior Secondary, Cambridge
    Curriculum, CBSE, International Programs, STEM Education, Skill Development."""
    name = models.CharField(max_length=150, unique=True)
    sort_order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class Department(models.Model):
    """Academic Affairs, Admissions, Student Services, Transport, Library,
    Finance, Accounts, HR, IT, Examination Cell, Sports, Hostel, Medical
    Center, Research, Innovation Lab."""
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class LeadershipMember(models.Model):
    """Founder & Chairman, Managing Director, Principal, Academic Director,
    Vice Principal, IT Director, Finance Head, Admissions Director."""
    name = models.CharField(max_length=150)
    designation = models.CharField(max_length=150)
    photo = models.ImageField(upload_to="leadership/", blank=True, null=True)
    bio = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.name} — {self.designation}"


class SchoolStat(models.Model):
    """Business Statistics / 'Why Choose EduNova' stat cards:
    6500+ Students, 620+ Employees, 350+ Teachers, 45+ Smart Classrooms,
    18 Science Labs, 6 Computer Labs, 2 Innovation Centers, 98% Board
    Results, 100% Digital Campus, etc."""
    label = models.CharField(max_length=150)
    value = models.CharField(max_length=50)  # kept as text to allow "98%", "6500+"
    icon = models.CharField(max_length=50, blank=True, help_text="icon name/key for frontend")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.value} {self.label}"


class WhyChooseItem(models.Model):
    """Smart Campus, Digital Classrooms, AI Learning Analytics, Parent Mobile
    App, Online Fee Payments, Digital Attendance, Robotics Lab, STEM
    Education, Career Counseling, 24x7 Parent Support, etc."""
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.title


class TechnologyPartner(models.Model):
    """Google Workspace, Microsoft Education, AWS Educate, Cisco Networking
    Academy, Intel Education, Adobe Creative Cloud, Oracle Academy, Zoom,
    Moodle, OpenAI Education."""
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="partners/", blank=True, null=True)
    website_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class CMSPage(models.Model):
    """Static long-form pages: About (overview/vision/mission/core values),
    Privacy Policy, Terms & Conditions, Student Life, Infrastructure,
    Facilities, Sports, Careers, Library/Transport/Hostel public info."""
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    content_html = models.TextField(help_text="Rich text / HTML content")
    meta_description = models.CharField(max_length=300, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class NewsPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    cover_image = models.ImageField(upload_to="news/", blank=True, null=True)
    published_date = models.DateField()
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["-published_date"]

    def __str__(self):
        return self.title


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_date = models.DateField()
    venue = models.CharField(max_length=255, blank=True)
    cover_image = models.ImageField(upload_to="events/", blank=True, null=True)

    class Meta:
        ordering = ["event_date"]

    def __str__(self):
        return self.title


class GalleryAlbum(models.Model):
    name = models.CharField(max_length=150)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class GalleryImage(models.Model):
    album = models.ForeignKey(GalleryAlbum, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="gallery/")
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.album.name} — {self.caption or self.id}"


class Achievement(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    achievement_date = models.DateField()
    cover_image = models.ImageField(upload_to="achievements/", blank=True, null=True)

    class Meta:
        ordering = ["-achievement_date"]

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    author_name = models.CharField(max_length=150)
    role = models.CharField(max_length=100, help_text="e.g. Parent, Alumnus, Student")
    message = models.TextField()
    photo = models.ImageField(upload_to="testimonials/", blank=True, null=True)
    is_featured = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.author_name} ({self.role})"


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question


class Document(models.Model):
    """Downloads page + Documents shared to portals (audience-gated)."""
    AUDIENCE_CHOICES = [
        ("public", "Public"),
        ("student", "Student"),
        ("parent", "Parent"),
        ("teacher", "Teacher"),
    ]
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="documents/")
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default="public")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title


class JobPosting(models.Model):
    title = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    is_open = models.BooleanField(default=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-posted_at"]

    def __str__(self):
        return self.title


class ContactSubmission(models.Model):
    """Public Contact page form submissions."""
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.name} — {self.submitted_at:%Y-%m-%d}"


class ScholarshipInfo(models.Model):
    """Public-facing scholarship program listing (distinct from the backend
    'scholarships' application-tracking table used once portals exist)."""
    name = models.CharField(max_length=200)
    description = models.TextField()
    eligibility = models.TextField(blank=True)
    coverage_percent = models.PositiveIntegerField(blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.name
