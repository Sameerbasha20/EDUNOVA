import hashlib
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import connection

# Order matters: the second file's FKs (portal_employee, portal_vehicle, ...)
# reference tables created in the first file (portal_user_profile, auth_user).
SQL_FILES = [
    "portal_extension_auth_user.sql",
    "portal_extension_parent_admin.sql",
    "portal_extension_facilities.sql",
]

TRACKING_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS public.portal_schema_migrations (
    filename varchar(200) PRIMARY KEY,
    checksum varchar(64) NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
);
"""


class Command(BaseCommand):
    help = (
        "Apply all EduNova portal extension SQL files to the connected Supabase/Postgres "
        "database, in order, and record which ones have been applied (portal_schema_migrations) "
        "so it's never a mystery which state a given database is in."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--check",
            action="store_true",
            help="Only report which of the SQL files have already been applied; make no changes.",
        )

    def handle(self, *args, **options):
        sql_dir = Path(__file__).resolve().parents[2] / "sql"

        with connection.cursor() as cursor:
            cursor.execute(TRACKING_TABLE_SQL)
            cursor.execute("SELECT filename, checksum FROM portal_schema_migrations")
            applied = dict(cursor.fetchall())

        if options["check"]:
            for filename in SQL_FILES:
                sql_path = sql_dir / filename
                checksum = hashlib.sha256(sql_path.read_text(encoding="utf-8").encode()).hexdigest()
                if filename not in applied:
                    self.stdout.write(self.style.WARNING(f"NOT APPLIED  — {filename}"))
                elif applied[filename] != checksum:
                    self.stdout.write(self.style.ERROR(f"CHANGED SINCE APPLYING — {filename} (file edited after it was run)"))
                else:
                    self.stdout.write(self.style.SUCCESS(f"applied      — {filename}"))
            return

        for filename in SQL_FILES:
            sql_path = sql_dir / filename
            sql = sql_path.read_text(encoding="utf-8")
            checksum = hashlib.sha256(sql.encode()).hexdigest()
            with connection.cursor() as cursor:
                cursor.execute(sql)
                cursor.execute(
                    "INSERT INTO portal_schema_migrations (filename, checksum) VALUES (%s,%s) "
                    "ON CONFLICT (filename) DO UPDATE SET checksum=EXCLUDED.checksum, applied_at=now()",
                    [filename, checksum],
                )
            self.stdout.write(self.style.SUCCESS(f"Applied {filename}"))
        self.stdout.write(self.style.SUCCESS("Portal extension schema applied successfully."))

