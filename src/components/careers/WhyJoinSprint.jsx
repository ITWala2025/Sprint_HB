import { whyJoinContent } from "@/data/careers";

/**
 * Why Join SPRINT — Editorial paragraph layout with highlighted key phrases.
 * Light section with optimal reading width (65-75 characters per line).
 */
export default function WhyJoinSprint() {
  return (
    <section className="bg-brand-white py-24" aria-labelledby="why-join-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full bg-brand-red-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Why Join SPRINT
          </p>
          <h2 id="why-join-heading" className="mt-4 font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            Where Learning Meets Impact
          </h2>
        </div>

        <div className="mt-16 mx-auto max-w-3xl">
          <div className="space-y-8 text-lg leading-relaxed text-brand-text-secondary">
            {whyJoinContent.map((item) => (
              <p key={item.id} dangerouslySetInnerHTML={{ __html: item.content }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}