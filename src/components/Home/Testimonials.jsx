"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { testimonials } from "@/data/data";

/**
 * Student Testimonials — Section 6.7 / 7.4.
 *
 * Text testimonials are rendered as a user-controlled horizontal track so
 * every learner story remains available without adding vertical page height.
 */
export default function Testimonials() {
  const trackRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startScrollLeft: 0 });

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = trackRef.current;
    if (!track) return;

    dragRef.current = {
      isDragging: true,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
    };
    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.isDragging) return;

    const track = trackRef.current;
    if (track) {
      track.scrollLeft =
        dragRef.current.startScrollLeft -
        (event.clientX - dragRef.current.startX);
    }
  };

  const handlePointerUp = (event) => {
    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    dragRef.current.isDragging = false;
  };

  return (
    <section className="sprint-section bg-brand-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
          Learner stories
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          What our students say
        </h2>

        <div className="mt-8 flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous testimonial"
            className="sprint-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-navy transition-colors hover:border-brand-navy"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>

          <div
            ref={trackRef}
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            role="region"
            aria-label="Learner testimonials"
          >
            {testimonials.map((testimonial) => {
              const initials = testimonial.name
                .split(" ")
                .map((part) => part[0])
                .join("");

              return (
                <article
                  key={testimonial.id}
                  className="flex min-h-64 w-full shrink-0 snap-start cursor-grab flex-col rounded-xl border border-brand-border bg-brand-white p-6 text-left shadow-sm active:cursor-grabbing md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy font-display text-lg font-bold text-brand-white">
                    {initials}
                  </div>
                  <blockquote className="mt-6 flex-1 text-lg font-medium text-brand-text">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <p className="mt-6 text-sm font-bold text-brand-navy">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 text-sm text-brand-text-secondary">
                    {testimonial.role}
                  </p>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next testimonial"
            className="sprint-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-navy transition-colors hover:border-brand-navy"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
