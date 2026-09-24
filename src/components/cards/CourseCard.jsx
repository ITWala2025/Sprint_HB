import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

/**
 * Course Card — Sections 5.1, 6.5, 7.2.
 * The whole card is a single Link to Course URL, satisfying "clicking
 * anywhere on the card navigates to the Course Details page". A visible
 * hover/focus state signals it's clickable, per Section 9.1 / 7.2.
 */
export default function CourseCard({ course }) {
  const courseHref = `/courses/${course.slug}`;

  return (
    <Link
      href={courseHref}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-white transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-brand-surface">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
          {course.category}
        </span>
        <h3 className="mt-2 font-display text-lg font-semibold text-brand-text">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-brand-text-secondary">
          {course.description}
        </p>

        {course.rating != null ? (
          <div className="mt-3 flex items-center gap-1 text-sm text-brand-text-secondary">
            <span aria-hidden="true" className="text-brand-warning">
              ★
            </span>
            <span className="font-medium text-brand-text">{course.rating}</span>
            {course.reviewCount != null ? (
              <span>({course.reviewCount})</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-1.5 text-sm text-brand-text-muted">
          <Clock className="size-4" aria-hidden="true" />
          <span>{course.duration}</span>
        </div>

        <span className="mt-auto flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-dark hover:shadow-brand-cta group-focus-visible:ring-2 group-focus-visible:ring-brand-red group-focus-visible:ring-offset-2">
          Know More
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
