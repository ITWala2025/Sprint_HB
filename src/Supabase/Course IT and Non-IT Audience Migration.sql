-- Migration: Support IT and Non-IT Professional Audiences in Courses
-- Purpose: Allow courses to be designated specifically for IT Professionals, Non-IT Professionals, Students, or Working Professionals.

DO $$ BEGIN
    -- Drop older audience check constraints if present
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'courses_audience_type_check'
          AND conrelid = 'public.courses'::regclass
    ) THEN
        ALTER TABLE public.courses DROP CONSTRAINT courses_audience_type_check;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'courses_audience_check'
          AND conrelid = 'public.courses'::regclass
    ) THEN
        ALTER TABLE public.courses DROP CONSTRAINT courses_audience_check;
    END IF;
END $$;

-- Update constraints to support undergraduate/student, it-pro, non-it, and working_professional
ALTER TABLE public.courses
    ADD CONSTRAINT courses_audience_type_check
    CHECK (audience_type IN ('undergraduate', 'student', 'it-pro', 'non-it', 'working_professional', 'all'));

ALTER TABLE public.courses
    ADD CONSTRAINT courses_audience_check
    CHECK (audience IN ('undergraduate', 'student', 'it-pro', 'non-it', 'working_professional', 'all'));

NOTIFY pgrst, 'reload schema';

