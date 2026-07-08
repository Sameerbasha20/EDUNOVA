-- ============================================================================
-- EduNova Global Academy — Full Database Schema (Supabase / PostgreSQL)
-- Source: DocScanner_16-Jun-2026 DB blueprint (52 tables)
-- Run this in Supabase SQL Editor (or via `supabase db push`) on a fresh project.
-- ============================================================================
create extension if not exists "pgcrypto";

-- ---------- Module A: Auth, Security, System Config ----------
create table users (
  id uuid primary key default gen_random_uuid(),
  username varchar(50) unique not null,
  email varchar(100) unique not null,
  password_hash varchar(255) not null,
  phone_number varchar(20) unique,
  user_type varchar(20) not null check (user_type in ('Admin','Teacher','Student','Parent','Employee')),
  is_active boolean default true,
  otp_secret varchar(128),
  password_policy_version int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table roles (
  id serial primary key,
  name varchar(100) unique not null,
  description text
);

create table user_roles (
  user_id uuid references users(id) on delete cascade,
  role_id int references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table permissions (
  id serial primary key,
  name varchar(100) unique not null,
  module varchar(50)
);

create table role_permissions (
  role_id int references roles(id) on delete cascade,
  permission_id int references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table audit_logs (
  id bigserial primary key,
  user_id uuid references users(id) on delete set null,
  action varchar(255),
  table_name varchar(100),
  row_id varchar(100),
  old_values jsonb,
  new_values jsonb,
  ip_address varchar(45),
  user_agent text,
  timestamp timestamptz default now()
);

create table settings (
  id serial primary key,
  setting_key varchar(100) unique not null,
  setting_value text
);

-- ---------- Module B: Stakeholders ----------
create table parents (
  id uuid primary key references users(id) on delete cascade,
  father_name varchar(150),
  mother_name varchar(150),
  father_profession varchar(100),
  mother_profession varchar(100),
  emergency_contact varchar(20),
  address text,
  is_verified boolean default false
);

create table classes (
  id serial primary key,
  name varchar(50),
  section varchar(10),
  curriculum varchar(20) check (curriculum in ('CBSE','Cambridge')),
  room_number varchar(20)
);

create table teachers (
  id uuid primary key references users(id) on delete cascade,
  qualification varchar(255),
  specialization varchar(150),
  date_of_joining date
);

create table employees (
  id uuid primary key references users(id) on delete cascade,
  department varchar(50) check (department in ('Academic Affairs','Admissions','Transport','Library','Finance','Accounts','Human Resources','IT Department','Examination Cell','Sports','Hostel','Medical Center')),
  designation varchar(100),
  date_of_joining date
);

create table students (
  id uuid primary key references users(id) on delete cascade,
  parent_id uuid references parents(id) on delete restrict,
  admission_number varchar(50) unique,
  qr_id_code varchar(100) unique,
  date_of_birth date,
  gender varchar(20),
  blood_group varchar(10),
  status varchar(20) default 'Active' check (status in ('Active','Graduated','Suspended'))
);

create table subjects (
  id serial primary key,
  name varchar(100),
  subject_code varchar(30) unique,
  type varchar(20) check (type in ('Theory','Practical','Lab','Skill_Development'))
);

create table academic_allocations (
  id serial primary key,
  class_id int references classes(id) on delete cascade,
  subject_id int references subjects(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete restrict,
  unique (class_id, subject_id, teacher_id)
);

create table student_enrollments (
  id serial primary key,
  student_id uuid references students(id) on delete cascade,
  class_id int references classes(id) on delete restrict,
  academic_year varchar(20),
  roll_number int
);

-- ---------- Module C: Timetable / Attendance / Homework ----------
create table timetables (
  id serial primary key,
  class_id int references classes(id) on delete cascade,
  subject_id int references subjects(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete cascade,
  day_of_week varchar(10) check (day_of_week in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  start_time time,
  end_time time
);

create table attendance (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  class_id int references classes(id) on delete cascade,
  date date,
  status varchar(20) check (status in ('Present','Absent','Late','Medical_Leave')),
  marked_by uuid references users(id) on delete restrict,
  remarks varchar(255)
);

create table homework (
  id serial primary key,
  class_id int references classes(id) on delete cascade,
  subject_id int references subjects(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete restrict,
  title varchar(200),
  description text,
  assigned_date date,
  due_date date
);

-- ---------- Module D: LMS ----------
create table course_management (
  id serial primary key,
  subject_id int references subjects(id) on delete cascade,
  class_id int references classes(id) on delete cascade,
  title varchar(200),
  description text
);

create table course_content (
  id serial primary key,
  course_id int references course_management(id) on delete cascade,
  content_type varchar(30) check (content_type in ('Video_Link','Recorded_Video_File','PDF_Notes','Live_Class_URL')),
  title varchar(200),
  resource_url text,
  sort_order int
);

create table assignments (
  id serial primary key,
  class_id int references classes(id) on delete cascade,
  subject_id int references subjects(id) on delete cascade,
  title varchar(200),
  description text,
  file_url text,
  max_marks int,
  due_date timestamptz
);

create table assignment_submissions (
  id serial primary key,
  assignment_id int references assignments(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  submission_url text,
  submitted_at timestamptz default now(),
  marks_obtained decimal(5,2),
  teacher_feedback text
);

create table quizzes (
  id serial primary key,
  course_id int references course_management(id) on delete cascade,
  title varchar(200),
  duration_minutes int,
  passing_score int
);

create table quiz_questions (
  id serial primary key,
  quiz_id int references quizzes(id) on delete cascade,
  question_text text,
  options jsonb,
  correct_answer varchar(255)
);

-- ---------- Module E: Examination ----------
create table question_bank (
  id serial primary key,
  subject_id int references subjects(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete restrict,
  difficulty_level varchar(10) check (difficulty_level in ('Easy','Medium','Hard')),
  question_text text,
  answer_schema jsonb
);

create table exam_schedules (
  id serial primary key,
  class_id int references classes(id) on delete cascade,
  subject_id int references subjects(id) on delete cascade,
  exam_name varchar(150),
  exam_type varchar(10) check (exam_type in ('Offline','Online','OMR')),
  exam_date date,
  start_time time,
  duration_minutes int,
  max_marks int
);

create table hall_tickets (
  id serial primary key,
  student_id uuid references students(id) on delete cascade,
  exam_schedule_id int references exam_schedules(id) on delete cascade,
  ticket_number varchar(100) unique,
  is_verified boolean default false
);

create table results (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  exam_schedule_id int references exam_schedules(id) on delete cascade,
  marks_obtained decimal(5,2),
  rank_position int,
  grade_points decimal(3,1),
  grade_letter varchar(10),
  remarks varchar(255)
);

-- ---------- Module F: Admissions / Fees / HR ----------
create table admissions (
  id serial primary key,
  registration_number varchar(100) unique,
  applicant_name varchar(150),
  target_class_id int references classes(id) on delete restrict,
  parent_phone varchar(20),
  scholarship_applied boolean default false,
  status varchar(20) check (status in ('Registered','Verification','Screening','Fee_Pending','Confirmed'))
);

create table fee_structures (
  id serial primary key,
  class_id int references classes(id) on delete restrict,
  term_name varchar(100),
  tuition_fee decimal(12,2),
  transport_fee decimal(12,2) default 0,
  hostel_fee decimal(12,2) default 0,
  total_amount decimal(12,2)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete restrict,
  fee_structure_id int references fee_structures(id) on delete restrict,
  transaction_id varchar(150) unique,
  amount_paid decimal(12,2),
  payment_method varchar(20) check (payment_method in ('NetBanking','Card','UPI')),
  status varchar(20) check (status in ('Success','Failed','Pending')),
  paid_at timestamptz default now()
);

create table payroll (
  id serial primary key,
  employee_id uuid references users(id) on delete restrict,
  month_year varchar(15),
  base_salary decimal(12,2),
  allowances decimal(12,2) default 0,
  deductions decimal(12,2) default 0,
  net_salary decimal(12,2),
  payment_status varchar(20) check (payment_status in ('Processed','Hold','Pending'))
);

create table leaves (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  leave_type varchar(20) check (leave_type in ('Casual','Sick','Earned','Academic')),
  start_date date,
  end_date date,
  reason text,
  status varchar(20) default 'Pending' check (status in ('Pending','Approved','Rejected')),
  approved_by uuid references users(id) on delete set null
);

-- ---------- Module G: Library / Transport / Hostel ----------
create table books (
  id serial primary key,
  title varchar(255),
  author varchar(255),
  isbn varchar(50) unique,
  barcode_id varchar(100) unique,
  quantity int,
  available_quantity int
);

create table library_transactions (
  id bigserial primary key,
  book_id int references books(id) on delete restrict,
  borrower_id uuid references users(id) on delete restrict,
  issue_date date,
  due_date date,
  return_date date,
  fine_amount decimal(10,2) default 0
);

create table vehicles (
  id serial primary key,
  vehicle_number varchar(50) unique,
  capacity int,
  driver_id uuid references employees(id) on delete restrict,
  gps_device_id varchar(150) unique,
  maintenance_status varchar(100)
);

create table routes (
  id serial primary key,
  route_name varchar(150),
  start_point varchar(200),
  end_point varchar(200)
);

create table transport_allocations (
  id serial primary key,
  student_id uuid references students(id) on delete cascade,
  vehicle_id int references vehicles(id) on delete restrict,
  route_id int references routes(id) on delete restrict,
  pickup_point varchar(200)
);

create table hostels (
  id serial primary key,
  name varchar(100),
  type varchar(10) check (type in ('Boys','Girls')),
  warden_id uuid references employees(id) on delete restrict
);

create table rooms (
  id serial primary key,
  hostel_id int references hostels(id) on delete cascade,
  room_number varchar(30),
  capacity int,
  occupied_beds int default 0
);

create table inventory (
  id serial primary key,
  item_name varchar(200),
  category varchar(30) check (category in ('IT Assets','Lab Material','Sports Equipment','Stationery')),
  quantity int,
  department varchar(100)
);

-- ---------- Module H: CMS ----------
create table notifications (
  id bigserial primary key,
  sender_id uuid references users(id) on delete cascade,
  recipient_type varchar(10) check (recipient_type in ('All','Class','Individual')),
  target_class_id int references classes(id) on delete cascade,
  title varchar(200),
  message text,
  created_at timestamptz default now()
);

create table news (
  id serial primary key,
  title varchar(255),
  content text,
  cover_image_url text,
  published_date date
);

create table events (
  id serial primary key,
  title varchar(255),
  description text,
  event_date date,
  venue varchar(200)
);

create table gallery (
  id serial primary key,
  album_name varchar(150),
  image_url text,
  uploaded_at timestamptz default now()
);

create table certificates (
  id serial primary key,
  student_id uuid references students(id) on delete cascade,
  certificate_type varchar(30) check (certificate_type in ('Transfer Certificate','Bonafide Certificate','Scholarship Award','Rank Certificate')),
  issued_date date,
  file_url text
);

-- ---------- Module I: Real-time Portals / Ops ----------
create table visitor_management (
  id serial primary key,
  visitor_name varchar(150),
  purpose text,
  host_user_id uuid references users(id) on delete set null,
  check_in_time timestamptz default now(),
  check_out_time timestamptz,
  id_proof_type varchar(50)
);

create table ptm_bookings (
  id serial primary key,
  parent_id uuid references parents(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete cascade,
  meeting_date date,
  time_slot time,
  status varchar(20) default 'Scheduled' check (status in ('Scheduled','Completed','Cancelled')),
  parent_notes text
);

create table live_bus_logs (
  id bigserial primary key,
  vehicle_id int references vehicles(id) on delete cascade,
  latitude decimal(9,6),
  longitude decimal(9,6),
  updated_at timestamptz default now()
);

create table alumni_registry (
  id serial primary key,
  student_id uuid references students(id) on delete cascade,
  graduation_year int,
  current_occupation varchar(200),
  higher_studies_details text
);

create table messages (
  id bigserial primary key,
  sender_id uuid references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  message_text text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table medical_logs (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  visit_date date,
  symptoms text,
  treatment_given text,
  doctor_notes text
);

-- ============================================================================
-- INDEXES (high-traffic student-portal lookups)
-- ============================================================================
create index idx_attendance_student_date on attendance(student_id, date);
create index idx_homework_class on homework(class_id, due_date);
create index idx_assignments_class on assignments(class_id, due_date);
create index idx_submissions_student on assignment_submissions(student_id);
create index idx_results_student on results(student_id);
create index idx_payments_student on payments(student_id);
create index idx_notifications_class on notifications(target_class_id);

-- ============================================================================
-- ROW LEVEL SECURITY — Student Portal scope
-- Assumes Django backend connects with a service role / trusted DB user and
-- enforces authorization in the API layer (see backend/portal/permissions.py).
-- If you instead call Supabase directly from the frontend with anon/user JWTs,
-- enable RLS + these policies so a student can only ever see their own rows.
-- ============================================================================
alter table students enable row level security;
alter table attendance enable row level security;
alter table assignment_submissions enable row level security;
alter table results enable row level security;
alter table payments enable row level security;
alter table hall_tickets enable row level security;
alter table certificates enable row level security;

-- Example policy pattern (uses Supabase auth.uid() if you switch to Supabase Auth):
-- create policy "students_read_own_row" on students
--   for select using (auth.uid() = id);
-- create policy "students_read_own_attendance" on attendance
--   for select using (auth.uid() = student_id);
-- Repeat the pattern per table. Left commented out because this project's
-- Django backend uses its own JWT auth against the `users` table, not
-- Supabase Auth — enable these only if you migrate auth to Supabase Auth.
