"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { testimonials } from "@/data/data";

/**
 * Student Testimonials — Section 6.7 / 7.4.
 *
 * Text testimonials are used here (final mix is TBD per spec); the
 * per-card video ref/hover wiring is included so upgrading any entry to a
 * video testimonial later is a data change, not a rebuild. Hover-to-play
 * is desktop-only (mobile hover behavior is explicitly TBD in the spec),
 * enforced via the `group` + `hidden md:contents`-free approach below —
 * the play/pause calls simply do nothing if a card has no videoUrl.
 */
export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);
  const total = testimonials.length;

  const goTo = (index) => setActiveIndex((index + total) % total);

  const handleHoverStart = (index) => {
    videoRefs.current[index]?.play().catch(() => {
      /* Autoplay-with-sound can be blocked by the browser; spec calls this
         out as a known risk to validate — fail silently rather than error. */
    });
  };

  const handleHoverEnd = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const active = testimonials[activeIndex];

  return (
    <section className="bg-brand-white py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-3xl font-bold text-brand-navy">
          What our students say
        </h2>

        {/* Active testimonial */}
        <div
          className="mt-12"
          onMouseEnter={() => handleHoverStart(activeIndex)}
          onMouseLeave={() => handleHoverEnd(activeIndex)}
        >
          <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-brand-surface">
            {active.videoUrl ? (
              <video
                ref={(el) => {
                  videoRefs.current[activeIndex] = el;
                }}
                muted
                loop
                playsInline
                poster={active.photoUrl}
                className="h-full w-full object-cover"
              >
                <source src={active.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={active.photoUrl}
                alt={active.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            )}
          </div>

          <blockquote className="mt-6 text-xl font-medium text-brand-text">
            &ldquo;{active.quote}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-semibold text-brand-navy">{active.name}</p>
          <p className="text-sm text-brand-text-secondary">{active.role}</p>
        </div>

        {/* Carousel controls */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-navy hover:border-brand-navy"
          >
            ‹
          </button>

          <div className="flex gap-2" role="tablist" aria-label="Testimonials">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Show testimonial from ${t.name}`}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === activeIndex ? "bg-brand-red" : "bg-brand-border"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-navy hover:border-brand-navy"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
