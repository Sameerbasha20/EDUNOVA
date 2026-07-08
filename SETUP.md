# EduNova Global Academy Platform — Setup & Status

This is the **single source of truth** for running this project and for
understanding what is and isn't built. It replaces the four overlapping docs
that used to live here (`README.md`, `README_RUN_THIS_PROJECT.md`,
`CLIENT_READY_RUNBOOK.md`, `CLIENT_REQUIREMENTS_FIXES.md`) — those are gone;
if a link or note somewhere still mentions one of them, this file is what it
should point to now.

---

## 0. Do this first — security

A previous delivery of this project shipped a real, live Supabase database
password and service-role key inside `backend/.env`. That file has been
removed from this package and replaced with `backend/.env.example`
(placeholders only). **If that old `.env` (or any zip containing it) was ever
shared, rotate the Supabase DB password and regenerate the service-role key
in the Supabase dashboard before doing anything else** — this is independent
of everything below and doesn't require any code change, just action on your
Supabase project settings.

Also removed from this package: the checked-in `backend/.venv` (110 MB) and
a stray `backend/edunova` SQLite dev database. A `.gitignore` now covers
`.env`, virtualenvs, SQLite files, and `__pycache__` so these can't be
re-committed by accident.

---

## 1. What's actually implemented

| Area | Status |
|---|---|
| Public website (22 pages, 18 homepage sections) | ✅ Complete, with scroll-reveal animations, animated stat counters, scroll progress bar, back-to-top, and a shrinking sticky nav |
| Student Portal | ✅ Complete — now includes Hostel room view + Medical Records history |
| Teacher Portal | ✅ Complete (pre-existing) |
| Parent Portal | ✅ Complete — now includes child's Hostel room view |
| Admin Portal | ✅ Complete — now includes Hostel, Inventory, Visitor Management, Alumni Registry, Medical Records, on top of the previously-listed modules |
| Admissions workflow past "Registered" | ✅ Wired — Admin Portal can advance Registered → Verification → Screening → Fee_Pending → Confirmed or Rejected at any stage |
| RBAC | ✅ Every portal endpoint checks a server-resolved role (`portal.roles.get_role`); every admin write is recorded in `portal_audit_log`, including the 5 newly added modules |
| Toast auto-dismiss bug | ✅ Fixed — `animate-[fadeIn_.2s_ease]` referenced a `fadeIn` keyframe that was never defined anywhere, in all four portals' `Common.jsx`, so `onAnimationEnd` never fired and toasts never auto-dismissed. Now defined in both `tailwind.config.js` and `index.css`. |
| Portal schema apply command | ✅ Fixed — now applies all 3 SQL files in order, and records what's applied in `portal_schema_migrations` (`python manage.py apply_portal_schema --check` reports current state without changing anything). |
| Privilege escalation via `is_staff` | ✅ Fixed — `get_role()` now only auto-grants Admin Portal authority to real superusers, not any `is_staff` account (e.g. a CMS content editor). The duplicate, subtly-different copy of this logic in `auth_views.py` was also removed — it now delegates to `portal.roles.get_role()` so there's a single source of truth. |
| OTP brute-force protection | ✅ Added — `AnonRateThrottle`-based limits on login/verify/resend (10/min, 10/min, 5/min per IP). Uses Django's default in-process cache; **for a multi-worker production deployment, point `CACHES` at Redis** or the limit is effectively `rate × worker count`, not a hard cap. |
| Exam extras: rank lists + report cards | ✅ Added — per-subject rank list generation, overall class rank (summed across subjects), and printable report cards, both admin- and student-facing. Built on the `portal_result`/`portal_exam_schedule` tables that already existed. |
| LMS extras: forums + digital notes + analytics | ✅ Added — `portal_forum_topic`/`portal_forum_post`/`portal_digital_note`/`portal_course_progress` tables, wired into the student LMS page (Discussion & Notes panel per course, mark-complete checkboxes) and an admin/teacher analytics endpoint (`/lms/analytics/`). |
| Automated backups | 🟡 Partially improved — `python manage.py backup_database` now writes a full timestamped JSON snapshot (every `portal_*` table + Django-managed CMS/admissions/auth data) to `backend/backups/`, runnable from cron. Still not encrypted/offsite/point-in-time — pair with Supabase's own automated-backup feature for that. |
| Exam cycle naming | ✅ Fixed — `exam_name` is now a fixed set of choices (`Unit_Test_1`…`Board_Exam`) enforced server-side, not free text. Previously "Mid Term" vs "Mid-Term" would silently split one exam cycle's results across two "cycles" with no error, producing incomplete rank lists/report cards. |
| Rank-list silent no-op | ✅ Fixed — `RankListView.post` now validates the exam schedule exists and has marks entered before running, returning a real 404/400 instead of a false-success "0 students ranked" message. |
| Report card completeness | ✅ Added — a report card now flags `is_complete: false` with a warning banner if the student has fewer subject results than their class is expected to have, instead of silently presenting a partial total as the final one. |
| Forum/notes access control | ✅ Fixed — `_can_access_course()` now checks real enrollment (student) or teaching allocation (teacher) before allowing access to a course's forum/notes/analytics. Previously any authenticated user of any role could read/post in any course's forum regardless of class — a cross-grade access gap in a school context specifically. Course analytics is now Admin/Teacher-only (a classmate's individual completion % was previously visible to other students). |
| OTP throttling | ✅ Fixed — was pure per-IP, which would throttle an entire school sharing one campus WiFi/NAT IP together as if they were one attacker. Now two layers: a tight per-account limit (the real defense) plus a much more generous per-IP backstop for distributed attacks. |
| Backup security & durability | ✅ Fixed — `backup_database` now **encrypts** the dump (Fernet, via `BACKUP_ENCRYPTION_KEY`; refuses to run without a key rather than writing plaintext) and **uploads to Supabase Storage** in addition to local disk, so it survives a container redeploy instead of silently vanishing. Also writes a manifest of what's in the file-storage buckets (LMS resources, submissions, certificates, avatars) so a restore can be checked against what should exist. |
| Missing 404 inside portals | ✅ Fixed — none of the 4 authenticated portals had a catch-all route; an unmatched sub-path rendered a blank content area. Added a shared `PortalNotFound` component to all four. |
| Scroll position on navigation | ✅ Fixed — React Router doesn't reset scroll on its own; added a global `ScrollToTop` so navigating away from a scrolled-down page doesn't land on the new page already scrolled down. |

### Still not implemented — and why

- **AI Tutor** — needs a decision on which LLM API to call and who pays for/holds that key; not something to silently pick.
- **OMR evaluation** — needs a decision on scanning hardware/service and an actual sample answer sheet to build the image pipeline against; nothing to safely guess here.
- **Physical hardware integration**: GPS tracker hardware, barcode scanner hardware — the software side (tables + APIs) is ready to receive data from real devices, but no such devices exist to integrate against.
- **Infrastructure**: Redis, Celery, Nginx, AWS/Cloudflare config, GitHub Actions CI/CD, SSL termination, monitoring/alerting, automated test suite — none of this exists; the app currently runs via `manage.py runserver` + `vite dev` only.
- **Teacher-side course authoring** (newly discovered, not previously flagged) — `teacher_views.py` has zero endpoints for creating/editing `portal_course`/`portal_course_content`/`portal_quiz`. Students can consume courses; nothing lets a teacher create one through the UI yet. Worth a explicit decision on scope/priority before building.

### A decision this doc can't make for you

The original schema you shared defines **multi-tenancy** (`tenants`/`domains` tables) and **UUID primary keys** everywhere; the actual implementation is **single-tenant** with Django's default **integer-PK** `auth_user`, and normalized `roles`/`permissions` tables were replaced with Django groups + a string check. None of that was silently "fixed" here — rewriting primary keys or adding tenant isolation across a system this size is a different architecture, not a bug fix, and doing it without your sign-off risks breaking everything already built. If multi-tenant SaaS is the actual goal, that's a conversation to have before more is built on the current foundation, not a routine cleanup task.

---

## 2. Running it locally

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env   # already done in this package; edit DATABASE_URL etc. for your own DB
```

Edit `.env` and point `DATABASE_URL` at your own Postgres/Supabase instance,
then apply the schema:

```bash
# 1. Apply all three portal extension SQL files against your Supabase/Postgres
#    database in one go (these are NOT Django migrations — see portal/sql/*.sql).
#    This command was previously broken (it silently skipped file #2) — fixed now,
#    it applies all three, in the correct dependency order:
python manage.py apply_portal_schema

# 2. Django-managed apps (cms, admissions) use real migrations:
python manage.py migrate admissions --fake-initial   # table already exists in most real deployments
python manage.py migrate

python manage.py createsuperuser
python manage.py seed_public_data       # optional demo content
python manage.py seed_portal_demo       # optional demo student/teacher accounts
python manage.py runserver
```

To enable the encrypted backup command, generate a key once and put it in `.env`:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# then set BACKUP_ENCRYPTION_KEY=<that value> in .env
python manage.py backup_database        # writes locally + uploads to Supabase Storage
```

`--fake-initial` on the first line tells Django "this table already exists,
just record the migration as applied" — use it the first time you adopt
migrations against a database that was previously managed by hand-applied
SQL. Once `0001_initial` is faked in, migration `0002_add_admin_portal_links`
will run normally and add the two new columns Admin Portal credential
generation needs.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`. The navbar has a **Login** button (role
picker) and direct links for Student / Teacher / Parent / Admin.

---

## 3. Trying out the new Admissions → Admin Portal flow

1. Submit an application at `/admissions` on the public site.
2. Log into the Admin Portal at `/admin/login` (create an Admin user first —
   `createsuperuser` gives you a Django superuser, which the Admin Portal's
   role resolver treats as Admin).
3. Go to **Admissions**, click through Verification → Screening →
   Fee Pending → **Confirm & generate logins**. The confirm step creates a
   Student account and a Parent account (or reuses an existing Parent account
   if the email already exists) and shows their temporary passwords once —
   copy them before dismissing that banner.
4. Log into the Parent Portal with those credentials at `/parent/login` —
   the newly admitted child should appear in the child switcher.

---

## 4. Known gaps worth knowing about before you rely on this

- **`apps/cms` has no migration files.** This is a pre-existing condition,
  not something introduced here — the cms tables were evidently applied to
  Supabase by hand at some point, same as the `portal_*` extension tables.
  Recommended fix: run `python manage.py makemigrations cms` against your
  own real database once, review the generated migration carefully, then
  `migrate --fake-initial`.
- **This sandbox has no way to install Django or run against a live
  database**, so every backend change here was verified by (a) `python -m
  py_compile` on every changed/added `.py` file, which passed with no syntax
  errors, and (b) careful manual review of SQL/ORM field names against the
  existing schema — not by an actual `manage.py check` or `migrate` run. Run
  those yourself in a real environment before deploying, especially the
  `admissions --fake-initial` step, which is safe only if that table's
  columns genuinely already match `apps/admissions/migrations/0001_initial.py`.
- **Frontend was verified with `esbuild`** (bundling the whole route tree
  with all new Parent/Admin code, zero resolution/syntax errors) but not
  with an actual `npm run build` or `npm run dev`, since this sandbox has no
  network access to `npm install` the real dependency tree. Run `npm install
  && npm run build` yourself as a final check.
- **The Transport module is data/API-complete but hardware-free** — see §1.
- **Backup export is a manual JSON download**, not a real backup system —
  see §1.

---

## 5. Where things live (quick map)

- `backend/portal/roles.py` — shared role resolution + `RoleRequired` permission classes used by every portal.
- `backend/portal/parent_views.py` / `admin_views.py` — new Parent/Admin Portal API views.
- `backend/portal/sql/portal_extension_parent_admin.sql` — new tables (employees, vehicles, routes, PTM bookings, feedback, audit log) + the `portal_leave.submitted_by` column.
- `backend/apps/admissions/migrations/0002_add_admin_portal_links.py` — the two columns Admin Portal credential generation needs on `AdmissionEnquiry`.
- `frontend/src/portals/parent/` and `frontend/src/portals/admin/` — new portal frontends, same architecture as the existing `student`/`teacher` portals (JWT + OTP auth, protected routes, sidebar layout).
- `frontend/src/portals/public/pages/LoginRolePicker.jsx` — the `/login` role picker.
