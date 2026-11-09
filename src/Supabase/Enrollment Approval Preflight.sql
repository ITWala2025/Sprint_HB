-- Read-only preflight for Student Enrollment Approval and Courses Migration.sql.
-- Run this against the intended Supabase project before applying either migration.

-- Required relations and fields referenced by the enrollment workflow.
SELECT
    required.table_name,
    required.column_name,
    EXISTS (
        SELECT 1
        FROM information_schema.columns AS existing
        WHERE existing.table_schema = 'public'
          AND existing.table_name = required.table_name
          AND existing.column_name = required.column_name
    ) AS exists
FROM (
    VALUES
        ('enrollments', 'id'),
        ('enrollments', 'student_id'),
        ('enrollments', 'applicant_user_id'),
        ('enrollments', 'course_id'),
        ('enrollments', 'bundle_id'),
        ('enrollments', 'status'),
        ('enrollments', 'email'),
        ('courses', 'id'),
        ('courses', 'is_published'),
        ('course_bundles', 'id'),
        ('students', 'id'),
        ('profiles', 'id'),
        ('registrations', 'user_id')
) AS required(table_name, column_name)
ORDER BY required.table_name, required.column_name;

-- The current two-argument function should exist; any three-argument overload
-- is obsolete and will be removed by the migration.
SELECT
    procedure.proname,
    pg_get_function_identity_arguments(procedure.oid) AS arguments,
    has_function_privilege('service_role', procedure.oid, 'EXECUTE') AS service_role_can_execute
FROM pg_proc AS procedure
JOIN pg_namespace AS namespace ON namespace.oid = procedure.pronamespace
WHERE namespace.nspname = 'public'
  AND procedure.proname = 'verify_and_approve_enrollment'
ORDER BY arguments;

-- These result sets must be empty before the migration creates the unique indexes.
WITH resolved_enrollments AS (
    SELECT
        enrollment_data.row_data->>'id' AS id,
        enrollment_data.row_data->>'created_at' AS created_at,
        enrollment_data.row_data->>'status' AS status,
        enrollment_data.row_data->>'course_id' AS course_id,
        COALESCE(
            NULLIF(enrollment_data.row_data->>'applicant_user_id', ''),
            NULLIF(enrollment_data.row_data->>'student_id', ''),
            verified_account.id::TEXT
        ) AS student_identity
    FROM public.enrollments AS enrollment
    CROSS JOIN LATERAL (
        SELECT to_jsonb(enrollment) AS row_data
    ) AS enrollment_data
    LEFT JOIN LATERAL (
        SELECT account.id
        FROM auth.users AS account
        WHERE lower(account.email) = lower(enrollment_data.row_data->>'email')
          AND account.email_confirmed_at IS NOT NULL
        LIMIT 1
    ) AS verified_account ON TRUE
)
SELECT
    student_identity,
    course_id,
    COUNT(*) AS application_count,
    array_agg(id ORDER BY created_at) AS enrollment_ids
FROM resolved_enrollments
WHERE status IN ('pending', 'approved')
  AND NULLIF(course_id, '') IS NOT NULL
  AND student_identity IS NOT NULL
GROUP BY student_identity, course_id
HAVING COUNT(*) > 1;

WITH resolved_enrollments AS (
    SELECT
        enrollment_data.row_data->>'id' AS id,
        enrollment_data.row_data->>'created_at' AS created_at,
        enrollment_data.row_data->>'status' AS status,
        enrollment_data.row_data->>'bundle_id' AS bundle_id,
        COALESCE(
            NULLIF(enrollment_data.row_data->>'applicant_user_id', ''),
            NULLIF(enrollment_data.row_data->>'student_id', ''),
            verified_account.id::TEXT
        ) AS student_identity
    FROM public.enrollments AS enrollment
    CROSS JOIN LATERAL (
        SELECT to_jsonb(enrollment) AS row_data
    ) AS enrollment_data
    LEFT JOIN LATERAL (
        SELECT account.id
        FROM auth.users AS account
        WHERE lower(account.email) = lower(enrollment_data.row_data->>'email')
          AND account.email_confirmed_at IS NOT NULL
        LIMIT 1
    ) AS verified_account ON TRUE
)
SELECT
    student_identity,
    bundle_id,
    COUNT(*) AS application_count,
    array_agg(id ORDER BY created_at) AS enrollment_ids
FROM resolved_enrollments
WHERE status IN ('pending', 'approved')
  AND NULLIF(bundle_id, '') IS NOT NULL
  AND student_identity IS NOT NULL
GROUP BY student_identity, bundle_id
HAVING COUNT(*) > 1;

-- Review existing policies; the migration only manages student_courses policies
-- with these names and does not remove other policies.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('enrollments', 'student_courses')
ORDER BY tablename, policyname;
