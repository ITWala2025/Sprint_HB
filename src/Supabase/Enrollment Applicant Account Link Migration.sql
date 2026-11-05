-- Link applications to the verified Auth account before student approval.
-- student_id remains reserved for the provisioned public.students record.
ALTER TABLE public.enrollments
    ADD COLUMN IF NOT EXISTS applicant_user_id UUID
    REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS enrollments_applicant_user_id_idx
    ON public.enrollments(applicant_user_id);

UPDATE public.enrollments AS enrollment
SET applicant_user_id = auth_user.id
FROM auth.users AS auth_user
WHERE enrollment.applicant_user_id IS NULL
  AND lower(enrollment.email) = lower(auth_user.email)
  AND auth_user.email_confirmed_at IS NOT NULL;

DROP POLICY IF EXISTS "Applicants can view their own enrollment applications"
    ON public.enrollments;
CREATE POLICY "Applicants can view their own enrollment applications"
    ON public.enrollments FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR applicant_user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
