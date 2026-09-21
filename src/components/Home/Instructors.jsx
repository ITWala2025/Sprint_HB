import Image from "next/image";
import { instructors } from "@/data/data";

/**
 * Instructor Section — Section 6.6.
 * Cards are plain <div>s, not links/buttons — spec explicitly forbids
 * click interaction here, and there is no "View All Instructors" CTA.
 */
export default function Instructors() {
  return (
    <section className="sprint-section bg-brand-off-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
          Meet the mentors
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          Learn from people who do this for a living
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
          Every instructor is a working professional at a partner company, not a
          full-time content creator.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="text-left">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-surface">
                <Image
                  src={instructor.photoUrl}
                  alt={`Portrait of ${instructor.name}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-brand-text">
                {instructor.name}
              </h3>
              <p className="text-sm text-brand-text-secondary">
                {instructor.designation}
              </p>
              <p className="text-sm text-brand-text-muted">
                {instructor.company}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
