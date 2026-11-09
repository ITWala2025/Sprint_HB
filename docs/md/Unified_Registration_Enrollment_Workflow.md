# SPRINT Unified Registration & Enrollment Workflow

**Architecture & Supabase Implementation Specification**

> **Status:** Implemented in the application; database migration and Supabase project configuration are still required before deployment.  
> **Scope:** Student account verification, personal registration, optional course enrollment, and Supabase project changes.  
> **Relationship to existing documentation:** This proposal updates the public intake workflow described in [Student_Reg_Enroll_Approval_System.md](./Student_Reg_Enroll_Approval_System.md). The existing admin review and student approval workflow remains in effect unless explicitly changed below.

## 1. Purpose

Provide one intake experience that verifies the applicant's email with a six-digit one-time password (OTP), captures required personal details, and optionally captures education details and a course or bundle selection.

Every submission through the registration wizard creates a row in `public.registrations`. A row in `public.enrollments` is also created when the applicant selects a course or bundle. The existing intake schema contains a legacy payment-status field, but payment is not part of direct enrollment or its approval decision.

## Direct course applications for existing students

An authenticated, active student may apply from an individual published course page without reopening the registration wizard. The server action verifies the authenticated student profile and the published course, then inserts one `pending` row in `public.enrollments`. Unauthenticated users are sent to Student Login and returned to that course after signing in.

The application appears in Admin Panel → Student Operations → Enrollment Applications and Student Portal → My Courses. The student portal reads enrollment status and active access records from Supabase, scoped to the signed-in student's identity. Admin approval calls the two-argument `verify_and_approve_enrollment(p_enrollment_id, p_admin_user_id)` RPC through the server-only service-role client. That RPC updates the existing enrollment and creates or reactivates the corresponding `public.student_courses` row. Rejection updates the existing enrollment without creating access. No payment check is part of this flow.

The server checks for an existing pending or approved application before inserting. The approval migration adds database uniqueness protection for concurrent submissions; review [Enrollment Approval Preflight.sql](../../src/Supabase/Enrollment%20Approval%20Preflight.sql), then apply [Enrollment Applicant Account Link Migration.sql](../../src/Supabase/Enrollment%20Applicant%20Account%20Link%20Migration.sql) and [Student Enrollment Approval and Courses Migration.sql](../../src/Supabase/Student%20Enrollment%20Approval%20and%20Courses%20Migration.sql), in that order. Neither migration is run automatically by the application.

## 2. Authentication and Routing

### 2.1 New account

1. The applicant enters an email address.
2. The application requests a six-digit email OTP from Supabase Auth:

   ```ts
   supabase.auth.signInWithOtp({
     email,
     options: {
       shouldCreateUser: true,
       data: { full_name, first_name, last_name, mobile_number },
     },
   });
   ```

3. The applicant enters the code. The application verifies it:

   ```ts
   supabase.auth.verifyOtp({
     email,
     token,
     type: "email",
   });
   ```

4. On successful verification, prompt the applicant to set a permanent password:

   ```ts
   supabase.auth.updateUser({ password: newPassword });
   ```

5. Continue to the enrollment form with the verified Supabase session.

The password is managed by Supabase Auth and must never be written to an application table.

### 2.2 Existing account

If an email is already associated with an account, offer:

- **Login:** `/student/login`
- **Forgot password:** `/student/forgot-password`

After login or password reset, return the applicant to the active enrollment form and prefill available profile data.

**Privacy warning:** The implemented flow checks account existence through a server-only RPC, never exposes `auth.users` to the browser, and uses the result to show separate login/recovery actions. Returning a boolean still enables account enumeration, even though the lookup is protected. This risk was explicitly accepted for the requested UX; before production, add rate limiting and abuse monitoring or replace the branch with an OTP-first flow that does not disclose account existence.

## 3. Enrollment Form

### Section 1 — Personal details (required)

Collect the identity and contact fields required to register an applicant, such as full name, email, phone, and the personal details approved for the product.

The authenticated user's UUID is the identity link. The verified email must match the email attached to the authenticated session.

### Section 2 — Education and course selection (optional)

Collect optional education details such as college/institution, degree, and semester/year. Allow the applicant to skip this section if they have not chosen a program.

When a course or bundle is selected, capture its database ID. Do not rely on a client-supplied title or price as the authoritative product identity.

## 4. Submission and Database Routing

Submission must be authorized against the current Supabase Auth user. The server must validate the session, verify the email, validate all submitted fields, and resolve any selected course or bundle against the database.

### Scenario A — Registration only

When the optional section is skipped or no course/bundle is selected:

1. Insert the applicant's personal details into `public.registrations`.
2. Set `registrations.user_id` to the authenticated user's UUID and status to the existing pending registration status.
3. Do not insert into `public.enrollments`.

### Scenario B — Registration with a selected course or bundle

When a course or bundle is selected:

1. Insert the applicant's personal and submitted education details into `public.registrations`.
2. Insert one corresponding application into `public.enrollments`, linked to the authenticated user through `applicant_user_id` and to the registration through the existing registration link where applicable.
3. Set the enrollment review status to pending and the payment status to `pending_offline_verification`.

The two inserts must be atomic. Prefer a PostgreSQL function/RPC that performs both inserts in one transaction. If a server action uses sequential writes instead, it must implement reliable rollback and ensure the authenticated user ID is derived from the verified server session, not accepted from the browser.

The current data model permits one `legacy_registration_id` per enrollment relationship. If one intake submission can select multiple products, revise that relationship and uniqueness constraint before implementing multi-product submission.

## 5. Supabase Project Configuration

Apply and verify these settings in the target Supabase project:

1. **Authentication → Providers → Email**
   - Enable email sign-in.
   - Configure email OTP and set the OTP length to six digits.
   - Confirm the OTP expiry and rate limits suit the intake flow.
2. **Authentication → Email Templates**
   - Configure the email sign-in template to display the token using `{{ .Token }}`.
   - Keep recovery email content and links configured for the password-reset flow.
3. **Authentication → URL Configuration**
   - Set the Site URL to the deployed application origin.
   - Add exact local and production redirect URLs required by the app. For example, if local development uses port 3001, allow `http://localhost:3001/student/enroll` and the actual password recovery callback URL.
   - Add each production origin and callback that the application uses. Do not assume port 3000 if the local app runs on another port.
4. **Authentication → SMTP Settings**
   - Configure a reliable SMTP provider for production delivery.
   - Verify sender identity, delivery, spam handling, and rate limits before release.
5. **Application environment**
   - Keep the Supabase URL and publishable/anon key in the browser as appropriate.
   - Keep the service-role key server-only. Never expose it through `NEXT_PUBLIC_*` variables or client code.

## 6. Database Schema and Policy Changes

Review the live database before applying migrations. The repository schema already includes `registrations`, `enrollments`, `enrollments.applicant_user_id`, and applicant read policies, but it does not currently define `enrollments.payment_status`.

### 6.1 Registration fields

`public.registrations` already contains fields including `full_name`, `email`, `phone`, education details, location fields, and status. It links `user_id` to `public.profiles(id)`, which should share the authenticated user's UUID.

Compare the final form with the deployed table. Add only the personal fields that the approved form actually collects and the table does not yet support (for example, date of birth, country, gender, or address). Choose consistent column names and types before adding them; avoid storing unused or redundant personal data.

`registration_number` is not generated at initial application submission in the current workflow. Preserve its nullable state until the existing approval process provisions a student number.

### 6.2 Payment status

Add a payment status to `public.enrollments` if the deployed schema does not already have one. Define the allowed values with the admin payment-verification workflow before adding a `CHECK` constraint. The initial value for new course applications must be `pending_offline_verification`. The included migration leaves this field nullable for legacy rows because their payment state cannot safely be inferred.

Keep payment status separate from `enrollments.status`: the latter represents application review state (`pending`, `approved`, or `rejected` in the current schema), while payment status represents fee verification.

### 6.3 Course selection constraint

The repository includes an optional-course migration that drops `enrollments_selected_product_check`, allowing course-less applications in `enrollments`. Under this proposal, registration-only submissions do not create enrollment rows. Before restoring a constraint that requires `course_id` or `bundle_id`, check existing production data and migrate any course-less enrollment applications to registrations; do not delete or silently discard applications.

### 6.4 Row-level security

- Replace the current public `registrations` insert policy with authenticated, owner-scoped access for the new intake path.
- For registration inserts, ensure the row's `user_id` matches `auth.uid()`. Add owner-scoped select/update policies only if required by the application.
- Retain staff/admin policies for review operations.
- Retain the applicant-only enrollment read policy based on `applicant_user_id = auth.uid()` (and the existing student access rule where applicable).
- Do not add anonymous policies that allow access to `auth.users` or expose another applicant's registration/enrollment data.

The existing Auth trigger in `Student Auth Migration.sql` creates a corresponding `public.profiles` row for a new Auth user. Confirm that the trigger is installed and compatible in the target project before relying on `registrations.user_id` or the profile-prefill flow.

### 6.5 Transaction and authorization

Use an authenticated PostgreSQL RPC or a server action that validates the Supabase session and then calls a transactional database function. A security-definer function must:

- derive or validate the applicant identity from `auth.uid()`;
- reject mismatched email or user IDs;
- validate course/bundle references;
- insert the registration and optional enrollment atomically;
- be executable only by the intended authenticated role (or by a narrowly authorized server-side role).

Do not treat the service-role key as a substitute for authorization checks. It bypasses RLS and must remain server-only.

## 7. Implementation Status

The application code now implements the intake flow described above:

- The personal-details step checks whether an account exists, sends and verifies a six-digit OTP for new users, and routes returning users to login or recovery.
- New users set a permanent Supabase Auth password before moving to optional education/course details.
- Optional education fields, including college/institution, are saved with the registration and copied to selected enrollment rows.
- Existing-account login and password recovery route returning students to the dashboard.
- The server action validates the confirmed session and selected products, then calls the transactional `submit_student_intake` RPC.
- Registration-only submissions create no enrollment rows; selected products create pending enrollment rows with `pending_offline_verification`.
- After successful submission, new students see a confirmation briefly and are redirected to the Student Dashboard; a dashboard link is available immediately.

The migration in `src/Supabase/Unified Registration Enrollment OTP Migration.sql` is not automatically applied by the application. Review and apply it to the target Supabase database after checking live data, policies, and compatibility with the deployed schema. Configure Email OTP and production SMTP/redirect settings as described above. Until those steps are complete, the new application flow may fail against the existing database.

## 8. Rollout Checklist

- [ ] Confirm the production schema, RLS policies, auth trigger, and current application data.
- [ ] Agree on the final personal and education fields and their database column names.
- [ ] Define payment status values and staff verification behavior.
- [x] Decide to show login/recovery actions for existing accounts; this accepts account-enumeration risk for the requested UX.
- [ ] Add rate limiting and abuse monitoring for the existing-account lookup, or replace it with an OTP-first flow before production.
- [ ] Back up or safely migrate course-less rows currently stored in `enrollments`.
- [ ] Review and apply the included migration in a non-production project first; verify it against the deployed schema and existing data.
- [ ] Configure OTP templates, SMTP, Site URL, redirect allowlist, and rate limits.
- [x] Implement OTP verification, permanent password setup, and login/recovery return flow with draft restoration.
- [x] Implement registration-only and registration-plus-enrollment submissions atomically.
- [ ] Verify owner-only access, admin review, duplicate submissions, and failure/rollback behavior.
- [ ] Test end-to-end in staging before production rollout.
