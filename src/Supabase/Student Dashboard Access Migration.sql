-- ============================================================================
-- SPRINT Student Portal — Dashboard Access Migration
-- ============================================================================
-- Run this in the Supabase SQL Editor (or via your migration tool) once.
--
-- What it does:
--   1. Grants table-level SELECT privileges to the `authenticated` role on all
--      tables queried by the student dashboard, fixing "permission denied for
--      table batches" and similar errors.
--   2. Adds an RLS policy so students can view batches they are enrolled in,
--      regardless of batch status (the existing "Public can view active batches"
--      policy only covers upcoming/enrolling/ongoing batches).
--   3. All changes are idempotent — safe to re-run.
--
-- IMPORTANT:
--   - RLS stays ENABLED on all tables.
--   - No existing policies are removed or weakened.
--   - Do not execute destructive SQL.
--   - After applying, run: NOTIFY pgrst, 'reload schema'; (included below)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE-LEVEL PERMISSIONS (GRANT SELECT)
-- ----------------------------------------------------------------------------

-- Public-facing tables (anon + authenticated)
GRANT SELECT ON public.batches TO anon, authenticated;
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT ON public.course_bundles TO anon, authenticated;
GRANT SELECT ON public.instructors TO anon, authenticated;
GRANT SELECT ON public.partners TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT SELECT ON public.campus_updates TO anon, authenticated;
GRANT SELECT ON public.career_openings TO anon, authenticated;

-- Student-private tables (authenticated only)
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.students TO authenticated;
GRANT SELECT ON public.enrollments TO authenticated;
GRANT SELECT ON public.student_course_enrollments TO authenticated;
GRANT SELECT ON public.student_courses TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. RLS POLICY: Students can view batches they are enrolled in
-- ----------------------------------------------------------------------------

-- The existing "Public can view active batches" policy only covers batches
-- with status IN ('upcoming', 'enrolling', 'ongoing'). A student enrolled in
-- a completed or cancelled batch should still be able to see their batch
-- details on the dashboard. This policy grants that access without exposing
-- batches the student is not enrolled in.
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

NOTIFY pgrst, 'reload schema';