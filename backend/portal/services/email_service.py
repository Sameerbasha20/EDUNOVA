"""
portal/services/email_service.py

Single place for all OTP email delivery.
Views call send_login_otp_email() — nothing else.
"""
import logging
from typing import TYPE_CHECKING

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser

logger = logging.getLogger(__name__)


def send_login_otp_email(user: "AbstractBaseUser", otp: str) -> None:
    """
    Send the login OTP to user.email via the configured EMAIL_BACKEND.

    Raises RuntimeError on SMTP failure so the caller can return HTTP 500.
    Never logs or exposes the OTP value.
    """
    expiry_minutes: int = getattr(settings, "OTP_EXPIRY_SECONDS", 300) // 60
    full_name: str = user.get_full_name().strip() or user.username  # type: ignore[attr-defined]

    context = {
        "name": full_name,
        "expiry_minutes": expiry_minutes,
        "otp": otp,
        "school_name": "EduNova Global Academy",
    }

    subject = "EduNova Login Verification Code"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [user.email]  # type: ignore[attr-defined]

    text_body = render_to_string("emails/login_otp.txt", context)
    html_body = render_to_string("emails/login_otp.html", context)

    msg = EmailMultiAlternatives(subject, text_body, from_email, to)
    msg.attach_alternative(html_body, "text/html")

    try:
        msg.send(fail_silently=False)
    except Exception as exc:
        logger.exception("OTP email delivery failed for user_id=%s", user.pk)  # type: ignore[attr-defined]
        raise RuntimeError("Unable to send verification email.") from exc
