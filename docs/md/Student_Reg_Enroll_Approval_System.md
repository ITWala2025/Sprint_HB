# SPRINT Architectural Workflow Specification: Student Registration, Enrollment & Approval System

> **Document Status**: Approved & Final  
> **Target Audience**: System Architects, Backend Engineers, Full-Stack Developers  
> **System Context**: SPRINT Institutional Training Hub (Admin Console & Student Portal)

---

## 1. System Architecture & Entity Model Overview

To support multi-course purchases, separate registration intakes, and secure administrative verification, the Supabase PostgreSQL database requires five core entities working in harmony:

1. **`registrations`**: Captures all user form submissions from the public enrollment/registration wizard.
2. **`enrollments`**: Captures paid or pending course purchase intents requiring offline fee verification by admin/staff.
3. **`students`**: Stores verified institutional records (`registration_number`, college details, academic standing) for fully vetted learners.
4. **`student_courses`** (Junction Table): Maps many-to-many relationships between `students.id` and `courses.id` (or `course_bundles.id`), enabling multi-course ownership.
5. **`profiles`**: Extends Supabase `auth.users` to manage role-based access control (`admin`, `staff`, `student`).

---

## 2. Public Intake Workflow (Form Submission Logic)

When a student completes the public onboarding / enrollment form (`/student/enroll`), the application inspects the course selection array:

### Email Verification and Redirect Configuration
* Before accepting the enrollment, the wizard sends a Supabase magic link to the email address entered in Step 1.
* Step 2 (education and course selection) is optional. The student can continue without selecting a course.
* Step 3 requires the student to open the link in the same browser session; the server verifies that the authenticated, confirmed email matches the submitted email before saving.
* The verification request includes the student's name and mobile number as Auth metadata so the new student profile is created with usable profile details.
* A successful submission is linked to the verified Auth user through `enrollments.applicant_user_id`. `enrollments.student_id` remains unset until approval provisions the student record.
* After the enrollment is saved, the server requests a Supabase password-recovery email that points to `<app-origin>/set-password`. This is a separate email from the Step 3 verification link. If password setup email delivery fails, the application remains saved and the completion screen directs the student to **Forgot Password**.
* Add each deployed application's callback URL (`<app-origin>/student/enroll`) and password callback (`<app-origin>/set-password`) to **Supabase → Authentication → URL Configuration → Redirect URLs**. Include local development and production origins. If Next.js is running on port `3001`, add `http://localhost:3001/student/enroll` and `http://localhost:3001/set-password` (not only port `3000`). Configure a working SMTP/email provider so Supabase can deliver both messages.
* A rejected redirect URL, email rate limit, or delivery-provider failure is shown with next steps; a failed verification request must not be treated as a successful verification.
* Email verification does not create a password. After submission, students use the password setup link to create one and sign in with email and password. The dashboard shows their pending, approved, or rejected application status; course access remains subject to approval.

### Student Dashboard Application Status
* `/student/dashboard` reads applications by `applicant_user_id`, which lets a verified student see their application before a `public.students` row exists.
* Each application shows the selected course or bundle and its review status. An application without a course selection is shown as **Course not selected**.
* Run `src/Supabase/Enrollment Applicant Account Link Migration.sql` in existing Supabase projects before deploying this workflow. The migration adds the applicant identity foreign key, backfills matching verified accounts, and enables applicant-only RLS reads. The initial schema defines the same column and policy for new installations.

### Scenario 1.1: Pure Registration (No Courses Selected)
* **Condition**: `course_ids` / `bundle_ids` array is empty.
* **Intent**: User is creating an account or expressing general interest without purchasing a specific program.
* **Database Action**: 
  * Insert record **only** into `public.registrations`.
  * Status set to `'pending'` (or `'registered'`).
* **Admin Visibility**: Appears under **Student Registration** (`/admin/students/registrations`).

### Scenario 1.2: Registration + Course Enrollment
* **Condition**: Student selects one or more courses/bundles during intake.
* **Intent**: User intends to enroll in specific training modules and pay offline.
* **Database Action**:
  * Insert primary record into `public.registrations`.
  * For each selected course/bundle, insert a corresponding record into `public.enrollments` linked to the user/registration, with `payment_status = 'pending_offline_verification'`.
* **Admin Visibility**: Registrations table **and** pending review under **Student Enrollment** (`/admin/students/enrollments`).

---

## 3. Database Schema: The `student_courses` Junction Table

To support students purchasing multiple courses over time without duplicating student records, execute this SQL migration in your Supabase SQL Editor:

The repository migration [Student Enrollment Approval and Courses Migration.sql](../../src/Supabase/Student%20Enrollment%20Approval%20and%20Courses%20Migration.sql) creates the junction table and the transactional `verify_and_approve_enrollment` RPC used by the admin approval action. Run it in existing Supabase projects before deploying these admin operations.

```sql
-- ============================================================================
-- SPRINT STUDENT COURSES JUNCTION TABLE MIGRATION
-- ============================================================================

create table if not exists public.student_courses (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references public.students(id) on delete cascade not null,
    course_id uuid references public.courses(id) on delete cascade,
    bundle_id uuid references public.course_bundles(id) on delete cascade,
    enrolled_at timestamptz not null default timezone('utc', now()),
    status text not null default 'active', -- 'active', 'completed', 'suspended'
    constraint student_course_or_bundle check (course_id is not null or bundle_id is not null),
    constraint unique_student_course unique nulls not distinct (student_id, course_id, bundle_id)
);

-- Enable RLS
alter table public.student_courses enable row level security;

-- Policies
create policy "Staff manage student courses"
    on public.student_courses for all
    to authenticated
    using (public.is_staff() or public.current_user_has_permission('student_ops', 'edit'));

create policy "Students view own purchased courses"
    on public.student_courses for select
    to authenticated
    using (student_id = auth.uid() or public.is_staff());

notify pgrst, 'reload schema';
```

---

## 4. Admin Dashboard: Student Operations Sub-Navigation

The **Student Operations** dropdown in the admin sidebar is partitioned into three distinct management consoles:

### 4.1. Student Registration (`/admin/students/registrations`)
* **Data Source**: `public.registrations` (where no courses were selected, or general inquiries).
* **Admin Capabilities**: 
  * **View**: Detailed modal showing personal details, college, phone, and submission timestamp.
  * **Edit**: Update contact info or notes.
  * **Delete**: Safely remove spam or obsolete registration rows.

### 4.2. Student Enrollment (`/admin/students/enrollments`)
* **Data Source**: `public.enrollments` joined with `public.registrations` and course metadata.
* **Verification & Processing Scenarios**:
  
  #### Scenario 3.2.1: First-Time Student Enrollment (New Account & ID Generation)
  1. Student registers and selects their first course(s). Appears as *Pending* in Admin Enrollment.
  2. Student completes **offline fee payment** at the SPRINT center.
  3. Admin clicks **Verify & Approve** in the dashboard.
  4. **Backend Transaction**:
     * Generates a unique institutional registration number (e.g., `SPR-2026-XXXX`).
     * Creates or updates the record in `public.students`.
     * Maps the `student_id` to the course ID(s) inside `public.student_courses`.
     * Upgrades user profile role in `public.profiles` to `'student'` and sets `is_active = true`.
     * Triggers an automated **Enrollment Confirmation Email** to the student with portal credentials and purchased course access.

  #### Scenario 3.2.2: Existing Student Purchasing Additional Courses
  1. An already verified student (who has a `student_id` and registration number) purchases a new course from the website.
  2. A new entry appears in the admin **Student Enrollment** console for this specific course purchase.
  3. Admin verifies offline fee payment and clicks **Approve**.
  4. **Backend Transaction**:
     * **Does NOT** generate a new student ID or duplicate the `public.students` record.
     * Inserts a new mapping row into `public.student_courses` linking the existing `student_id` to the new `course_id`.
     * Sends a targeted **Course Enrollment Confirmation Email** confirming addition of the new module.
     * The newly purchased course instantly unlocks and populates inside the student's portal course collection (`/student/my-course`).

### 4.3. Student Directory (`/admin/students/list`)
* **Data Source**: `public.students` joined with `public.profiles` and aggregated `public.student_courses`.
* **Admin Capabilities**:
  * Comprehensive view of every fully vetted, active student.
  * Displays complete profile data, registration number, college, branch, and **all active course badges** purchased by the student.
  * Direct access to attendance records, academic progress, and profile editing tools.

---

## 5. Summary State Transition Matrix

| Event / Action | Target Table(s) | Student ID / Reg No. | Course Mapping | Portal Access State |
| :--- | :--- | :--- | :--- | :--- |
| **Form Submitted (No Courses)** | `registrations` | Not Generated | None | Locked / Registration Only |
| **Form Submitted (With Courses)** | `registrations`, `enrollments` | Pending Generation | Staged in Enrollments | Pending Verification Notice |
| **Admin Approves First Course** | `students`, `student_courses`, `profiles` | **Generated** (`SPR-YYYY-XXXX`) | Linked in `student_courses` | **Full Portal Access** + Course Unlocked |
| **Admin Approves Additional Course** | `student_courses`, `enrollments` | **Retained** (Existing ID) | Appended to `student_courses` | New Course Unlocked in Collection |