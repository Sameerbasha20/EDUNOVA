import urllib.request, json, sys

BASE = 'http://localhost:8000/api'

def post(path, body, token=None):
    hdrs = {'Content-Type': 'application/json'}
    if token: hdrs['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(f'{BASE}{path}', data=json.dumps(body).encode(), headers=hdrs, method='POST')
    try:
        with urllib.request.urlopen(req) as r:
            body2 = r.read()
            return (json.loads(body2) if body2.strip() else None), r.status
    except urllib.error.HTTPError as e:
        body2 = e.read()
        return (json.loads(body2) if body2.strip() else None), e.code

def get(path, token):
    req = urllib.request.Request(f'{BASE}{path}', headers={'Authorization': f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read()
            return (json.loads(body) if body.strip() else None), r.status
    except urllib.error.HTTPError as e:
        body = e.read()
        return (json.loads(body) if body.strip() else None), e.code

def login(email):
    d, s = post('/auth/login/', {'email': email, 'password': 'EduNova@123'})
    if s != 200: return None, f'step1 {s}: {d}'
    d2, s2 = post('/auth/verify-otp/', {'user_id': d['user_id'], 'otp': '123456'})
    if s2 != 200: return None, f'otp {s2}: {d2}'
    return d2['access'], None

def chk(label, endpoints, token):
    print(f'\n=== {label} ===')
    fails = []
    for path in endpoints:
        d, s = get(path, token)
        status = 'OK' if s == 200 else f'FAIL({s})'
        detail = f' => {str(d)[:120]}' if s != 200 else ''
        print(f'  [{status}] {path}{detail}')
        if s != 200:
            fails.append((path, s, d))
    return fails

# --- Login ---
print('=== LOGIN ===')
st, e = login('student@edunova.edu');  print(f'  Student : {"OK" if st else "FAIL: "+str(e)}')
te, e = login('teacher@edunova.edu');  print(f'  Teacher : {"OK" if te else "FAIL: "+str(e)}')
pa, e = login('parent@edunova.edu');   print(f'  Parent  : {"OK" if pa else "FAIL: "+str(e)}')
ad, e = login('admin@edunova.edu');    print(f'  Admin   : {"OK" if ad else "FAIL: "+str(e)}')

all_fails = []

# --- Student ---
all_fails += chk('STUDENT PORTAL', [
    '/student/dashboard/', '/student/profile/', '/student/attendance/',
    '/student/timetable/', '/student/homework/', '/student/assignments/',
    '/student/courses/', '/student/exams/', '/student/hall-tickets/',
    '/student/results/', '/student/fees/', '/student/library/',
    '/student/library/search/?q=math', '/student/certificates/',
    '/student/announcements/', '/student/events/',
    '/student/hostel/', '/student/medical-records/',
    '/student/report-card/?exam_name=Unit_Test_1',
    '/lms/forum-topics/?course_id=1', '/lms/notes/?course_id=1',
    '/lms/analytics/?course_id=1',
], st)

# --- Teacher ---
all_fails += chk('TEACHER PORTAL', [
    '/teacher/dashboard/', '/teacher/profile/', '/teacher/classes/',
    '/teacher/attendance/?class_id=1', '/teacher/homework/',
    '/teacher/assignments/', '/teacher/exams/',
    '/teacher/marks-entry/?exam_schedule_id=1',
    '/teacher/performance/?class_id=1',
    '/teacher/messages/', '/teacher/contacts/', '/teacher/notices/',
    '/teacher/leaves/', '/teacher/timetable/', '/teacher/documents/',
    '/teacher/question-bank/',
], te)

# --- Parent (need child_id) ---
# first fetch children list
children_d, children_s = get('/parent/children/', pa)
child_id = children_d[0]['id'] if children_s == 200 and children_d else None
print(f'\n  [parent child_id resolved: {child_id}]')

parent_endpoints = [
    '/parent/dashboard/', '/parent/profile/', '/parent/children/',
    '/parent/notifications/', '/parent/ptm/', '/parent/feedback/',
    '/parent/messages/',
]
if child_id:
    parent_endpoints += [
        f'/parent/attendance/?child_id={child_id}',
        f'/parent/homework/?child_id={child_id}',
        f'/parent/results/?child_id={child_id}',
        f'/parent/fees/?child_id={child_id}',
        f'/parent/documents/?child_id={child_id}',
        f'/parent/transport/?child_id={child_id}',
        f'/parent/hostel/?child_id={child_id}',
        f'/parent/leaves/?child_id={child_id}',
    ]
all_fails += chk('PARENT PORTAL', parent_endpoints, pa)

# --- Admin ---
all_fails += chk('ADMIN PORTAL', [
    '/admin-portal/dashboard/', '/admin-portal/admissions/',
    '/admin-portal/users/', '/admin-portal/roles/',
    '/admin-portal/classes/', '/admin-portal/subjects/',
    '/admin-portal/vehicles/', '/admin-portal/routes/',
    '/admin-portal/transport-allocations/',
    '/admin-portal/fee-structures/', '/admin-portal/payments/',
    '/admin-portal/library/books/', '/admin-portal/notices/',
    '/admin-portal/leaves/', '/admin-portal/reports/',
    '/admin-portal/audit-log/',
    '/admin-portal/hostels/', '/admin-portal/rooms/',
    '/admin-portal/hostel-allocations/',
    '/admin-portal/inventory/', '/admin-portal/visitors/',
    '/admin-portal/alumni/', '/admin-portal/medical-logs/',
    '/admin-portal/rank-list/?exam_schedule_id=1',
    '/admin-portal/rank-list/overall/?class_id=1&exam_name=Unit_Test_1',
    '/admin-portal/report-card/?student_id=1&exam_name=Unit_Test_1',
], ad)

# --- POST workflow tests ---
print('\n=== WRITE WORKFLOW TESTS ===')

# Teacher: mark attendance
d, s = post('/teacher/attendance/', {
    'class_id': 1, 'date': '2025-01-15',
    'records': [{'student': child_id, 'status': 'Present', 'remarks': ''}]
}, te)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /teacher/attendance/ => {str(d)[:100]}')

# Teacher: create homework
d, s = post('/teacher/homework/', {
    'class_id': 1, 'subject_id': 1, 'title': 'Audit HW',
    'description': 'Test', 'due_date': '2025-12-31'
}, te)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /teacher/homework/ => {str(d)[:100]}')

# Teacher: create assignment
d, s = post('/teacher/assignments/', {
    'class_id': 1, 'subject_id': 1, 'title': 'Audit Assignment',
    'description': 'Test', 'max_marks': 50, 'due_date': '2025-12-31T00:00:00Z'
}, te)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /teacher/assignments/ => {str(d)[:100]}')

# Teacher: submit marks
d, s = post('/teacher/marks-entry/', {
    'exam_schedule_id': 1,
    'rows': [{'student': child_id, 'marks_obtained': 42, 'remarks': 'Good'}]
}, te)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /teacher/marks-entry/ => {str(d)[:100]}')

# Student: pay fee
fees_d, fees_s = get('/student/fees/', st)
fee_id = fees_d['pending'][0]['id'] if fees_s == 200 and fees_d.get('pending') else None
if fee_id:
    d, s = post('/student/fees/pay/', {'fee_structure_id': fee_id, 'payment_method': 'UPI'}, st)
    print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /student/fees/pay/ => {str(d)[:100]}')
else:
    print('  [SKIP] POST /student/fees/pay/ (no pending fees)')

# Parent: submit leave
if child_id:
    d, s = post('/parent/leaves/', {
        'child_id': child_id, 'leave_type': 'Sick',
        'start_date': '2025-02-01', 'end_date': '2025-02-02', 'reason': 'Fever'
    }, pa)
    print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /parent/leaves/ => {str(d)[:100]}')

# Parent: PTM booking
d, s = post('/parent/ptm/', {
    'teacher_id': 1, 'student_id': child_id,
    'meeting_date': '2025-03-10', 'time_slot': '10:00', 'parent_notes': 'Audit test'
}, pa)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /parent/ptm/ => {str(d)[:100]}')

# Parent: feedback
d, s = post('/parent/feedback/', {'category': 'General', 'feedback_text': 'Audit test feedback'}, pa)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /parent/feedback/ => {str(d)[:100]}')

# Admin: broadcast notice
d, s = post('/admin-portal/notices/', {
    'title': 'Audit Notice', 'message': 'Test', 'recipient_type': 'All'
}, ad)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /admin-portal/notices/ => {str(d)[:100]}')

# Admin: rank list generate
d, s = post('/admin-portal/rank-list/', {'exam_schedule_id': 1}, ad)
print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /admin-portal/rank-list/ => {str(d)[:100]}')

# Admin: leave approve
leaves_d, leaves_s = get('/admin-portal/leaves/?status=Pending', ad)
leave_id = leaves_d[0]['id'] if leaves_s == 200 and leaves_d else None
if leave_id:
    d, s = post(f'/admin-portal/leaves/{leave_id}/decide/', {'decision': 'Approved'}, ad)
    print(f'  [{"OK" if s==200 else f"FAIL({s})"}] POST /admin-portal/leaves/{leave_id}/decide/ => {str(d)[:100]}')
else:
    print('  [SKIP] POST /admin-portal/leaves/decide/ (no pending leaves)')

# --- RBAC cross-role checks ---
print('\n=== RBAC CROSS-ROLE CHECKS (all should be 403) ===')
d, s = get('/student/dashboard/', te);  print(f'  [{"OK=403" if s==403 else f"BROKEN({s})"}] teacher->student dashboard')
d, s = get('/teacher/dashboard/', st);  print(f'  [{"OK=403" if s==403 else f"BROKEN({s})"}] student->teacher dashboard')
d, s = get('/admin-portal/dashboard/', pa); print(f'  [{"OK=403" if s==403 else f"BROKEN({s})"}] parent->admin dashboard')
d, s = get('/parent/dashboard/', st);   print(f'  [{"OK=403" if s==403 else f"BROKEN({s})"}] student->parent dashboard')

print(f'\n=== SUMMARY: {len(all_fails)} endpoint(s) failed ===')
for path, s, d in all_fails:
    print(f'  FAIL({s}) {path} => {str(d)[:120]}')
