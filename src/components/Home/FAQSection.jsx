import { faqs } from "@/data/data";

/**
 * FAQs — Section 6.8 / 7.5.
 *
 * Built on native <details>/<summary> rather than a custom JS accordion:
 * it's keyboard accessible and exposes expanded/collapsed state to
 * assistive tech for free (Section 15), and the arrow rotation is pure CSS
 * driven by the [open] attribute — no client component needed.
 */
export default function FAQSection() {
  return (
    <section className="sprint-section bg-brand-off-white py-[2.1rem] md:py-[3.5rem] lg:py-[4.375rem]">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
          Need to know
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-8 divide-y divide-brand-border border-t border-brand-border">
          {faqs.map((faq) => (
            <details key={faq.id} className="group py-5">
              <summary className="sprint-focus flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-brand-text marker:content-none">
                {faq.question}
                <span
                  className="shrink-0 text-brand-navy transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </summary>
              <p className="mt-3 text-brand-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
