import { stats } from "@/data/data";

/**
 * What We Give — Trust & Statistics (Section 6.2).
 * Four consistent stat items; numbers are the visually prominent element,
 * labels stay short and descriptive per the UI requirements.
 */
export default function WhatWeGive() {
  return (
    <section className="bg-brand-off-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display text-3xl font-bold text-brand-navy">
          What SPRINT gives you
        </h2>

        <dl className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="border-l-2 border-brand-red pl-4">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl font-bold text-brand-navy">
                {stat.value}
              </dd>
              <p className="mt-2 text-sm text-brand-text-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
