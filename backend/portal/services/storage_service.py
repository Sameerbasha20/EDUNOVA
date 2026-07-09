"""Supabase Storage helpers for user-uploaded files (currently: profile
avatars). Reuses the same service-role client pattern as
management/commands/backup_database.py."""
import mimetypes

from django.conf import settings
from django.db import connection

from portal.roles import get_role

ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5MB


class AvatarUploadError(Exception):
    pass


def _client():
    url = getattr(settings, "SUPABASE_URL", "")
    key = getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return None
    from supabase import create_client
    return create_client(url, key)


def _bucket():
    return getattr(settings, "SUPABASE_BUCKET_AVATARS", "studentavatars")


def upload_avatar(user, uploaded_file):
    """Uploads uploaded_file to a stable per-user path (so re-uploading
    replaces the previous image rather than accumulating orphans) and
    returns the public URL, persisted onto portal_user_profile.avatar_url."""
    content_type = uploaded_file.content_type or mimetypes.guess_type(uploaded_file.name)[0]
    if content_type not in ALLOWED_AVATAR_TYPES:
        raise AvatarUploadError("Only JPEG, PNG, WEBP, or GIF images are allowed.")
    if uploaded_file.size > MAX_AVATAR_BYTES:
        raise AvatarUploadError("Image must be smaller than 5MB.")

    client = _client()
    if not client:
        raise AvatarUploadError("File storage is not configured on the server.")

    ext = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}[content_type]
    path = f"user_{user.id}{ext}"
    bucket = _bucket()
    try:
        client.storage.from_(bucket).upload(
            path, uploaded_file.read(), {"content-type": content_type, "upsert": "true"}
        )
    except Exception as e:
        raise AvatarUploadError(f"Upload failed: {e}")

    public_url = client.storage.from_(bucket).get_public_url(path)
    role = get_role(user) or "Student"
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO portal_user_profile (user_id, user_type, avatar_url) VALUES (%s,%s,%s) "
            "ON CONFLICT (user_id) DO UPDATE SET avatar_url=EXCLUDED.avatar_url, updated_at=now()",
            [user.id, role, public_url],
        )
    return public_url


def delete_avatar(user):
    """Clears avatar_url and best-effort removes the stored file. Never
    raises -- a storage-side failure shouldn't block clearing the DB field.

    Uploads always use the stable path user_{id}{ext} (see upload_avatar), so
    rather than parsing the extension back out of the stored public URL
    (fragile -- Supabase's get_public_url appends a trailing "?" that isn't
    part of the real object key), just try removing every extension that
    could have been uploaded. remove() on a key that doesn't exist is a
    silent no-op, not an error, so this is safe to call unconditionally."""
    client = _client()
    if client:
        bucket = _bucket()
        candidates = [f"user_{user.id}{ext}" for ext in (".jpg", ".png", ".webp", ".gif")]
        try:
            client.storage.from_(bucket).remove(candidates)
        except Exception:
            pass

    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE portal_user_profile SET avatar_url=NULL, updated_at=now() WHERE user_id=%s",
            [user.id],
        )
