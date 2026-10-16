"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { normalizeDatabaseCourse } from "@/data/courses";
import { createClient } from "@/lib/supabase/client";
import CourseCard from "../cards/CourseCard";

/**
 * More Courses / Learning Paths — Section 6.5.
 * Grid: 3 columns desktop (10.1), 2 tablet (10.2), 1 mobile (10.3).
 * "View All Courses" is sticky on desktop within the section.
 */
export default function MoreCourses() {
  const supabase = useMemo(() => createClient(), []);
  const [moreCourses, setMoreCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (!active) return;

        if (error) {
          setHasError(true);
          return;
        }

        setMoreCourses((data ?? []).map(normalizeDatabaseCourse));
      } catch {
        if (active) setHasError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCourses();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <section className="sprint-section relative bg-brand-white pt-6 pb-[2.1rem] md:pt-10 md:pb-[3.5rem] lg:pt-12 lg:pb-[4.375rem]">
      <div className="mx-auto max-w-[1200px] px-6">
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
          className="mt-7 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-6"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <p role="status" className="sr-only">
                Loading learning paths.
              </p>
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="min-h-[360px] animate-pulse rounded-2xl border border-brand-border bg-brand-off-white"
                />
              ))}
            </>
          ) : hasError ? (
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
