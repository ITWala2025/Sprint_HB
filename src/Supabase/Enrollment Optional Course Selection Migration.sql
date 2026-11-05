-- Enrollment applications may be submitted before a student selects a course.
-- The admin review flow can collect the program choice after the application.
ALTER TABLE public.enrollments
    DROP CONSTRAINT IF EXISTS enrollments_selected_product_check;
