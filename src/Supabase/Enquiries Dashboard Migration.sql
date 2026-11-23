ALTER TABLE public.enquiries
    ADD COLUMN IF NOT EXISTS current_company TEXT,
    ADD COLUMN IF NOT EXISTS current_designation TEXT,
    ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
    ADD COLUMN IF NOT EXISTS role_designation TEXT,
    ADD COLUMN IF NOT EXISTS company_domain TEXT,
    ADD COLUMN IF NOT EXISTS website_url TEXT,
    ADD COLUMN IF NOT EXISTS interested_courses TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS services TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS purpose_types TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.enquiries
    DROP CONSTRAINT IF EXISTS enquiries_status_check;

ALTER TABLE public.enquiries
    ADD CONSTRAINT enquiries_status_check
    CHECK (status IN ('new', 'contacted', 'resolved', 'in_progress', 'converted', 'closed'));
