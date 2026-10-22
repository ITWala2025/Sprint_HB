
"use client";

import { useEffect, useRef, useState } from "react";
import { hiringProcessSteps } from "@/data/careers";

const stepIcons = [
  <svg key="apply" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h6" />
  </svg>,
  <svg key="screening" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6V20" />
  </svg>,
  <svg key="interview" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M8 21h8M12 17v4M8 10l2 2 5-5" />
  </svg>,
  <svg key="onboarding" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <path d="M5 19 19 5M8 5h11v11" />
    <path d="M4 12v7a1 1 0 0 0 1 1h7" />
  </svg>,
];

export default function HiringProcess() {
  const sectionRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setHasEntered(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
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
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`hiring-process-section relative overflow-hidden bg-[#061d3d] py-14 text-white sm:py-16 lg:py-16 ${
        hasEntered ? "is-visible" : ""
      }`}
      aria-labelledby="hiring-process-heading"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(239,62,67,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(11,99,182,0.16),transparent_50%)]"
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-rose-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef3e43]">
            Hiring Process
          </span>

          <h2
            id="hiring-process-heading"
            className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            Transparent, Respectful, Fast
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            No ghosting, no endless rounds. Our process is designed to be
            completed in 2–3 weeks with clear communication at every stage.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto mt-10 max-w-5xl lg:mt-12">
          {/* Desktop connecting line */}
          <div
            aria-hidden="true"
            className="process-line absolute left-[12.5%] right-[12.5%] top-6 hidden h-px origin-left bg-white/30 lg:block"
          />

          {/* Mobile connecting line */}
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-5 top-5 w-px bg-white/25 lg:hidden"
          />

          <div className="grid gap-8 lg:grid-cols-4 lg:gap-5">
            {hiringProcessSteps.map((step, index) => (
              <article
                key={step.id}
                className="process-step group relative grid grid-cols-[44px_minmax(0,1fr)] gap-4 lg:grid-cols-1 lg:gap-0 lg:text-center"
                style={{ "--step-index": index }}
              >
                {/* Number */}
                <div className="process-number relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#061d3d] bg-[#ef233c] text-sm font-extrabold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-300 group-hover:shadow-[0_0_0_6px_rgba(239,35,60,0.16)] lg:mx-auto lg:h-12 lg:w-12">
                  {String(step.number ?? index + 1).padStart(2, "0")}
                </div>

                {/* Step content */}
                <div className="min-w-0 rounded-xl p-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white/[0.04] lg:mt-5 lg:p-3">
                  <div className="mb-2 flex items-center gap-2 lg:justify-center">
                    <span className="text-white/80">
                      {stepIcons[index % stepIcons.length]}
                    </span>

                    <h3 className="font-display text-base font-bold text-white sm:text-lg">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-white/75 lg:text-[13px] lg:leading-5">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center lg:mt-9">
          <a
            href="mailto:info@sprint.naturalelements.co.in?subject=Careers%20Application%20-%20SPRINT&body=Name%3A%20%0ARole%20Applied%20For%3A%20%0AResume%2FPortfolio%20Link%3A%20"
            className="process-cta relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#ef233c] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#d91f35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span className="relative z-10">Start Your Application</span>
            <svg
              className="relative z-10 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
