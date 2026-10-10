"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Blocks,
  Bot,
  BriefcaseBusiness,
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
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sprint-section relative isolate overflow-hidden bg-[linear-gradient(145deg,var(--color-brand-blue-light)_0%,#f5faff_48%,#dcecff_100%)] py-12 text-brand-navy sm:py-16 lg:py-20"
      aria-labelledby="featured-program-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(11,99,182,0.18),transparent_58%),radial-gradient(ellipse_at_8%_12%,rgba(248,21,41,0.045),transparent_35%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-6">
        <header className="mx-auto w-full max-w-2xl text-center">
          {/* <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Featured program
          </p> */}
          <h2
            id="featured-program-heading"
            className="mt-3 font-display text-3xl font-bold sm:text-4xl"
          >
            {featuredCourse.title}
          </h2>
          <p className="mt-4 leading-relaxed text-brand-text-secondary">
            {featuredCourse.shortDescription}
          </p>
        </header>

        <div className="relative mx-auto mt-10 max-w-6xl sm:mt-14 lg:mt-12">
          <div
            className="absolute bottom-6 left-5 top-6 w-px bg-brand-blue/20 md:left-6 lg:hidden"
            aria-hidden="true"
          >
            <div
              className={`h-full w-px origin-top bg-brand-blue transition-transform duration-[1800ms] ease-out motion-reduce:scale-y-100 motion-reduce:transition-none ${
                hasEntered ? "scale-y-100" : "scale-y-0"
              }`}
            />
          </div>

          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="featured-program-timeline-gradient" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--color-brand-blue)" />
                <stop offset="52%" stopColor="var(--color-brand-red)" />
                <stop offset="100%" stopColor="var(--color-brand-blue)" />
              </linearGradient>
            </defs>
            <path
              d="M 83 350 C 167 350, 167 650, 250 650 S 333 350, 417 350 S 500 650, 583 650 S 667 350, 750 350 S 833 650, 917 650"
              stroke="rgba(11, 99, 182, 0.18)"
              strokeWidth="5"
              vectorEffect="non-scaling-stroke"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={hasEntered ? "0" : "1"}
              className="transition-[stroke-dashoffset] duration-[1600ms] ease-out motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0]"
            />
            <path
              d="M 83 350 C 167 350, 167 650, 250 650 S 333 350, 417 350 S 500 650, 583 650 S 667 350, 750 350 S 833 650, 917 650"
              stroke="url(#featured-program-timeline-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={hasEntered ? "0" : "1"}
              className="transition-[stroke-dashoffset] duration-[1600ms] ease-out motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0]"
            />
          </svg>

          <div className="relative space-y-5 lg:grid lg:grid-cols-6 lg:grid-rows-[minmax(280px,auto)_14rem_minmax(280px,auto)] lg:gap-x-0 lg:space-y-0">
            {featuredProgramStages.map((stage, index) => {
              const isUpper = index % 2 === 0;
              const StageIllustration = stageIllustrations[index] ?? Code2;

              return (
                <div
                  key={stage.id}
                  data-index={index}
                  className={`relative grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 py-3 transition-[opacity,translate,scale] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none lg:col-span-1 lg:grid-cols-1 lg:px-0 lg:py-0 ${
                    isUpper
                      ? "lg:row-start-1 lg:flex lg:items-end"
                      : "lg:row-start-3 lg:flex lg:items-start"
                  } ${desktopStageColumns[index] ?? ""} ${
                    hasEntered
                      ? "translate-y-0 scale-100 opacity-100"
                      : "translate-y-[18px] scale-[0.9] opacity-0"
                  }`}
                  style={{ transitionDelay: `${1600 + index * 225}ms` }}
                >
                  <span
                    className={`z-10 col-start-1 row-start-1 grid size-10 place-items-center rounded-full border-4 border-white text-xs font-bold text-white shadow-[0_3px_12px_rgba(1,31,62,0.18)] ring-1 transition-colors duration-300 md:size-12 lg:absolute lg:left-1/2 lg:size-10 lg:-translate-x-1/2 ${
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

                  <article
                    className={`sprint-focus col-start-2 row-start-1 min-w-0 overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 md:max-w-[640px] lg:col-start-1 lg:w-full lg:max-w-none ${
                      index === 0
                        ? "border-brand-blue/35 shadow-brand-card ring-1 ring-brand-blue/10"
                        : "border-brand-blue/10 shadow-[0_10px_28px_rgba(1,31,62,0.07)]"
                    }`}
                  >
                    <div
                      className={`relative isolate flex h-36 items-center justify-center overflow-hidden sm:h-40 md:h-44 lg:h-28 ${illustrationPanels[index % illustrationPanels.length]}`}
                      aria-hidden={stage.image ? undefined : "true"}
                    >
                      {stage.image ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={stage.image}
                            alt={stage.imageAlt ?? `${stage.title} illustration`}
                            fill
                            sizes="(max-width: 1023px) 100vw, 200px"
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="absolute size-36 rounded-full border border-brand-blue/10 sm:size-44 lg:size-36" />
                          <span className="absolute size-24 rounded-full border border-brand-blue/10 sm:size-32 lg:size-24" />
                          <span className="absolute right-[18%] top-5 size-3 rounded-sm bg-brand-red/35" />
                          <span className="absolute bottom-6 left-[20%] size-2 rounded-full bg-brand-blue/40" />
                          <span className="relative grid size-20 place-items-center rounded-[1.35rem] border border-white/80 bg-white/65 text-brand-blue shadow-[0_12px_28px_rgba(1,31,62,0.1)] sm:size-24 lg:size-16">
                            <StageIllustration className="size-10 sm:size-12 lg:size-8" strokeWidth={1.5} />
                          </span>
                        </>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 md:p-7 lg:p-3.5">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-red-accessible lg:text-[0.625rem] lg:tracking-[0.12em]">
                        {stage.stageLabel}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold text-brand-navy sm:text-2xl lg:mt-1.5 lg:text-base lg:leading-tight">
                        {stage.title}
                      </h3>
                      <p className="mt-3 max-w-prose text-sm leading-relaxed text-brand-text-secondary sm:text-base lg:mt-2 lg:text-xs lg:leading-snug">
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
