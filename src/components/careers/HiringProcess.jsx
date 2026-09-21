import { hiringProcessSteps } from "@/data/careers";

/**
 * Hiring Process — Dark navy section with 4-step visual guide.
 * Circles perfectly aligned with step titles, connecting line through center.
 */
export default function HiringProcess() {
  return (
    <section
      className="relative bg-brand-navy py-24"
      aria-labelledby="hiring-process-heading"
    >
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
          <h2
            id="hiring-process-heading"
            className="mt-4 font-display text-3xl font-bold text-brand-white sm:text-4xl"
          >
            Transparent, Respectful, Fast
          </h2>
          <p className="mt-4 text-lg text-brand-white/70">
            No ghosting, no endless rounds. Our process is designed to be
            completed in 2–3 weeks with clear communication at every stage.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            className="absolute bottom-0 left-5 top-0 w-px bg-brand-white/15 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-10 md:space-y-12">
            {hiringProcessSteps.map((step, index) => (
              <div
                key={step.id}
                className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-8"
              >
                <div
                  className="col-start-1 row-start-1 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-brand-navy bg-brand-red md:col-start-2 md:size-14"
                  aria-hidden="true"
                >
                  <span className="font-display text-base font-bold text-brand-white md:text-2xl">
                    {step.number}
                  </span>
                </div>

                {/* Step content */}
                <div
                  className={`col-start-2 row-start-1 min-w-0 max-w-md ${index % 2 === 0 ? "text-left md:col-start-1 md:justify-self-end md:text-right" : "text-left md:col-start-3 md:justify-self-start"}`}
                >
                  <h3 className="font-display text-xl font-semibold text-brand-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-brand-white/70">
                    {step.description}
                  </p>
                </div>
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
            <svg
              className="size-4"
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
