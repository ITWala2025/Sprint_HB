import Link from "next/link";

const EMAIL = "info@sprint.naturalelements.co.in";

/**
 * Submit Your Application — Simple mailto CTA block.
 * Replaces the full form with a clean email action.
 */
export default function ApplicationForm() {
  const mailtoLink = `mailto:${EMAIL}?subject=${encodeURIComponent("SPRINT Careers Application")}`;

  return (
    <section id="application-form" className="bg-brand-white py-24" aria-labelledby="application-form-heading">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full bg-brand-red-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Apply Now
          </p>
          <h2 id="application-form-heading" className="mt-4 font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            Submit Your Application
          </h2>
          <p className="mt-4 text-lg text-brand-text-secondary">
            Send your resume here
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={mailtoLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-border bg-white px-8 py-4 text-base font-semibold text-brand-navy transition-colors hover:border-brand-red hover:text-brand-red hover:bg-brand-red-light w-full sm:w-auto"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email your resume
            </a>
            <Link
              href="#open-positions"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark w-full sm:w-auto"
            >
              View Open Roles
            </Link>
          </div>

          <p className="mt-6 text-sm text-brand-text-muted max-w-xl mx-auto">
            Please mention the <span className="font-semibold text-brand-navy">role title</span> in the subject line
            (e.g., "Application for Agentic AI Developer") so we can route your application quickly.
          </p>
        </div>
      </div>
    </section>
  );
}