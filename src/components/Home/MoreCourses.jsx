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
    <section className="sprint-section relative bg-brand-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
              Learning pathways
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              More learning paths
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
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

        <div className="mt-10 grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
