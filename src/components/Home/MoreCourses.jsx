import Link from "next/link";
import { normalizeDatabaseCourse } from "@/data/courses";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import CourseCard from "../cards/CourseCard";

/**
 * More Courses / Learning Paths — Section 6.5.
 * Grid: 4 columns desktop (10.1) when 4 courses are displayed (or 3 columns for 3),
 * 2 tablet (10.2), 1 mobile (10.3).
 * "View All Courses" is sticky on desktop within the section.
 */
export default async function MoreCourses() {
  const supabase = createPublicServerClient();
  let moreCourses = [];
  let hasError = false;

  if (!supabase) {
    console.error("[SPRINT Home] Supabase server client is not configured.");
    hasError = true;
  } else {
    try {
      let { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && (!data || data.length === 0)) {
        const fallback = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error("[SPRINT Home] Could not load published courses:", error.message);
        hasError = true;
      } else {
        moreCourses = (data ?? []).map(normalizeDatabaseCourse);
      }
    } catch (error) {
      console.error("[SPRINT Home] Could not load published courses:", error);
      hasError = true;
    }
  }

  const gridColsClass =
    moreCourses.length === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="sprint-section relative bg-brand-white py-6 md:py-8 lg:py-10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              More learning paths
            </h2>
          </div>

          {/* View All Courses -> Courses Page (Section 6.5 / 8) - Sticky on desktop */}
          <div className="hidden lg:block shrink-0">
            <div className="sticky top-24">
              <Link
                href="/courses"
                className="inline-flex min-h-11 items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition-colors hover:bg-brand-off-white hover:border-brand-navy hover:text-brand-red-accessible"
              >
                View All Courses
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`mt-7 grid grid-cols-1 items-stretch gap-5 ${gridColsClass} lg:mt-8 lg:gap-6`}
        >
          {hasError ? (
            <p role="alert" className="col-span-full py-8 text-center text-sm text-brand-text-secondary">
              Courses are temporarily unavailable. Please try again later.
            </p>
          ) : moreCourses.length ? (
            moreCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))
          ) : (
            <p className="col-span-full py-8 text-center text-sm text-brand-text-secondary">
              New learning paths are coming soon.
            </p>
          )}
        </div>

        {/* Mobile View All Courses - not sticky, shown at bottom */}
        <div className="mt-6 lg:hidden">
          <Link
            href="/courses"
            className="flex min-h-11 items-center justify-center text-center text-sm font-semibold text-brand-navy hover:text-brand-red-accessible"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
