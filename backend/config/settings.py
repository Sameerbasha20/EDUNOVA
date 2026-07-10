"""
EduNova Global Academy — Integrated Backend
Public website CMS/admissions + Student Portal + Teacher Portal.
Database target: Supabase PostgreSQL using DATABASE_URL.
"""
from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="dev-secret-key-change-in-production")
# SAFE-BY-DEFAULT: DEBUG defaults to False. You must explicitly opt into DEBUG=True
# in your local .env for development. Never set DEBUG=True on any host reachable
# from the internet (see DEV_STATIC_OTP below for the related OTP risk).
def _cast_debug(val):
    """Accept True/False/1/0/yes/no. Anything else (e.g. 'release' from a
    system env var set by another tool) is treated as False so the server
    doesn't crash on startup."""
    if isinstance(val, bool):
        return val
    return str(val).lower() in ("true", "1", "yes")

DEBUG = config("DEBUG", default=False, cast=_cast_debug)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1").split(",")

# SECURITY: separate, explicit opt-in — never tied to DEBUG. A rushed deploy
# with DEBUG=True left on would otherwise make every account reachable via a
# publicly-known static OTP ("123456"). Defaults to False; keep it False
# everywhere except your own local machine.
DEV_STATIC_OTP = config("DEV_STATIC_OTP", default=False, cast=bool)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "apps.cms",
    "apps.admissions",
    "portal",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASE_URL = config("DATABASE_URL", default="")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            # 0 = a fresh connection per request, no persistent reuse. Required
            # when DATABASE_URL points at Supabase's PgBouncer pooler (session
            # or transaction mode): the pooler can recycle/close the backend
            # connection between uses in ways Django's persistent-connection
            # tracking doesn't detect, which surfaced as "connection already
            # closed" InterfaceErrors partway through a test run. Safe to raise
            # again if DATABASE_URL is ever pointed at the direct (unpooled)
            # host instead.
            conn_max_age=config("DB_CONN_MAX_AGE", default=0, cast=int),
            ssl_require=config("DB_SSL_REQUIRE", default=True, cast=bool),
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="edunova"),
            "USER": config("DB_USER", default="postgres"),
            "PASSWORD": config("DB_PASSWORD", default="changeme123"),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }

# Uses Django's default auth_user table. This matches the Supabase schema shared in this chat.
# Portal roles are stored in portal_user_profile and Django groups.

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# OTP codes and login/throttle rate-limit counters live in Django's cache.
# LocMemCache is per-process — fine for `manage.py runserver`, but under
# multi-worker Gunicorn each worker gets its own cache, so a throttle rate of
# "5/min" becomes "5/min × worker count" and OTP codes generated by one
# worker aren't visible to the worker that handles verify-otp. Set REDIS_URL
# in .env for any deployment with more than one worker process.
REDIS_URL = config("REDIS_URL", default="")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    # Brute-force protection on the OTP login flow. Two layers per endpoint:
    # a tight per-account limit (the real defense — caps attempts against one
    # account regardless of how many IPs an attacker spreads across) and a
    # much more generous per-IP backstop (catches one IP spraying attempts
    # across many different accounts, without punishing a whole school
    # sharing one campus WiFi/NAT egress IP the way a single shared-IP limit
    # would). These use Django's cache framework — the default LocMemCache
    # below works for a single-process dev server, but is PER-PROCESS: behind
    # Gunicorn with multiple workers, each worker has its own counter, so the
    # real effective limit is (rate x worker count). For production, point
    # CACHES at Redis so limits are enforced consistently across all workers.
    "DEFAULT_THROTTLE_RATES": {
        "otp_login_account": "5/min",
        "otp_verify_account": "5/min",
        "otp_resend_account": "3/min",
        "otp_login_ip": "40/min",
        "otp_verify_ip": "40/min",
        "otp_resend_ip": "20/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    # Without these, a refresh token stolen from browser storage (XSS, shared
    # device, browser extension) stays valid for the full 7 days even after
    # the user hits "Log out" -- rotation + blacklist-on-rotation means each
    # refresh call invalidates the previous refresh token, and /auth/logout/
    # (below) blacklists it immediately on logout.
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

CORS_ALLOW_ALL_ORIGINS = DEBUG  # allows any localhost port in dev; False in production (DEBUG=False)
CORS_ALLOWED_ORIGINS = [] if DEBUG else config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
).split(",")
CORS_ALLOW_CREDENTIALS = True

# Supabase Storage/API — server-side only. Never place service role keys in frontend.
SUPABASE_URL = config("SUPABASE_URL", default="")
SUPABASE_SERVICE_ROLE_KEY = config("SUPABASE_SERVICE_ROLE_KEY", default="")
SUPABASE_BUCKET_LMS = "lms-resources"
SUPABASE_BUCKET_SUBMISSIONS = "assignment-submissions"
SUPABASE_BUCKET_CERTS = "official-documents"
SUPABASE_BUCKET_AVATARS = "student-avatars"
SUPABASE_BUCKET_BACKUPS = "database-backups"

# Symmetric key (Fernet, 32 url-safe base64 bytes) used to encrypt the local
# JSON backup file before it's written to disk / uploaded to Supabase
# Storage. Generate one with:
#   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# There is deliberately no default — an empty/missing key means
# backup_database will refuse to run rather than silently write an
# unencrypted dump of every student's fee, medical, and contact data.
BACKUP_ENCRYPTION_KEY = config("BACKUP_ENCRYPTION_KEY", default="")

EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="no-reply@edunovaacademy.edu.in")

OTP_EXPIRY_SECONDS = 300
OTP_LENGTH = 6

# Error tracking — off by default (no SENTRY_DSN configured), so dev/CI never
# need the sentry-sdk package installed or a Sentry project provisioned. Set
# SENTRY_DSN in the environment to turn this on; `pip install sentry-sdk`
# first (listed in requirements.txt). Without this, a 500 in production is
# only visible by someone thinking to check server logs.
SENTRY_DSN = config("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=config("SENTRY_TRACES_SAMPLE_RATE", default=0.1, cast=float),
        send_default_pii=False,
        environment=config("SENTRY_ENVIRONMENT", default="production"),
    )
