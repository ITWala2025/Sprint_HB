"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const videoId = "dManUjTSO7o";

const statistics = [
  {
    metric: "20–30+ Years",
    label: "Combined Industry Leadership",
  },
  {
    metric: "Day-1 Ready",
    label: "Production-Aligned Training",
  },
  {
    metric: "360° Approach",
    label: "Technical & Communication Mastery",
  },
];

export default function SmeVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      aria-labelledby="sme-video-heading"
      className="sprint-section bg-brand-white py-10 md:py-14"
      style={{ backgroundImage: "none" }}
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <header>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-red">
            INDUSTRY ADVISORY &amp; SME PERSPECTIVES
          </p>
          <h2
            id="sme-video-heading"
            className="mt-2.5 text-center text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl"
          >
            What Global IT Leaders Say About SPRINT
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Senior technology leaders with 20 to 30+ years of industry
            experience share candid insights on campus hiring gaps and why
            practical, day-one readiness sets SPRINT graduates apart.
          </p>
        </header>

        <div className="mt-8 sm:mt-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-[#011f3e] shadow-[0_24px_60px_-15px_rgba(1,31,62,0.20)]">
            {isPlaying ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Industry Expert (SME) Feedback on SPRINT Training | SPRINT"
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
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#011f3e]/80 via-black/15 to-transparent"
                />
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label="Play the SPRINT industry expert roundtable"
                  className="sprint-focus absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-brand-red hover:bg-brand-red sm:h-20 sm:w-20"
                >
                  <Play size={28} fill="currentColor" aria-hidden="true" />
                </button>
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-4 pb-4 text-xs font-medium text-white sm:px-6 sm:pb-6 sm:text-sm">
                  <span>SME Roundtable • 03:18</span>
                  <span>20–30+ Years Combined Leadership</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 border-y border-slate-200/80 py-6">
          <div className="grid grid-cols-1 divide-y divide-slate-200/80 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {statistics.map(({ metric, label }) => (
              <div key={metric} className="py-4 sm:py-0">
                <p className="text-xl font-bold text-brand-navy sm:text-2xl">
                  {metric}
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
