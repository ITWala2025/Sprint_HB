"use client";

import { useEffect, useRef, useState } from "react";
import { featuredCourse, featuredProgramStages } from "@/data/data";

/**
 * Featured Course / Program — Section 6.4.
 *
 * Scroll-driven vertical timeline: each stage is observed with
 * IntersectionObserver, and the stage nearest the viewport center becomes
 * "active". This is deliberately observer-based rather than a scroll-jack
 * library — it never overrides native scroll (spec: "should not interfere
 * with normal page scrolling") and degrades gracefully (no JS = every
 * stage just renders statically, still readable).
 *
 * The whole block is intentionally NOT wrapped in a link/button per spec
 * ("not intended to function as a clickable card").
 */
export default function FeaturedProgram() {
  const stageRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      {
        // Trigger when a stage crosses the vertical center of the
        // viewport, so "active" tracks scroll position naturally.
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    stageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-brand-navy py-24 text-brand-white covers-watermark">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-red">Featured Program</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {featuredCourse.title}
          </h2>
          <p className="mt-4 text-brand-white/75">{featuredCourse.shortDescription}</p>
        </div>

        <div className="relative mt-16 grid gap-0 md:pl-4">
          {/* The vertical rail. The filled segment grows with scroll
              progress to visualize "a clear sense of progression". */}
          <div
            className="absolute left-0 top-0 hidden h-full w-px bg-brand-white/15 md:block"
            aria-hidden="true"
          >
            <div
              className="w-px bg-brand-red transition-[height] duration-500 ease-out"
              style={{
                height: `${((activeIndex + 1) / featuredProgramStages.length) * 100}%`,
              }}
            />
          </div>

          {featuredProgramStages.map((stage, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={stage.id}
                ref={(el) => {
                  stageRefs.current[index] = el;
                }}
                data-index={index}
                className="relative py-10 pl-8 md:pl-12"
              >
                {/* Node on the rail, filled when active */}
                <span
                  className={`absolute left-[-5px] top-11 hidden h-[11px] w-[11px] rounded-full border-2 md:block ${
                    isActive
                      ? "border-brand-red bg-brand-red"
                      : "border-brand-white/40 bg-brand-navy"
                  }`}
                  aria-hidden="true"
                />

                <p
                  className={`text-sm font-semibold ${
                    isActive ? "text-brand-red" : "text-brand-white/50"
                  }`}
                >
                  {stage.stageLabel}
                </p>
                <h3
                  className={`mt-1 font-display text-2xl font-semibold transition-opacity ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                >
                  {stage.title}
                </h3>
                <p
                  className={`mt-2 max-w-lg transition-opacity ${
                    isActive ? "text-brand-white/85 opacity-100" : "text-brand-white/60 opacity-70"
                  }`}
                >
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
