
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Blocks,
  Bot,
  Cloud,
  Code2,
  Workflow,
} from "lucide-react";
import { featuredCourse, featuredProgramStages } from "@/data/data";

const stageIllustrations = [
  Code2,
  Cloud,
  Blocks,
  Bot,
  Workflow,
  BadgeCheck,
];

const illustrationPanels = [
  "bg-[linear-gradient(135deg,#dceeff,#f4f9ff_58%,#e5f2ff)]",
  "bg-[linear-gradient(135deg,#e5f4ff,#f7fbff_58%,#e2f3f2)]",
  "bg-[linear-gradient(135deg,#e2eeff,#f7f9ff_58%,#eeeaff)]",
  "bg-[linear-gradient(135deg,#e4f2ff,#f8fbff_58%,#fff0f2)]",
  "bg-[linear-gradient(135deg,#e5f4ff,#f7fbff_58%,#e2f3f2)]",
  "bg-[linear-gradient(135deg,#e2eeff,#f7f9ff_58%,#eeeaff)]",
];

const desktopStageColumns = [
  "lg:col-start-1",
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
  "lg:col-start-6",
];

// Compact wave timeline coordinates
const timelineSegments = [
  "M 83 420 C 167 420, 167 580, 250 580",
  "M 250 580 C 333 580, 333 420, 417 420",
  "M 417 420 C 500 420, 500 580, 583 580",
  "M 583 580 C 667 580, 667 420, 750 420",
  "M 750 420 C 833 420, 833 580, 917 580",
];

export default function FeaturedProgram() {
  const sectionRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || typeof IntersectionObserver === "undefined") {
      setHasEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sprint-section relative isolate overflow-hidden bg-[linear-gradient(145deg,var(--color-brand-blue-light)_0%,#f5faff_48%,#dcecff_100%)] pt-7 pb-9 text-brand-navy sm:pt-9 sm:pb-11 lg:pt-9 lg:pb-10"
      aria-labelledby="featured-program-heading"
    >
      {/* Background Decoration */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(11,99,182,0.18),transparent_58%),radial-gradient(ellipse_at_8%_12%,rgba(248,21,41,0.045),transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-6">

        {/* Section Heading */}
        <header className="mx-auto w-full max-w-2xl text-center">
          <h2
            id="featured-program-heading"
            className="font-display text-3xl font-bold sm:text-4xl lg:text-[2rem]"
          >
            {featuredCourse.title}
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-text-secondary sm:text-base">
            {featuredCourse.shortDescription}
          </p>
        </header>

        {/* Timeline Container */}
        <div className="relative mx-auto mt-8 max-w-6xl sm:mt-9 lg:mt-7">

          {/* Mobile Vertical Timeline */}
          <div
            className="absolute bottom-6 left-5 top-6 w-px bg-brand-blue/20 md:left-6 lg:hidden"
            aria-hidden="true"
          >
            <div
              className={`h-full w-px origin-top bg-brand-blue transition-transform duration-[3600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:scale-y-100 motion-reduce:transition-none ${
                hasEntered ? "scale-y-100" : "scale-y-0"
              }`}
            />
          </div>

          {/* Desktop Animated Wave */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="featured-program-timeline-gradient"
                x1="0"
                x2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-brand-blue)"
                />
                <stop
                  offset="52%"
                  stopColor="var(--color-brand-red)"
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand-blue)"
                />
              </linearGradient>
            </defs>

            {timelineSegments.map((segment, index) => (
              <g key={segment} data-timeline-segment={index}>
                <path
                  d={segment}
                  stroke="rgba(11, 99, 182, 0.18)"
                  strokeWidth="5"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={hasEntered ? "0" : "1"}
                  className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0]"
                  style={{
                    transitionDelay: `${300 + index * 600}ms`,
                  }}
                />

                <path
                  d={segment}
                  stroke="url(#featured-program-timeline-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={hasEntered ? "0" : "1"}
                  className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0]"
                  style={{
                    transitionDelay: `${300 + index * 600}ms`,
                  }}
                />
              </g>
            ))}
          </svg>

          {/* Stage Cards */}
          <div className="relative space-y-5 lg:grid lg:grid-cols-6 lg:grid-rows-[minmax(200px,auto)_76px_minmax(200px,auto)] lg:gap-x-0 lg:space-y-0">

            {featuredProgramStages.map((stage, index) => {
              const isUpper = index % 2 === 0;
              const StageIllustration =
                stageIllustrations[index] ?? Code2;

              return (
                <div
                  key={stage.id}
                  data-index={index}
                  className={`relative grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 py-3 transition-[opacity,translate,scale] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none lg:col-span-1 lg:grid-cols-1 lg:px-0 lg:py-0 ${
                    isUpper
                      ? "lg:row-start-1 lg:flex lg:items-end"
                      : "lg:row-start-3 lg:flex lg:items-start"
                  } ${desktopStageColumns[index] ?? ""} ${
                    hasEntered
                      ? "translate-y-0 scale-100 opacity-100"
                      : "translate-y-3 scale-[0.96] opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${index * 600}ms`,
                  }}
                >

                  {/* Stage Number */}
                  <span
                    className={`z-10 col-start-1 row-start-1 grid size-10 place-items-center rounded-full border-4 border-white text-xs font-bold text-white shadow-[0_3px_12px_rgba(1,31,62,0.18)] ring-1 transition-colors duration-300 md:size-12 lg:absolute lg:left-1/2 lg:size-9 lg:-translate-x-1/2 ${
                      index === 0
                        ? "bg-brand-red-accessible ring-brand-red/20"
                        : "bg-brand-blue ring-brand-blue/15"
                    } ${
                      isUpper
                        ? "lg:bottom-0 lg:translate-y-1/2"
                        : "lg:top-0 lg:-translate-y-1/2"
                    }`}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Card */}
                  <article
                    className={`sprint-focus col-start-2 row-start-1 min-w-0 overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 md:max-w-[640px] lg:col-start-1 lg:w-full lg:max-w-none ${
                      index === 0
                        ? "border-brand-blue/35 shadow-brand-card ring-1 ring-brand-blue/10"
                        : "border-brand-blue/10 shadow-[0_10px_28px_rgba(1,31,62,0.07)]"
                    }`}
                  >

                    {/* Card Illustration */}
                    <div
                      className={`relative isolate flex h-36 items-center justify-center overflow-hidden sm:h-40 md:h-44 lg:h-[72px] ${
                        illustrationPanels[
                          index % illustrationPanels.length
                        ]
                      }`}
                      aria-hidden={stage.image ? undefined : "true"}
                    >
                      {stage.image ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={stage.image}
                            alt={
                              stage.imageAlt ??
                              `${stage.title} illustration`
                            }
                            fill
                            sizes="(max-width: 1023px) 100vw, 200px"
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="absolute size-36 rounded-full border border-brand-blue/10 sm:size-44 lg:size-28" />

                          <span className="absolute size-24 rounded-full border border-brand-blue/10 sm:size-32 lg:size-20" />

                          <span className="absolute right-[18%] top-5 size-3 rounded-sm bg-brand-red/35" />

                          <span className="absolute bottom-6 left-[20%] size-2 rounded-full bg-brand-blue/40" />

                          <span className="relative grid size-20 place-items-center rounded-[1.35rem] border border-white/80 bg-white/65 text-brand-blue shadow-[0_12px_28px_rgba(1,31,62,0.1)] sm:size-24 lg:size-12">
                            <StageIllustration
                              className="size-10 sm:size-12 lg:size-6"
                              strokeWidth={1.5}
                            />
                          </span>
                        </>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 md:p-7 lg:p-3">

                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-red-accessible lg:text-[0.625rem] lg:tracking-[0.12em]">
                        {stage.stageLabel}
                      </p>

                      <h3 className="mt-2 font-display text-xl font-semibold text-brand-navy sm:text-2xl lg:mt-1 lg:text-[0.875rem] lg:leading-[1.2]">
                        {stage.title}
                      </h3>

                      <p className="mt-3 max-w-prose text-sm leading-relaxed text-brand-text-secondary sm:text-base lg:mt-1.5 lg:text-[0.6875rem] lg:leading-[1.4]">
                        {stage.description}
                      </p>
                    </div>

                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
