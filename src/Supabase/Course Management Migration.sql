ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS audience_type public.audience_type NOT NULL DEFAULT 'student',
    ADD COLUMN IF NOT EXISTS delivery_method public.training_mode NOT NULL DEFAULT 'Hybrid',
    ADD COLUMN IF NOT EXISTS duration_weeks INTEGER NOT NULL DEFAULT 0 CHECK (duration_weeks >= 0),
    ADD COLUMN IF NOT EXISTS duration_hours INTEGER NOT NULL DEFAULT 0 CHECK (duration_hours >= 0);

UPDATE public.courses
SET duration_weeks = substring(duration FROM '([0-9]+) *weeks?')::INTEGER
WHERE duration_weeks = 0
  AND duration ~* '[0-9]+ *weeks?';