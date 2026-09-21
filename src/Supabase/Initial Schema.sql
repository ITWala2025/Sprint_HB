-- ============================================================================
-- SPRINT Training Hub — Complete Supabase PostgreSQL Database Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* ----------------------------------------------------------------------------
   1. ENUMS & CUSTOM TYPES
---------------------------------------------------------------------------- */

DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.audience_type AS ENUM ('student', 'working_professional', 'institute', 'company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.training_mode AS ENUM ('Online', 'Offline', 'Hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.batch_status AS ENUM ('upcoming', 'enrolling', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected', 'enrolled', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.enrollment_status AS ENUM ('active', 'completed', 'dropped', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.assessment_type AS ENUM ('quiz', 'assignment', 'midterm', 'final_exam', 'capstone_project');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.ticker_category AS ENUM ('ANNOUNCEMENT', 'MAINTENANCE', 'DEADLINE', 'TIP/ALERT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.job_type AS ENUM ('internship', 'full-time', 'part-time', 'contract');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM ('submitted', 'screening', 'interview', 'offered', 'rejected', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

/* ----------------------------------------------------------------------------
   2. HELPER FUNCTIONS
---------------------------------------------------------------------------- */

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'instructor', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

/* ----------------------------------------------------------------------------
   3. TABLES
---------------------------------------------------------------------------- */

/* Table: profiles */
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role public.user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: students */
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_number TEXT UNIQUE NOT NULL,
    college_institution TEXT,
    course_degree TEXT,
    specialization_branch TEXT,
    graduation_year INTEGER CHECK (graduation_year BETWEEN 1990 AND 2100),
    current_semester TEXT,
    employment_status TEXT DEFAULT 'student',
    organization_name TEXT,
    city TEXT,
    state TEXT,
    dob DATE,
    gender TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: courses */
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    duration TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    thumbnail_url TEXT,
    tools TEXT[] NOT NULL DEFAULT '{}',
    pathway TEXT,
    prerequisites TEXT DEFAULT 'No formal prerequisites',
    target_role TEXT,
    certificate_included BOOLEAN NOT NULL DEFAULT true,
    current_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    original_price NUMERIC(10, 2),
    discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 0.00 AND 5.00),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    curriculum JSONB NOT NULL DEFAULT '[]'::jsonb,
    outcomes TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: course_bundles */
CREATE TABLE IF NOT EXISTS public.course_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Career Package',
    description TEXT NOT NULL,
    long_description TEXT,
    pathway TEXT,
    target_role TEXT DEFAULT 'Career pathway',
    outcomes TEXT[] NOT NULL DEFAULT '{}',
    tools TEXT[] NOT NULL DEFAULT '{}',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: bundle_courses */
CREATE TABLE IF NOT EXISTS public.bundle_courses (
    bundle_id UUID NOT NULL REFERENCES public.course_bundles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (bundle_id, course_id)
);

/* Table: batches */
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_code TEXT UNIQUE NOT NULL,
    batch_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    registration_deadline TIMESTAMPTZ,
    mode public.training_mode NOT NULL DEFAULT 'Hybrid',
    max_seats INTEGER NOT NULL DEFAULT 30 CHECK (max_seats > 0),
    status public.batch_status NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: registrations */
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    bundle_id UUID REFERENCES public.course_bundles(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college_institution TEXT,
    course_degree TEXT,
    specialization_branch TEXT,
    year_semester TEXT,
    city TEXT,
    state TEXT,
    employment_status TEXT,
    organization_name TEXT,
    source_of_info TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT true,
    communication_consent BOOLEAN NOT NULL DEFAULT true,
    status public.registration_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: enrollments */
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    status public.enrollment_status NOT NULL DEFAULT 'active',
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    certificate_issued BOOLEAN NOT NULL DEFAULT false,
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_student_batch UNIQUE (student_id, batch_id)
);

/* Table: assessments */
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type public.assessment_type NOT NULL DEFAULT 'quiz',
    assessment_date DATE NOT NULL,
    max_marks NUMERIC(6, 2) NOT NULL CHECK (max_marks > 0),
    passing_marks NUMERIC(6, 2) CHECK (passing_marks >= 0 AND passing_marks <= max_marks),
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: assessment_results */
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(6, 2) NOT NULL CHECK (marks_obtained >= 0),
    percentage NUMERIC(5, 2) CHECK (percentage BETWEEN 0.00 AND 100.00),
    result_status TEXT NOT NULL DEFAULT 'pending' CHECK (result_status IN ('pass', 'fail', 'absent', 'pending')),
    feedback TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_assessment_student UNIQUE (assessment_id, student_id)
);

/* Table: enquiries */
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience_type public.audience_type NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT,
    designation TEXT,
    domain TEXT,
    total_experience TEXT,
    institute_name TEXT,
    website TEXT,
    interested_programs TEXT[] NOT NULL DEFAULT '{}',
    interested_services TEXT[] NOT NULL DEFAULT '{}',
    purposes TEXT[] NOT NULL DEFAULT '{}',
    preferred_contact_time TEXT,
    message TEXT,
    privacy_consent BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'converted', 'closed')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: career_openings */
CREATE TABLE IF NOT EXISTS public.career_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    job_type public.job_type NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    duration TEXT,
    stipend_compensation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: job_applications */
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opening_id UUID REFERENCES public.career_openings(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    portfolio_github_url TEXT,
    cover_note TEXT,
    status public.application_status NOT NULL DEFAULT 'submitted',
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: campus_updates */
CREATE TABLE IF NOT EXISTS public.campus_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category public.ticker_category NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: instructors */
CREATE TABLE IF NOT EXISTS public.instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    company TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: testimonials */
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    company TEXT NOT NULL,
    quote TEXT NOT NULL,
    photo_url TEXT,
    video_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* Table: partners */
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    partner_type TEXT NOT NULL DEFAULT 'Hiring Partner',
    logo_url TEXT NOT NULL,
    website_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

/* ----------------------------------------------------------------------------
   4. AUTOMATED TIMESTAMP TRIGGERS
---------------------------------------------------------------------------- */

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS tr_%I_updated_at ON public.%I;
            CREATE TRIGGER tr_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
            t, t, t, t);
    END LOOP;
END $$;

/* ----------------------------------------------------------------------------
   5. SUPABASE AUTH USER TRIGGER
---------------------------------------------------------------------------- */

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/* ----------------------------------------------------------------------------
   6. PERFORMANCE INDEXES
---------------------------------------------------------------------------- */

CREATE INDEX IF NOT EXISTS idx_students_profiles_fk ON public.students(id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON public.batches(course_id);
CREATE INDEX IF NOT EXISTS idx_bundle_courses_course_id ON public.bundle_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_course_id ON public.registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_registrations_batch_id ON public.registrations(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON public.enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_assessments_batch_id ON public.assessments(batch_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_student_id ON public.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_to ON public.enquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_applications_opening_id ON public.job_applications(opening_id);
CREATE INDEX IF NOT EXISTS idx_instructors_profile_id ON public.instructors(profile_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_student_id ON public.testimonials(student_id);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_course_bundles_slug ON public.course_bundles(slug);
CREATE INDEX IF NOT EXISTS idx_batches_batch_code ON public.batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_students_registration_num ON public.students(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_num ON public.registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_career_openings_slug ON public.career_openings(slug);

CREATE INDEX IF NOT EXISTS idx_courses_category_published ON public.courses(category, is_published);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_status_audience ON public.enquiries(status, audience_type);
CREATE INDEX IF NOT EXISTS idx_assessments_batch_published ON public.assessments(batch_id, is_published);
CREATE INDEX IF NOT EXISTS idx_results_published ON public.assessment_results(is_published);
CREATE INDEX IF NOT EXISTS idx_campus_updates_active ON public.campus_updates(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_career_openings_active ON public.career_openings(is_active);

/* ----------------------------------------------------------------------------
   7. ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------------------------- */

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

/* Policies: profiles */
CREATE POLICY "Public can view basic instructor profiles"
    ON public.profiles FOR SELECT
    USING (role IN ('instructor', 'admin'));

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full control over profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: students */
CREATE POLICY "Students can view their own student record"
    ON public.students FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Students can update their own contact details"
    ON public.students FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view all student records"
    ON public.students FOR SELECT
    TO authenticated
    USING (public.is_staff());

CREATE POLICY "Admins have full control over students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: courses & bundles */
CREATE POLICY "Public can view published courses"
    ON public.courses FOR SELECT
    USING (is_published = true OR public.is_staff());

CREATE POLICY "Admins have full control over courses"
    ON public.courses FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Public can view published bundles"
    ON public.course_bundles FOR SELECT
    USING (is_published = true OR public.is_staff());

CREATE POLICY "Admins have full control over bundles"
    ON public.course_bundles FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Public can view bundle course links"
    ON public.bundle_courses FOR SELECT
    USING (true);

CREATE POLICY "Admins have full control over bundle courses"
    ON public.bundle_courses FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: batches */
CREATE POLICY "Public can view active batches"
    ON public.batches FOR SELECT
    USING (status IN ('upcoming', 'enrolling', 'ongoing') OR public.is_staff());

CREATE POLICY "Admins have full control over batches"
    ON public.batches FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: registrations */
CREATE POLICY "Anyone can submit a registration"
    ON public.registrations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
    ON public.registrations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full control over registrations"
    ON public.registrations FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: enrollments */
CREATE POLICY "Students can view their own enrollments"
    ON public.enrollments FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Staff can view all enrollments"
    ON public.enrollments FOR SELECT
    TO authenticated
    USING (public.is_staff());

CREATE POLICY "Admins have full control over enrollments"
    ON public.enrollments FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: assessments */
CREATE POLICY "Enrolled students can view published assessments"
    ON public.assessments FOR SELECT
    TO authenticated
    USING (
        is_published = true AND EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.batch_id = assessments.batch_id
              AND enrollments.student_id = auth.uid()
        )
    );

CREATE POLICY "Staff have full control over assessments"
    ON public.assessments FOR ALL
    TO authenticated
    USING (public.is_staff());

/* Policies: assessment_results */
CREATE POLICY "Students can view their own published results"
    ON public.assessment_results FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() AND is_published = true);

CREATE POLICY "Staff have full control over assessment results"
    ON public.assessment_results FOR ALL
    TO authenticated
    USING (public.is_staff());

/* Policies: enquiries */
CREATE POLICY "Anyone can submit an enquiry"
    ON public.enquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage enquiries"
    ON public.enquiries FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: career_openings & job_applications */
CREATE POLICY "Public can view active job openings"
    ON public.career_openings FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full control over career openings"
    ON public.career_openings FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Anyone can submit a job application"
    ON public.job_applications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins have full control over job applications"
    ON public.job_applications FOR ALL
    TO authenticated
    USING (public.is_admin());

/* Policies: campus_updates, instructors, testimonials, partners */
CREATE POLICY "Public can view active campus updates"
    ON public.campus_updates FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > timezone('utc', now())));

CREATE POLICY "Admins have full control over campus updates"
    ON public.campus_updates FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Public can view instructors"
    ON public.instructors FOR SELECT
    USING (true);

CREATE POLICY "Admins have full control over instructors"
    ON public.instructors FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Public can view verified testimonials"
    ON public.testimonials FOR SELECT
    USING (verified = true OR public.is_admin());

CREATE POLICY "Admins have full control over testimonials"
    ON public.testimonials FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Public can view active partners"
    ON public.partners FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full control over partners"
    ON public.partners FOR ALL
    TO authenticated
    USING (public.is_admin());