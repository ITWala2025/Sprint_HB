ALTER TABLE public.course_bundles
    ADD COLUMN IF NOT EXISTS audience_type TEXT,
    ADD COLUMN IF NOT EXISTS target_audience TEXT,
    ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'Hybrid',
    ADD COLUMN IF NOT EXISTS credential TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS designed_for TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS program_type TEXT NOT NULL DEFAULT 'bundle'
        CHECK (program_type IN ('signature', 'bundle'));

UPDATE public.course_bundles
SET audience_type = COALESCE(audience_type, audience, 'undergraduate'),
    target_audience = COALESCE(target_audience, audience, 'undergraduate'),
    delivery_method = training_mode::text,
    program_type = CASE
        WHEN slug IN ('sprint-rise', 'career-accelerator', 'sprint-3-year-program') THEN 'signature'
        ELSE program_type
    END,
    designed_for = COALESCE(NULLIF(designed_for, ''), eligibility, ''),
    credential = COALESCE(NULLIF(credential, ''), 'Certification');

ALTER TABLE public.course_bundles
    ALTER COLUMN audience_type SET DEFAULT 'undergraduate',
    ALTER COLUMN target_audience SET DEFAULT 'undergraduate';

CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    eyebrow TEXT NOT NULL DEFAULT 'CAREER PATHWAY',
    target_audience TEXT NOT NULL DEFAULT 'undergraduate'
        CHECK (target_audience IN ('undergraduate', 'working_professional')),
    total_hours INTEGER NOT NULL DEFAULT 0 CHECK (total_hours >= 0),
    stages JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(stages) = 'array'),
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(certifications) = 'array'),
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_published_slug
    ON public.learning_paths (is_published, slug);

DROP TRIGGER IF EXISTS learning_paths_updated_at ON public.learning_paths;
CREATE TRIGGER learning_paths_updated_at
    BEFORE UPDATE ON public.learning_paths
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.learning_paths TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learning_paths TO authenticated;

DROP POLICY IF EXISTS "Public can view published learning paths" ON public.learning_paths;
CREATE POLICY "Public can view published learning paths"
    ON public.learning_paths FOR SELECT
    TO anon, authenticated
    USING (
        is_published
        OR public.current_user_has_permission('courses', 'view')
        OR public.current_user_has_permission('course_bundle_cms', 'view')
        OR public.current_user_has_permission('cms_courses', 'view')
    );

DROP POLICY IF EXISTS "Staff can create learning paths with permission" ON public.learning_paths;
CREATE POLICY "Staff can create learning paths with permission"
    ON public.learning_paths FOR INSERT
    TO authenticated
    WITH CHECK (
        public.current_user_has_permission('courses', 'create')
        OR public.current_user_has_permission('course_bundle_cms', 'create')
        OR public.current_user_has_permission('cms_courses', 'create')
    );

DROP POLICY IF EXISTS "Staff can edit learning paths with permission" ON public.learning_paths;
CREATE POLICY "Staff can edit learning paths with permission"
    ON public.learning_paths FOR UPDATE
    TO authenticated
    USING (
        public.current_user_has_permission('courses', 'edit')
        OR public.current_user_has_permission('course_bundle_cms', 'edit')
        OR public.current_user_has_permission('cms_courses', 'edit')
    )
    WITH CHECK (
        public.current_user_has_permission('courses', 'edit')
        OR public.current_user_has_permission('course_bundle_cms', 'edit')
        OR public.current_user_has_permission('cms_courses', 'edit')
    );

DROP POLICY IF EXISTS "Staff can delete learning paths with permission" ON public.learning_paths;
CREATE POLICY "Staff can delete learning paths with permission"
    ON public.learning_paths FOR DELETE
    TO authenticated
    USING (
        public.current_user_has_permission('courses', 'delete')
        OR public.current_user_has_permission('course_bundle_cms', 'delete')
        OR public.current_user_has_permission('cms_courses', 'delete')
    );

INSERT INTO public.learning_paths (
    slug, title, eyebrow, target_audience, total_hours, stages, certifications,
    is_published, is_featured
)
VALUES
    (
        'ai-engineer', 'AI Engineer', 'CAREER PATHWAY', 'undergraduate', 225,
        '[{"number":"01","title":"Applied Machine Learning & Scikit-Learn","hours":"60 Hours","learn":"Core statistical modeling, regression, classification, clustering, data preprocessing, and model evaluation techniques using scikit-learn and Python."},{"number":"02","title":"Deep Learning, Computer Vision & NLP","hours":"90 Hours","learn":"Neural network foundations, ANNs, CNNs, RNNs, and Transformer model architectures."},{"number":"03","title":"Generative AI & Autonomous Agent Systems","hours":"75 Hours","learn":"LLMs, prompt engineering frameworks, LangChain/LangGraph pipelines, ChromaDB vector search (RAG), and multi-agent system orchestration using CrewAI."}]'::jsonb,
        '["Applied Machine Learning & Scikit-Learn: Passing score (>=70%) on the End-of-Course Practical ML Assessment & Case Study.","Deep Learning, Computer Vision & NLP: Passing score (>=70%) on the Deep Learning Neural Model Design Exam.","Generative AI & Autonomous Agent Systems: Passing score (>=70%) on the GenAI Agent Architecture & RAG Pipeline Evaluation Test."]'::jsonb,
        true, true
    ),
    (
        'cloud-engineer', 'Cloud Engineer', 'CAREER PATHWAY', 'working_professional', 160,
        '[{"number":"01","title":"Cloud Infrastructure Foundations (AWS Core)","hours":"50 Hours","learn":"Core cloud principles, EC2, VPC, S3/EBS, IAM, and security groups."},{"number":"02","title":"Microservices Architecture & Cloud Backend","hours":"65 Hours","learn":"Service decomposition, Docker Compose, REST APIs, asynchronous message queues, and cloud backend deployment."},{"number":"03","title":"Enterprise Cloud Operations & Administration","hours":"45 Hours","learn":"Enterprise cloud resource scaling, automated backups, cross-region replication, IAM role governance, and resource billing monitoring."}]'::jsonb,
        '["Cloud Infrastructure Foundations (AWS Core): Passing score (>=75%) on the Cloud Infrastructure Hands-on Practical Exam.","Microservices Architecture & Cloud Backend: Passing score (>=70%) on the Microservices Deployment & API Design Test.","Enterprise Cloud Operations & Administration: Passing score (>=70%) on the Cloud Operations & Systems Administration Exam."]'::jsonb,
        true, true
    ),
    (
        'devops-engineer', 'DevOps Engineer', 'CAREER PATHWAY', 'working_professional', 180,
        '[{"number":"01","title":"Containerization & Orchestration (Docker & Kubernetes)","hours":"70 Hours","learn":"Container lifecycle management, multi-stage Docker builds, Kubernetes clusters, pods, services, ingress, and Helm."},{"number":"02","title":"Infrastructure as Code (IaC) with Terraform","hours":"50 Hours","learn":"Declarative cloud provisioning, Terraform state management, reusable modules, variable scopes, and automated multi-environment rollouts."},{"number":"03","title":"CI/CD Pipeline Automation & GitOps","hours":"60 Hours","learn":"Automated test/deployment workflows using GitHub Actions/GitLab CI, artifact versioning, staging rollouts, and Git/GitHub workflows."}]'::jsonb,
        '["Containerization & Orchestration (Docker & Kubernetes): Passing score (>=75%) on the Container Orchestration & Cluster Management Lab Exam.","Infrastructure as Code (IaC) with Terraform: Passing score (>=70%) on the Terraform Infrastructure Automation Test.","CI/CD Pipeline Automation & GitOps: Passing score (>=75%) on the End-to-End CI/CD Pipeline Build Assessment."]'::jsonb,
        true, true
    ),
    (
        'software-engineer', 'Software Engineer', 'CAREER PATHWAY', 'undergraduate', 225,
        '[{"number":"01","title":"Object-Oriented Programming & Logic Building","hours":"60 Hours","learn":"Programming logic, algorithm design, data structures, OOP patterns, and file handling."},{"number":"02","title":"Modern Frontend Web Development","hours":"65 Hours","learn":"Semantic HTML5, CSS3, responsive design, modern JavaScript (ES6+), component architecture, and React UI engineering."},{"number":"03","title":"Enterprise Full-Stack Engineering (MERN & Java)","hours":"100 Hours","learn":"End-to-end development using MongoDB/PostgreSQL, Express/Spring Boot, React, Node.js, and CI/CD-driven deployments."}]'::jsonb,
        '["Object-Oriented Programming & Logic Building: Passing score (>=70%) on the DSA Logic & Coding Proficiency Test.","Modern Frontend Web Development: Passing score (>=70%) on the Frontend Interactive Application Evaluation.","Enterprise Full-Stack Engineering (MERN & Java): Passing score (>=75%) on the Full-Stack Enterprise Capstone Project & Technical Assessment."]'::jsonb,
        true, true
    )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.course_bundles (
    slug, title, category, badge_label, tagline, description, long_description,
    audience, audience_type, target_audience, duration, level, training_mode,
    delivery_method, credential, designed_for, eligibility, highlights, roadmap,
    program_type, is_published, is_featured
)
VALUES (
    'career-accelerator',
    'SPRINT Career Accelerator',
    'Flagship Program',
    'Signature Program',
    'From campus to corporate, with confidence.',
    'A career-development program for B.Tech and MCA students, progressing through the phases of Foundations, Ignite, and Outperform.',
    'A structured career-development pathway for B.Tech and MCA students.',
    'undergraduate',
    'undergraduate',
    'undergraduate',
    '3 Years (6 Semesters)',
    'Undergraduate',
    'Hybrid',
    'Hybrid',
    'Certification',
    'B.Tech and MCA students',
    'B.Tech and MCA students',
    ARRAY['Foundations', 'Ignite', 'Outperform'],
    '[{"stage":"Phase 1","title":"Foundations","hours":"","topics":["Programming foundations","Digital fluency"]},{"stage":"Phase 2","title":"Ignite","hours":"","topics":["Applied technology","Specialization projects"]},{"stage":"Phase 3","title":"Outperform","hours":"","topics":["Advanced practice","Industry capstone","Career readiness"]}]'::jsonb,
    'signature',
    true,
    true
)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
