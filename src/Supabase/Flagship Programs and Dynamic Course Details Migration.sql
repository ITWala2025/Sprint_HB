ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS badge_label TEXT NOT NULL DEFAULT 'Course',
    ADD COLUMN IF NOT EXISTS target_roles TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.courses
    ALTER COLUMN outcomes DROP DEFAULT;

ALTER TABLE public.courses
    ALTER COLUMN outcomes TYPE JSONB USING to_jsonb(outcomes),
    ALTER COLUMN outcomes SET DEFAULT '[]'::jsonb;

UPDATE public.courses
SET target_roles = ARRAY[target_role]
WHERE target_role IS NOT NULL
  AND target_role <> ''
  AND cardinality(target_roles) = 0;

ALTER TABLE public.course_bundles
    ADD COLUMN IF NOT EXISTS badge_label TEXT NOT NULL DEFAULT 'Flagship Program',
    ADD COLUMN IF NOT EXISTS tagline TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'undergraduate'
        CHECK (audience IN ('undergraduate', 'working_professional')),
    ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS training_mode public.training_mode NOT NULL DEFAULT 'Hybrid',
    ADD COLUMN IF NOT EXISTS eligibility TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

INSERT INTO public.course_bundles (
    slug, title, category, badge_label, tagline, description, long_description,
    audience, duration, training_mode, eligibility, highlights, roadmap,
    is_published, is_featured
)
VALUES
    (
        'sprint-rise',
        'SPRINT RISE',
        'Flagship Program',
        'Flagship Program',
        'Campus to Corporate in 6 Months',
        'An intensive, industry-focused program to build in-demand skills in Cloud, AI, DevOps and more with hands-on projects and expert mentorship.',
        'SPRINT RISE brings technical learning, professional development, industry ways of working, and internship experience together in a guided six-month pathway from campus to career.',
        'undergraduate',
        '6 Months Intensive',
        'Hybrid',
        'Undergraduate students ready to build practical technology skills and prepare for industry roles.',
        ARRAY['124 hours of technical sessions', '46 hours of personality development', '40 hours of industry ways of working', '90 hours of internship experience'],
        '[{"title":"Day One","duration":"Orientation","subjects":[]},{"title":"Technical Sessions","duration":"124 hours","subjects":["Cloud","AI","DevOps"]},{"title":"Personality Development","duration":"46 hours","subjects":["Communication","Professional confidence"]},{"title":"Industry Ways of Working","duration":"40 hours","subjects":["Team workflows","Industry practices"]},{"title":"Internship","duration":"90 hours","subjects":["Applied industry experience"]},{"title":"Industry-Ready","duration":"Program completion","subjects":["Career preparation"]}]'::jsonb,
        true,
        true
    ),
    (
        'sprint-3-year-program',
        'SPRINT 3-Year Degree-Integrated Program',
        '3-Year Pathway',
        '3-Year Pathway',
        'A three-year learning journey',
        'Progress through Foundations in Year 1, Ignite in Year 2, and Outperform in Year 3.',
        'A degree-integrated technology pathway that builds durable foundations, advances through applied specialization, and culminates in sustained industry readiness.',
        'undergraduate',
        '3 Years (6 Semesters)',
        'Hybrid',
        'Undergraduate students pursuing a degree-integrated technology pathway.',
        ARRAY['Foundational technology learning', 'Progressive applied specialization', 'Industry-aligned projects', 'Career readiness across three years'],
        '[{"title":"Year 1 — Foundations","duration":"Semesters 1-2","subjects":["Programming foundations","Digital fluency"]},{"title":"Year 2 — Ignite","duration":"Semesters 3-4","subjects":["Applied technology","Specialization projects"]},{"title":"Year 3 — Outperform","duration":"Semesters 5-6","subjects":["Advanced practice","Industry capstone","Career readiness"]}]'::jsonb,
        true,
        true
    )
ON CONFLICT (slug) DO NOTHING;