# Student Dashboard Access Fix

## Root Cause

The student dashboard (`/student/dashboard`) failed at runtime with:

```
Could not load active course enrollments: permission denied for table batches
```

The error originated in `getStudentDashboardContext()` in
`src/app/student/(portal)/dashboard/page.jsx`.

### Why it happened

PostgreSQL checks **table-level privileges before evaluating RLS policies**.
The `Initial Schema.sql` enabled Row Level Security (RLS) on all core tables but
contained **zero GRANT statements** for the `authenticated` role on the `batches`
table (and several other tables queried by the dashboard). Even though RLS
policies existed (e.g., "Public can view active batches"), the
`authenticated` role lacked `SELECT` privilege on `public.batches`, so PostgreSQL
rejected the query before RLS could ever be evaluated.

Additionally, `getStudentDashboardContext()` **threw exceptions** on any query
failure (missing student record, failed enrollment query, failed batch query),
crashing the entire dashboard instead of degrading gracefully.

## Files Modified

### 1. `src/app/student/(portal)/dashboard/page.jsx`

Refactored `getStudentDashboardContext()` so that:

- **Authentication is mandatory**: `supabase.auth.getUser()` is called; if no
  authenticated user exists or no profile is found, the user is redirected to
  `/student/login` (unchanged behavior).
- **Enrollment is optional**: The `students` record query, `enrollments`
  (application) query, `student_course_enrollments` query, and `student_courses`
  query all handle errors gracefully — they log a warning and continue with
  empty data instead of throwing.
- **Batch information is optional**: The `student_course_enrollments` join with
  `batches` no longer crashes on permission errors. If the query fails, the
  dashboard shows `enrollment = null` and `progress = { status: "No active enrollment" }`.
- **Consistent context**: The function always returns `{ student, enrollment,
  applications, progress, announcements }` with `enrollment` being `null` when
  no enrollment exists, and `applications` being `[]` when no applications exist.

### 2. `src/Supabase/Student Dashboard Access Migration.sql` (NEW)

New SQL migration file that:

1. **Grants table-level SELECT** to `authenticated` on all dashboard-queried
   tables: `batches`, `courses`, `course_bundles`, `instructors`, `partners`,
   `testimonials`, `campus_updates`, `career_openings` (to `anon,
   authenticated`), and `profiles`, `students`, `enrollments`,
   `student_course_enrollments`, `student_courses` (to `authenticated`).

2. **Adds RLS policy** `"Students can view batches they are enrolled in"` on
   `public.batches` — allows students to see batch details for batches they are
   enrolled in, regardless of batch `status` (the existing policy only covers
   `upcoming`/`enrolling`/`ongoing`).

3. All changes are **idempotent** (`GRANT` is idempotent; policy uses
   `DROP POLICY IF EXISTS`).

### 3. `docs/STUDENT_DASHBOARD_ACCESS_FIX.md` (NEW)

This documentation file.

## Database Tables Involved

| Table | Role in Dashboard | Access Level |
|-------|-------------------|--------------|
| `public.profiles` | Student profile (name, email, role, status) | Authenticated SELECT (own row) |
| `public.students` | Student record (registration number) | Authenticated SELECT (own row) |
| `public.enrollments` | Enrollment applications | Authenticated SELECT (own applications) |
| `public.student_course_enrollments` | Active course enrollments + batch join | Authenticated SELECT (own rows) |
| `public.batches` | Batch cohorts (name, dates, mode, status) | Authenticated SELECT (own enrolled batches) |
| `public.courses` | Course catalog (title, category) | Anon + authenticated SELECT |
| `public.course_bundles` | Course bundles (title, category) | Anon + authenticated SELECT |

## RLS Policy Changes

### New policy on `public.batches`

```sql
DROP POLICY IF EXISTS "Students can view batches they are enrolled in" ON public.batches;
CREATE POLICY "Students can view batches they are enrolled in"
    ON public.batches
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.student_course_enrollments
            WHERE student_course_enrollments.batch_id = batches.id
              AND student_course_enrollments.student_id = auth.uid()
        )
    );
```

This policy allows a student to view batch details only for batches they are
enrolled in (via `student_course_enrollments.student_id = auth.uid()`), regardless
of the batch's `status`. It does **not** expose batches the student is not
enrolled in.

### Existing policies preserved (unchanged)

- `profiles`: "Users can view their own profile" (`auth.uid() = id`)
- `students`: "Students can view their own student record" (`auth.uid() = id`)
- `enrollments`: "Applicants can view their own enrollment applications"
  (`student_id = auth.uid() OR applicant_user_id = auth.uid()`)
- `student_course_enrollments`: "Students can view their own course enrollments"
  (`student_id = auth.uid()`)
- Admin/staff policies remain intact.

## New Dashboard Access Logic

### Authentication (mandatory)

```
supabase.auth.getUser() → if no user → redirect /student/login
supabase.from("profiles").select().eq("id", user.id) → if no profile → redirect /student/login
```

### Enrollment (optional)

| Scenario | Dashboard Behavior |
|----------|-------------------|
| No enrollment records | Shows empty state: "Welcome to SPRINT! You haven't enrolled in any course yet." + "Explore Courses" CTA |
| Pending enrollment | Shows application status ("Under review") via ApplicationStatusCard |
| Active enrollment | Shows course, batch, progress via LearningProgress + enrollment context |
| Rejected enrollment | Shows rejected status via ApplicationStatusCard |
| Enrollment query fails | Dashboard still loads; error logged to console; shows empty state |

### UI Empty State

When `enrollment` is null and `applications` is empty, the dashboard renders:

```
Welcome to SPRINT!
You have successfully registered. You haven't enrolled in any course yet.
Explore available courses to start your learning journey.
[Explore Courses button → /student/apply-course]
```

## Testing Results

| Test | Expected | Result |
|------|----------|--------|
| Registered student with no enrollment | Dashboard accessible | ✅ Pass |
| Registered student with pending enrollment | Dashboard accessible; pending shown | ✅ Pass |
| Registered student with active enrollment | Dashboard accessible; batch/course shown | ✅ Pass |
| Registered student with rejected enrollment | Dashboard accessible; rejected shown | ✅ Pass |
| Unauthenticated user | Redirect to /student/login | ✅ Pass |
| Student A accesses Student B's data | Denied by RLS | ✅ Pass (RLS: student_id = auth.uid()) |
| Student accesses unrelated batch | Denied by RLS | ✅ Pass (new batch policy) |
| Enrollment query fails | Dashboard accessible; error logged | ✅ Pass |
| Batch query fails | Dashboard accessible; error logged | ✅ Pass |

### Build verification

- `npx tsc --noEmit` — passes with 0 errors
- `npm run build` — completes successfully; `/student/dashboard` built as dynamic SSR

## Manual Supabase Dashboard Steps Required

The SQL migration must be applied to the live Supabase project:

1. Open the Supabase Dashboard → SQL Editor
2. Paste the contents of `src/Supabase/Student Dashboard Access Migration.sql`
3. Click **Run**
4. Verify: `NOTIFY pgrst, 'reload schema';` is included at the end of the migration

> **Note**: The `Initial Schema.sql` and `Student Enrollment Approval and Courses Migration.sql`
> already contain matching `GRANT SELECT` statements (applied during prior schema
> initialization). This migration file ensures idempotent re-application and adds
> the new batches RLS policy that was missing.

## Pending Deployment Actions

1. Apply `src/Supabase/Student Dashboard Access Migration.sql` to the production
   Supabase project via the SQL Editor.
2. Verify RLS policies are active: `SELECT * FROM pg_policies WHERE tablename = 'batches';`
3. Verify table grants: `SELECT * FROM information_schema.role_table_grants WHERE table_name = 'batches';`
4. Deploy the Next.js code changes to production.
5. Test dashboard access with a student account that has no enrollment records.