import { courses } from "@/data/courses";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { normalizeDatabaseCourse } from "@/data/courses";
import CourseCard from "@/components/cards/CourseCard";

export const metadata = { title: "Apply for a Course" };

export default async function StudentApplyCoursePage() {
  const supabase = createPublicServerClient();
  if (!supabase) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, category, description, difficulty_level, duration, delivery_method, prerequisites, tools, outcomes, target_roles, thumbnail_url, audience, audience_type, certificate_included, is_published",
    )
    .eq("is_published", true)
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Could not load available courses: ${error.message}`);
  }

  const courses = (data ?? []).map(normalizeDatabaseCourse);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="courses-eyebrow">Student Portal</p>
        <h1 className="font-display text-3xl font-bold text-brand-navy">
          Explore courses
        </h1>
        <p className="mt-2 text-sm text-brand-text-secondary">
          Choose a course to submit an enrollment application for admin review.
        </p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
      {courses.length === 0 ? (
        <p className="rounded-xl border border-brand-border bg-brand-white p-5 text-sm text-brand-text-secondary">
          There are no published courses available for applications right now.
        </p>
      ) : null}
    </div>
  );
}
