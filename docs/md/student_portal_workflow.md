# Student Portal, Registration, Authentication, and Enrollment Workflows

## Scope and evidence

This document describes the behavior implemented in the repository as inspected, distinguishing live flows from schema capabilities that are not enforced by those flows. The principal implementation areas are:

- Student enrollment wizard and server actions: [src/app/student/enroll/page.jsx](./src/app/student/enroll/page.jsx), [src/app/student/enroll/actions.ts](./src/app/student/enroll/actions.ts), and [src/components/student/enrollment/](./src/components/student/enrollment/)
- Student sign-in and portal access: [src/app/student/login/page.jsx](./src/app/student/login/page.jsx), [src/lib/supabase/middleware.ts](./src/lib/supabase/middleware.ts), [src/proxy.ts](./src/proxy.ts), and [src/app/student/(portal)/](./src/app/student/%28portal%29/)
- Course discovery and applications: [src/app/courses/](./src/app/courses/), [src/components/courses/](./src/components/courses/), and [src/app/courses/actions.ts](./src/app/courses/actions.ts)
- Data model and access controls: [src/Supabase/Initial Schema.sql](./src/Supabase/Initial%20Schema.sql) and the student/enrollment migrations in [src/Supabase/](./src/Supabase/)

There are no dedicated student registration, sign-in, or course-enrollment REST route handlers under `src/app/api`. The application uses Supabase Auth/Database SDK calls and Next.js Server Actions. Supabase's PostgREST RPC endpoints are database operations, not app-owned Next.js route handlers.

## High-level architecture

```text
Browser
  ├─ Public pages: /home, /courses, /courses/[slug]
  ├─ Student UI: /student/enroll, /student/login, /(portal) pages
  ├─ Supabase browser client (@supabase/ssr)
  │    └─ Supabase Auth: OTP, password sign-in, password update/recovery
  └─ Next.js Server Actions / Server Components
       ├─ Cookie-aware Supabase SSR client: verifies the current Auth user
       ├─ Server-only service client for privileged reads/writes/RPC calls
       └─ Route proxy validates portal session and profile role/status
              ↓
Supabase
  ├─ Auth users, access/refresh tokens, email OTP and recovery
  ├─ public.profiles and public.students
  ├─ public.courses, public.batches, course_bundles
  ├─ public.registrations (student intake record)
  ├─ public.enrollments (course/bundle application and review state)
  └─ public.student_courses / student_course_enrollments (approved access
     and cohort participation/progress)
```

### Main components

| Layer | Responsibility | Implementation |
|---|---|---|
| Public entry and catalog | Root route redirects to `/home`. The catalog starts with local course data, then replaces it with published Supabase courses, bundles, and learning paths when available. | [src/app/page.jsx](./src/app/page.jsx), [src/app/courses/page.jsx](./src/app/courses/page.jsx), [src/components/courses/CourseCatalogue.jsx](./src/components/courses/CourseCatalogue.jsx), [src/data/courses.js](./src/data/courses.js) |
| Course details | Server-loads a course by slug from `public.courses`, rejects unpublished rows, and uses local course data as a fallback. The detail component exposes the application action for course records. | [src/app/courses/[slug]/page.jsx](./src/app/courses/%5Bslug%5D/page.jsx), [src/components/courses/DetailPage.jsx](./src/components/courses/DetailPage.jsx), [src/components/courses/CourseApplicationForm.tsx](./src/components/courses/CourseApplicationForm.tsx) |
| Student registration | Multi-step client wizard collects personal details, verifies email by OTP, sets a password, and optionally collects education/course selections. The final submission runs on the server. | [src/components/student/enrollment/EnrollmentWizard.jsx](./src/components/student/enrollment/EnrollmentWizard.jsx), [src/components/student/enrollment/enrollment-steps.js](./src/components/student/enrollment/enrollment-steps.js) |
| Authentication | Browser calls Supabase Auth; SSR uses cookie-aware Supabase clients. Login separately verifies the corresponding profile's student role and active status. | [src/app/student/login/page.jsx](./src/app/student/login/page.jsx), [src/lib/supabase/client.ts](./src/lib/supabase/client.ts), [src/lib/supabase/middleware.ts](./src/lib/supabase/middleware.ts) |
| Server-side persistence | Enrollment actions validate input, verify the authenticated user, resolve published products, and use a server-only service client for privileged work. | [src/app/student/enroll/actions.ts](./src/app/student/enroll/actions.ts), [src/app/courses/actions.ts](./src/app/courses/actions.ts), [src/lib/supabase/service.ts](./src/lib/supabase/service.ts) |
| Database | Supabase Auth owns credentials and tokens. Public tables, triggers, RPC functions, constraints, and RLS policies persist and protect application data. | [src/Supabase/Initial Schema.sql](./src/Supabase/Initial%20Schema.sql), [src/Supabase/Student Auth Migration.sql](./src/Supabase/Student%20Auth%20Migration.sql), [src/Supabase/Unified Registration Enrollment OTP Migration.sql](./src/Supabase/Unified%20Registration%20Enrollment%20OTP%20Migration.sql) |

## Data model and lifecycle states

### Principal records

| Record | Purpose and important fields | Lifecycle/use |
|---|---|---|
| `auth.users` | Supabase-managed identity, email confirmation, and password. Password hashes and auth tokens are not stored in SPRINT's public tables. | User is created by OTP sign-up (`shouldCreateUser: true`) if the email is new. Auth supplies the verified session used by later actions. |
| `public.profiles` | Auth-linked identity (`id`), `full_name`, `email`, `phone`, `role`; `Student Auth Migration.sql` adds `first_name`, `last_name`, `mobile_number`, and `status`. | `handle_new_user` provisions a student profile after Auth user creation. The migration sets student status to `active`; this is distinct from approval of a course application. |
| `public.students` | Student directory record linked to `profiles`, with unique `registration_number`, education/contact fields, and student status. | Created or updated by enrollment approval RPCs, not by the new OTP intake RPC. |
| `public.courses` | Published course catalog, including `slug`, `title`, `is_published`, `prerequisites`, and content. | Published rows are discoverable and eligible for application. `prerequisites` is text, not an enforced prerequisite relation. |
| `public.batches` | Course cohort, dates, status, and `max_seats` (default 30). | Batch data is separately managed. The student application path does not assign a batch or count available seats. |
| `public.registrations` | Student intake/profile submission, including user/email, personal and education details, selected first product, and `status`. | `submit_student_intake` inserts a pending registration; approval RPC updates it to approved when linked to an enrollment application. |
| `public.enrollments` | Per-course or per-bundle application with `applicant_user_id`, `student_id`, selected product, application number, review fields, `status`, and payment status. | New unified intake inserts one pending row per selected product. Course detail application also inserts a pending row. Approval/rejection changes the review state. |
| `public.student_courses` | Approved product access mapping for a student to a course or bundle. | `verify_and_approve_enrollment` inserts/activates this row; `/student/my-course` uses active rows to show approved access. |
| `public.student_course_enrollments` | Cohort participation and learning progress (`batch_id`, `course_id`, progress, certificate, status). | Used by dashboard reporting for course/batch progress. The approval RPC described here does not create this record. |

The schemas and changes above are defined in [src/Supabase/Initial Schema.sql](./src/Supabase/Initial%20Schema.sql), [src/Supabase/Student Auth Migration.sql](./src/Supabase/Student%20Auth%20Migration.sql), [src/Supabase/Enrollment Applicant Account Link Migration.sql](./src/Supabase/Enrollment%20Applicant%20Account%20Link%20Migration.sql), [src/Supabase/Enrollment Approval and Student Directory Migration.sql](./src/Supabase/Enrollment%20Approval%20and%20Student%20Directory%20Migration.sql), and [src/Supabase/Unified Registration Enrollment OTP Migration.sql](./src/Supabase/Unified%20Registration%20Enrollment%20OTP%20Migration.sql).

### State transitions

```text
New email
  └─ Auth OTP sent → OTP verified → Auth user + profile → password set
       └─ intake submitted → registrations.status = pending
            ├─ no product selected → registration only; apply later
            └─ product(s) selected → enrollments.status = pending
                 ├─ admin rejects → enrollments.status = rejected
                 └─ admin approves → enrollments.status = approved
                      + public.students row provisioned/activated
                      + public.student_courses product access activated
```

Important distinction: the wizard's success screen means **the registration/application was submitted for review**, not that course access has been granted. A newly OTP-verified account can have an active student profile and enter the portal while a selected course application is still pending. Product access is added by the approval path.

## Step-by-step workflows

### 1. Student account registration

1. `/` permanently redirects to `/home`. The student can enter `/student/enroll` from the site's enrollment navigation or `/student/login`.
2. `StudentEnrollPage` renders `EnrollmentWizard`. [EnrollmentWizard.jsx](./src/components/student/enrollment/EnrollmentWizard.jsx) uses three configured steps from [enrollment-steps.js](./src/components/student/enrollment/enrollment-steps.js): Personal Information, Password, and optional Education & Career Profile.
3. Personal fields are validated in the browser by `enrollment-validation.js` and checked again by `submitStudentEnrollmentAction` in [src/app/student/enroll/actions.ts](./src/app/student/enroll/actions.ts). The server requires valid first/last names, email, nonfuture ISO date, country, state, and a normalized 10-digit phone number.
4. As the email is entered, `PersonalInformationStep` checks for an existing Auth account by calling `checkEnrollmentEmailAction(email)`. That server action calls the service-role-only `check_auth_email_exists` RPC.
5. If the Auth email already exists, the UI offers `/student/login` or password recovery rather than creating another account. The wizard can save the current personal/education details to `sessionStorage` before navigating away; it intentionally does not store the password in the draft.
6. For a new email, the UI calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, data: ... } })`. Supabase emails a six-digit code. On code entry, `verifyOtp({ email, token, type: "email" })` must return a session whose user has a confirmed email matching the form.
7. Supabase's `on_auth_user_created` trigger invokes `public.handle_new_user` as defined in [Student Auth Migration.sql](./src/Supabase/Student%20Auth%20Migration.sql). The trigger creates a `profiles` row with student role and active status, plus provided identity metadata.
8. The verified OTP session authenticates the user. The wizard moves to Password Setup and calls `supabase.auth.updateUser({ password })`. Password validation rules are client-side in `enrollment-validation.js` / `PasswordSetupStep.jsx`; credentials remain in Supabase Auth.
9. Education fields are optional. `EducationStep` loads published courses from Supabase, with local catalog fallback via `resolveCourseOptions`; it does not require the student to select a course. “Skip for now” preserves any values but submits no selected course.
10. At final submission, `EnrollmentWizard` calls `submitStudentEnrollmentAction`. The server verifies the Auth user is email-confirmed and its email matches the submitted email, validates/normalizes fields, resolves each selected course/bundle by published ID or slug, and calls `submit_student_intake` using the server-only service client.
11. The RPC validates required values and confirmed account identity; verifies a profile exists; enforces an array of at most 10 products and exactly one course or bundle per product; serializes each user's submission with an advisory transaction lock; verifies each selected product is still published; and rejects a duplicate pending application for the same product and applicant.
12. The RPC inserts one `registrations` row in `pending` state. If products were selected, it inserts a separate `enrollments` row per product, also pending, with an application number and `payment_status = pending_offline_verification`. With no products, it returns a registration-derived application identifier and zero enrollments.
13. The action returns a success result and application ID. `EnrollmentSuccessPanel` says whether the registration alone or both registration and course application were submitted, and the wizard redirects to `/student/dashboard` after a short delay.

### 2. Authentication and portal access

1. The student submits email and password on `/student/login` (`StudentLoginPage` in [src/app/student/login/page.jsx](./src/app/student/login/page.jsx)).
2. The browser Supabase client calls `auth.signInWithPassword`. Supabase Auth validates the credentials and establishes/refreshes the session using the configured Supabase SSR browser client.
3. The page then selects the user's own `profiles` row by Auth user ID. It requires a profile, `role === "student"`, and `status === "active"`. On missing profile, wrong role, or inactive status, it signs out and shows a user-facing error. Supabase credential errors are mapped to specific unconfirmed-email/rate-limit messages or a generic invalid-credentials message.
4. Successful login navigates to a safe `next` path or `/student/dashboard`. `resolveStudentLoginNextPath` in [src/lib/student-login-redirect.js](./src/lib/student-login-redirect.js) only allows same-origin `/courses/<slug>` return paths; other values resolve to the dashboard. The course detail application action itself redirects unauthenticated users to `/student/login?next=/courses/<slug>`.
5. [src/proxy.ts](./src/proxy.ts) calls `updateSession` from [src/lib/supabase/middleware.ts](./src/lib/supabase/middleware.ts). It creates a cookie-aware Supabase server client and calls `auth.getUser()` (not `getSession()`) to validate the user with Supabase Auth.
6. The proxy protects the configured portal paths (`/student/dashboard`, `/student/my-course`, `/student/apply-course`, and the other listed portal routes). No session redirects to `/student/login`; a session without an active student profile also redirects to login. An active student visiting login is redirected to dashboard.
7. Server-rendered portal pages independently read and verify the user/profile where needed. For example, [src/app/student/(portal)/layout.jsx](./src/app/student/%28portal%29/layout.jsx) uses `auth.getUser()` and loads the profile for the shared portal shell; `/student/my-course` explicitly validates student role and active status before fetching private records.
8. Supabase Auth owns token and session lifecycle. SPRINT's admin session token mechanism is for admin/staff, not student portal sessions.

Recovery is handled by `/student/forgot-password`, `/student/check-email`, `/set-password`, and the shared reset component at `/student/reset-password`. The forgot-password UI validates email syntax, calls `auth.resetPasswordForEmail`, avoids disclosing whether the email exists, and displays a generic check-email step. `/set-password` renders the same reset component as `/student/reset-password`; the reset page requires an Auth recovery session and applies password rules before `auth.updateUser`. See [src/app/student/forgot-password/page.jsx](./src/app/student/forgot-password/page.jsx), [src/app/student/check-email/page.jsx](./src/app/student/check-email/page.jsx), [src/app/set-password/page.jsx](./src/app/set-password/page.jsx), and [src/app/student/reset-password/page.jsx](./src/app/student/reset-password/page.jsx).

### 3. Course discovery and enrollment

#### Discovery

1. `/courses` renders `CourseCatalogue` using local data from `src/data/courses.js` for initial content.
2. The client catalogue fetches published `courses`, `learning_paths`, and `course_bundles` from Supabase and orders them by creation/title. On query errors or empty results, it retains local/static catalog data.
3. `/courses/[slug]` looks up a course server-side. If a database row exists but is unpublished, it returns not found; otherwise it maps course details including `prerequisites` for display. If the database is unavailable or has no matching row, local catalog data is used.
4. For a student already in the portal, `/student/apply-course` fetches published courses from Supabase and displays course cards. It throws a page error on missing Supabase configuration or query failure rather than silently showing an empty list.

#### Application from a public course detail

1. `DetailPage` renders `CourseApplicationForm` with the course slug.
2. `applyForCourseAction` validates the slug and builds an SSR Supabase client from request cookies. It verifies the current Auth user with `auth.getUser()`.
3. If there is no user, the action returns `redirectTo` for `/student/login?next=/courses/<slug>`. The form performs the client-side navigation.
4. For a signed-in user, the action loads the user's profile and requires student role plus active status. It separately verifies that the course exists and is published.
5. It checks `public.enrollments` for an existing pending or approved application for that user and course (using `applicant_user_id` or `student_id`). If none exists, the service client inserts a pending application with the applicant's profile/contact details.
6. The database migration adds unique partial indexes for an active application per student/course and per student/bundle. If an insert loses a race and violates uniqueness, the action re-queries and treats a found concurrent application as already applied.
7. It revalidates the admin application list and portal pages, then navigates to `/student/my-course?success=course-application`. The page presents a pending-review message or an already-applied message.

The public course-detail CTA is wired to this action for courses. The bundle CTA in `DetailPage` instead links to `/register`; the repository only contains `src/app/register/.gitkeep`, not a registration page. Although the server-side intake contract supports bundle IDs, the active wizard does not expose a bundle selector, so bundle enrollment is not currently connected end to end.

#### Review and course access

1. Admin/student-operations staff load the application list through `getEnrollmentRegistrations` and review it in `/admin/students/enrollments`.
2. `verifyRegistration(id, "approved" | "rejected")` validates the ID/status and calls `assertModuleAccess("student_ops", "edit")`.
3. Rejection updates the `enrollments` row to `rejected` and records reviewer/time.
4. Approval calls `public.verify_and_approve_enrollment` with the enrollment ID and authenticated reviewer ID. The RPC locks and checks that the application exists and is pending; resolves the Auth/profile identity; provisions/activates the `profiles` and `students` records; inserts or reactivates a `student_courses` product access row; marks the application approved and records reviewer/time; and updates the linked legacy `registrations` row to approved when present.
5. The action revalidates the admin list, student directory, `/student/dashboard`, and `/student/my-course`. `/student/my-course` then displays the active product separately from the review status. The dashboard can report enrollment progress from `student_course_enrollments`, or show a fallback access entry from `student_courses`.

## Data flow and API/action table

There are no stable, app-owned REST endpoints for these flows. “Server Action” entries below are invoked via Next.js's Server Action transport; they should not be treated as public REST URLs. Supabase SDK calls use the configured Supabase Auth, PostgREST, and RPC APIs.

| Method / operation | Route or operation | Request body / parameters | Response / effect | Middleware / authorization |
|---|---|---|---|---|
| `GET` | `/` → `/home` | None | Permanent redirect to public home. | Public route. |
| `GET` | `/courses` | None; optional audience query is used for catalog filtering. | Catalog page, client-fetches published courses, bundles, and learning paths; static fallbacks are available. | Public; RLS allows published course reads. |
| `GET` | `/courses/[slug]` | Slug route parameter. | Course detail data from published Supabase row or local catalog fallback; unpublished DB course returns not found. | Public; published rows allowed by RLS. |
| `GET` | `/student/enroll` | None. | Enrollment wizard UI. | The route is not included in the middleware's protected portal prefix list; OTP is required before final submission. |
| Supabase Auth SDK | `auth.signInWithOtp` (registration) | Email and metadata (`full_name`, `first_name`, `last_name`, `mobile_number`); `shouldCreateUser: true`. | Sends one-time code and creates Auth identity/profile when applicable. | Public initiation; Supabase Auth email/OTP controls apply. |
| Supabase Auth SDK | `auth.verifyOtp` | `{ email, token, type: "email" }`. | Verified Auth session, expected confirmed email matching form. | OTP must be valid; session is then required for registration submission. |
| Supabase Auth SDK | `auth.updateUser` (set password) | `{ password }`. | Updates password for the verified session. | Requires authenticated session; password complexity is checked by the client wizard. |
| Server Action | `checkEnrollmentEmailAction(email)` in [src/app/student/enroll/actions.ts](./src/app/student/enroll/actions.ts) | Email string. | `{ success: true, exists }` or `{ success: false, error }`. | Email syntax validated; service client invokes `check_auth_email_exists`, executable only by `service_role`. |
| Supabase RPC | `check_auth_email_exists(p_email)` | `p_email: TEXT`. | Boolean indicating a matching Auth email. | `SECURITY DEFINER`; privileges revoked from `PUBLIC`, `anon`, and `authenticated`; granted to `service_role`. |
| Server Action | `submitStudentEnrollmentAction(input)` in [src/app/student/enroll/actions.ts](./src/app/student/enroll/actions.ts) | `{ personal: { firstName, lastName, email, dob, country, state, phone }, education: { collegeInstitution?, courseDegree?, semesterYear?, currentRole?, courseIds?, bundleIds? } }`. | Success with application ID and `hasCourseEnrollment`, or a failure message. | Cookie-based `auth.getUser`; confirmed email must match; validates all required fields; service client required; product must be published. |
| Supabase RPC | `submit_student_intake(...)` | Verified user ID, normalized personal/education fields, and JSON array of `{ course_id, bundle_id }` products. | JSON `{ registration_id, application_id, enrollment_count }`; inserts pending registration and optional pending product application rows. | `SECURITY DEFINER`; execute revoked from public/anon/authenticated and granted to service role. RPC independently checks verified Auth email, profile presence, product shape/count/publication and duplicate pending products. |
| `GET` | `/student/login?next=...` | Query return path. | Sign-in UI; post-login goes to allowed `/courses/[slug]` or dashboard. | Middleware redirects active students away to dashboard; unauthenticated route is public. |
| Supabase Auth SDK | `auth.signInWithPassword` | Email and password. | Auth user/session or SDK error. | Credentials checked by Supabase Auth; UI then verifies profile role/status and signs out on mismatch. |
| `GET` | `/student/dashboard` and other portal pages | Cookie Auth session. | Server-rendered student data. | `src/proxy.ts` → `updateSession`; valid Auth user and `profiles.role = student`, `profiles.status = active` required. Page/RLS checks also apply. |
| Supabase Auth SDK | `auth.resetPasswordForEmail`, `auth.updateUser` | Email, allowed recovery redirect; then new password. | Generic check-email UX; password update only for valid recovery session. | Supabase recovery session required for update; recovery response avoids account existence disclosure. |
| `GET` | `/student/apply-course` | None. | Published courses for signed-in student's application choices. | Protected portal route; SSR Supabase query and RLS. |
| Server Action | `applyForCourseAction(_previousState, formData)` in [src/app/courses/actions.ts](./src/app/courses/actions.ts) | `FormData` with course `slug`. | Error state or `redirectTo` for login/already-applied/confirmation page; otherwise inserts pending `enrollments` row. | Validates slug; verifies user via SSR `auth.getUser`; checks profile student/active and published course; service client performs application checks/write. |
| `GET` | `/student/my-course` | Auth cookie and optional `success` query. | Shows active product access and application review statuses. | Server verifies Auth user and active student profile; RLS further limits private rows to applicant/student. |
| Server Action | `verifyRegistration(id, status)` / `approveRegistration(id)` / `rejectRegistration(id)` in [src/app/admin/students/enrollments/actions.ts](./src/app/admin/students/enrollments/actions.ts) | UUID and approved/rejected state. | Success/error result; updates enrollment and revalidates portal/admin paths. | `assertModuleAccess("student_ops", "edit")`; reviewer ID comes from authenticated user. Approval invokes service-role RPC. |
| Supabase RPC | `verify_and_approve_enrollment(p_enrollment_id, p_admin_user_id)` | Enrollment UUID and reviewer UUID. | Provisions student and product access; marks application approved. | Execute granted only to `service_role`; app action performs module authorization before invocation. |

## Validation, state, and error handling

| Condition | Current behavior |
|---|---|
| Invalid registration name/email/date/country/state/phone | Browser field validation provides immediate feedback; `submitStudentEnrollmentAction` repeats validation on the server. Names use an ASCII-letter pattern. The date must be a valid `YYYY-MM-DD` date not in the future; phone is normalized to digits and must be 10 digits after supported prefix removal. |
| Existing Auth email during registration | `checkEnrollmentEmailAction` returns `exists: true`; the wizard directs the applicant to sign in or recover their password instead of sending a new OTP. |
| Email-check RPC/service unavailable | Action returns a generic retryable email-verification error; the UI sets an error status and leaves submission disabled until verification succeeds. |
| OTP send rate limit, SMTP, redirect configuration, or invalid OTP | OTP UI surfaces a send/verification error and provides a resend path. The magic-link `AccountStep` also has specialized messages, but it is not included in the currently configured `ENROLLMENT_STEPS`; the active wizard uses the six-digit OTP flow in `PersonalInformationStep`. |
| Email not confirmed or different from submitted email | Enrollment server action refuses to submit. The SQL RPC independently requires an Auth user with `email_confirmed_at` and matching email. |
| Missing service-role configuration | Server actions return a temporary/unavailable error or RPC submission failure; privileged keys are read only by [src/lib/supabase/service.ts](./src/lib/supabase/service.ts). |
| More than 10 products, malformed or duplicate product selection | Server-side `readSelections` rejects invalid arrays, duplicate selections, or more than 10 products; the RPC repeats the 10-product/one-product-per-object checks. Current wizard UI exposes one course field and no bundle selector, although the action/RPC accept multiple courses and bundles. |
| Course unpublished/deleted between selection and submit | `resolveProducts` checks `is_published`; the RPC checks publication again inside the database transaction and rejects unavailable products. |
| Existing pending/approved course application | Course-detail flow returns an “already applied” notice without a duplicate insert. The unified registration RPC rejects a duplicate pending product application; course-action unique-index race handling re-queries the concurrent application. |
| Course full | No current “course full” decision or error is implemented in the described application/approval path. `batches.max_seats` exists, but application does not select a batch and neither `applyForCourseAction` nor `verify_and_approve_enrollment` counts batch seats. |
| Prerequisite failure | No prerequisite evaluation or prerequisite-failure response is implemented. `courses.prerequisites` is a text field rendered on the course detail page; it is descriptive only in this workflow. |
| Terms/communication consent | `submit_student_intake` currently writes `terms_accepted = FALSE` and `communication_consent = FALSE` to registration and application records; the active wizard does not collect these fields. |
| Sign-in credentials invalid/unconfirmed/rate-limited | Login displays a confirmation-specific message, rate-limit-specific message, or generic invalid-email/password message. |
| Auth succeeds but profile missing, wrong role, or inactive | Login signs out and displays an explanation. Proxy redirects a non-active student from protected portal pages to `/student/login`; server-rendered `/student/my-course` independently checks role and status. |
| Application rejected or approved | Rejection changes application status and review metadata. Approval RPC refuses non-pending/nonexistent rows, provisions the student, grants access, and updates linked registration. Errors are returned by the admin Server Action. |
| Dashboard query failure | Dashboard logs warnings for student/application/enrollment lookup failures and may render partial dashboard data. `/student/my-course` throws on auth/profile/application/access/product lookup failures rather than silently rendering a success state. |

## Authorization and persistence notes

- Supabase Auth is the source of truth for passwords, confirmed email, and user identity. Browser Auth is initialized in [src/lib/supabase/client.ts](./src/lib/supabase/client.ts); server-side service access is isolated in [src/lib/supabase/service.ts](./src/lib/supabase/service.ts).
- The student route proxy uses `auth.getUser()` to validate the user rather than trusting an unverified session payload. Portal access also depends on the associated profile's student role and active status.
- The database enables RLS on the student/course/application tables in [src/Supabase/Initial Schema.sql](./src/Supabase/Initial%20Schema.sql). Relevant policies include own-profile/student reads, published-course reads, and applicant reads of their own applications. [Enrollment Applicant Account Link Migration.sql](./src/Supabase/Enrollment%20Applicant%20Account%20Link%20Migration.sql) adds/refreshes applicant ownership via `applicant_user_id`.
- The intake and approval RPCs are restricted to `service_role`. Consequently the server action's identity checks and admin `assertModuleAccess` gate are essential: service-role Supabase operations bypass ordinary RLS.
- The student OTP trigger initially provisions `profiles.status = 'active'`; this does not create a `students` directory row or grant a course product. Approval provisions the directory row and product access. Keep account/portal access state distinct from course application and enrollment state.

## Enrollment lifecycle diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Web as Next.js pages/components
    participant Auth as Supabase Auth
    participant Actions as Next.js Server Actions
    participant DB as Supabase public DB
    actor Reviewer as Admin / Student Ops

    Student->>Web: Open / (redirects to /home), browse /courses
    Web->>DB: Read published courses (catalog/detail)
    DB-->>Web: Course details, including descriptive prerequisites

    alt Student creates a new portal account
        Student->>Web: Open /student/enroll; enter personal details
        Web->>Actions: checkEnrollmentEmailAction(email)
        Actions->>DB: RPC check_auth_email_exists (service role)
        DB-->>Actions: exists = false
        Actions-->>Web: New email
        Web->>Auth: signInWithOtp(shouldCreateUser=true, metadata)
        Auth->>DB: on_auth_user_created → handle_new_user
        DB-->>Auth: Student profile created
        Auth-->>Student: Send six-digit email code
        Student->>Web: Enter code
        Web->>Auth: verifyOtp(email, token)
        Auth-->>Web: Confirmed Auth session
        Student->>Web: Set password and optionally select a course
        Web->>Auth: updateUser(password)
        Web->>Actions: submitStudentEnrollmentAction(personal, education)
        Actions->>Auth: getUser() and verify confirmed matching email
        Actions->>DB: Resolve selected products; call submit_student_intake
        DB->>DB: Validate profile/products; lock user; insert pending registration
        opt One or more products selected
            DB->>DB: Insert one pending enrollment application per product
        end
        DB-->>Actions: registration/application identifiers and count
        Actions-->>Web: Success result and application ID
        Web-->>Student: Submission confirmation; navigate to /student/dashboard
    else Existing account or returning student
        Student->>Web: Open /student/login; submit email/password
        Web->>Auth: signInWithPassword
        Auth-->>Web: Auth user/session or credential error
        Web->>DB: Read own profile by Auth user ID
        DB-->>Web: role/status
        alt role is student and status is active
            Web-->>Student: Navigate to dashboard or safe next course
        else Profile is missing, inactive, or another role
            Web->>Auth: signOut
            Web-->>Student: Show access error
        end
    end

    opt Course application from /courses/[slug]
        Student->>Web: Submit course application
        Web->>Actions: applyForCourseAction(FormData{slug})
        Actions->>Auth: getUser()
        alt No session
            Actions-->>Web: redirectTo /student/login?next=/courses/[slug]
        else Active student
            Actions->>DB: Verify published course and pending/approved duplicate
            DB-->>Actions: Available / already applied
            opt No existing application
                Actions->>DB: Insert pending public.enrollments application
            end
            Actions-->>Web: Redirect to /student/my-course with confirmation state
        end
    end

    Reviewer->>Actions: Approve or reject pending application
    Actions->>Actions: Validate UUID/status; assert student_ops edit access
    alt Reject
        Actions->>DB: Update enrollment status/reviewer/time to rejected
        DB-->>Actions: Updated
    else Approve
        Actions->>DB: RPC verify_and_approve_enrollment (service role)
        DB->>DB: Provision/activate profile and students row
        DB->>DB: Activate student_courses product access
        DB->>DB: Mark enrollment and linked registration approved
        DB-->>Actions: Student ID / success
    end
    Actions-->>Student: Portal paths revalidated
    Student->>Web: Open /student/my-course
    Web->>DB: Read own applications and active student_courses
    DB-->>Web: Review status and approved product access
    Web-->>Student: Show pending/rejected status or Open course
```

## Known workflow gaps and interpretation

1. **Capacity is modeled but not applied to enrollment decisions.** `public.batches.max_seats` has a default and a positive-value check. The current public application path does not select a batch; the approval RPC does not count current enrollments against `max_seats`. Do not describe the current behavior as seat-reserving or capacity-safe.
2. **Prerequisites are descriptive, not gates.** `public.courses.prerequisites` is displayed from course data but no application or approval code evaluates prerequisite completion.
3. **Two enrollment/access records serve different purposes.** `public.enrollments` is the pending review application. The approval RPC inserts `public.student_courses` to grant product access. `public.student_course_enrollments` holds batch/course participation progress and is read by dashboard components, but is not inserted by that approval RPC.
4. **Legacy and unified registration paths coexist in the schema.** The unified OTP migration removes the public insert policy for `registrations` and exposes the service-role-only `submit_student_intake` path. Older registration structures and approval code remain in the repository; distinguish those legacy flows from the currently wired wizard/action path.
5. **Current wizard selection is narrower than its server contract.** The action and RPC can accept up to ten courses/bundles, but the active education step exposes one course selector and no bundle selector.
6. **Bundle CTA is not connected to the wizard.** Public bundle detail links to `/register`, which has no page implementation; the active registration wizard also has no bundle selector.
7. **Consent values are not collected.** The unified intake RPC persists both terms and communication consent as false; no active wizard step asks for them.
8. **A pending new-account registration is not itself an approved course enrollment.** The OTP trigger creates an active student profile, allowing portal access; the course remains unavailable until approval creates/activates `student_courses`.
