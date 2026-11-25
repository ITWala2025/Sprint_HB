ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles AS profile
SET onboarding_completed = true
WHERE profile.role = 'student'
  AND (
      EXISTS (
          SELECT 1
          FROM public.students AS student
          WHERE student.id = profile.id
      )
      OR EXISTS (
          SELECT 1
          FROM public.registrations AS registration
          WHERE registration.user_id = profile.id
      )
      OR EXISTS (
          SELECT 1
          FROM public.enrollments AS enrollment
          WHERE enrollment.applicant_user_id = profile.id
             OR enrollment.student_id = profile.id
      )
  );

COMMENT ON COLUMN public.profiles.onboarding_completed IS
    'Set true after student intake is submitted; submit_student_intake may also set this, and submitStudentEnrollmentAction enforces it directly.';
