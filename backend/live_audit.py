"""
In-process endpoint audit. Uses Django's test Client (no real HTTP/network
needed) so it works even where the sandbox can't reach a locally running
server, and reads the OTP straight out of the shared cache instead of
depending on real email delivery.

Run with: venv/Scripts/python.exe manage.py shell < live_audit.py
"""
import json
import django
from django.conf import settings
from django.test import Client
from django.core.cache import cache
from django.contrib.auth import get_user_model

if "testserver" not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append("testserver")

client = Client()
User = get_user_model()

all_fails = []


def post(path, body, token=None):
    headers = {}
    if token:
        headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    resp = client.post(f"/api{path}", data=json.dumps(body), content_type="application/json", **headers)
    try:
        data = resp.json()
    except Exception:
        data = resp.content[:200]
    return data, resp.status_code


def get(path, token):
    headers = {}
    if token:
        headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    resp = client.get(f"/api{path}", **headers)
    try:
        data = resp.json()
    except Exception:
        data = resp.content[:200]
    return data, resp.status_code


def login(email):
    d, s = post("/auth/login/", {"email": email, "password": "EduNova@123"})
    if s != 200:
        return None, f"step1 {s}: {d}"
    user_id = d["user_id"]
    otp = cache.get(f"portal_login_otp:{user_id}")
    if not otp:
        return None, f"no OTP found in cache for user_id={user_id}"
    d2, s2 = post("/auth/verify-otp/", {"user_id": user_id, "otp": otp})
    if s2 != 200:
        return None, f"otp {s2}: {d2}"
    return d2["access"], None


def chk(label, endpoints, token):
    print(f"\n=== {label} ===")
    fails = []
    for path in endpoints:
        d, s = get(path, token)
        status = "OK" if s == 200 else f"FAIL({s})"
        detail = f" => {str(d)[:160]}" if s != 200 else ""
        print(f"  [{status}] {path}{detail}")
        if s != 200:
            fails.append((path, s, d))
    return fails


print("=== LOGIN ===")
st, e = login("student@edunova.edu")
print(f"  Student : {'OK' if st else 'FAIL: ' + str(e)}")
te, e = login("teacher@edunova.edu")
print(f"  Teacher : {'OK' if te else 'FAIL: ' + str(e)}")
pa, e = login("parent@edunova.edu")
print(f"  Parent  : {'OK' if pa else 'FAIL: ' + str(e)}")
ad, e = login("admin@edunova.edu")
print(f"  Admin   : {'OK' if ad else 'FAIL: ' + str(e)}")

all_fails += chk("STUDENT PORTAL", [
    "/student/dashboard/", "/student/profile/", "/student/attendance/",
    "/student/timetable/", "/student/homework/", "/student/assignments/",
    "/student/courses/", "/student/exams/", "/student/hall-tickets/",
    "/student/results/", "/student/fees/", "/student/library/",
    "/student/library/search/?q=math", "/student/certificates/",
    "/student/announcements/", "/student/events/",
    "/student/hostel/", "/student/medical-records/",
    "/student/report-card/?exam_name=Unit_Test_1",
    "/lms/forum-topics/?course_id=1", "/lms/notes/?course_id=1",
], st)

# LMS analytics is Admin/Teacher-only — test with teacher token
all_fails += chk("LMS ANALYTICS (teacher)", [
    "/lms/analytics/?course_id=1",
], te)

all_fails += chk("TEACHER PORTAL", [
    "/teacher/dashboard/", "/teacher/profile/", "/teacher/classes/",
    "/teacher/attendance/?class_id=1", "/teacher/homework/",
    "/teacher/assignments/", "/teacher/exams/",
    "/teacher/marks-entry/?exam_schedule_id=1",
    "/teacher/performance/?class_id=1",
    "/teacher/messages/", "/teacher/contacts/", "/teacher/notices/",
    "/teacher/leaves/", "/teacher/timetable/", "/teacher/documents/",
    "/teacher/question-bank/",
], te)

children_d, children_s = get("/parent/children/", pa)
child_id = children_d[0]["id"] if children_s == 200 and children_d else None
print(f"\n  [parent child_id resolved: {child_id}]")

parent_endpoints = [
    "/parent/dashboard/", "/parent/profile/", "/parent/children/",
    "/parent/notifications/", "/parent/ptm/", "/parent/feedback/",
    "/parent/messages/",
]
if child_id:
    parent_endpoints += [
        f"/parent/attendance/?child_id={child_id}",
        f"/parent/homework/?child_id={child_id}",
        f"/parent/results/?child_id={child_id}",
        f"/parent/fees/?child_id={child_id}",
        f"/parent/documents/?child_id={child_id}",
        f"/parent/transport/?child_id={child_id}",
        f"/parent/hostel/?child_id={child_id}",
        f"/parent/leaves/?child_id={child_id}",
    ]
all_fails += chk("PARENT PORTAL", parent_endpoints, pa)

all_fails += chk("ADMIN PORTAL", [
    "/admin-portal/dashboard/", "/admin-portal/admissions/",
    "/admin-portal/users/", "/admin-portal/roles/",
    "/admin-portal/classes/", "/admin-portal/subjects/",
    "/admin-portal/vehicles/", "/admin-portal/routes/",
    "/admin-portal/transport-allocations/",
    "/admin-portal/fee-structures/", "/admin-portal/payments/",
    "/admin-portal/library/books/", "/admin-portal/notices/",
    "/admin-portal/leaves/", "/admin-portal/reports/",
    "/admin-portal/audit-log/",
    "/admin-portal/hostels/", "/admin-portal/rooms/",
    "/admin-portal/hostel-allocations/",
    "/admin-portal/inventory/", "/admin-portal/visitors/",
    "/admin-portal/alumni/", "/admin-portal/medical-logs/",
    "/admin-portal/rank-list/?exam_schedule_id=1",
    "/admin-portal/rank-list/overall/?class_id=1&exam_name=Unit_Test_1",
    "/admin-portal/report-card/?student_id=1&exam_name=Unit_Test_1",
], ad)

print("\n=== WRITE WORKFLOW TESTS ===")

d, s = post("/teacher/attendance/", {
    "class_id": 1, "date": "2025-01-15",
    "records": [{"student": child_id, "status": "Present", "remarks": ""}]
}, te)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /teacher/attendance/ => {str(d)[:150]}")

d, s = post("/teacher/homework/", {
    "class_id": 1, "subject_id": 1, "title": "Audit HW",
    "description": "Test", "due_date": "2025-12-31"
}, te)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /teacher/homework/ => {str(d)[:150]}")

d, s = post("/teacher/assignments/", {
    "class_id": 1, "subject_id": 1, "title": "Audit Assignment",
    "description": "Test", "max_marks": 50, "due_date": "2025-12-31T00:00:00Z"
}, te)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /teacher/assignments/ => {str(d)[:150]}")

d, s = post("/teacher/marks-entry/", {
    "exam_schedule_id": 1,
    "rows": [{"student": child_id, "marks_obtained": 42, "remarks": "Good"}]
}, te)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /teacher/marks-entry/ => {str(d)[:150]}")

fees_d, fees_s = get("/student/fees/", st)
fee_id = fees_d["pending"][0]["id"] if fees_s == 200 and isinstance(fees_d, dict) and fees_d.get("pending") else None
if fee_id:
    d, s = post("/student/fees/pay/", {"fee_structure_id": fee_id, "payment_method": "UPI"}, st)
    print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /student/fees/pay/ => {str(d)[:150]}")
else:
    print("  [SKIP] POST /student/fees/pay/ (no pending fees)")

if child_id:
    d, s = post("/parent/leaves/", {
        "child_id": child_id, "leave_type": "Sick",
        "start_date": "2025-02-01", "end_date": "2025-02-02", "reason": "Fever"
    }, pa)
    print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /parent/leaves/ => {str(d)[:150]}")

d, s = post("/parent/ptm/", {
    "teacher_id": 1, "student_id": child_id,
    "meeting_date": "2025-03-10", "time_slot": "10:00", "parent_notes": "Audit test"
}, pa)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /parent/ptm/ => {str(d)[:150]}")

d, s = post("/parent/feedback/", {"category": "General", "feedback_text": "Audit test feedback"}, pa)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /parent/feedback/ => {str(d)[:150]}")

d, s = post("/admin-portal/notices/", {
    "title": "Audit Notice", "message": "Test", "recipient_type": "All"
}, ad)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /admin-portal/notices/ => {str(d)[:150]}")

d, s = post("/admin-portal/rank-list/", {"exam_schedule_id": 1}, ad)
print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /admin-portal/rank-list/ => {str(d)[:150]}")

leaves_d, leaves_s = get("/admin-portal/leaves/?status=Pending", ad)
leave_id = leaves_d[0]["id"] if leaves_s == 200 and leaves_d else None
if leave_id:
    d, s = post(f"/admin-portal/leaves/{leave_id}/decide/", {"decision": "Approved"}, ad)
    print(f"  [{'OK' if s == 200 else f'FAIL({s})'}] POST /admin-portal/leaves/{leave_id}/decide/ => {str(d)[:150]}")
else:
    print("  [SKIP] POST /admin-portal/leaves/decide/ (no pending leaves)")

print("\n=== RBAC CROSS-ROLE CHECKS (all should be 403) ===")
d, s = get("/student/dashboard/", te)
print(f"  [{'OK=403' if s == 403 else f'BROKEN({s})'}] teacher->student dashboard")
d, s = get("/teacher/dashboard/", st)
print(f"  [{'OK=403' if s == 403 else f'BROKEN({s})'}] student->teacher dashboard")
d, s = get("/admin-portal/dashboard/", pa)
print(f"  [{'OK=403' if s == 403 else f'BROKEN({s})'}] parent->admin dashboard")
d, s = get("/parent/dashboard/", st)
print(f"  [{'OK=403' if s == 403 else f'BROKEN({s})'}] student->parent dashboard")

print(f"\n=== SUMMARY: {len(all_fails)} endpoint(s) failed ===")
for path, s, d in all_fails:
    print(f"  FAIL({s}) {path} => {str(d)[:160]}")
