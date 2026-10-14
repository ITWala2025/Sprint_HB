
"use client";

import Image from "next/image";
import { Quote, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { textTestimonials } from "@/data/data";

// ========================================
// Student Avatar Component
// ========================================

function StudentAvatar({ name, photoUrl }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [photoUrl]);

    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");

    return (
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy text-xs font-semibold text-white ring-1 ring-slate-200">
            {photoUrl && !failed ? (
                <Image
                    src={photoUrl}
                    alt=""
                    fill
                    sizes="40px"
                    draggable={false}
                    className="object-cover"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span aria-hidden="true">{initials}</span>
            )}
        </div>
    );
}

// ========================================
// Individual Review Card
// ========================================

function TestimonialCard({ testimonial }) {
    return (
        <article
            className="
                mb-2 inline-block w-full break-inside-avoid
                rounded-2xl border border-slate-200/80
                bg-white p-5 align-top
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-slate-300
                hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]
                motion-reduce:transform-none
                motion-reduce:transition-none"
            >
            <Quote
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
                className="mb-3 text-brand-red"
            />

            <blockquote className="text-[14px] font-normal leading-6 text-brand-navy sm:text-[15px]">
                {testimonial.quote}
            </blockquote>

            <div className="mt-3 flex items-start gap-3 border-t border-slate-100 pt-3">
                <StudentAvatar
                    name={testimonial.name}
                    photoUrl={testimonial.photoUrl}
                />

                <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-brand-navy">
                        {testimonial.name}
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                        {testimonial.role}
                    </p>
                </div>
            </div>
        </article>
    );
}

// ========================================
// Text Testimonials Section
// ========================================

export default function TextTestimonials() {
    const [showAll, setShowAll] = useState(false);

    const MOBILE_LIMIT = 3;
    const DESKTOP_LIMIT = 6;

    if (textTestimonials.length === 0) {
        return null;
    }

    const hasMoreMobile = textTestimonials.length > MOBILE_LIMIT;
    const hasMoreDesktop = textTestimonials.length > DESKTOP_LIMIT;

    return (
        <div className="mt-8 md:mt-10">
            {/* Section Heading */}
            <div className="mb-8 text-center">
                {/* <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red-accessible">
          Written Reviews
        </p> */}

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
                    Words from our learners
                </h3>
            </div>

            {/* Responsive Masonry Layout */}

            <div
                id="written-reviews-list"
                className="columns-1 gap-4 md:columns-2 lg:columns-3"
            >
                {textTestimonials.map((testimonial, index) => {
                    const visibilityClass = showAll
                        ? "block"
                        : index >= 6
                            ? "hidden"
                            : index >= 3
                                ? "hidden md:block"
                                : "block";

                    return (
                        <div
                            key={testimonial.id}
                            className={`${visibilityClass} mb-6 break-inside-avoid`}
                        >
                            <TestimonialCard testimonial={testimonial} />
                        </div>
                    );
                })}
            </div>

            {/* View More / Show Less */}
            {(hasMoreMobile || hasMoreDesktop) && (
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={() => setShowAll((prev) => !prev)}
                        aria-expanded={showAll}
                        aria-controls="written-reviews-list"

                        className="
                            sprint-focus inline-flex items-center
                            justify-center gap-2 rounded-full
                            border border-brand-navy
                            bg-white px-6 py-2.5
                            text-sm font-semibold text-brand-navy
                            shadow-sm transition-all duration-200
                            hover:bg-brand-navy hover:text-white
                            hover:shadow-md
                            active:scale-[0.98]
                            motion-reduce:transform-none"
                        >
                        {showAll ? (
                            <>
                                Show Less
                                <ChevronUp size={17} aria-hidden="true" />
                            </>
                        ) : (
                            <>
                                View More Reviews
                                <ChevronDown size={17} aria-hidden="true" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
