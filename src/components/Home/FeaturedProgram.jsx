"use client";

import { ArrowDown } from "lucide-react";
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
 * The stages are revealed as one accessible disclosure so the section stays
 * compact until a visitor asks to view the program path.
 */
export default function FeaturedProgram() {
  const stageRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

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
      },
    );

    stageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isExpanded]);

  return (
    <section className="sprint-section bg-brand-navy py-[2.1rem] text-brand-white md:py-[3.5rem] lg:py-[4.375rem]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light">
            Featured program
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {featuredCourse.title}
          </h2>
          <p className="mt-4 text-brand-white/75">
            {featuredCourse.shortDescription}
          </p>

          <button
            type="button"
            className="sprint-focus group mt-6 inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-red-light/80 bg-brand-red/10 px-5 py-2.5 text-sm font-semibold text-brand-white shadow-[0_0_0_1px_rgba(232,70,47,0.08)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-brand-red-light hover:bg-brand-red hover:text-white hover:shadow-[0_8px_24px_rgba(232,70,47,0.28)] focus-visible:ring-2 focus-visible:ring-brand-red-light focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy active:scale-95"
            aria-controls="featured-program-stages"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <span>
              {isExpanded ? "Hide Program Stages" : "View Program Stages"}
            </span>
            <span
              className={`text-xl font-bold leading-none transition-all duration-200 ease-in-out group-hover:translate-y-0.5 ${
                isExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <ArrowDown className="size-5" aria-hidden="true" />
            </span>
          </button>
        </div>

        <div
          id="featured-program-stages"
          aria-hidden={!isExpanded}
          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="relative mt-8 grid gap-0 pl-10 lg:pl-0">
              {/* The vertical rail. The filled segment grows with scroll
                  progress to visualize "a clear sense of progression". */}
              <div
                className="absolute left-4 top-0 h-full w-px bg-brand-white/15 lg:left-1/2 lg:-translate-x-1/2"
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
                const badgeNumber = String(index + 1).padStart(2, "0");
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={stage.id}
                    ref={(el) => {
                      stageRefs.current[index] = el;
                    }}
                    data-index={index}
                    className="relative grid min-h-[190px] grid-cols-1 items-start py-6 lg:grid-cols-2 lg:items-center lg:py-12"
                  >
                    {/* Numbered node stays on the rail at every breakpoint. */}
                    <span
                      className={`absolute -left-11 top-6 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-brand-navy bg-brand-red text-xs font-bold text-brand-white shadow-[0_0_0_1px_rgba(232,70,47,0.35)] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                      aria-hidden="true"
                    >
                      {badgeNumber}
                    </span>

                    <div
                      className={`max-w-xl pl-4 lg:pl-0 ${
                        isLeft
                          ? "lg:col-start-1 lg:justify-self-end lg:pr-16 lg:text-right"
                          : "lg:col-start-2 lg:pl-16 lg:text-left"
                      }`}
                    >
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
                          isActive
                            ? "text-brand-white/85 opacity-100"
                            : "text-brand-white/60 opacity-70"
                        }`}
                      >
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
