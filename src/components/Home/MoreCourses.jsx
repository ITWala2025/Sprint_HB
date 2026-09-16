import Link from "next/link";
import { moreCourses } from "@/data/data";
import CourseCard from "../cards/CourseCard";

/**
 * More Courses / Learning Paths — Section 6.5.
 * Grid: 4 columns desktop (10.1), 2 tablet (10.2), 1 mobile (10.3).
 */
export default function MoreCourses() {
  return (
    <section className="bg-brand-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-brand-navy">
              More learning paths
            </h2>
            <p className="mt-2 text-brand-text-secondary">
              Pick a track built around where you want to end up.
            </p>
          </div>

          {/* View All Courses -> Courses Page (Section 6.5 / 8) */}
          <Link
            href="/courses"
            className="hidden shrink-0 text-sm font-semibold text-brand-navy hover:text-brand-red sm:block"
          >
            View All Courses
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {moreCourses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
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
