# QA Test Report — EduNova Global Academy ERP
**Tester:** Senior QA Lead (30+ years, functional/perf/sec/compat/regression/exploratory/API/data/accessibility)
**Date:** 2026-07-10
**Build under test:** git HEAD at time of testing (backend Django 5.0.6 / DRF 3.15.1, frontend React 18.3.1 / Vite 5.3.1, PostgreSQL via Supabase)
**Environments actually exercised:** Live local dev server (`127.0.0.1:8000`, `DEBUG=True`) against the real Supabase Postgres dev database; full backend automated test suite; static review of the React/Vite frontend. **No browser was launched, no mobile device was used, no load-testing tool was run.** Anyone who tells you a report like this "confirms cross-browser compatibility" or "confirms performance under load" without one of those is lying to you or to themselves. I don't do that here — see Compatibility and Performance sections for exactly what was and wasn't possible.

---

## Testing Scope & Approach

Before I write a single finding, I want the record to show what I was and wasn't given to work with, because half of any QA engagement's failures trace back to nobody defining the target in the first place.

**What I was NOT given, and am flagging as unclear/undefined requirements, not assuming:**
- No target browser/OS/device support matrix exists anywhere in this repository (`README.md`, `SETUP.md` — checked both, neither mentions a single browser name, OS version, or device class). I have no idea if this needs to work on Safari 14 on an iPad from 2019 or only on evergreen Chrome. Nobody wrote that down. That's on the project, not on me, but a real QA sign-off cannot happen without it.
- No performance/load SLA exists anywhere (no stated concurrent-user target, no stated p95 response time, no stated uptime target). "Fast" is not a requirement.
- No formal test plan or test-case repository existed prior to this report; the closest artifact is `docs/REPOSITORY_OWNERSHIP_AUDIT.md`, which is an architecture audit, not a QA test plan.

**What I actually did, because I don't write reports off vibes:**
- Ran the entire backend automated test suite (139 tests) against a real Postgres database — not mocked, not stubbed.
- Ran the project's own 83-check end-to-end functional workflow script (`full_workflow_audit.py`) against the live dev server, covering every portal's core happy path.
- Ran live HTTP probes against the actual running dev server with `curl`: unauthenticated access, forged tokens, SQL-injection-style payloads, account-enumeration attempts, rate-limit hammering, and a cross-origin CORS preflight from a fabricated attacker origin.
- Ran direct SQL queries against the live database to check for silent data-integrity corruption that no application-level test would ever catch.
- Statically reviewed the entire frontend source tree for accessibility, theming, and performance anti-patterns (this work builds on and cross-references the separate `audit.md` already produced for this codebase — I am not going to waste your time copy-pasting all 27 of those findings verbatim into a second document; I cite the highest-severity ones here in this report's required format and refer you to `audit.md` for the full accounting).

**What I could NOT do, and will not pretend I did:**
- No real browser was opened. Zero. I cannot tell you this renders correctly in Safari, Firefox, or on an actual Android phone, because I have no browser automation tool in this environment. Anything in the Compatibility section is explicitly marked as untested, not "probably fine."
- No load/stress/soak testing was performed. I have no load-generation tool here. Nobody can responsibly claim "performance testing" was done on a system that has never seen concurrent traffic.
- No manual click-through exploratory session on the live UI was performed, because that requires a browser. The exploratory testing I *did* do was against the API and the database directly, which is where I found the two most serious defects in this report.

If your release process considers this report a substitute for real cross-browser QA and a load test, your release process has a bigger problem than anything in this document.

---

## Executive Summary

The backend is fundamentally sound — 135 of 139 automated tests pass, all 83 end-to-end workflow checks pass, and every live security probe I threw at it (SQL injection attempts, account enumeration, forged tokens) came back clean. That is a genuinely competent baseline. But "the happy path works" and "this is production-ready" are not the same sentence, and I found real, live, reproducible defects that a superficial pass would have missed entirely: a security-hardening fix has silently broken quiz-taking for any quiz not tied to a course (4 failing regression tests, confirmed root cause), the live database currently contains two pairs of accounts sharing the same login email with no constraint stopping a third, and two students are currently enrolled in two different classes simultaneously with no application-level rule preventing it. None of that showed up by reading code — it showed up by running things and querying the actual data, which is the entire point of testing instead of auditing. Layer on top of that the accessibility and hardening gaps already documented in `audit.md` (zero form-label association anywhere, no rate limiting outside OTP, no CSP/HSTS), and this is not a system I would sign off for a production launch today.

**Overall verdict: Conditional fail.** Fix the quiz-scoring regression and the two data-integrity holes before anything else — those are live, confirmed, and actively degrading real functionality and real data right now, not theoretical risks.

---

## Detailed Findings

### 1. Functional Testing

#### TC-FUNC-01 — End-to-end workflow script, all four portals
- **Environment:** Live dev server, `127.0.0.1:8000`, real Postgres dev DB
- **Steps to Reproduce:** Ran `full_workflow_audit.py`, which logs in as a student/teacher/parent/admin and exercises the full lifecycle of attendance, homework, assignments, question bank, exams, marks entry, LMS forum/notes, fee payment, hostel, library, notices, leaves, visitors, alumni, medical logs, and the full admission-enquiry-to-confirmed-student pipeline.
- **Expected Result:** All 83 checks pass.
- **Actual Result:** 83/83 passed, 0 failed.
- **Severity:** N/A (positive result)
- **Impact:** The core happy path, across every role, is functionally intact as of this build. This is the one piece of unambiguously good news in this report.

#### TC-FUNC-02 — Quiz submission for a quiz with no assigned course
- **Environment:** Backend automated test suite, `portal.tests.test_quiz_scoring.QuizScoringTests`
- **Steps to Reproduce:** Create a quiz directly in `portal_quiz` with no `course_id` set (this column is nullable in the schema and the app's own pre-existing test suite relies on that being a valid, supported state). Log in as an enrolled student. `POST /api/student/quizzes/{quiz_id}/` with answers.
- **Expected Result:** HTTP 200 with `{score, total, percentage, passed}` reflecting the submitted answers (this is the documented, previously-passing behavior — the test file's own docstring describes exactly this contract).
- **Actual Result:** HTTP 404 `{"detail": "Quiz not found."}`. Confirmed by reading `backend/portal/views.py:395,404`: `QuizDetailView.get`/`.post` both call `_course_in_student_class(request.user.id, quiz.get("course_id"))`, and `_course_in_student_class` (line 92-93) returns `False` unconditionally whenever `course_id` is falsy — before it ever checks whether the student is enrolled in anything.
- **Severity:** **Critical**
- **Impact:** Any quiz that isn't tied to a specific course — which the schema explicitly permits and which is a completely ordinary configuration for a general-knowledge or practice quiz — is now **100% unreachable by every student**, not just ones who shouldn't have access to it. This is a functional regression introduced by an access-control fix that was too broad: it correctly closes an IDOR hole for course-scoped quizzes, but it also blocks legitimate access to course-less ones as collateral damage. 4 of the 4 tests in this file fail (2 `AssertionError: 404 != 200`, 2 `KeyError: 'score'` because the error response doesn't even contain a score field).
- **Logs:** `[ATTACHMENT_REFERENCE: full test traceback, portal.tests.test_quiz_scoring, 4 failures]`

#### TC-FUNC-03 — Password reset flow
- **Environment:** Static code review, `backend/portal/admin_views.py` (reset-password endpoint, exercised functionally by `full_workflow_audit.py`'s "reset-password" step, which passed)
- **Steps to Reproduce:** Admin triggers a password reset for a user.
- **Expected Result:** Not fully specified by any requirement doc — flagging as ambiguous: should a reset generate a temp password returned in the API response (current behavior, confirmed working in TC-FUNC-01), or should it email a reset link? Both are legitimate patterns; nothing in this repo's docs states which one was actually required.
- **Actual Result:** Functions correctly as a temp-password-in-response flow.
- **Severity:** Low (documentation/requirements gap, not a functional defect)
- **Impact:** Cannot be scored against a requirement that was never written down. Flagging so it doesn't get silently assumed to be either "correct" or "wrong" by the next person who touches it.

---

### 2. Usability Testing

*(Full accounting with file:line citations lives in `audit.md`; the following are the two most severe, restated here in this report's required format.)*

#### TC-USAB-01 — Destructive action confirmation
- **Environment:** Static code review, all four authenticated portals
- **Steps to Reproduce:** As an admin, click "Vacate" on an occupied hostel room (`frontend/src/portals/admin/pages/Hostel.jsx:142`), or as a teacher, click "Delete" on a question-bank entry (`frontend/src/portals/teacher/pages/QuestionBank.jsx:25-28`).
- **Expected Result:** A confirmation prompt before an irreversible action fires.
- **Actual Result:** The API call fires immediately on click. A codebase-wide search for `window.confirm` across the entire frontend source returns zero matches. There is no confirmation step anywhere in this application for any destructive action.
- **Severity:** High
- **Impact:** One misclick — trivially easy on the undersized touch targets documented in `audit.md` — permanently destroys data (a room allocation, a question, a record) with no recovery path and no warning.

#### TC-USAB-02 — Toast notification visibility and dismissibility
- **Environment:** Static code review, `frontend/src/portals/*/components/Common.jsx` (`Toast` component, identical across 3 of 4 portals)
- **Steps to Reproduce:** Submit any form that triggers a success/error toast.
- **Expected Result:** The user is reliably informed of the outcome and can dismiss or re-read the message.
- **Actual Result:** The toast auto-dismisses via a hardcoded `setTimeout(onClose, 3000)` with no close button and no `aria-live`/`role` attribute of any kind.
- **Severity:** Medium
- **Impact:** A user who looks away for three seconds after submitting a form — an extremely common thing to do — has no way to find out whether their action succeeded or failed, and has to guess or retry blind.

---

### 3. Performance Testing

#### TC-PERF-01 — Load / stress / concurrency testing
- **Environment:** N/A
- **Steps to Reproduce:** N/A — no load-generation tool (JMeter, k6, Locust, or equivalent) is available in this testing environment.
- **Expected Result:** A defined number of concurrent users at a defined response-time ceiling (never specified — see Testing Scope).
- **Actual Result:** **Not tested. Flagging as an outright gap in the QA process, not a pass.** I will not write "performance is acceptable" in a report when the only thing I ran against this server was single-threaded `curl` calls. Nobody knows what happens to this system under 50 concurrent users, and until someone runs a real load test, nobody should be claiming otherwise.
- **Severity:** High (process gap)
- **Impact:** This system handles fee payments, exam results, and hostel/library concurrency-sensitive writes (already flagged and partially hardened with row-level locking earlier in this project's history). Going live with zero load-test data on a system with financial and academic-record writes is a real, unquantified risk.

#### TC-PERF-02 — Image lazy-loading
- **Environment:** Static code review, all 48 `<img>` tags in `frontend/src`
- **Steps to Reproduce:** Grep the entire frontend for `loading="lazy"`.
- **Expected Result:** Off-screen images in gallery-heavy pages (`Gallery.jsx`, `CampusGallery.jsx`) defer loading.
- **Actual Result:** Zero of 48 `<img>` tags use `loading="lazy"`. Every image on every page loads eagerly regardless of scroll position.
- **Severity:** Medium
- **Impact:** Slower perceived load and wasted bandwidth on the image-heaviest pages of the public site, which is also the site's primary conversion surface for prospective parents.

#### TC-PERF-03 — Client-side bundle strategy
- **Environment:** Static review, `frontend/vite.config.js`
- **Steps to Reproduce:** Read the Vite config for code-splitting configuration.
- **Expected Result:** Some chunk-splitting strategy given 5 distinct app surfaces (public + 4 portals) sharing one source tree.
- **Actual Result:** `vite.config.js` contains only `plugins: [react()]` and a dev server port — no `manualChunks`, no route-level lazy imports found anywhere in the router.
- **Severity:** Low
- **Impact:** Unquantified without an actual built-bundle size measurement (which I did not run), but the absence of any splitting strategy on a 5-surface app is a structural risk for initial-load time as the app grows.

---

### 4. Security Testing

#### TC-SEC-01 — SQL injection via raw-SQL query parameters
- **Environment:** Live dev server, `127.0.0.1:8000`
- **Steps to Reproduce:** `GET /api/admin-portal/rank-list/?exam_schedule_id=1' OR '1'='1` and `GET /api/admin-portal/report-card/?student_id=1;DROP TABLE portal_result;--&exam_name=x`, both with a valid admin bearer token.
- **Expected Result:** Clean rejection, no SQL execution of the injected payload.
- **Actual Result:** Both returned HTTP 400 `{"detail": "Invalid exam_schedule_id."}` / `{"detail": "Invalid student_id."}`. Confirmed not exploitable — parameterized queries and `DataError` handling are working as intended.
- **Severity:** N/A (positive result)
- **Impact:** No injection risk found on the endpoints tested.

#### TC-SEC-02 — Account enumeration via login error messages
- **Environment:** Live dev server
- **Steps to Reproduce:** `POST /api/auth/login/` with a nonexistent email, then again with a real account's email and a wrong password.
- **Expected Result:** Identical, non-revealing error message in both cases.
- **Actual Result:** Both returned identical `{"detail": "Invalid email/username or password."}` at HTTP 400.
- **Severity:** N/A (positive result)
- **Impact:** No enumeration vector found here.

#### TC-SEC-03 — Rate limiting on non-authentication endpoints
- **Environment:** Live dev server
- **Steps to Reproduce:** Sent 25 rapid sequential `GET /api/admin-portal/students/` requests with a valid token; separately sent 8 rapid `POST /api/auth/login/` requests with a wrong password.
- **Expected Result:** Some form of throttling on repeated rapid requests to any endpoint.
- **Actual Result:** All 25 requests to the CRUD endpoint returned HTTP 200 — zero throttling. The login endpoint, by contrast, correctly throttled: 5×400 followed by 3×429, confirming the OTP-scope throttle works exactly as configured.
- **Severity:** High
- **Impact:** Every endpoint in this API except the three OTP endpoints can be hit at unlimited rate by any authenticated client. Confirmed live, not inferred from config — this is not a hypothetical.

#### TC-SEC-04 — CORS behavior against a fabricated attacker origin
- **Environment:** Live dev server (`DEBUG=True`)
- **Steps to Reproduce:** `OPTIONS /api/admin-portal/students/` with `Origin: https://evil-attacker.example`.
- **Expected Result:** In a properly locked-down environment, the origin should be rejected unless allowlisted.
- **Actual Result:** HTTP 200 with `access-control-allow-origin: https://evil-attacker.example` and `access-control-allow-credentials: true`. This is expected, by-design behavior for this specific server (`CORS_ALLOW_ALL_ORIGINS = DEBUG`, and this instance is running with `DEBUG=True`) — the production code path locks this to an explicit allowlist when `DEBUG=False`. Confirmed the production-path logic exists and is correctly gated; **not** re-tested with `DEBUG=False` live in this session.
- **Severity:** Informational (dev-only, by design) — but flagging: whoever operates this environment must guarantee `DEBUG=False` and a real domain allowlist before this server (or anything configured like it) is ever reachable from the internet, and I found no automated safeguard forcing that at deploy time.
- **Impact:** Zero impact as configured for local dev. Real impact if this exact configuration were ever exposed publicly with `DEBUG=True` still set — full credentialed cross-origin access from any site.

#### TC-SEC-05 — Missing security headers on live responses
- **Environment:** Live dev server
- **Steps to Reproduce:** Inspect full response headers on any API call.
- **Expected Result:** `Strict-Transport-Security` and a `Content-Security-Policy` present (at minimum on a production-configured instance).
- **Actual Result:** Confirmed live: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, and `Cross-Origin-Opener-Policy: same-origin` are all present. `Strict-Transport-Security` and any `Content-Security-Policy` are **absent** from every response. Matches the static finding already in `audit.md` (no `SECURE_HSTS_SECONDS`/`SECURE_SSL_REDIRECT`/CSP anywhere in `backend/config/settings.py`), now confirmed with live evidence rather than just config reading.
- **Severity:** Medium
- **Impact:** No forced-HTTPS instruction to browsers, and no script-injection backstop, on whatever domain this eventually deploys to.

#### TC-SEC-06 — Duplicate account email with no uniqueness constraint
- **Environment:** Live Supabase dev database, direct SQL query
- **Steps to Reproduce:** `SELECT lower(email), count(*) FROM auth_user GROUP BY lower(email) HAVING count(*) > 1`
- **Expected Result:** Zero rows — each login-identifying email should belong to exactly one account.
- **Actual Result:** Two duplicate pairs found live in the current database: `admin@edunova.edu` shared by user IDs 16 and 5; `jhansilakshmi1004@gmail.com` shared by user IDs 21 and 17. Confirmed root cause by reading `backend/portal/auth_views.py:87-93` — `_find_user_by_email_or_username` resolves an email login via `User.objects.filter(email__iexact=identifier).first()`, which silently picks whichever matching row comes first when more than one exists, with no error and no indication to the user that ambiguity occurred.
- **Severity:** **Critical**
- **Impact:** `auth_user.email` has no unique constraint anywhere in this Django project (Django's default `User` model does not enforce one, and nothing here adds one). Right now, in the live database, two real accounts already share a login email each. A user typing that email at login is silently routed to whichever account `.first()` happens to return — not necessarily their own account — with an OTP sent to that email regardless of which underlying account it resolves to. This is not a theoretical edge case; it is a currently-existing state in the data.

#### TC-SEC-07 — Superuser accounts missing `portal_user_profile` rows
- **Environment:** Live Supabase dev database, direct SQL query
- **Steps to Reproduce:** `SELECT u.* FROM auth_user u LEFT JOIN portal_user_profile p ON p.user_id=u.id WHERE p.user_id IS NULL`
- **Expected Result / Actual Result:** 3 accounts found with no profile row, all three confirmed `is_superuser=True`.
- **Severity:** N/A — investigated and confirmed **not a defect**. This is the documented superuser-fallback path in the RBAC design (role resolution falls back to `is_superuser` when no `portal_user_profile` row exists). Logging this explicitly so it is not mistaken for a bug by whoever reads this report next — I verified it rather than assuming either way.

---

### 5. Compatibility Testing

#### TC-COMPAT-01 — Cross-browser rendering and behavior
- **Environment:** N/A — no browser automation tool available in this testing environment.
- **Steps to Reproduce:** N/A.
- **Expected Result:** Consistent rendering/behavior across whatever browser matrix the business actually requires.
- **Actual Result:** **Not tested. Zero coverage.** I did not open Chrome, Firefox, Safari, or Edge. I did not test a single mobile device. Any claim of "responsive design works" in this project's static-review-based `audit.md` is exactly that — a static review of Tailwind breakpoint classes, not an observed, rendered result on a real viewport. Treat every "responsive" finding elsewhere as *"the CSS suggests this should work"*, not *"I watched it work."*
- **Severity:** High (process gap, not a product defect per se)
- **Impact:** No one currently knows for certain how this renders on Safari (a real risk given Safari's historical quirks with flexbox/backdrop-filter, both used heavily per `audit.md`'s glassmorphism findings) or on an actual small Android device. This needs real device/browser testing before launch, full stop.

#### TC-COMPAT-02 — Target browser/OS/device requirements
- **Environment:** Documentation review (`README.md`, `SETUP.md`)
- **Steps to Reproduce:** Search both files for any browser, OS, or device requirement.
- **Expected Result:** A stated compatibility target.
- **Actual Result:** None found. Zero mentions of any browser, OS version, or device class in either file.
- **Severity:** Medium (requirements gap)
- **Impact:** Nobody can be held to a compatibility bar that was never written down. Flagging as an unclear requirement per this audit's own ground rules, not assuming a target on the project's behalf.

---

### 6. Regression Testing

#### TC-REG-01 — Full backend automated suite
- **Environment:** `manage.py test portal` against a real ephemeral Postgres test database
- **Steps to Reproduce:** Run the entire test suite (139 tests across 21 test modules covering auth/session security, admission document upload, student/parent/teacher ownership, admin directory, admin facilities/library locking, exam extras, quiz scoring, and more).
- **Expected Result:** 139/139 pass — this suite represents the project's own accumulated regression baseline from prior hardening work.
- **Actual Result:** **135 passed, 4 failed** (2 `FAIL`, 2 `ERROR`), all four in `portal.tests.test_quiz_scoring`. See TC-FUNC-02 for full root-cause analysis — this is a real, live regression, not flaky infrastructure (the same run's other 135 tests, including ones touching the same database and auth stack, passed cleanly).
- **Severity:** Critical
- **Impact:** This is exactly the kind of thing an automated suite exists to catch, and it caught it — the problem is that nobody ran the full suite after the access-control change that caused it, or the failure would have been caught before now. A 97.1% pass rate sounds fine until you realize the 2.9% that failed is an entire feature (quiz-taking) becoming unusable for a whole class of content.

---

### 7. Exploratory Testing

#### TC-EXPL-01 — Duplicate active class enrollments
- **Environment:** Live Supabase dev database, direct SQL query
- **Steps to Reproduce:** `SELECT student_id, academic_year, array_agg(id), array_agg(class_id) FROM portal_student_enrollment GROUP BY student_id, academic_year HAVING count(*) > 1`
- **Expected Result:** A student should have at most one active class enrollment per academic year — this is a basic real-world invariant for a K-12 school (a student is not simultaneously in two different classes in the same year).
- **Actual Result:** Two students currently violate this in the live data: student ID 6 has enrollment rows in both class 16 and class 17 for academic year 2025-26; student ID 49 has rows in class 8 and class 17 for the same year. Confirmed the schema's own constraint (`UNIQUE (student_id, class_id, academic_year)` in `backend/portal/sql/portal_extension_auth_user.sql:77`) only prevents the exact same triple twice — it does not, and was never designed to, prevent a student from being enrolled in two *different* classes in the same year. Confirmed `current_class_for_student` (`backend/portal/views.py:69-79`) silently resolves this ambiguity via `ORDER BY academic_year DESC, e.id DESC LIMIT 1` — i.e., whichever enrollment was inserted most recently silently wins, with no error, no warning, and no indication to anyone that the underlying data is ambiguous.
- **Severity:** **Critical**
- **Impact:** For these two students right now, every "current class" lookup — attendance, homework, fee structure, exam schedule, teacher roster — is being resolved to whichever enrollment happens to have the higher database ID, which may or may not be the class they should actually currently be in. If a teacher in the "losing" class marks this student present, submits homework for them, or a fee structure is generated against the "losing" class, that data goes essentially nowhere the student's own dashboard will show it, because every read path picks the other one. This was found only because I queried the live data directly — no application-level test would ever catch this, because the application never treats it as an error.

---

### 8. API Testing

*(See TC-FUNC-01, TC-SEC-01 through TC-SEC-05 above for the specific API-level test cases already executed against the live server — not duplicating them here.)*

#### TC-API-01 — Payment endpoint has no real gateway integration
- **Environment:** Static code review, `backend/portal/views.py:496-521` (`InitiatePaymentView`)
- **Steps to Reproduce:** Read the handler logic for `POST /api/student/fees/pay/`.
- **Expected Result:** A real payment is processed via a gateway, and status reflects the gateway's actual response (`Pending`/`Success`/`Failed`).
- **Actual Result:** The endpoint inserts a `portal_payment` row with `status='Success'` unconditionally, on every call, with no gateway involved at all. This is a previously known, already-flagged gap (not new to this report), but it belongs in a QA test report regardless: this endpoint currently cannot fail. There is no code path where a fee payment is ever *not* successful.
- **Severity:** **Critical**
- **Impact:** Every fee-payment API call succeeds regardless of whether any real money changed hands. This has been true throughout this project's history and remains true today. Not re-litigating the fix here (a payment-gateway choice is a business decision, not a QA finding) — but a QA sign-off cannot treat the Finance module as tested until this is resolved, because there is currently no failure mode to even test against.

---

### 9. Data Integrity Testing

#### TC-DATA-01 — Financial/academic constraint spot-checks
- **Environment:** Live Supabase dev database, 12 direct SQL integrity queries (payments, results, rooms, books, enrollments, emails)
- **Steps to Reproduce:** Ran checks for: negative/zero payment amounts, payments referencing nonexistent fee structures, exam results exceeding the exam's max marks, negative marks, room occupancy exceeding capacity or going negative, book availability exceeding total quantity or going negative, and room-occupancy-vs-active-allocation-count mismatches.
- **Expected Result:** Zero violations across all 12 checks.
- **Actual Result:** 9 of 12 checks came back clean (no negative/invalid financial or academic values, no capacity overruns, no book-count mismatches, hostel occupancy counters are internally consistent with active allocations). The 3 that failed are TC-SEC-06 (duplicate emails), TC-EXPL-01 (duplicate enrollments), and TC-SEC-07 (superuser profile gap, confirmed non-issue).
- **Severity:** See individual findings above.
- **Impact:** The financial and capacity-tracking data (fees, room/book counts) is in good shape — the row-level locking work already done on hostel/library allocation appears to be holding up in the live data with no drift. The identity-layer data (accounts, enrollments) is where the actual problems are.

---

### 10. Accessibility Testing

*(Full findings with file:line citations already documented in `audit.md`'s Accessibility section, scored 1/4 there. Restating the single most severe item here in this report's required format, since it's the one every other accessibility issue traces back to.)*

#### TC-A11Y-01 — Form input label association
- **Environment:** Static code review, entire `frontend/src` tree
- **Steps to Reproduce:** Grep every `<input>`/`<select>`/`<textarea>` (164 found) and every `htmlFor` attribute (0 found) across the whole frontend.
- **Expected Result:** Every form control has a programmatically associated label (`htmlFor`/`id` pair, or `aria-label`).
- **Actual Result:** Zero `htmlFor`/`id` pairs exist anywhere in this codebase. 13 `<label>` elements exist total, all unassociated siblings rather than wrapping/paired elements; 6 `aria-label` attributes exist. The remaining ~145 inputs rely on placeholder text alone.
- **Severity:** **Critical** (WCAG 1.3.1 / 4.1.2 — this is a Level A failure, not even AA)
- **Impact:** A screen-reader user cannot reliably identify what the vast majority of form fields in this entire application are for, across every portal, on both the public and authenticated sides. This is the single largest, most systemic defect in the product from an accessibility-compliance standpoint, and it is not a one-off — it is the app's default behavior for every form it has.

---

## Areas of Concern

Beyond the individually-scored findings above, three broader patterns concern me more than any single bug:

1. **Security fixes are being shipped without re-running the full regression suite.** The quiz-scoring regression (TC-FUNC-02/TC-REG-01) is not a mystery bug — it is the direct, traceable consequence of an access-control fix that nobody validated against the pre-existing test suite before it was committed. That the fix's own intent (closing an IDOR hole) was correct doesn't matter if the collateral damage broke a whole feature and nobody noticed for however long this has been live. This is a process failure, not just a code defect.
2. **There is no database-level enforcement of basic identity invariants.** Neither "one email per account" nor "one active class per student per year" is enforced by a constraint — both are currently violated in the live data, right now, not in a hypothetical future. A schema that doesn't enforce its own business rules will keep accumulating exactly this kind of silent corruption, and the application layer papering over it with `ORDER BY ... LIMIT 1` instead of raising an error means nobody will ever be told when it happens again.
3. **This project has never been load-tested, never been tested in a real browser, and has no stated compatibility or performance requirements to test against even if it had been.** Every "responsive design" and "performance" finding anyone produces for this codebase — mine included, in `audit.md` — is necessarily a static-analysis approximation until someone actually runs it in front of real traffic and real devices. I am not willing to let that ambiguity pass as "tested."

---

## Overall Quality Score/Rating

**6/10 — Conditional fail. Not release-ready.**

The backend engineering fundamentals are genuinely solid — parameterized queries hold up under real injection attempts, auth doesn't leak account existence, the OTP throttle works exactly as designed, and 135 of 139 regression tests plus all 83 end-to-end workflow checks pass. That is not nothing, and I've reviewed far worse codebases than this one. But a quality score has to reflect what I actually found live in the running system and the live data, not just what a happy-path script reports: a shipped fix that silently breaks an entire feature, two real accounts sharing a login email in the current database, two students with ambiguous class enrollment right now, zero rate limiting outside three endpoints, and an accessibility posture that fails at the most basic level (form labeling) across the entire product. None of these are hypothetical. All of them are either currently live in the data or directly reproducible against the running application. A 6 reflects "solid bones, real live defects that must not ship as-is" — not "close enough."

---

## Recommendations

1. **Fix immediately, before anything else ships:** the quiz-scoring regression (TC-FUNC-02). This is an active, confirmed break in a core student-facing feature, caught by the project's own test suite, currently failing.
2. **Fix immediately:** add a uniqueness constraint (or at minimum an application-level check) on `auth_user.email`, and resolve the two existing duplicate-email accounts in the live data manually before doing so (TC-SEC-06).
3. **Fix immediately:** add an application-level rule preventing a student from holding two active class enrollments in the same academic year, and resolve the two existing conflicts in the live data (TC-EXPL-01).
4. **Requires architectural review:** the access-control pattern used in `_course_in_student_class` (and any sibling ownership-check helpers written the same way) should be audited for the same "falsy-input-means-deny-everyone" failure mode before it's copied to any other endpoint — this is a pattern risk, not just a single bug.
5. **Requires a real test pass before launch, not a static one:** commission actual cross-browser/device testing and a real load test. Nothing in this report or in `audit.md` can responsibly stand in for either, and I said so at every point where I substituted static review for the real thing.
6. **Process fix, not a code fix:** the full backend test suite must be run — and its results actually read — before any security- or ownership-related change is merged. It would have caught TC-FUNC-02 immediately.
7. **Everything documented in `audit.md`** (accessibility, missing rate limiting, missing CSP/HSTS, legal/GDPR gaps) remains open and unresolved as of this report and should be worked in the priority order already given there — I am not duplicating that prioritization here.
