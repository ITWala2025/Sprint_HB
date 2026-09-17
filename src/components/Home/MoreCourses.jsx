import Link from "next/link";
import { moreCourses } from "@/data/data";
import CourseCard from "../cards/CourseCard";

/**
 * More Courses / Learning Paths — Section 6.5.
 * Grid: 4 columns desktop (10.1), 2 tablet (10.2), 1 mobile (10.3).
 * "View All Courses" is sticky on desktop within the section.
 */
export default function MoreCourses() {
  return (
    <section className="relative bg-brand-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-3xl font-bold text-brand-navy">
              More learning paths
            </h2>
            <p className="mt-2 text-brand-text-secondary">
              Pick a track built around where you want to end up.
            </p>
          </div>

          {/* View All Courses -> Courses Page (Section 6.5 / 8) - Sticky on desktop */}
          <div className="hidden lg:block shrink-0">
            <div className="sticky top-24">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition-colors hover:bg-brand-off-white hover:border-brand-navy hover:text-brand-red"
              >
                View All Courses
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {moreCourses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>

        {/* Mobile View All Courses - not sticky, shown at bottom */}
        <div className="mt-8 lg:hidden">
          <Link
            href="/courses"
            className="block text-center text-sm font-semibold text-brand-navy hover:text-brand-red"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
