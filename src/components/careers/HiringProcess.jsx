import { hiringProcessSteps } from "@/data/careers";

/**
 * Hiring Process — Dark navy section with 4-step visual guide.
 * Circles perfectly aligned with step titles, connecting line through center.
 */
export default function HiringProcess() {
  return (
    <section className="relative bg-brand-navy py-24" aria-labelledby="hiring-process-heading">
      {/* Background gradient mesh */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgba(248,21,41,0.12),transparent_60%),radial-gradient(ellipse_50%_45%_at_80%_90%,rgba(11,99,182,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full bg-brand-red-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Hiring Process
          </p>
          <h2 id="hiring-process-heading" className="mt-4 font-display text-3xl font-bold text-brand-white sm:text-4xl">
            Transparent, Respectful, Fast
          </h2>
          <p className="mt-4 text-lg text-brand-white/70">
            No ghosting, no endless rounds. Our process is designed to be completed in 2–3 weeks
            with clear communication at every stage.
          </p>
        </div>

        <div className="mt-16 relative">
          {/* Vertical connecting line - runs through center of circles */}
          <div className="hidden lg:absolute lg:left-[calc(50%-12px)] lg:top-0 lg:h-full lg:w-[24px] lg:border-l lg:border-brand-white/15" aria-hidden="true" />

          <div className="space-y-16 lg:space-y-0">
            {hiringProcessSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:w-1/2 lg:pr-10 ${index % 2 === 1 ? "lg:ml-auto lg:pl-10 lg:pr-0" : ""}`}
              >
                {/* Step number circle - perfectly centered with connecting line */}
                <div className="relative flex size-24 shrink-0 items-center justify-center rounded-full bg-brand-red lg:absolute lg:left-[calc(50%-12px)] lg:-translate-x-1/2 lg:top-4" aria-hidden="true">
                  <span className="font-display text-2xl font-bold text-brand-white">
                    {step.number}
                  </span>
                </div>

                {/* Step content */}
                <div className={`w-full lg:w-auto ${index % 2 === 1 ? "text-right" : ""} pt-2`}>
                  <h3 className="font-display text-xl font-semibold text-brand-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-brand-white/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow between steps on mobile */}
                {index < hiringProcessSteps.length - 1 && (
                  <div className="lg:hidden flex items-center justify-center w-full py-4" aria-hidden="true">
                    <svg className="size-8 text-brand-white/30 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#application-form"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark"
          >
            Start Your Application
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}