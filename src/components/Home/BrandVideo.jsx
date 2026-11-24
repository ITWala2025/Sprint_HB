"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  CodeXml,
  MapPin,
  Play,
  Sparkles,
  UsersRound,
} from "lucide-react";

const pillars = [
  {
    number: "01",
    title: "Zero-Theory Classrooms",
    description:
      "Most graduates know syntax, yet few know how real software ships. Step inside SPRINT's Hazaribagh engineering floor where every session runs like an actual product sprint.",
    icon: CodeXml,
    pillClassName: "bg-amber-400 text-white",
    iconClassName: "text-amber-600",
    activeClassName:
      "border-amber-300 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.18)]",
  },
  {
    number: "02",
    title: "20+ Yrs Practitioner Mentors",
    description:
      "Train directly under working software architects and engineers with two decades of real production experience.",
    icon: UsersRound,
    pillClassName: "bg-sky-500 text-white",
    iconClassName: "text-sky-600",
    activeClassName:
      "border-sky-300 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.18)]",
  },
  {
    number: "03",
    title: "Production-Grade Code Reviews",
    description:
      "Build, deploy, and ship real cloud, AI, and full-stack systems with corporate-level feedback.",
    icon: ClipboardCheck,
    pillClassName: "bg-teal-500 text-white",
    iconClassName: "text-teal-600",
    activeClassName:
      "border-teal-300 shadow-[0_10px_30px_-10px_rgba(20,184,166,0.18)]",
  },
];

const videoId = "dVzpvw9Z8Tw";

export default function BrandVideo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      aria-labelledby="brand-video-heading"
      className="brand-video-section relative bg-brand-white pt-4 pb-8 md:pt-6 md:pb-12"
    >
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-8 top-2 hidden grid-cols-6 gap-1.5 text-slate-200 lg:grid"
        >
          {Array.from({ length: 24 }, (_, index) => (
            <span key={index} className="size-1.5 rounded-full bg-current" />
          ))}
        </div>

        <header className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            NO LECTURES. PURE EXECUTION.
          </p>
          <h2
            id="brand-video-heading"
            className="mt-2.5 text-center text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-[42px]"
          >
            We Do Not Teach, We Empower.
          </h2>
        </header>

        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex min-w-0 flex-col gap-2.5 lg:col-span-5 sm:gap-3">
            {pillars.map((pillar, index) => {
              const isActive = activeIndex === index;
              const PillarIcon = pillar.icon;
              const panelId = `brand-video-pillar-${pillar.number}`;

              return (
                <article
                  key={pillar.number}
                  className={`min-w-0 cursor-pointer rounded-2xl border bg-white p-4 transition-all duration-300 motion-reduce:transition-none sm:p-5 ${
                    isActive
                      ? pillar.activeClassName
                      : "border-slate-200 shadow-[0_4px_14px_rgba(30,55,90,0.06)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    onClick={() => setActiveIndex(index)}
                    className="sprint-focus flex w-full items-center gap-3 text-left sm:gap-4"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold shadow-sm sm:size-12 ${pillar.pillClassName}`}
                    >
                      {pillar.number}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-extrabold leading-snug tracking-tight text-brand-navy sm:text-base">
                      {pillar.title}
                    </span>
                    <PillarIcon
                      aria-hidden="true"
                      className={`size-5 shrink-0 sm:size-6 ${pillar.iconClassName}`}
                      strokeWidth={1.8}
                    />
                  </button>

                  <div
                    id={panelId}
                    hidden={!isActive}
                    className="animate-[brandVideoReveal_.3s_ease-out_both] pl-[3.25rem] pt-3 sm:pl-16"
                  >
                    <p className="text-sm leading-relaxed text-slate-600">
                      {pillar.description}
                    </p>
                    {index === 0 && (
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="sprint-focus mt-3 text-left text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700"
                      >
                        Watch Campus Walkthrough →
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="relative isolate lg:col-span-7">
            <div
              aria-hidden="true"
              className="absolute -inset-2 -z-10 -rotate-2 rounded-3xl bg-gradient-to-tr from-[#011f3e] via-sky-500/80 to-cyan-400/80 opacity-90 sm:-inset-3"
            />
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/40 bg-[#011f3e] shadow-2xl">
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="SPRINT | We Do Not Teach, We Empower — Official Virtual Campus Tour"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <>
                  <img
                    src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#011f3e]/60 via-[#011f3e]/10 to-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    aria-label="Play the official SPRINT virtual campus tour"
                    className="sprint-focus absolute left-1/2 top-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/25 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-brand-red sm:size-[4.5rem]"
                  >
                    <Play size={24} fill="currentColor" aria-hidden="true" />
                  </button>

                  <div className="absolute left-2 top-2 flex max-w-[85%] items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-2.5 py-2 shadow-lg backdrop-blur-sm sm:left-4 sm:top-4 sm:gap-3 sm:px-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 sm:size-10">
                      <Sparkles size={18} aria-hidden="true" />
                    </span>
                    <span>
                      <strong className="block text-xs leading-tight text-brand-navy sm:text-sm">
                        Skills + Confidence
                      </strong>
                      <small className="mt-0.5 block text-[10px] leading-tight text-slate-600 sm:text-xs">
                        Complete transformation
                      </small>
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 flex max-w-[90%] items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-2.5 py-2 shadow-lg backdrop-blur-sm sm:bottom-4 sm:left-4 sm:gap-3 sm:px-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700 sm:size-10">
                      <MapPin size={18} aria-hidden="true" />
                    </span>
                    <span>
                      <strong className="block text-xs leading-tight text-brand-navy sm:text-sm">
                        Hazaribagh Campus
                      </strong>
                      <small className="mt-0.5 block text-[10px] leading-tight text-slate-600 sm:text-xs">
                        Official Film <span aria-hidden="true">•</span> 01:07
                      </small>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes brandVideoReveal {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .brand-video-section *,
          .brand-video-section *::before,
          .brand-video-section *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
