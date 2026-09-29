import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, UserRound } from "lucide-react";

import { mockStudent } from "@/data/student";

const meta = [
  { id: "student-id", label: "Student ID", value: mockStudent.id, Icon: UserRound },
  { id: "program", label: "Program", value: mockStudent.program, Icon: GraduationCap },
  { id: "cohort", label: "Cohort", value: mockStudent.cohort, Icon: CalendarDays },
];

/**
 * Welcome banner — navy field, brand-red accent glow, photo backdrop.
 * Uses SPRINT's own palette (not the reference design's blue/purple).
 */
export default function WelcomeBanner() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-brand-navy text-brand-white"
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
      <div
        className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-red/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-red/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red-light ring-1 ring-brand-red/30">
            <GraduationCap className="size-3.5" aria-hidden="true" />
            Student Portal
          </p>

          <h1
            id="student-welcome-heading"
            className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
          >
            Welcome back, {mockStudent.firstName}!
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-white/85 sm:text-base">
            {mockStudent.greetingQuote}
          </p>
        </div>

        <dl className="flex flex-wrap gap-2.5">
          {meta.map(({ id, label, value, Icon }) => (
            <div
              key={id}
              className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/15 backdrop-blur"
            >
              <Icon className="size-4 shrink-0 text-brand-red-light" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-white/70">
                  {label}
                </dt>
                <dd className="truncate text-xs font-semibold text-brand-white">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div>
          <Link
            href="/student/profile"
            className="sprint-focus group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-brand-white transition-colors hover:border-white hover:bg-white/20"
          >
            View my profile
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
