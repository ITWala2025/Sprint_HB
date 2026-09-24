"use client";

import Image from "next/image";
import { useState } from "react";
import { instructors } from "@/data/data";

function InitialsAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="flex h-full w-full items-center justify-center bg-brand-navy font-display text-3xl font-bold text-brand-white">
      {initials}
    </div>
  );
}

/**
 * Instructor Section — Section 6.6.
 * Cards are plain <div>s, not links/buttons — spec explicitly forbids
 * click interaction here, and there is no "View All Instructors" CTA.
 */
export default function Instructors() {
  const [failedImages, setFailedImages] = useState({});

  return (
    <section className="sprint-section bg-brand-off-white py-[2.1rem] md:py-[3.5rem] lg:py-[4.375rem]">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
          Meet the mentors
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          Learn from people who do this for a living
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
          Every instructor is a working professional at a partner company, not a
          full-time content creator.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="flex h-full flex-col rounded-3xl border border-brand-border bg-brand-white p-4 shadow-sm"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-brand-surface">
                {failedImages[instructor.id] ? (
                  <InitialsAvatar name={instructor.name} />
                ) : (
                  <Image
                    src={instructor.photoUrl}
                    alt={`Portrait of ${instructor.name}`}
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    unoptimized
                    onError={() =>
                      setFailedImages((current) => ({
                        ...current,
                        [instructor.id]: true,
                      }))
                    }
                  />
                )}
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
