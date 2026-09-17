import Link from "next/link";

/**
 * Contact CTA — Section 6.9 (replaces form-based CTA).
 * Clean call-to-action section linking to the Contact page.
 */
export default function ContactCTA() {
  return (
    <section className="bg-brand-navy py-24 text-brand-white">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
          Ready to Take the Next Step?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-white/75">
          Have questions about our programs or need guidance on the right
          learning path? Our team is here to help you make the best choice for
          your career.
        </p>
        <div className="mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}