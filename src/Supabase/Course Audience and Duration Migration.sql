ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'undergraduate',
    ADD COLUMN IF NOT EXISTS audience_type TEXT NOT NULL DEFAULT 'undergraduate',
    ADD COLUMN IF NOT EXISTS delivery_method public.training_mode NOT NULL DEFAULT 'Hybrid';

ALTER TABLE public.courses
    ALTER COLUMN audience TYPE TEXT USING audience::TEXT,
    ALTER COLUMN audience_type TYPE TEXT USING audience_type::TEXT;

UPDATE public.courses
SET audience = CASE WHEN audience_type = 'working_professional' OR audience = 'working_professional' THEN 'working_professional' ELSE 'undergraduate' END,
    audience_type = CASE WHEN audience_type = 'working_professional' OR audience = 'working_professional' THEN 'working_professional' ELSE 'undergraduate' END;

UPDATE public.courses
SET category = CASE category
    WHEN 'Artificial Intelligence' THEN 'Artificial Intelligence & ML'
    WHEN 'Cloud Computing' THEN 'Cloud & DevOps'
    WHEN 'Cloud & DevOps Architecture' THEN 'Cloud & DevOps'
    WHEN 'Cloud-Native & DevOps' THEN 'Cloud & DevOps'
    WHEN 'DevOps & Containers' THEN 'Cloud & DevOps'
    WHEN 'Full-Stack Web' THEN 'Full Stack Web'
    WHEN 'Programming Fundamentals' THEN 'Software Engineering'
    WHEN 'Professional Skills' THEN 'Career & Soft Skills'
    ELSE category
END;

ALTER TABLE public.courses
    ALTER COLUMN audience SET DEFAULT 'undergraduate',
    ALTER COLUMN audience_type SET DEFAULT 'undergraduate',
    DROP COLUMN IF EXISTS duration_weeks,
    DROP COLUMN IF EXISTS duration_hours;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'courses_audience_type_check'
          AND conrelid = 'public.courses'::regclass
    ) THEN
        ALTER TABLE public.courses
            ADD CONSTRAINT courses_audience_type_check
            CHECK (audience_type IN ('undergraduate', 'working_professional'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'courses_audience_check'
          AND conrelid = 'public.courses'::regclass
    ) THEN
        ALTER TABLE public.courses
            ADD CONSTRAINT courses_audience_check
            CHECK (audience IN ('undergraduate', 'working_professional'));
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';