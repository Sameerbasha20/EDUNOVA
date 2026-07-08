"""A real, schedulable backup — not just the Admin Portal's on-demand JSON
download button. Run this from cron (or any external scheduler; this project
has no Celery/Celery-beat, so scheduling has to live outside Django):

    0 2 * * * cd /path/to/backend && /path/to/venv/bin/python manage.py backup_database

What changed from the first version of this command, after review:
  1. The dump is now ENCRYPTED (Fernet/AES) before it ever touches disk —
     the previous version wrote full plaintext student/medical/fee data to a
     local JSON file, which needed exactly as much protection as the
     database itself and had none.
  2. The encrypted file is uploaded to a Supabase Storage bucket (durable,
     off-server) in addition to being written locally — the previous
     version only wrote to local disk, which is often an ephemeral
     container filesystem (see this project's own Dockerfile/docker-compose):
     a cron job could "work" for months while every backup silently
     vanished on the next deploy.
  3. It now also writes a manifest of what's in the four file-storage
     buckets (LMS resources, assignment submissions, certificates, avatars)
     — actual file bytes were never duplicated here (Supabase Storage
     already has its own durability for that), but there was previously no
     way to cross-check "does the file this record points to still exist."

This is still a *logical* backup (data as encrypted JSON), not a binary
pg_dump. For point-in-time recovery of the database itself, pair this with
Supabase's own automated backup/PITR feature (Project Settings > Database >
Backups) — this command is a portable supplement to that, not a replacement.
"""
import io
import json
from datetime import datetime, date
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import connection

from portal.admin_views import EXPORT_TABLES
from portal.views import table_exists

STORAGE_BUCKETS = [
    getattr(settings, "SUPABASE_BUCKET_LMS", None),
    getattr(settings, "SUPABASE_BUCKET_SUBMISSIONS", None),
    getattr(settings, "SUPABASE_BUCKET_CERTS", None),
    getattr(settings, "SUPABASE_BUCKET_AVATARS", None),
]


def _json_default(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


class Command(BaseCommand):
    help = "Write an encrypted, off-server-backed snapshot of every portal_* table plus Django-managed app data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--out-dir",
            default=str(Path(settings.BASE_DIR) / "backups"),
            help="Directory to also write a local copy into (default: backend/backups/). "
                 "The Supabase Storage upload is the durable copy; local is a convenience copy only.",
        )
        parser.add_argument(
            "--skip-upload",
            action="store_true",
            help="Only write the local encrypted file; skip the Supabase Storage upload (e.g. for local testing).",
        )

    def handle(self, *args, **options):
        key = getattr(settings, "BACKUP_ENCRYPTION_KEY", "")
        if not key:
            raise CommandError(
                "BACKUP_ENCRYPTION_KEY is not set. Refusing to write an unencrypted dump of "
                "student/medical/fee data. Generate one with:\n"
                '  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"\n'
                "and set it in your .env as BACKUP_ENCRYPTION_KEY=..."
            )
        try:
            from cryptography.fernet import Fernet
        except ImportError:
            raise CommandError("The 'cryptography' package is required for encrypted backups — pip install cryptography")

        snapshot = {"generated_at": datetime.now().isoformat(), "portal_tables": {}}
        with connection.cursor() as cursor:
            for table in EXPORT_TABLES:
                if not table_exists(table):
                    continue
                cursor.execute(f"SELECT * FROM {table}")
                cols = [c[0] for c in cursor.description]
                snapshot["portal_tables"][table] = [dict(zip(cols, r)) for r in cursor.fetchall()]

        buf = io.StringIO()
        call_command("dumpdata", "cms", "admissions", "auth", "--indent", "2", stdout=buf)
        snapshot["django_managed_apps"] = json.loads(buf.getvalue())

        # Storage manifest: what files *should* exist, per bucket, so a
        # restore can be checked against reality instead of assuming records
        # and files are still in sync.
        snapshot["storage_manifest"] = self._build_storage_manifest()

        plaintext = json.dumps(snapshot, indent=2, default=_json_default).encode("utf-8")
        encrypted = Fernet(key.encode()).encrypt(plaintext)

        out_dir = Path(options["out_dir"])
        out_dir.mkdir(parents=True, exist_ok=True)
        filename = f"edunova_backup_{datetime.now():%Y%m%d_%H%M%S}.json.enc"
        local_path = out_dir / filename
        local_path.write_bytes(encrypted)

        uploaded = False
        if not options["skip_upload"]:
            uploaded = self._upload_to_supabase(filename, encrypted)

        table_count = len(snapshot["portal_tables"])
        self.stdout.write(self.style.SUCCESS(
            f"Encrypted backup written to {local_path} ({table_count} portal table(s)). "
            f"Supabase Storage upload: {'OK' if uploaded else 'SKIPPED/FAILED — local copy only, see warnings above'}."
        ))

    def _build_storage_manifest(self):
        manifest = {}
        client = self._supabase_client()
        if not client:
            return {"error": "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured — manifest skipped."}
        for bucket in STORAGE_BUCKETS:
            if not bucket:
                continue
            try:
                files = client.storage.from_(bucket).list()
                manifest[bucket] = [f.get("name") for f in files]
            except Exception as e:
                manifest[bucket] = f"error listing bucket: {e}"
        return manifest

    def _upload_to_supabase(self, filename, encrypted_bytes):
        client = self._supabase_client()
        if not client:
            self.stdout.write(self.style.WARNING(
                "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured — skipping off-server upload. "
                "The backup ONLY exists on local disk, which may not survive a redeploy."
            ))
            return False
        bucket = getattr(settings, "SUPABASE_BUCKET_BACKUPS", "database-backups")
        try:
            client.storage.from_(bucket).upload(
                filename, encrypted_bytes, {"content-type": "application/octet-stream"}
            )
            return True
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Supabase Storage upload failed: {e}. Local copy still written."))
            return False

    def _supabase_client(self):
        url = getattr(settings, "SUPABASE_URL", "")
        key = getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            return None
        from supabase import create_client
        return create_client(url, key)
