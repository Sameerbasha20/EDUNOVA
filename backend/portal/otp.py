import random

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail

OTP_CACHE_PREFIX = "student_otp:"


def generate_and_send_otp(user):
    """Generates a numeric OTP, stores it in cache (5 min expiry per
    settings.OTP_EXPIRY_SECONDS) and emails it via the configured SMTP
    backend (console backend in dev — see EMAIL_BACKEND in .env)."""
    otp = "".join(random.choices("0123456789", k=settings.OTP_LENGTH))
    cache.set(f"{OTP_CACHE_PREFIX}{user.id}", otp, timeout=settings.OTP_EXPIRY_SECONDS)

    send_mail(
        subject="Your EduNova Student Portal login code",
        message=f"Your one-time login code is {otp}. It expires in "
                f"{settings.OTP_EXPIRY_SECONDS // 60} minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
    return otp  # returned only so DEBUG/dev tooling can surface it; never log in prod


def verify_otp(user, submitted_otp):
    key = f"{OTP_CACHE_PREFIX}{user.id}"
    real_otp = cache.get(key)
    if real_otp is None:
        return False, "OTP expired or not requested. Please request a new one."
    if submitted_otp != real_otp:
        return False, "Incorrect OTP."
    cache.delete(key)
    return True, None
