
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
import {
  featuredCourse,
  featuredProgramStages,
} from "@/data/data";

// Change this value to adjust wave height
const WAVE_GAP = 120;

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

// Generate SVG wave dynamically
function createWavePath(start, end) {
  const dx = end.x - start.x;

  // Controls the smoothness of the curve
  const controlOffset = dx * 0.42;

  return `
    M ${start.x} ${start.y}
    C ${start.x + controlOffset} ${start.y},
      ${end.x - controlOffset} ${end.y},
      ${end.x} ${end.y}
  `;
}

export default function FeaturedProgram() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const gridRef = useRef(null);

  // References to each numbered node
  const nodeRefs = useRef([]);

  const [hasEntered, setHasEntered] = useState(false);

  // Stores actual measured SVG coordinates
  const [geometry, setGeometry] = useState(null);

  // Section entrance animation
  useEffect(() => {
    const section = sectionRef.current;

    if (
      !section ||
      typeof IntersectionObserver === "undefined"
    ) {
      setHasEntered(true);
      return;
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

  // Dynamically measure the timeline and numbered nodes
  useEffect(() => {
    const timeline = timelineRef.current;
    const grid = gridRef.current;

    if (!timeline || !grid) return;

    let frameId = null;

    const measureTimeline = () => {
      if (window.innerWidth < 1024) {
        setGeometry(null);
        return;
      }

      const containerRect =
        timeline.getBoundingClientRect();

      const nodes = nodeRefs.current.slice(
        0,
        featuredProgramStages.length
      );

      if (
        !containerRect.width ||
        !containerRect.height ||
        nodes.some((node) => !node)
      ) {
        return;
      }

      // Measure the real center of every numbered node
      const points = nodes.map((node) => {
        const rect = node.getBoundingClientRect();

        return {
          x:
            rect.left -
            containerRect.left +
            rect.width / 2,
          y:
            rect.top -
            containerRect.top +
            rect.height / 2,
        };
      });

      // Build segments between consecutive nodes
      const paths = points.slice(0, -1).map(
        (point, index) =>
          createWavePath(point, points[index + 1])
      );

      setGeometry((previous) => {
        const next = {
          width: containerRect.width,
          height: containerRect.height,
          paths,
        };

        // Avoid unnecessary updates
        if (
          previous &&
          previous.width === next.width &&
          previous.height === next.height &&
          previous.paths.every(
            (path, index) => path === paths[index]
          ) &&
          previous.paths.length === paths.length
        ) {
          return previous;
        }

        return next;
      });
    };

    // Batch measurements into animation frames
    const scheduleMeasurement = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        frameId = null;
        measureTimeline();
      });
    };

    // Monitor container, grid and cards
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleMeasurement)
        : null;

    if (resizeObserver) {
      resizeObserver.observe(timeline);
      resizeObserver.observe(grid);

      nodeRefs.current.forEach((node) => {
        if (node) resizeObserver.observe(node);
      });

      grid.querySelectorAll("article").forEach(
        (card) => resizeObserver.observe(card)
      );
    }

    window.addEventListener(
      "resize",
      scheduleMeasurement
    );

    // Recalculate after web fonts load
    if (document.fonts) {
      document.fonts.ready.then(scheduleMeasurement);
    }

    scheduleMeasurement();

    return () => {
      resizeObserver?.disconnect();

      window.removeEventListener(
        "resize",
        scheduleMeasurement
      );

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="featured-program-heading"
      className="sprint-section relative isolate overflow-hidden bg-[linear-gradient(145deg,var(--color-brand-blue-light)_0%,#f5faff_48%,#dcecff_100%)] pt-7 pb-9 text-brand-navy sm:pt-9 sm:pb-11 lg:pt-9 lg:pb-10"
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(11,99,182,0.18),transparent_58%),radial-gradient(ellipse_at_8%_12%,rgba(248,21,41,0.045),transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-6">
        {/* Heading */}
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

        {/* Timeline */}
        <div
          ref={timelineRef}
          className="relative mx-auto mt-8 max-w-6xl sm:mt-9 lg:mt-7"
        >
          {/* Mobile Vertical Line */}
          <div
            className="absolute bottom-6 left-5 top-6 w-px bg-brand-blue/20 md:left-6 lg:hidden"
            aria-hidden="true"
          >
            <div
              className={`h-full w-px origin-top bg-brand-blue transition-transform duration-[3600ms] ease-out motion-reduce:transition-none ${
                hasEntered
                  ? "scale-y-100"
                  : "scale-y-0"
              }`}
            />
          </div>

          {/* Dynamic Desktop SVG */}
          {geometry && (
            <svg
              className="pointer-events-none absolute left-0 top-0 hidden overflow-visible lg:block"
              width={geometry.width}
              height={geometry.height}
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="featured-program-timeline-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-brand-blue)"
                  />

                  <stop
                    offset="50%"
                    stopColor="var(--color-brand-red)"
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--color-brand-blue)"
                  />
                </linearGradient>
              </defs>

              {geometry.paths.map((path, index) => (
                <g key={index}>
                  {/* Soft background stroke */}
                  <path
                    d={path}
                    stroke="rgba(11,99,182,0.14)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={
                      hasEntered ? 0 : 1
                    }
                      className="transition-[stroke-dashoffset] duration-[800ms] ease-in-out motion-reduce:transition-none"                    style={{
                      transitionDelay: `${
                        index * 450
                      }ms`,
                    }}
                  />

                  {/* Main wave stroke */}
                  <path
                    d={path}
                    stroke="url(#featured-program-timeline-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={
                      hasEntered ? 0 : 1
                    }
                      className="transition-[stroke-dashoffset] duration-[800ms] ease-in-out motion-reduce:transition-none"                    style={{
                      transitionDelay: `${
                        index * 450
                      }ms`,
                    }}
                  />
                </g>
              ))}
            </svg>
          )}

          {/* Stage Grid */}
          <div
            ref={gridRef}
            className="featured-stage-grid relative space-y-5 lg:grid lg:grid-cols-6 lg:space-y-0"
            style={{
              "--wave-gap": `${WAVE_GAP}px`,
            }}
          >
            <style>{`
              @media (min-width: 1024px) {
                .featured-stage-grid {
                  grid-template-rows:
                    minmax(195px, auto)
                    var(--wave-gap)
                    minmax(195px, auto);
                }
              }
            `}</style>

            {/* Grid rows applied with CSS variable */}
            {featuredProgramStages.map(
              (stage, index) => {
                const isUpper = index % 2 === 0;

                const StageIllustration =
                  stageIllustrations[index] ??
                  Code2;

                return (
                  <div
                    key={stage.id}
                    data-index={index}
                    className={`relative grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 py-3 transition-[opacity,transform] duration-650 ease-out motion-reduce:transition-none lg:col-span-1 lg:grid-cols-1 lg:px-0 lg:py-0 lg:transform-none ${
                      isUpper
                        ? "lg:row-start-1 lg:flex lg:items-end"
                        : "lg:row-start-3 lg:flex lg:items-start"
                    } ${
                      desktopStageColumns[index] ??
                      ""
                    } ${
                        hasEntered
                          ? "translate-y-0 opacity-100"
                          : "translate-y-3 lg:translate-y-0 opacity-0"
                      }`}
                    style={{
                      transitionDelay: `${
                        index * 450
                      }ms`,
                    }}
                  >
                    {/* Numbered Node */}
                    <span
                      ref={(element) => {
                        nodeRefs.current[index] =
                          element;
                      }}
                      className={`z-10 col-start-1 row-start-1 grid size-10 place-items-center rounded-full border-4 border-white text-xs font-bold text-white shadow-[0_3px_12px_rgba(1,31,62,0.18)] ring-1 md:size-12 lg:absolute lg:left-1/2 lg:size-9 lg:-translate-x-1/2 ${
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
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    {/* Stage Card */}
                    <article
                      className={`sprint-focus col-start-2 row-start-1 min-w-0 overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 md:max-w-[640px] lg:col-start-1 lg:w-full lg:max-w-none ${
                        index === 0
                          ? "border-brand-blue/35 shadow-brand-card ring-1 ring-brand-blue/10"
                          : "border-brand-blue/10 shadow-[0_10px_28px_rgba(1,31,62,0.07)]"
                      }`}
                    >
                      {/* Illustration */}
                      <div
                        className={`relative isolate flex h-36 items-center justify-center overflow-hidden sm:h-40 md:h-44 lg:h-[72px] ${
                          illustrationPanels[
                            index %
                              illustrationPanels.length
                          ]
                        }`}
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
                              className="object-contain p-0 lg:scale-[1.45] transition-transform duration-300"
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

                        <h3 className="mt-2 font-display text-xl font-semibold text-brand-navy sm:text-2xl lg:mt-1 lg:text-[0.840rem] lg:leading-[1.2]">
                          {stage.title}
                        </h3>

                        <p className="mt-3 max-w-prose text-sm leading-relaxed text-brand-text-secondary sm:text-base lg:mt-1.5 lg:text-[0.6875rem] lg:leading-[1.4]">
                          {stage.description}
                        </p>
                      </div>
                    </article>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
