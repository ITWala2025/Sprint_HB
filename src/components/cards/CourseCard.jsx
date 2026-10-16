"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { getCourseFallbackImage } from "@/data/courses";

/**
 * Course Card — Sections 5.1, 6.5, 7.2.
 * The whole card is a single Link to Course URL, satisfying "clicking
 * anywhere on the card navigates to the Course Details page". A visible
 * hover/focus state signals it's clickable, per Section 9.1 / 7.2.
 */
export default function CourseCard({ course }) {
  const courseHref = `/courses/${course.slug}`;
  const fallbackImage = getCourseFallbackImage(course.category);
  const rating = Number(course.rating);
  const reviewCount = Number(course.review_count ?? course.reviewCount);
  const hasRating =
    course.rating != null &&
    course.rating !== "" &&
    Number.isFinite(rating) &&
    rating >= 0 &&
    rating <= 5 &&
    Number.isFinite(reviewCount) &&
    reviewCount > 0;
  const hasCertificate =
    course.certificate_included === true ||
    (course.certificate_included === undefined && course.certificate === true);
  const [imageSrc, setImageSrc] = useState(() => {
    const source = course.image;
    if (typeof source !== "string") return fallbackImage;
    if (source.startsWith("/") && !source.startsWith("//")) return source;

    try {
      const url = new URL(source);
      return url.protocol === "http:" || url.protocol === "https:"
        ? source
        : fallbackImage;
    } catch {
      return fallbackImage;
    }
  });

  return (
    <Link
      href={courseHref}
      aria-label={`Know more about ${course.title}`}
      className="group flex h-full flex-col overflow-hidden rounded-[0.9rem] border border-brand-border bg-brand-white shadow-[0_9px_18px_-18px_rgba(1,31,62,0.55)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-brand-card focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
    >
      <div className="relative aspect-[16/7] w-full shrink-0 overflow-hidden bg-brand-navy">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`${course.title} course thumbnail`}
            fill
            unoptimized={!imageSrc.startsWith("/") || imageSrc.endsWith(".svg")}
            onError={() => {
              setImageSrc((current) =>
                current === fallbackImage ? null : fallbackImage,
              );
            }}
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-brand-navy to-brand-navy-light" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-brand-blue">
          {course.category}
        </span>
        <h3 className="mt-2 mb-2 line-clamp-2 font-display text-[1.18rem] font-bold leading-[1.23] text-brand-text">          {course.title}
        </h3>
        <p className="mt-1 line-clamp-3 min-h-[3.75rem] text-[0.84rem] leading-[1.48] text-brand-text-secondary">
          {course.description}
        </p>

        {hasRating ? (
          <div
            aria-label={`${rating} out of 5 from ${reviewCount} reviews`}
            className="mt-2 flex items-center gap-1 text-sm text-brand-text-secondary"
          >
            <Star className="size-4 fill-current text-brand-warning" aria-hidden="true" />
            <span className="font-medium text-brand-text">{rating}</span>
            <span>({reviewCount})</span>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-[0.38rem] pt-3">
          <span className="rounded-[0.35rem] bg-brand-surface px-[0.45rem] py-[0.28rem] text-[0.67rem] font-semibold text-brand-text-secondary">
            {course.duration || "Duration to be announced"}
          </span>
          <span className="rounded-[0.35rem] bg-brand-surface px-[0.45rem] py-[0.28rem] text-[0.67rem] font-semibold text-brand-text-secondary">
            {course.delivery_method || course.delivery || "Hybrid"}
          </span>
          <span className="rounded-[0.35rem] bg-brand-surface px-[0.45rem] py-[0.28rem] text-[0.67rem] font-semibold text-brand-text-secondary">
            {course.difficulty_level || course.level || "Beginner"}
          </span>
          {hasCertificate ? (
            <span className="rounded-[0.35rem] bg-brand-surface px-[0.45rem] py-[0.28rem] text-[0.67rem] font-semibold text-brand-text-secondary">
              Certificate
            </span>
          ) : null}
        </div>

        <span className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-brand-red-dark group-focus-visible:ring-2 group-focus-visible:ring-brand-red group-focus-visible:ring-offset-2">
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
