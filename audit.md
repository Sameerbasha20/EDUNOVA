# Site Audit Report
**Date:** 2026-07-10
**Project:** EduNova Global Academy — School ERP (public marketing/admissions site + Student/Parent/Teacher/Admin portals)
**Detected stack:** React 18.3.1 + Vite 5.3.1 + Tailwind CSS 3.4.4 + react-router-dom 6.24, axios, lucide-react, recharts (frontend); Django 5.0.6 + Django REST Framework 3.15.1 + SimpleJWT 5.3.1, PostgreSQL via Supabase, django-cors-headers, django-filter (backend)
**Detected audience/goal:** A K-12 private school's full digital operation: a public marketing/admissions site for prospective parents, plus four authenticated portals (Student, Parent, Teacher, Admin) covering attendance, exams, fees, hostel, library, and communication. Business goal is dual — convert enquiries into admissions on the public side, and run day-to-day school operations on the portal side.
**Design system maturity:** Partially tokenized — `tailwind.config.js` defines a real named palette (`primary`, `secondary`, `accent`, `highlight`, `success`, `error`, `danger`, `academic.*`, `surface.*`, `ink.*`) and a 4-face type system, but raw untokenized Tailwind colors (`slate-`, `gray-`, `blue-`, `red-`, etc.) appear ~380 times alongside the tokens across the 5 portals.

---

## Anti-Pattern Verdict

**Partially.** This does not read as an AI-slop gallery, but it has two of the nine listed tells.

- **Not found:** purple/indigo/blue gradient sameness (all 52 `bg-gradient` usages are built from the project's own `primary`/`accent`/`highlight`/`secondary` tokens, e.g. `frontend/src/portals/public/home/HeroBanner.jsx:23` — `bg-gradient-to-r from-primary/82 via-primary/45 to-transparent`); generic-font-everywhere (the app pairs Poppins/Nunito/Inter/Montserrat deliberately, not a single Inter/Roboto/system-ui default); card-grid overuse (dashboards use `divide-y` lists for simple item lists, e.g. `frontend/src/portals/admin/pages/Dashboard.jsx:29-40`, and only use cards for genuine grids of distinct items); emoji-as-icon (zero emoji found anywhere; `lucide-react` is used consistently in 84 files); fake "system status"/"online" badges (every status pill found is bound to a real field, e.g. `frontend/src/portals/admin/pages/StudentDetail.jsx:44`); competing equal-weight CTAs (hero and admissions CTAs are correctly weighted, solid-vs-outline).
- **Found:** (1) Fabricated/unverifiable hero metrics — one instance is genuinely CMS-bound (`frontend/src/portals/public/home/HeroBanner.jsx:8-11` fetches `/cms/stats/`), but the same numbers (`6,500+`, `98%`, `350+`) are duplicated as static, unbound copy in `frontend/src/portals/public/home/AcademicPrograms.jsx:68,77`, `FacultyHighlight.jsx:9`, and `FacilitiesGrid.jsx:74` — these four have no data source at all. (2) Glassmorphism used decoratively: `frontend/src/portals/public/home/HeroBanner.jsx:31,57,72` stacks three different `bg-white/2x backdrop-blur-*` combinations in a single hero section purely for visual effect (the same technique is used *functionally* elsewhere, e.g. sticky-header blur in the four portal `Topbar.jsx` files, which is fine).
- The public site's page composition (hero → about snippet → academic programs → why-choose grid → faculty highlight → events/news → campus gallery → facilities → contact → admission banner/steps) is school-specific and content-driven, not a generic centered-hero-3-col-features-testimonial-CTA SaaS template.

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 1/4 | 164 form inputs, 0 `htmlFor`/`id` label associations anywhere in the codebase |
| 2 | Performance | 2/4 | Zero `loading="lazy"` on all 48 `<img>` tags; no code-splitting for 5 separate portal bundles |
| 3 | Security | 2/4 | No CSP/HSTS/SSL-redirect configured; zero rate limiting outside the 3 OTP endpoints |
| 4 | Theming & design system | 2/4 | `darkMode: "class"` configured but zero `dark:` classes exist anywhere — fully dead |
| 5 | Responsive design | 3/4 | Touch targets consistently under 44px on modal-close and hamburger-menu buttons |
| 6 | Anti-patterns | 3/4 | Fabricated hero stats duplicated outside their one real CMS binding |
| | **Total** | **13/24** | **Acceptable** |

**Legal & compliance flags:** Privacy Policy **present and linked** (`frontend/src/components/Footer.jsx:29`, routed at `frontend/src/routes/AppRoutes.jsx:67`) · Terms **present and linked** (`Footer.jsx:29`, `AppRoutes.jsx:68`) · Cookie consent **missing** (no consent mechanism anywhere; Google Fonts is loaded directly from Google's CDN in `frontend/index.html:7-8` with no consent gate) · GDPR signals **missing** (Privacy Policy has no access/erasure/export/consent-withdrawal language) · COPPA **missing/not addressed** (no disclosure despite the platform storing K-12, likely under-13, student data — mitigated somewhat by data being entered by parents/school staff rather than directly by children, but this exception is never stated or relied upon in the docs).

---

## Executive Summary

The codebase is in noticeably better shape architecturally than most AI-assisted builds — it has a real design-token system, a single consistent icon library, no XSS sinks, no secrets in the frontend bundle, and a backend that has already been through a dedicated security-hardening pass (JWT rotation/blacklist, IsAuthenticated-by-default, CORS allowlist, OTP throttling). The gap is accessibility: form inputs have no programmatic label association anywhere in the app, no modal implements dialog semantics or focus management, and destructive actions fire with no confirmation step — these are the issues that will actually generate WCAG/ADA demand letters or cause a user to lose data by misclick, and they're systemic rather than isolated. Legal exposure is real but narrow: Privacy Policy and Terms exist and are linked (better than most audits find), but neither addresses GDPR data-subject rights or COPPA, and there's no cookie-consent mechanism. None of the findings block a user from completing a task outright (no keyboard traps, no total nav loss on mobile), so this is not a "stop the launch" report — but it is not release-ready against a WCAG AA bar or a GDPR/COPPA-aware legal bar without the P1 fixes below.

Total findings by severity: P0 **0** · P1 **8** · P2 **14** · P3 **5**

---

## Quick Wins
1. Add `role="status" aria-live="polite"` + a manual close button to the one shared `Toast` component (`frontend/src/portals/*/components/Common.jsx`) (P1) — one component, reused everywhere, fixes screen-reader silence + no-dismiss in a single edit per portal.
2. Add a `window.confirm(...)` guard (or a shared confirm-modal) before the `vacate`/`remove`/delete-style handlers (P1) — a few one-line guards prevent irreversible misclicks.
3. Wrap the two un-wrapped `<table>` instances in `overflow-x-auto` (`frontend/src/portals/admin/pages/ExamResults.jsx:78,110,154`, `frontend/src/portals/student/pages/Results.jsx:58`) (P2) — two `<div>` wrappers.
4. Add `loading="lazy"` to the 48 `<img>` tags, prioritizing the gallery-heavy public pages (P2) — mechanical, no logic change.
5. Either remove the dead `darkMode: "class"` config from `tailwind.config.js` or scope a real dark-mode pass — currently 100% unused configuration that misleads anyone reading the config.

---

## Findings

### P0 — Blocking
No issues found. Nothing in this audit prevents a user from completing a task outright — navigation remains reachable on mobile in every portal, and no keyboard trap was found.

### P1 — Major

#### Form inputs have no programmatic label association anywhere in the app
- **Category:** Accessibility (WCAG 1.3.1, 4.1.2)
- **Location:** Systemic — 164 `<input>`/`<select>`/`<textarea>` elements across all portals, 0 `htmlFor`/`id` pairs found (`grep -c htmlFor` = 0 for all of `frontend/src`). Examples: `frontend/src/portals/admin/pages/Users.jsx:77-82` (placeholder-only, no `<label>` at all); `frontend/src/portals/public/pages/Login.jsx:123-124,133-134,156-157` (a visible `<label>` exists but is a sibling with no `htmlFor`/`id` link).
- **Issue:** Every form in every portal either has no label at all (placeholder-only) or has a visually-adjacent label with no programmatic association to its input.
- **User impact:** A screen-reader user tabbing into any of these fields hears the field's placeholder (if any) or nothing at all — not "Email or username" or "First name," just an unlabeled edit box. This affects login, admission forms, and every admin/teacher/parent/student CRUD form in the app.
- **Fix:** Add `htmlFor`/matching `id` pairs (or wrap the input in the `<label>`) across all forms; for icon-only/compact fields, use `aria-label` as a minimum.

#### No modal implements dialog accessibility semantics
- **Category:** Accessibility (WCAG 2.4.3, 4.1.2) / Usability heuristics — hidden & dynamic UI
- **Location:** All modal components, e.g. `frontend/src/portals/student/pages/Assignments.jsx:84-122` (Submit modal), `frontend/src/portals/student/pages/Fees.jsx:94` (Checkout modal), `frontend/src/portals/student/components/CourseForum.jsx:57`, `frontend/src/portals/student/components/Quiz.jsx`. Confirmed via a codebase-wide grep for `aria-modal`/`role="dialog"`/`Escape` — 0 matches anywhere.
- **Issue:** Every modal is a bare `<div className="fixed inset-0 ...">` with no `role="dialog"`, no `aria-modal`, no focus trap, no Escape-to-close, and no focus return to the triggering element on close.
- **User impact:** Screen-reader users aren't told a dialog opened and can silently tab out into the page behind it; keyboard users have no Escape shortcut and, after closing, lose their place because focus isn't returned to the button that opened the modal.
- **Fix:** Build one shared `Modal` component with `role="dialog"`, `aria-modal="true"`, a focus trap, an Escape-key handler, and focus-return on close, then have every existing modal consume it instead of hand-rolling the wrapper `<div>`.

#### Toast notifications are silent to screen readers and can't be dismissed
- **Category:** Accessibility (WCAG 4.1.3) / Usability heuristics — visibility of system status
- **Location:** `frontend/src/portals/admin/components/Common.jsx:77-88` (`Toast` component; identical copies exist in the parent/student/teacher portals' own `Common.jsx`)
- **Issue:** `Toast` renders a plain `<div>` with no `role="status"`/`role="alert"`/`aria-live`, and closes only via `onAnimationEnd={() => setTimeout(onClose, 3000)}` — there is no close button.
- **User impact:** Screen-reader users never learn that a save succeeded or failed. Sighted users who look away for a moment (common right after submitting a form) miss the message entirely and have no way to bring it back — they're left guessing whether their action worked.
- **Fix:** Add `role="status"` and `aria-live="polite"` (or `role="alert"` for errors) to the toast container, and add a manual close (×) button in addition to the timeout.

#### No confirmation step before destructive actions
- **Category:** Usability heuristics — error prevention / user control and freedom
- **Location:** Systemic — `grep -rn "window.confirm"` across `frontend/src` returns zero matches. Concrete examples: `frontend/src/portals/admin/pages/Hostel.jsx:51-57` (`vacate`, called directly from the `onClick` at line 142 with no guard) and `frontend/src/portals/teacher/pages/QuestionBank.jsx:25-28` (`remove`, fires the `DELETE` call immediately on click).
- **Issue:** Irreversible actions (vacating a hostel room, deleting a question-bank entry, and similarly-styled delete/remove buttons elsewhere) execute immediately on click with no confirmation step anywhere in the app.
- **User impact:** A single misclick (easy on a touch device, see the touch-target findings below) permanently removes data with no undo and no "are you sure" moment to catch the mistake.
- **Fix:** Add a `window.confirm(...)` call (or, better, a shared confirm-modal component once the Modal fix above lands) in front of every destructive handler.

#### Public-site nav mega-menu is keyboard-inaccessible
- **Category:** Accessibility (WCAG 2.1.1 Keyboard)
- **Location:** `frontend/src/components/Nav.jsx:84-93`
- **Issue:** The "Academics/Admissions/..." dropdown opens purely via CSS `group-hover`; the trigger `<button>` has no `onClick`, `aria-expanded`, or `aria-haspopup`, so it never opens for a keyboard-only user tabbing through the nav.
- **User impact:** A keyboard-only visitor (including many screen-reader users) can tab to the nav item but cannot open its dropdown to reach the sub-pages inside it — those pages become unreachable from the main nav for that user.
- **Fix:** Make the trigger a real toggle (`onClick` + `aria-expanded` + `aria-haspopup="true"`), open/close it in JS rather than pure `:hover`, and support Escape-to-close.

#### Missing CSP, HSTS, and forced SSL redirect
- **Category:** Security
- **Location:** `backend/config/settings.py` — confirmed via grep that `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT`, `X_FRAME_OPTIONS`, and any CSP mechanism are absent from the entire file; `django-csp` is not in `backend/requirements.txt`.
- **Issue:** `SecurityMiddleware` is installed but running on Django's un-hardened defaults — no HSTS header, no forced HTTPS redirect, and no Content-Security-Policy of any kind.
- **User impact:** Nothing exploitable today (no XSS sink was found elsewhere in this audit), but this removes a real layer of defense-in-depth: without HSTS, a user who ever types the bare `http://` host gets silently served over plaintext; without CSP, any future script-injection bug (a dependency compromise, a stored-XSS regression) has no browser-level backstop.
- **Fix:** Set `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT=True`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, and add a Content-Security-Policy (via `django-csp` or manual middleware) before the production domain goes live over HTTPS.

#### No rate limiting outside the three OTP endpoints
- **Category:** Security
- **Location:** `backend/config/settings.py:150-184` (`REST_FRAMEWORK` — no `DEFAULT_THROTTLE_CLASSES` set); confirmed the only `@throttle_classes` usages in the whole backend are the three OTP views in `backend/portal/auth_views.py:115,166,202`. `InitiatePaymentView` (`backend/portal/views.py:496`) and every admin/student/teacher/parent CRUD endpoint have no throttle at all.
- **Issue:** Every endpoint in the API except login/verify/resend-OTP can be called at unlimited rate by any authenticated (or, where permitted, unauthenticated) client.
- **User impact:** Nothing stops a compromised token or a scripting mistake from hammering `InitiatePaymentView` or any list/detail endpoint thousands of times a minute — at minimum a resource/cost problem, and combined with the already-known "payment always succeeds" gap, a script could spam fee-payment records at will.
- **Fix:** Add a sane default `DEFAULT_THROTTLE_CLASSES`/rate (e.g. a generous per-user scope) to `REST_FRAMEWORK`, and a tighter explicit scope on `InitiatePaymentView` specifically.

#### Privacy Policy has no GDPR data-subject-rights language
- **Category:** Legal & compliance
- **Location:** `frontend/src/portals/public/pages/PrivacyPolicy.jsx` (full file read)
- **Issue:** The policy describes what's collected and how it's used, but contains no language on the right to access, correct, export, or delete personal data, no named data controller/DPO contact, and no data-retention period.
- **User impact:** Any EU-connected data subject (a parent, a transferred international student) has no documented way to exercise their rights, and the school has no documented process if one asks — this is the concrete FTC/GDPR exposure the audit brief flagged, not a hypothetical.
- **Fix:** Add an explicit data-subject-rights section (access/erasure/export/consent-withdrawal) and a named contact/process for exercising them.

### P2 — Minor

#### Touch targets consistently under 44×44px
- **Category:** Responsive design
- **Location:** Modal close buttons across 8+ files (bare `<X size={18}/>` with no padding, e.g. `frontend/src/portals/student/pages/Assignments.jsx:108`, `Fees.jsx:113`, `frontend/src/portals/teacher/pages/Assignments.jsx:119,206`, `Documents.jsx:102`, `Exams.jsx:117`, `Homework.jsx:103`, `Leave.jsx:92`, `QuestionBank.jsx:110`); all 4 portals' mobile hamburger buttons (e.g. `frontend/src/portals/student/components/Topbar.jsx:19`, `<Menu size={22}/>` with no padding); `frontend/src/portals/admin/pages/Inventory.jsx:61-62` (28px stock adjust buttons).
- **Issue:** Icon-only buttons are sized to their icon with no padding buffer, landing around 18-28px instead of the 44×44px minimum touch target.
- **User impact:** On a phone, closing a modal or adjusting inventory stock requires a precise tap — easy to miss or mis-tap next to it, especially for users with larger fingers or motor impairments.
- **Fix:** Add consistent padding (e.g. `p-2` or `p-3`) to all icon-only interactive buttons, or introduce a shared `IconButton` component that enforces a minimum hit area.

#### Two data tables not wrapped for horizontal overflow
- **Category:** Responsive design
- **Location:** `frontend/src/portals/admin/pages/ExamResults.jsx:78,110,154`, `frontend/src/portals/student/pages/Results.jsx:58`
- **Issue:** These `<table className="w-full text-sm">` instances have no `overflow-x-auto` wrapper, unlike every other data table in the app (Alumni, Hostel, Inventory, MedicalRecords, Visitors, Exams, MarksEntry, Performance all correctly wrap theirs).
- **User impact:** On a narrow screen, these two tables can clip columns or force the whole page to scroll horizontally instead of just the table.
- **Fix:** Wrap each in a `<div className="overflow-x-auto">`, matching the pattern already used elsewhere in the same portals.

#### Raw Tailwind colors mixed with design tokens in the same className
- **Category:** Theming & design system
- **Location:** Systemic — ~380 raw palette-class hits across the 5 portals (admin 133, public 95, teacher 70, student 49, parent 32); none of `slate/gray/blue/red/green/indigo/purple` etc. are defined as tokens in `tailwind.config.js`. Concrete examples: `frontend/src/portals/admin/pages/Admissions.jsx:198` (`bg-red-50 text-danger` — raw red mixed with the `danger` token in one className), `frontend/src/portals/teacher/pages/Assignments.jsx:121` (`text-danger bg-red-50`), `frontend/src/portals/student/components/CourseForum.jsx:66,72` (`bg-slate-100` next to `text-ink-*`).
- **Issue:** The same visual role (an error background, a neutral divider/border) is expressed with a raw Tailwind color in some places and the matching design token in others, often in the very same element.
- **User impact:** No visible defect today since the raw colors happen to be close to the tokens, but the two will drift the moment either is restyled — a design update to `danger` or the neutral palette silently won't apply everywhere it should.
- **Fix:** Replace the raw palette classes with the existing tokens (`danger`, `ink.secondary`, etc.), and promote `slate-200`/`slate-100` to a real token given how universally they're already used as the de facto border/divider color.

#### Two parallel, inconsistent "card" systems
- **Category:** Theming & design system
- **Location:** `frontend/src/index.css:28` defines a `.card` utility (`bg-white rounded-xl shadow-sm border border-gray-100 p-6`), used only on the public site (e.g. `frontend/src/portals/public/pages/AcademicPrograms.jsx:105`); separately, each authenticated portal's `Common.jsx` exports a React `Card` component (`bg-white rounded-card shadow-card p-5`, no border) used on dashboards.
- **Issue:** Two different "card" definitions exist with different radius, shadow, border, and padding values, with no shared source of truth between them.
- **User impact:** The public marketing site and the logged-in portals feel like two different products at the component level — a subtle but real brand-consistency gap for a parent who moves from the marketing site into the parent portal.
- **Fix:** Consolidate to one `Card` component/token set and use it (or a documented deliberate variant) in both places.

#### `darkMode: "class"` is fully configured but completely unimplemented
- **Category:** Theming & design system
- **Location:** `frontend/tailwind.config.js:4` (`darkMode: "class"`); confirmed via a codebase-wide grep that zero files anywhere in `frontend/src` use a `dark:` variant class, and no theme-toggle component exists.
- **Issue:** Dark mode is switched on in the build config but never actually styled or exposed to the user.
- **User impact:** None today (no toggle exists for a user to find), but this is dead configuration that will mislead the next developer who assumes dark mode "already works" because the config says so.
- **Fix:** Either remove `darkMode: "class"` until a real dark-mode pass is scoped, or treat it as a backlog item and implement it properly (tokens redefined under the `.dark` class + a toggle control).

#### Duplicated (not shared) `Common.jsx` across four portals
- **Category:** Theming & design system / maintainability
- **Location:** `frontend/src/portals/{parent,student,teacher}/components/Common.jsx` are byte-for-byte identical (verified via `diff`, 0 differences, 83 lines each); `frontend/src/portals/admin/components/Common.jsx` differs by exactly one added `Link`-wrapping feature on `StatCard`. Each portal's `Topbar.jsx` is similarly hand-duplicated (identical `sticky top-0 z-20 bg-surface-light/90 backdrop-blur border-b border-slate-200 ...` string in all four), with one already-drifted copy: `frontend/src/portals/parent/components/Topbar.jsx:32` uses `border-gray-100` where the other three portals (and this same file's own line 11) use `border-slate-200`.
- **Issue:** `Card`, `Badge`, `Loader`, `EmptyState`, `StatCard`, and `Toast` are copy-pasted four times instead of living in one shared `frontend/src/components/` location.
- **User impact:** Not directly user-visible yet, but it already caused one visible inconsistency (the border-color drift above), and every accessibility fix recommended in this report (Toast, Modal) will need to be applied and kept in sync across four separate files instead of one.
- **Fix:** Promote these components to `frontend/src/components/` and have all four portals import the shared versions; keep only genuinely portal-specific pieces (e.g. `Sidebar` nav item lists) local.

#### Weaker focus indicator on the public admission form
- **Category:** Accessibility
- **Location:** `frontend/src/portals/public/pages/Admissions.jsx` inputs at lines 293, 301, 311, 323, 347, 355, 366, 375, 403 (`focus:outline-none focus:border-primary`, no `.focus-ring` class)
- **Issue:** The rest of the app consistently pairs `outline-none` with the shared `.focus-ring:focus-visible` utility (`frontend/src/index.css:49-52`) for a clear keyboard-focus indicator; this one form's inputs remove the outline and substitute only a border-color change.
- **User impact:** Keyboard users filling out the admission form (arguably the highest-stakes public-facing form on the whole site) get a subtler, easier-to-miss focus indicator than everywhere else in the app.
- **Fix:** Add the shared `.focus-ring` class to these inputs to match the rest of the codebase.

#### No image lazy-loading anywhere
- **Category:** Performance
- **Location:** All 48 `<img>` tags across the public site (Gallery, News, Events, Faculty, Achievements, CampusGallery, etc.) — confirmed zero `loading="lazy"` usages.
- **Issue:** Every image loads eagerly regardless of scroll position, including image-grid-heavy pages like `frontend/src/portals/public/pages/Gallery.jsx:86` and `frontend/src/portals/public/home/CampusGallery.jsx:103`.
- **User impact:** Slower initial page load and more bandwidth used than necessary on gallery/news-heavy pages, particularly on mobile connections.
- **Fix:** Add `loading="lazy"` to all `<img>` tags outside the immediate hero viewport.

#### No code-splitting across five separate portal bundles
- **Category:** Performance
- **Location:** `frontend/vite.config.js` (full file: only `plugins: [react()]`, `server: { port: 5173 }` — no `build.rollupOptions.manualChunks`)
- **Issue:** With five distinct entry surfaces (public + 4 portals) sharing one `src` tree, there's no configured chunk-splitting strategy, so a library like `recharts` (used in 3 files) is bundled wherever it's imported with no guaranteed separate vendor chunk.
- **User impact:** Users of portals that don't use charts may still pay for a larger-than-necessary JS payload if code-splitting isn't happening implicitly via Vite's defaults for their routes.
- **Fix:** Add route-level `React.lazy`/dynamic imports for heavier pages, and/or a `manualChunks` strategy separating vendor libraries from app code.

#### Total absence of `React.memo`/`useMemo`/`useCallback`
- **Category:** Performance
- **Location:** Codebase-wide — confirmed zero matches for any of the three across all of `frontend/src`.
- **Issue:** No component in the app uses any memoization primitive, including list-rendering components that map over students/books/notices.
- **User impact:** No severe case was found in this audit (the sampled list components, e.g. `frontend/src/portals/admin/pages/Students.jsx:48-58`, do lightweight per-row rendering), so there's no current user-facing slowness — but there are also no guard rails in place if a list gains a derived computation or an inline-function prop later.
- **Fix:** Not urgent today; apply memoization opportunistically as list components grow more complex, rather than as a blanket retrofit.

#### Parent portal's child-switcher dropdown lacks ARIA/keyboard affordances
- **Category:** Accessibility
- **Location:** `frontend/src/portals/parent/components/Topbar.jsx:19-51`
- **Issue:** The "Select child" dropdown toggles via `onClick={() => setOpen(!open)}` with no `aria-expanded`, no `aria-haspopup`, no Escape-to-close, and no outside-click-to-close (it only closes on selecting a child or re-clicking the toggle).
- **User impact:** A parent using a screen reader isn't told whether the dropdown is open or closed, and a sighted keyboard user who clicks elsewhere expects the dropdown to close and it won't.
- **Fix:** Add `aria-expanded`/`aria-haspopup`, an Escape handler, and a click-outside listener, matching a pattern that should also be reused by the FAQ accordion's existing (correct) `aria-expanded` implementation.

#### `ScrollProgress` animates a layout property instead of `transform`
- **Category:** Performance
- **Location:** `frontend/src/components/ScrollProgress.jsx:20-22`
- **Issue:** The scroll-progress bar animates `width` directly (`style={{ width: `${progress}%` }}` with a `transition-[width]` class) and recalculates on every unthrottled `scroll` event, instead of animating a compositor-only `transform: scaleX(...)`.
- **User impact:** Minor — this is a 3px-tall bar, not a large element, so the layout cost per scroll tick is small, but it is a real (if isolated) instance of the exact anti-pattern the performance dimension screens for.
- **Fix:** Switch to a `transform: scaleX()`-based implementation with `transform-origin: left`, which avoids triggering layout on every scroll event.

#### No cookie-consent mechanism; Google Fonts loaded without consent
- **Category:** Legal & compliance
- **Location:** `frontend/index.html:7-8` (Google Fonts `<link>` tags), no consent banner/mechanism found anywhere in `frontend/src`.
- **Issue:** No first-party tracking cookies were found in this audit (auth uses JWT in `localStorage`, not cookies), but the site does make an unconsented, render-blocking request to Google's font CDN on every page load, which shares the visitor's IP address with a third party before any consent is given.
- **User impact:** For EU visitors specifically, this is the same category of issue that produced real regulatory action against other sites (a 2022 German court ruling fined a site for exactly this pattern) — low severity in isolation, but a real, known exposure category.
- **Fix:** Self-host the Google Fonts files (removes the third-party request entirely) or add a consent gate before loading them.

#### No COPPA disclosure despite serving K-12 (likely under-13) student data
- **Category:** Legal & compliance
- **Location:** `frontend/src/portals/public/pages/PrivacyPolicy.jsx`, `Terms.jsx` — neither mentions children's data, COPPA, or an age threshold.
- **Issue:** The platform stores academic records for K-12 students, some of whom are necessarily under 13, with no COPPA-related disclosure anywhere in the public-facing legal docs.
- **User impact:** This is a documentation gap rather than a proven violation — data appears to be entered by parents/school staff (via admission enquiry forms) rather than collected directly from children, which is the school-official-consent pattern the FTC recognizes as an exception for ed-tech providers. But because that exception is never stated or relied upon anywhere in the docs, the school currently has no documented compliance position at all if ever asked.
- **Fix:** Add an explicit statement describing how student data is collected (via parent/school, not directly from the child) and reference the applicable COPPA school-consent exception, or consult counsel if any feature ever allows a student to submit personal data directly and unsupervised.

### P3 — Polish

#### Static, unverifiable hero stats duplicated outside their one real data source
- **Category:** Anti-patterns
- **Location:** `frontend/src/portals/public/home/AcademicPrograms.jsx:68,77`, `FacultyHighlight.jsx:9`, `FacilitiesGrid.jsx:74`
- **Issue:** `HeroBanner.jsx` correctly binds its stats to a live `/cms/stats/` endpoint with a static fallback, but these four other components hardcode the same-looking numbers (`6,500+`, `98%`, `350+`) with no CMS binding at all.
- **User impact:** None functionally — but if the real numbers ever change, these four will silently go stale while the hero updates.
- **Fix:** Bind these to the same CMS stats source as the hero, or remove the specific numbers in favor of qualitative copy.

#### Decorative glassmorphism stacking in the public hero
- **Category:** Anti-patterns
- **Location:** `frontend/src/portals/public/home/HeroBanner.jsx:31,57,72`
- **Issue:** Three different `bg-white/2x backdrop-blur-*` combinations are stacked in one hero section.
- **User impact:** None concrete — a stylistic choice, not a defect, flagged only because the audit brief specifically screens for decorative glassmorphism stacking.
- **Fix:** Optional simplification to one consistent glass treatment if revisited for other reasons.

#### A few one-off raw hex/pixel values instead of tokens
- **Category:** Theming & design system
- **Location:** `frontend/src/portals/student/components/IdCard.jsx:24` (`to-[#12245c]`, nearly identical to the existing `bg-dark` token `#0F172A` but not reusing it), `:73,77` (`p-[2px]`, `gap-[2px]`, `rounded-[1px]`)
- **Issue:** A handful of arbitrary-value Tailwind classes bypass the token/spacing scale.
- **User impact:** None visible — cosmetic inconsistency only, isolated to one component.
- **Fix:** Replace with the nearest existing token/scale value next time this component is touched.

#### Generic fallback error copy on two public forms
- **Category:** Usability heuristics — error recovery
- **Location:** `frontend/src/portals/public/pages/Admissions.jsx:105`, `frontend/src/portals/public/home/ContactSection.jsx:51` (both: `"Something went wrong. Please try again."`)
- **Issue:** These two forms fall back to a generic message, while other parts of the app (e.g. `frontend/src/portals/student/pages/Support.jsx:21`) give a specific, actionable fallback with an alternate contact method.
- **User impact:** A parent whose admission enquiry fails to submit gets no indication of what to do next besides retrying blindly.
- **Fix:** Match the more specific pattern already used in `Support.jsx` — state what failed and offer an alternate contact path.

#### Repeated magic-number image-card heights
- **Category:** Theming & design system
- **Location:** `frontend/src/portals/public/pages/Faculty.jsx:179`, `StudentLife.jsx:134`, `Academics.jsx:234`, `Downloads.jsx:143`, `News.jsx:83`, `TransportPublic.jsx:130` (all use `h-[420px]` or `h-[430px]`)
- **Issue:** The same fixed pixel height for image cards is repeated as an arbitrary value across six files instead of a shared class or token.
- **User impact:** None visible today — purely a maintainability nit.
- **Fix:** Extract to a shared utility class if these are meant to stay visually identical.

---

## Systemic Patterns

1. **No accessible-name convention exists for form fields anywhere in the app.** This isn't one bad form — it's every form in every portal (164 inputs, 0 `htmlFor`/`id` pairs, 13 `<label>` elements, 6 `aria-label` attributes total). It indicates no accessibility pattern for form fields was ever established, rather than a one-off oversight.
2. **Components are duplicated per-portal instead of shared.** `Common.jsx` (Card/Badge/Loader/EmptyState/StatCard/Toast) is byte-identical across three portals and near-identical in the fourth; `Topbar.jsx`'s chrome markup is separately hand-copied four times and has already drifted once (parent's `border-gray-100` vs. the other three portals' `border-slate-200`). Every fix recommended for a shared component in this report (Toast, focus states) currently must be applied and kept in sync manually across four files.
3. **No modal in the app has any dialog-accessibility primitive.** Submit Assignment, Checkout, Question Bank, Course Forum, and Quiz modals are five independent implementations of the same bare `fixed inset-0` wrapper, none with `role="dialog"`, focus trapping, Escape handling, or focus return — a single shared `Modal` abstraction was never built, so the same gap repeats five times.
4. **Icon-only buttons are undersized wherever they appear.** Modal close buttons (8+ files), all four portals' mobile hamburger toggles, and the admin inventory adjust buttons all size the button to the icon with no padding, landing well under the 44×44px touch-target guideline — the root cause is the lack of a shared `IconButton` component that enforces a minimum hit area.
5. **Raw Tailwind colors and design tokens are used interchangeably for the same visual role**, most heavily in the admin portal (133 raw-color hits) and the public site (95) — the same error-background or divider-border is expressed with a token in some places and a raw hex-equivalent class in others, often in the same `className` string, with no lint rule preventing the drift.

---

## Strengths

1. **Real, deliberate typographic system.** `tailwind.config.js` pairs four distinct type roles (Poppins/heading, Nunito/subheading, Inter/body, Montserrat/numbers) rather than defaulting to a single generic face everywhere — a genuine design decision, not a template default.
2. **Single, consistent icon library with zero drift.** `lucide-react` is the only icon source across 84 importing files; no emoji-as-icon, no mixed icon-library usage was found anywhere in the codebase.
3. **A real, consistently-applied empty-state/loading convention.** A shared `EmptyState` + `Loader` pattern is used in 66 files across all four authenticated portals, with explicit loading → empty → populated branching everywhere sampled — no silent blank-list views were found.
4. **Actual accessibility intent already exists, just incompletely applied.** `frontend/src/index.css:49-52` defines a proper `.focus-ring:focus-visible` treatment, correctly paired with `outline-none` on the majority of interactive controls across the app — this is meaningfully more thoughtful than the "remove outline, replace with nothing" pattern this exact audit brief screens for, even though a few forms (Admissions) were missed.
5. **A backend that has already been through a real security-hardening pass.** DRF defaults to `IsAuthenticated` (not `AllowAny`), JWT refresh tokens rotate and blacklist on logout, OTP endpoints have both per-account and per-IP throttling, CORS is a strict allowlist in production, and hostel/library writes use transactional row-locking — none of the classic "wide-open by default" mistakes were found in this audit.
6. **Zero XSS sinks and zero secrets in the frontend bundle.** No `dangerouslySetInnerHTML`, `.innerHTML`, `eval`, or hardcoded credentials exist anywhere in `frontend/src`, and `.env` is correctly gitignored at the repo root with `.env.example` deliberately excluded from the ignore rule.

---

## Recommended Priority Order

1. **Fix form-label association across every portal.** It's the single largest accessibility gap, touches literally every form in the app, and is the most likely to generate an actual WCAG/ADA complaint if the school is ever audited.
2. **Add a confirm step before destructive actions.** Cheapest possible fix (a handful of `window.confirm` calls) for one of the few findings that causes real, irreversible data loss from a single misclick.
3. **Fix the shared `Toast` and build one shared `Modal` component with real dialog semantics.** High leverage: because these are (mostly) already shared components, fixing them once — after first consolidating the duplicated `Common.jsx` files — fixes the issue everywhere instead of four times.
4. **Add CSP/HSTS/SSL-redirect and a default rate-limit scope to the backend.** Cheap, config-only changes that close the two concrete security gaps found before this app is exposed on a real production domain.
5. **Consolidate the four duplicated `Common.jsx`/`Topbar.jsx` files into one shared component set.** Not urgent on its own, but it's a force-multiplier — every future fix to Card/Badge/Toast/Topbar currently has to be applied four times, and the parent-portal border-color drift shows that's already happening.
6. **Close the two documented legal gaps** (add GDPR data-subject-rights language to the Privacy Policy; add a COPPA disclosure describing the parent/school-consent data flow) — low engineering cost, real regulatory exposure if left as-is.
7. **Address the remaining P2/P3 polish items opportunistically** (touch targets, dead dark-mode config, image lazy-loading, raw-color/token cleanup) as part of normal feature work rather than a dedicated pass — none of them are urgent in isolation.
