-- Unified student intake: OTP account lookup, registration-first submission,
-- optional product enrollments, and offline payment verification.

ALTER TABLE public.registrations
    ALTER COLUMN registration_number DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS country TEXT;

ALTER TABLE public.enrollments
    ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Do not infer the payment status of legacy enrollment rows.
ALTER TABLE public.enrollments
    ALTER COLUMN payment_status
        SET DEFAULT 'pending_offline_verification';

-- A registration may contain several selected products, each represented by
-- a separate enrollment row.
ALTER TABLE public.enrollments
    DROP CONSTRAINT IF EXISTS enrollments_legacy_registration_id_key;

DROP INDEX IF EXISTS public.enrollments_one_pending_per_email_idx;

CREATE INDEX IF NOT EXISTS enrollments_legacy_registration_id_idx
    ON public.enrollments(legacy_registration_id);

DROP POLICY IF EXISTS "Anyone can submit a registration"
    ON public.registrations;

CREATE OR REPLACE FUNCTION public.check_auth_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM auth.users AS auth_user
        WHERE lower(auth_user.email) = lower(btrim(p_email))
    );
$$;

REVOKE ALL ON FUNCTION public.check_auth_email_exists(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_auth_email_exists(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.check_auth_email_exists(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_auth_email_exists(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.submit_student_intake(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_college_institution TEXT,
    p_date_of_birth DATE,
    p_country TEXT,
    p_state TEXT,
    p_course_degree TEXT,
    p_year_semester TEXT,
    p_employment_status TEXT,
    p_products JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    auth_email TEXT;
    registration_id UUID;
    registration_created_at TIMESTAMPTZ;
    primary_course_id UUID;
    primary_bundle_id UUID;
    product JSONB;
    selected_course_id UUID;
    selected_bundle_id UUID;
    enrollment_count INTEGER := 0;
    application_prefix TEXT;
    next_application_number INTEGER;
    application_id TEXT;
BEGIN
    IF p_user_id IS NULL
        OR nullif(btrim(p_full_name), '') IS NULL
        OR nullif(btrim(p_email), '') IS NULL
        OR nullif(btrim(p_phone), '') IS NULL
        OR p_date_of_birth IS NULL
        OR nullif(btrim(p_country), '') IS NULL
        OR nullif(btrim(p_state), '') IS NULL
    THEN
        RAISE EXCEPTION 'Required applicant details are missing.';
    END IF;

    SELECT lower(auth_user.email)
    INTO auth_email
    FROM auth.users AS auth_user
    WHERE auth_user.id = p_user_id
      AND auth_user.email_confirmed_at IS NOT NULL;

    IF auth_email IS NULL OR auth_email <> lower(btrim(p_email)) THEN
        RAISE EXCEPTION 'The verified applicant account does not match the submitted email.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.profiles AS profile WHERE profile.id = p_user_id
    ) THEN
        RAISE EXCEPTION 'The applicant profile has not been provisioned.';
    END IF;

    IF p_products IS NULL OR jsonb_typeof(p_products) <> 'array' THEN
        RAISE EXCEPTION 'Selected courses and bundles must be provided as an array.';
    END IF;

    IF jsonb_array_length(p_products) > 10 THEN
        RAISE EXCEPTION 'No more than ten courses or bundles may be selected.';
    END IF;

    -- Serialize submissions for this user so duplicate pending applications
    -- cannot race each other through the check below.
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::TEXT)::BIGINT);

    IF jsonb_array_length(p_products) > 0 THEN
        IF EXISTS (
            SELECT 1
            FROM jsonb_array_elements(p_products) AS item
            WHERE
                (nullif(item->>'course_id', '') IS NULL)
                = (nullif(item->>'bundle_id', '') IS NULL)
        ) THEN
            RAISE EXCEPTION 'Each selected product must be exactly one course or bundle.';
        END IF;

        primary_course_id := nullif(p_products->0->>'course_id', '')::UUID;
        primary_bundle_id := nullif(p_products->0->>'bundle_id', '')::UUID;
    END IF;

    INSERT INTO public.registrations (
        registration_number,
        user_id,
        course_id,
        bundle_id,
        full_name,
        email,
        phone,
        college_institution,
        date_of_birth,
        country,
        course_degree,
        year_semester,
        state,
        employment_status,
        terms_accepted,
        communication_consent,
        status
    )
    VALUES (
        NULL,
        p_user_id,
        primary_course_id,
        primary_bundle_id,
        btrim(p_full_name),
        lower(btrim(p_email)),
        btrim(p_phone),
        nullif(btrim(p_college_institution), ''),
        p_date_of_birth,
        btrim(p_country),
        nullif(btrim(p_course_degree), ''),
        nullif(btrim(p_year_semester), ''),
        btrim(p_state),
        nullif(btrim(p_employment_status), ''),
        FALSE,
        FALSE,
        'pending'::public.registration_status
    )
    RETURNING id, created_at
    INTO registration_id, registration_created_at;

    IF jsonb_array_length(p_products) > 0 THEN
        PERFORM pg_advisory_xact_lock(
            hashtext('sprint_enrollment_application_number')::BIGINT
        );
        application_prefix :=
            'SPR-APP-' || to_char(timezone('utc', now()), 'YYMM') || '-';

        FOR product IN SELECT value FROM jsonb_array_elements(p_products)
        LOOP
            selected_course_id := nullif(product->>'course_id', '')::UUID;
            selected_bundle_id := nullif(product->>'bundle_id', '')::UUID;

            IF selected_course_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.courses AS course
                WHERE course.id = selected_course_id AND course.is_published
            ) THEN
                RAISE EXCEPTION 'A selected course is not available.';
            END IF;

            IF selected_bundle_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM public.course_bundles AS bundle
                WHERE bundle.id = selected_bundle_id AND bundle.is_published
            ) THEN
                RAISE EXCEPTION 'A selected bundle is not available.';
            END IF;

            IF EXISTS (
                SELECT 1
                FROM public.enrollments AS existing
                WHERE existing.applicant_user_id = p_user_id
                  AND existing.status = 'pending'
                  AND existing.course_id IS NOT DISTINCT FROM selected_course_id
                  AND existing.bundle_id IS NOT DISTINCT FROM selected_bundle_id
            ) THEN
                RAISE EXCEPTION 'A pending course application already exists for this applicant.';
            END IF;

            SELECT coalesce(
                max(substring(enrollment.application_number FROM char_length(application_prefix) + 1)::INTEGER),
                0
            ) + 1
            INTO next_application_number
            FROM public.enrollments AS enrollment
            WHERE enrollment.application_number ~
                ('^' || application_prefix || '[0-9]{4}$');

            application_id :=
                application_prefix || lpad(next_application_number::TEXT, 4, '0');

            INSERT INTO public.enrollments (
                legacy_registration_id,
                application_number,
                applicant_user_id,
                full_name,
                email,
                phone,
                college_institution,
                course_degree,
                year_semester,
                state,
                employment_status,
                terms_accepted,
                communication_consent,
                course_id,
                bundle_id,
                status,
                payment_status
            )
            VALUES (
                registration_id,
                application_id,
                p_user_id,
                btrim(p_full_name),
                lower(btrim(p_email)),
                btrim(p_phone),
                nullif(btrim(p_college_institution), ''),
                nullif(btrim(p_course_degree), ''),
                nullif(btrim(p_year_semester), ''),
                btrim(p_state),
                nullif(btrim(p_employment_status), ''),
                FALSE,
                FALSE,
                selected_course_id,
                selected_bundle_id,
                'pending',
                'pending_offline_verification'
            );

            enrollment_count := enrollment_count + 1;
        END LOOP;
    ELSE
        application_id :=
            'SPR-APP-' || to_char(registration_created_at AT TIME ZONE 'utc', 'YYMM')
            || '-' || upper(left(replace(registration_id::TEXT, '-', ''), 4));
    END IF;

    RETURN jsonb_build_object(
        'registration_id', registration_id,
        'application_id', application_id,
        'enrollment_count', enrollment_count
    );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_student_intake(
    UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_student_intake(
    UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM anon;
REVOKE ALL ON FUNCTION public.submit_student_intake(
    UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.submit_student_intake(
    UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO service_role;

NOTIFY pgrst, 'reload schema';
