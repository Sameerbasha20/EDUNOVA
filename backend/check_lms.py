import urllib.request, json

BASE = 'http://localhost:8000/api'
OUT = []

def post(p, b, t=None):
    h = {'Content-Type': 'application/json'}
    if t: h['Authorization'] = 'Bearer ' + t
    r = urllib.request.Request(BASE+p, json.dumps(b).encode(), h, method='POST')
    try:
        with urllib.request.urlopen(r, timeout=10) as x:
            body = x.read()
            return (json.loads(body) if body.strip() else None), x.status
    except urllib.error.HTTPError as e:
        body = e.read()
        return (json.loads(body) if body.strip() else None), e.code

def get(p, t):
    r = urllib.request.Request(BASE+p, headers={'Authorization': 'Bearer ' + t})
    try:
        with urllib.request.urlopen(r, timeout=10) as x:
            body = x.read()
            return (json.loads(body) if body.strip() else None), x.status
    except urllib.error.HTTPError as e:
        body = e.read()
        return (json.loads(body) if body.strip() else None), e.code

def login(email):
    d, _ = post('/auth/login/', {'email': email, 'password': 'EduNova@123'})
    d2, _ = post('/auth/verify-otp/', {'user_id': d['user_id'], 'otp': '123456'})
    return d2['access']

te = login('teacher@edunova.edu')
ad = login('admin@edunova.edu')
st = login('student@edunova.edu')

results = []
for label, token in [('teacher', te), ('admin', ad), ('student', st)]:
    d, s = get('/lms/analytics/?course_id=1', token)
    results.append(f'{label}: {s} {"OK" if s==200 else "FAIL => "+str(d)[:100]}')

with open('check_lms_result.txt', 'w') as f:
    f.write('\n'.join(results) + '\n')
