# SPRINT Supabase Database Migration Reference

**Last updated:** 17 November 2026\
**Status:** Public-schema data imported and row-count verified. Auth
test users intentionally not migrated. Storage migration, destination
Auth configuration, and application cutover remain outstanding.

## 1. Project details

  --------------------------------------------------------------------------------
  Item                                Value
  ----------------------------------- --------------------------------------------
  Source project reference            `vrapmahhtmhflaqbubux`

  Destination project reference       `wbegixswinshimuziyum`

  Destination project URL             `https://wbegixswinshimuziyum.supabase.co`

  Destination Session Pooler host     `aws-1-ap-southeast-2.pooler.supabase.com`

  Destination port                    `5432`

  Database                            `postgres`

  Database username                   `postgres.wbegixswinshimuziyum`

  Migration folder                    `D:\SPRINT_SUPABASE_MIGRATION`

  Application folder mentioned        `D:\Sprint_HB`

  Supabase CLI                        `npx supabase` (version 3.1.0 observed)

  PostgreSQL client                   Docker image `postgres:17` (local `psql` was
                                      unavailable)
  --------------------------------------------------------------------------------

**Security:** Do not commit database passwords, API keys, service-role
keys, secret keys, access tokens, refresh tokens, or password hashes.
The destination database password was previously exposed during
troubleshooting and was reset. Do not put the current password in this
file.

## 2. Executive summary and decisions

### Public database

-   The destination's 33 public tables had already been created.
-   Source data was exported from the `public` schema to `data.sql`.
-   The first import failed because destination `public.profiles` lacked
    `avatar_url`. The import was run with `--single-transaction`, and
    subsequent checks showed the destination remained empty, confirming
    rollback.
-   Ten missing `profiles` columns were added.
-   The second import completed successfully: 33 `COPY` operations,
    followed by `RESET`, with no error.
-   All 33 table row counts were compared between source and destination
    and matched.
-   Total imported rows across the 33 tables: **173**.

### Auth decision

The source had 18 test Auth users and 18 identities. The user explicitly
decided these test accounts are not needed and wants completely new
users.

Therefore: - Do **not** migrate old `auth.users` or `auth.identities`. -
Do **not** migrate old sessions or refresh tokens. - Destination Auth
counts of zero are expected. - New users should register through the
SPRINT application. - Important: the public `profiles`, `students`,
`registrations`, and other public test records were imported separately.
They remain in the destination until deliberately cleaned or reconciled.
Empty `auth.users` does not remove public test data.

### Remaining work

-   Configure destination Auth provider, SMTP, Site URL, and redirect
    URLs.
-   Test signup, login, email confirmation, password reset, and profile
    creation.
-   Decide whether imported public test profiles/student/application
    records should remain.
-   Migrate/recreate Storage buckets, objects, and policies if required.
-   Verify functions, triggers, RLS policies, grants, constraints, and
    indexes.
-   Update application environment variables and hosting configuration.
-   Test the full SPRINT application before switching production
    traffic.
-   Keep the old project active until the new project is fully verified.

## 3. Source data export

From PowerShell in `D:\SPRINT_SUPABASE_MIGRATION`, the source project
was linked and this command was run:

``` powershell
npx supabase db dump --linked --data-only --use-copy --schema public -f data.sql
```

The file was created at:

`D:\SPRINT_SUPABASE_MIGRATION\data.sql`

This is a **data-only dump** of the `public` schema. It is not a
complete Supabase project backup. It does not migrate Auth users,
Storage objects, or all project configuration.

## 4. Destination database connection

A direct connection to `db.wbegixswinshimuziyum.supabase.co:5432` failed
from the user's network due to IPv6 connectivity. The destination
**Session Pooler** connection worked with:

-   Host: `aws-1-ap-southeast-2.pooler.supabase.com`
-   Port: `5432`
-   Database: `postgres`
-   Username: `postgres.wbegixswinshimuziyum`

Do not store the database password in this document.

### Set the password securely in PowerShell

``` powershell
$securePassword = Read-Host "Enter destination database password" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    Remove-Variable securePassword
}
```

Connection test:

``` powershell
docker run --rm --env PGPASSWORD postgres:17 psql `
  -h aws-1-ap-southeast-2.pooler.supabase.com `
  -p 5432 `
  -U postgres.wbegixswinshimuziyum `
  -d postgres `
  -c "SELECT current_database(), current_user;"
```

After the database work, clear the environment variable:

``` powershell
Remove-Item Env:PGPASSWORD
```

## 5. Schema compatibility correction

A column-level comparison was made for all 33 tables and the exported
`COPY` columns. All exported table names and column names were found in
the destination. This is not a complete proof of schema equivalence:
data types, constraints, foreign keys, triggers, functions, grants, and
RLS still require verification.

### Missing `profiles` columns

The first import reported:

``` text
ERROR: column "avatar_url" of relation "profiles" does not exist
```

The following correction was applied successfully in the destination SQL
Editor:

``` sql
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN,
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS mobile_number TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT,
    ADD COLUMN IF NOT EXISTS first_login BOOLEAN,
    ADD COLUMN IF NOT EXISTS password_changed BOOLEAN;
```

### Destination enum labels inspected

  -----------------------------------------------------------------------
  Enum type                           Labels
  ----------------------------------- -----------------------------------
  `application_status`                `submitted`, `under_review`,
                                      `accepted`, `rejected`

  `assessment_type`                   `quiz`, `assignment`, `exam`,
                                      `project`

  `batch_status`                      `upcoming`, `active`, `completed`

  `enrollment_status`                 `active`, `completed`, `dropped`

  `registration_status`               `pending`, `approved`, `rejected`

  `training_mode`                     `Online`, `Offline`, `Hybrid`

  `user_role`                         `admin`, `instructor`, `student`,
                                      `staff`
  -----------------------------------------------------------------------

The destination enum values were inspected and found compatible with the
expected values.

## 6. Successful public data import

From PowerShell:

``` powershell
cd D:\SPRINT_SUPABASE_MIGRATION
Test-Path .\data.sql
```

Expected result: `True`.

The successful import command was:

``` powershell
docker run --rm --env PGPASSWORD `
  -v "${PWD}:/work" `
  -w /work `
  postgres:17 psql `
  -h aws-1-ap-southeast-2.pooler.supabase.com `
  -p 5432 `
  -U postgres.wbegixswinshimuziyum `
  -d postgres `
  --single-transaction `
  -v ON_ERROR_STOP=1 `
  -f /work/data.sql
```

The successful run printed 33 `COPY` results and then `RESET`, with no
error.

Flag notes: - `--single-transaction` makes the import atomic: if an
error occurs, the transaction rolls back. - `-v ON_ERROR_STOP=1` stops
execution at the first SQL error. - `--env PGPASSWORD` passes the
password from the local environment. - `-v "${PWD}:/work"` mounts the
current PowerShell folder into Docker. - `-f /work/data.sql` runs the
dump file inside the container.

Do not blindly rerun this import against populated tables. Re-importing
can cause duplicate-key or duplicate-data errors. First decide whether a
clean restore or controlled merge is intended.

## 7. Verified row counts

The same 33-table count query was run in both source and destination
projects. All counts matched.

  Table                             Rows Table                            Rows
  ------------------------------- ------ ------------------------------ ------
  `announcements`                      6 `assessment_results`                0
  `assessments`                        0 `batches`                           0
  `bundle_courses`                     0 `campus_updates`                    2
  `career_openings`                    0 `course_bundles`                    6
  `courses`                           15 `enquiries`                         0
  `enrollments`                       12 `home_cta`                          1
  `home_faqs`                          5 `home_hero`                         1
  `home_rise_stages`                   6 `home_sections`                     6
  `home_stats`                         4 `instructors`                       4
  `job_applications`                   0 `learning_paths`                    4
  `partners`                          22 `profiles`                         18
  `registrations`                     15 `roles`                             4
  `signature_programs`                 2 `site_settings`                     4
  `sprint_careers_applications`        0 `sprint_careers_jobs`               3
  `staff_invitations`                  2 `student_course_enrollments`        0
  `student_courses`                   11 `students`                         10
  `testimonials`                       3                                

**Total: 173 rows across 33 tables.**

Reusable SQL to verify counts:

``` sql
SELECT 'announcements' AS table_name, COUNT(*) AS total_rows FROM public.announcements
UNION ALL SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL SELECT 'batches', COUNT(*) FROM public.batches
UNION ALL SELECT 'assessments', COUNT(*) FROM public.assessments
UNION ALL SELECT 'roles', COUNT(*) FROM public.roles
UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL SELECT 'students', COUNT(*) FROM public.students
UNION ALL SELECT 'assessment_results', COUNT(*) FROM public.assessment_results
UNION ALL SELECT 'course_bundles', COUNT(*) FROM public.course_bundles
UNION ALL SELECT 'bundle_courses', COUNT(*) FROM public.bundle_courses
UNION ALL SELECT 'campus_updates', COUNT(*) FROM public.campus_updates
UNION ALL SELECT 'career_openings', COUNT(*) FROM public.career_openings
UNION ALL SELECT 'enquiries', COUNT(*) FROM public.enquiries
UNION ALL SELECT 'registrations', COUNT(*) FROM public.registrations
UNION ALL SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL SELECT 'home_cta', COUNT(*) FROM public.home_cta
UNION ALL SELECT 'home_faqs', COUNT(*) FROM public.home_faqs
UNION ALL SELECT 'home_hero', COUNT(*) FROM public.home_hero
UNION ALL SELECT 'home_rise_stages', COUNT(*) FROM public.home_rise_stages
UNION ALL SELECT 'home_sections', COUNT(*) FROM public.home_sections
UNION ALL SELECT 'home_stats', COUNT(*) FROM public.home_stats
UNION ALL SELECT 'instructors', COUNT(*) FROM public.instructors
UNION ALL SELECT 'job_applications', COUNT(*) FROM public.job_applications
UNION ALL SELECT 'learning_paths', COUNT(*) FROM public.learning_paths
UNION ALL SELECT 'partners', COUNT(*) FROM public.partners
UNION ALL SELECT 'signature_programs', COUNT(*) FROM public.signature_programs
UNION ALL SELECT 'site_settings', COUNT(*) FROM public.site_settings
UNION ALL SELECT 'sprint_careers_jobs', COUNT(*) FROM public.sprint_careers_jobs
UNION ALL SELECT 'sprint_careers_applications', COUNT(*) FROM public.sprint_careers_applications
UNION ALL SELECT 'staff_invitations', COUNT(*) FROM public.staff_invitations
UNION ALL SELECT 'student_course_enrollments', COUNT(*) FROM public.student_course_enrollments
UNION ALL SELECT 'student_courses', COUNT(*) FROM public.student_courses
UNION ALL SELECT 'testimonials', COUNT(*) FROM public.testimonials
ORDER BY table_name;
```

Matching row counts verify record totals, not every field value or every
database object.

## 8. UUID and sequence inspection

The destination ID columns were inspected. Most are UUIDs with
`gen_random_uuid()` defaults. `profiles.id` and `students.id` are UUIDs
without defaults and must be supplied by the application or a trigger.
`home_cta.id` and `home_hero.id` are integers with a literal default of
`1`.

The search for serial-style `nextval(...)` defaults returned no rows:

``` sql
SELECT
    table_name,
    column_name,
    pg_get_serial_sequence(
        format('%I.%I', table_schema, table_name),
        column_name
    ) AS sequence_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_default LIKE 'nextval(%'
ORDER BY table_name, ordinal_position;
```

ID inspection query:

``` sql
SELECT
    table_name,
    column_name,
    data_type,
    column_default,
    is_identity,
    identity_generation
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
ORDER BY table_name;
```

No sequence reset was identified as necessary for the inspected ID
columns. Review `home_cta` and `home_hero` if the application expects
multiple rows: default `1` is not an auto-increment mechanism.

## 9. Auth: source inventory and final decision

Source Auth inventory:

  Metric                         Count
  ---------------------------- -------
  `auth.users`                      18
  `auth.identities`                 18
  `auth.sessions`                    8
  `auth.refresh_tokens`             34
  `auth.mfa_factors`                 0
  Users with email                  18
  Users with phone                   0
  Users with password hashes        18
  Users with confirmed email        15
  Deleted users                      0

Destination Auth inventory at the time of inspection:

  Table                     Count
  ----------------------- -------
  `auth.users`                  0
  `auth.identities`             0
  `auth.sessions`               0
  `auth.refresh_tokens`         0

The destination `auth.users` and `auth.identities` core columns were
inspected and found present. No Auth data import was performed.

**Final decision:** All source Auth accounts were test users. Start
fresh. Keep destination Auth users and identities empty until new users
sign up or are provisioned through SPRINT. Do not import the old test
users, identities, sessions, or refresh tokens.

### Fresh Auth setup checklist

1.  In destination Supabase, configure Authentication email provider.
2.  Configure SMTP for production email delivery. The earlier SPRINT
    setup had SMTP unconfigured; verify the new project's current
    settings.
3.  Set Site URL and allowed redirect URLs for local and production
    deployments.
4.  Review email confirmation and password-reset settings/templates.
5.  Verify the signup flow creates exactly one corresponding
    `public.profiles` record.
6.  Test signup, email confirmation, login, logout, and password reset.
7.  Test student dashboard and role-based access.

The public test records were imported independently of Auth. Before real
signup, decide whether to clean up or reconcile old `profiles`,
`students`, `registrations`, and `enrollments` records so they do not
conflict with fresh accounts.

## 10. API keys and application environment

Destination URL:

``` env
NEXT_PUBLIC_SUPABASE_URL=https://wbegixswinshimuziyum.supabase.co
```

Example environment variable names:

``` env
NEXT_PUBLIC_SUPABASE_URL=https://wbegixswinshimuziyum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace_with_destination_public_key

# Server-side only. Never expose with NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=replace_with_destination_legacy_service_role_key

# Alternative if application code is updated to use the newer Supabase secret key:
# SUPABASE_SECRET_KEY=replace_with_destination_secret_key
```

Supabase provides legacy `anon`/`service_role` keys and newer
publishable/secret keys. Use the key type expected by the installed
Supabase client and the code. Privileged `service_role` and secret keys
bypass RLS.

Security: - Never prefix a service-role or secret key with
`NEXT_PUBLIC_`. - Never use privileged keys in browser/client
components. - Keep `.env.local` out of Git. - Set production keys
through the hosting provider's secure environment-variable settings. -
Restart the development server after changing environment variables. -
Rotate any key that is exposed.

Official key documentation:
https://supabase.com/docs/guides/getting-started/api-keys

## 11. Remaining work checklist

### Public database

-   [x] Destination public tables existed.
-   [x] Compare exported table/column names.
-   [x] Add missing `profiles` columns.
-   [x] Inspect relevant enum labels.
-   [x] Export source public data.
-   [x] Import data transactionally.
-   [x] Verify row counts for all 33 tables.
-   [ ] Compare important record values, not just counts.
-   [ ] Review foreign keys, constraints, indexes, grants, RLS,
    functions, and triggers.
-   [ ] Decide whether to retain or clean imported public test records.

### Auth

-   [ ] Configure email provider.
-   [ ] Configure production SMTP.
-   [ ] Set Site URL and redirect allowlist.
-   [ ] Review confirmation and reset-password behavior.
-   [ ] Verify signup/profile trigger and prevent duplicate profiles.
-   [ ] Test a new student account end-to-end.
-   [ ] Test secure admin/staff provisioning if needed.

### Storage

-   [ ] List source buckets and identify required assets.
-   [ ] Create equivalent destination buckets.
-   [ ] Migrate required objects/files.
-   [ ] Recreate Storage policies and public/private settings.
-   [ ] Verify images, PDFs, resumes, and other assets load.
-   [ ] Update old Storage URLs if needed.

### Application and cutover

-   [ ] Update local `.env.local` with destination URL and keys.
-   [ ] Update production hosting environment variables.
-   [ ] Search code for old project references and hard-coded URLs.
-   [ ] Test signup, login, logout, password reset, student dashboard,
    admin dashboard, courses, registrations/enrollments, and file
    access.
-   [ ] Check browser and server logs for RLS/permission errors.
-   [ ] Confirm backup and rollback plan.
-   [ ] Switch production traffic only after successful tests.
-   [ ] Keep source project available until destination acceptance.

## 12. Troubleshooting notes

**Docker volume mount:** The earlier `${PWD.Path}` form produced an
invalid mount path. The working PowerShell syntax was
`-v "${PWD}:/work"`.

**Direct database connection:** The direct endpoint failed because IPv6
was unreachable from the user's network. The Session Pooler endpoint
succeeded.

**Missing profile column:** The first import failed on
`profiles.avatar_url`; the missing columns were added and the
transaction rolled back. The second import succeeded.

**No serial sequences:** The inspected IDs mostly use UUIDs. The
sequence query returned no rows; do not run a blanket sequence reset.

**Empty Auth users:** This is expected because old Auth users were
intentionally excluded.

## 13. Operational safety rules

1.  Never commit credentials or secrets.
2.  Never share database passwords, API keys, password hashes, or
    refresh tokens.
3.  Never expose privileged keys to browser code.
4.  Keep the source project active until the destination passes
    end-to-end testing.
5.  Back up before destructive cleanup or re-import.
6.  Do not rerun the data import on populated tables without a
    deliberate restore/merge plan.
7.  Row-count matching is useful verification, but does not prove every
    field or database object is identical.
8.  Record schema changes in version control, excluding secrets.

## 14. Official references

-   Supabase API keys:
    https://supabase.com/docs/guides/getting-started/api-keys
-   Supabase CLI database dump:
    https://supabase.com/docs/reference/cli/supabase-db-dump
-   Supabase Auth: https://supabase.com/docs/guides/auth
-   Supabase Storage: https://supabase.com/docs/guides/storage

------------------------------------------------------------------------

**Current conclusion:** The destination contains the imported public
dataset: 33 tables and 173 rows, with all source/destination table
counts matching. Old Auth test accounts were intentionally not migrated.
Next priorities are fresh-user Auth configuration, deciding how to
handle imported public test records, Storage migration if needed,
security/configuration verification, and full SPRINT application
testing.
