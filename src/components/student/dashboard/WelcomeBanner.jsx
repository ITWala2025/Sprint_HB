import Image from "next/image";

import { mockStudent } from "@/data/student";

/**
 * Dashboard hero — welcome heading alongside the learner's progress summary.
 */
export default function WelcomeBanner({ children }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-brand-navy text-brand-white"
      aria-labelledby="student-welcome-heading"
    >
      <Image
        src="/images/home/home-hero.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover object-center opacity-40"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/92 to-brand-navy/60"
        aria-hidden="true"
      />

      <div className="relative z-10 grid gap-7 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-10 lg:p-10">
        <div className="min-w-0">
          <h1
            id="student-welcome-heading"
            className="font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
          >
            Welcome back, {mockStudent.firstName}!
          </h1>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
