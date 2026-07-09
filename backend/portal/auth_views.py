import logging
import secrets

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .services.email_service import send_login_otp_email

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Throttle classes (unchanged)
# ---------------------------------------------------------------------------

class _PerAccountThrottle(SimpleRateThrottle):
    account_field = "user_id"

    def get_cache_key(self, request, view):
        ident = request.data.get(self.account_field)
        if not ident:
            return None
        return self.cache_format % {"scope": self.scope, "ident": f"{self.scope}:{ident}"}


class LoginAccountThrottle(_PerAccountThrottle):
    scope = "otp_login_account"

    def get_cache_key(self, request, view):
        ident = request.data.get("email") or request.data.get("username")
        if not ident:
            return None
        return self.cache_format % {"scope": self.scope, "ident": f"{self.scope}:{ident}"}


class OtpVerifyAccountThrottle(_PerAccountThrottle):
    scope = "otp_verify_account"
    account_field = "user_id"


class OtpResendAccountThrottle(_PerAccountThrottle):
    scope = "otp_resend_account"
    account_field = "user_id"


class LoginIPThrottle(AnonRateThrottle):
    scope = "otp_login_ip"


class OtpVerifyIPThrottle(AnonRateThrottle):
    scope = "otp_verify_ip"


class OtpResendIPThrottle(AnonRateThrottle):
    scope = "otp_resend_ip"


# ---------------------------------------------------------------------------
# Helpers (unchanged signatures)
# ---------------------------------------------------------------------------

def get_user_role(user):
    from .roles import get_role
    return get_role(user)


def user_payload(user) -> dict:
    full_name = user.get_full_name().strip() or user.username
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": full_name,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "user_type": get_user_role(user),
    }


def _find_user_by_email_or_username(identifier: str):
    User = get_user_model()
    if not identifier:
        return None
    try:
        if "@" in identifier:
            return User.objects.filter(email__iexact=identifier).first()
        return User.objects.filter(username__iexact=identifier).first()
    except Exception:
        return None


def _generate_otp() -> str:
    """Cryptographically secure 6-digit OTP. Never logged, never returned."""
    return str(secrets.randbelow(900000) + 100000)


def _store_otp(user_id: int, otp: str) -> None:
    expiry = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
    cache.set(f"portal_login_otp:{user_id}", otp, expiry)


# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginAccountThrottle, LoginIPThrottle])
def login_step1(request):
    identifier = (request.data.get("email") or request.data.get("username") or "").strip()
    password = request.data.get("password") or ""

    user_obj = _find_user_by_email_or_username(identifier)

    if not user_obj:
        return Response(
            {"detail": "Invalid email/username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        username=user_obj.username,
        password=password,
    )

    if not user:
        return Response(
            {"detail": "Invalid email/username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.is_active:
        return Response(
            {"detail": "User account is inactive."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp = _generate_otp()
    _store_otp(user.id, otp)

    try:
        send_login_otp_email(user, otp)
    except Exception:
        logger.exception("Failed to send OTP email")
        return Response(
            {"detail": "Unable to send verification email."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({
        "user_id": user.id,
        "user_type": get_user_role(user),
        "detail": "OTP sent successfully.",
    })


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OtpVerifyAccountThrottle, OtpVerifyIPThrottle])
def login_step2_verify_otp(request):
    """Unchanged — verifies cached OTP and returns JWT."""
    user_id = request.data.get("user_id")
    otp = str(request.data.get("otp") or "").strip()

    if not user_id or not otp:
        return Response(
            {"detail": "User ID and OTP are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cached = cache.get(f"portal_login_otp:{user_id}")
    if not cached or otp != str(cached):
        return Response(
            {"detail": "Invalid or expired OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    refresh = RefreshToken.for_user(user)
    cache.delete(f"portal_login_otp:{user_id}")
    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": user_payload(user),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OtpResendAccountThrottle, OtpResendIPThrottle])
def resend_otp(request):
    user_id = request.data.get("user_id")
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Invalidate previous OTP, generate and store a fresh one
    cache.delete(f"portal_login_otp:{user.id}")
    otp = _generate_otp()
    _store_otp(user.id, otp)

    try:
        send_login_otp_email(user, otp)
    except RuntimeError:
        return Response(
            {"detail": "Unable to send verification email."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"detail": "OTP resent successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    """Blacklists the given refresh token so it can't be used again, even
    though the caller's access token is still technically valid for the
    rest of its 6-hour lifetime (that's an accepted tradeoff of stateless
    JWTs -- blacklisting only the refresh token prevents ongoing renewal,
    which is what actually matters for a stolen-token scenario). AllowAny
    (not IsAuthenticated) because logout should still succeed even if the
    access token already expired -- all it needs is the refresh token."""
    refresh = request.data.get("refresh")
    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            pass
    return Response({"detail": "Logged out."}, status=status.HTTP_205_RESET_CONTENT)
