import Link from "next/link";

/**
 * Contact CTA — Section 6.9 (replaces form-based CTA).
 * Clean call-to-action section linking to the Contact page.
 */
export default function ContactCTA() {
  return (
    <section className="sprint-cta-bg sprint-section relative overflow-hidden text-brand-navy">
      <div className="mx-auto max-w-[1200px] px-6 py-[2.1rem] text-center md:py-[3.5rem] lg:py-[4.375rem]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
          Start with a conversation
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Take the Next Step?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-text-secondary">
          Have questions about our programs or need guidance on the right
          learning path? Our team is here to help you make the best choice for
          your career.
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="sprint-focus inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-brand-red px-7 py-3 text-base font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
