"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Blocks, BriefcaseBusiness, Code2, Workflow } from "lucide-react";
import { featuredCourse, featuredProgramStages } from "@/data/data";

const stageIllustrations = [Code2, Blocks, Workflow, BriefcaseBusiness];
const illustrationPanels = [
  "bg-[linear-gradient(135deg,#dceeff,#f4f9ff_58%,#e5f2ff)]",
  "bg-[linear-gradient(135deg,#e5f4ff,#f7fbff_58%,#e2f3f2)]",
  "bg-[linear-gradient(135deg,#e2eeff,#f7f9ff_58%,#eeeaff)]",
  "bg-[linear-gradient(135deg,#e4f2ff,#f8fbff_58%,#fff0f2)]",
];

export default function FeaturedProgram() {
  const stageRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
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
  }, []);

  return (
    <section
      className="sprint-section relative isolate overflow-hidden bg-[linear-gradient(145deg,var(--color-brand-blue-light)_0%,#f5faff_48%,#dcecff_100%)] py-12 text-brand-navy sm:py-16 lg:py-20"
      aria-labelledby="featured-program-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(11,99,182,0.18),transparent_58%),radial-gradient(ellipse_at_8%_12%,rgba(248,21,41,0.045),transparent_35%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-6">
        <header className="mx-auto w-full max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Featured program
          </p>
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

        <div className="relative mx-auto mt-10 max-w-6xl sm:mt-14">
          <div
            className="absolute bottom-6 left-4 top-6 w-px bg-brand-blue/20 lg:left-1/2 lg:-translate-x-1/2"
            aria-hidden="true"
          >
            <div
              className="w-px bg-brand-blue transition-[height] duration-500 ease-out"
              style={{
                height: `${((activeIndex + 1) / featuredProgramStages.length) * 100}%`,
              }}
            />
          </div>

          <div className="relative space-y-5 lg:space-y-2">
            {featuredProgramStages.map((stage, index) => {
              const isActive = index === activeIndex;
              const badgeNumber = String(index + 1).padStart(2, "0");
              const isLeft = index % 2 === 0;
              const StageIllustration =
                stageIllustrations[index % stageIllustrations.length] ?? Code2;

              return (
                <div
                  key={stage.id}
                  ref={(element) => {
                    stageRefs.current[index] = element;
                  }}
                  data-index={index}
                  className="relative grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 py-3 lg:min-h-[260px] lg:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] lg:gap-x-5 lg:py-8"
                >
                  <span
                    className={`z-10 col-start-1 row-start-1 grid size-10 place-items-center rounded-full border-4 border-white text-xs font-bold text-white shadow-[0_3px_12px_rgba(1,31,62,0.18)] ring-1 transition-colors duration-300 md:size-12 lg:col-start-2 ${
                      isActive
                        ? "bg-brand-red ring-brand-red/20"
                        : "bg-brand-blue ring-brand-blue/15"
                    }`}
                    aria-hidden="true"
                  >
                    {badgeNumber}
                  </span>

                  <article
                    className={`sprint-focus col-start-2 row-start-1 min-w-0 overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 md:max-w-[640px] lg:max-w-[470px] ${
                      isLeft
                        ? "lg:col-start-1 lg:justify-self-end"
                        : "lg:col-start-3 lg:justify-self-start"
                    } ${
                      isActive
                        ? "border-brand-blue/35 shadow-brand-card ring-1 ring-brand-blue/10"
                        : "border-brand-blue/10 shadow-[0_10px_28px_rgba(1,31,62,0.07)]"
                    }`}
                  >
                    <div
                      className={`relative isolate flex h-36 items-center justify-center overflow-hidden sm:h-40 md:h-44 ${illustrationPanels[index % illustrationPanels.length]}`}
                      aria-hidden={stage.image ? undefined : "true"}
                    >
                      {stage.image ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={stage.image}
                            alt={stage.imageAlt ?? `${stage.title} illustration`}
                            fill
                            sizes="(max-width: 768px) 100vw, 470px"
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="absolute size-36 rounded-full border border-brand-blue/10 sm:size-44" />
                          <span className="absolute size-24 rounded-full border border-brand-blue/10 sm:size-32" />
                          <span className="absolute right-[18%] top-5 size-3 rounded-sm bg-brand-red/35" />
                          <span className="absolute bottom-6 left-[20%] size-2 rounded-full bg-brand-blue/40" />
                          <span className="relative grid size-20 place-items-center rounded-[1.35rem] border border-white/80 bg-white/65 text-brand-blue shadow-[0_12px_28px_rgba(1,31,62,0.1)] sm:size-24">
                            <StageIllustration className="size-10 sm:size-12" strokeWidth={1.5} />
                          </span>
                        </>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 md:p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-red">
                        {stage.stageLabel}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold text-brand-navy sm:text-2xl">
                        {stage.title}
                      </h3>
                      <p className="mt-3 max-w-prose text-sm leading-relaxed text-brand-text-secondary sm:text-base">
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
