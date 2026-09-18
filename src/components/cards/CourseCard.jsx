import Image from "next/image";
import Link from "next/link";

/**
 * Course Card — Sections 5.1, 6.5, 7.2.
 * The whole card is a single Link to Course URL, satisfying "clicking
 * anywhere on the card navigates to the Course Details page". A visible
 * hover/focus state signals it's clickable, per Section 9.1 / 7.2.
 */
export default function CourseCard({ course }) {
  return (
    <Link
      href={course.courseUrl}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-white transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-brand-surface">
        <Image
          src={course.thumbnailUrl}
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
          {course.shortDescription}
        </p>

        <div className="mt-3 flex items-center gap-1 text-sm text-brand-text-secondary">
          <span aria-hidden="true" className="text-brand-warning">★</span>
          <span className="font-medium text-brand-text">{course.rating}</span>
          <span>({course.reviewCount})</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-brand-navy">
            ₹{course.currentPrice.toLocaleString("en-IN")}
          </span>
          {course.discountPercentage > 0 && (
            <>
              <span className="text-sm text-brand-text-muted line-through">
                ₹{course.originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-semibold text-brand-success">
                {course.discountPercentage}% off
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
