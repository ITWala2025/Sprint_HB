-- Course and career-bundle mappings used by the student directory and approval flow.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.registrations
    ALTER COLUMN registration_number DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.student_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    bundle_id UUID REFERENCES public.course_bundles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    status TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT student_course_or_bundle CHECK (course_id IS NOT NULL OR bundle_id IS NOT NULL),
    CONSTRAINT unique_student_course UNIQUE NULLS NOT DISTINCT (student_id, course_id, bundle_id)
);

ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.student_courses TO authenticated;

DROP POLICY IF EXISTS "Staff manage student courses" ON public.student_courses;
CREATE POLICY "Staff manage student courses"
    ON public.student_courses FOR ALL TO authenticated
    USING (public.is_staff() OR public.current_user_has_permission('student_ops', 'edit'))
    WITH CHECK (public.is_staff() OR public.current_user_has_permission('student_ops', 'edit'));

DROP POLICY IF EXISTS "Students view own purchased courses" ON public.student_courses;
CREATE POLICY "Students view own purchased courses"
    ON public.student_courses FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Student operations can view student courses" ON public.student_courses;
CREATE POLICY "Student operations can view student courses"
    ON public.student_courses FOR SELECT TO authenticated
    USING (public.current_user_has_permission('student_ops', 'view'));

CREATE OR REPLACE FUNCTION public.verify_and_approve_enrollment(
    p_enrollment_id UUID,
    p_admin_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    application public.enrollments%ROWTYPE;
    student_user_id UUID;
    auth_email TEXT;
    student_number TEXT;
BEGIN
    IF p_enrollment_id IS NULL OR p_admin_user_id IS NULL THEN
        RAISE EXCEPTION 'An enrollment and reviewing administrator are required.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_user_id) THEN
        RAISE EXCEPTION 'The reviewing administrator could not be verified.';
    END IF;

    SELECT *
    INTO application
    FROM public.enrollments
    WHERE id = p_enrollment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'This enrollment application no longer exists.';
    END IF;

    IF application.status <> 'pending' THEN
        RAISE EXCEPTION 'This enrollment application has already been reviewed.';
    END IF;

    student_user_id := COALESCE(application.student_id, application.applicant_user_id);

    IF student_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = student_user_id
    ) THEN
        SELECT profile.id
        INTO student_user_id
        FROM public.profiles AS profile
        WHERE lower(profile.email) = lower(application.email)
        LIMIT 1;
    END IF;

    IF student_user_id IS NULL THEN
        SELECT account.id
        INTO student_user_id
        FROM auth.users AS account
        WHERE lower(account.email) = lower(application.email)
        LIMIT 1;
    END IF;

    IF student_user_id IS NULL THEN
        RAISE EXCEPTION 'The applicant account could not be verified.';
    END IF;

    SELECT email
    INTO auth_email
    FROM auth.users
    WHERE id = student_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'The applicant account could not be verified.';
    END IF;

    SELECT registration_number
    INTO student_number
    FROM public.students
    WHERE id = student_user_id
    FOR UPDATE;

    IF NULLIF(trim(student_number), '') IS NULL THEN
        student_number := 'SPR-' ||
            to_char(timezone('utc', now()), 'YYYY') || '-' ||
            upper(replace(student_user_id::TEXT, '-', ''));
    END IF;

    INSERT INTO public.profiles (id, full_name, email, phone, role, is_active)
    VALUES (
        student_user_id,
        application.full_name,
        COALESCE(NULLIF(trim(auth_email), ''), application.email),
        application.phone,
        'student'::public.user_role,
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = CASE
            WHEN NULLIF(trim(public.profiles.full_name), '') IS NULL THEN EXCLUDED.full_name
            ELSE public.profiles.full_name
        END,
        email = EXCLUDED.email,
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        role = CASE
            WHEN public.profiles.role = 'admin'::public.user_role THEN public.profiles.role
            ELSE 'student'::public.user_role
        END,
        is_active = TRUE;

    INSERT INTO public.students (
        id,
        registration_number,
        college_institution,
        course_degree,
        specialization_branch,
        current_semester,
        phone,
        status,
        employment_status,
        organization_name,
        city,
        state
    )
    VALUES (
        student_user_id,
        student_number,
        application.college_institution,
        application.course_degree,
        application.specialization_branch,
        application.year_semester,
        application.phone,
        'active',
        application.employment_status,
        application.organization_name,
        application.city,
        application.state
    )
    ON CONFLICT (id) DO UPDATE
    SET registration_number = COALESCE(
            NULLIF(trim(public.students.registration_number), ''),
            EXCLUDED.registration_number
        ),
        college_institution = COALESCE(
            NULLIF(trim(public.students.college_institution), ''),
            EXCLUDED.college_institution
        ),
        course_degree = COALESCE(
            NULLIF(trim(public.students.course_degree), ''),
            EXCLUDED.course_degree
        ),
        specialization_branch = COALESCE(
            NULLIF(trim(public.students.specialization_branch), ''),
            EXCLUDED.specialization_branch
        ),
        current_semester = COALESCE(
            NULLIF(trim(public.students.current_semester), ''),
            EXCLUDED.current_semester
        ),
        phone = COALESCE(NULLIF(trim(public.students.phone), ''), EXCLUDED.phone),
        status = 'active',
        employment_status = COALESCE(
            NULLIF(trim(public.students.employment_status), ''),
            EXCLUDED.employment_status
        ),
        organization_name = COALESCE(
            NULLIF(trim(public.students.organization_name), ''),
            EXCLUDED.organization_name
        ),
        city = COALESCE(NULLIF(trim(public.students.city), ''), EXCLUDED.city),
        state = COALESCE(NULLIF(trim(public.students.state), ''), EXCLUDED.state);

    IF application.course_id IS NOT NULL THEN
        INSERT INTO public.student_courses (student_id, course_id, status)
        VALUES (student_user_id, application.course_id, 'active')
        ON CONFLICT ON CONSTRAINT unique_student_course
        DO UPDATE SET status = 'active';
    END IF;

    IF application.bundle_id IS NOT NULL THEN
        INSERT INTO public.student_courses (student_id, bundle_id, status)
        VALUES (student_user_id, application.bundle_id, 'active')
        ON CONFLICT ON CONSTRAINT unique_student_course
        DO UPDATE SET status = 'active';
    END IF;

    UPDATE public.enrollments
    SET student_id = student_user_id,
        status = 'approved',
        reviewed_by = p_admin_user_id,
        reviewed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    WHERE id = application.id;

    IF application.legacy_registration_id IS NOT NULL THEN
        UPDATE public.registrations
        SET status = 'approved'::public.registration_status,
            user_id = student_user_id,
            registration_number = COALESCE(registration_number, student_number)
        WHERE id = application.legacy_registration_id;
    END IF;

    RETURN student_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_and_approve_enrollment(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_and_approve_enrollment(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.verify_and_approve_enrollment(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_approve_enrollment(UUID, UUID) TO service_role;

NOTIFY pgrst, 'reload schema';
