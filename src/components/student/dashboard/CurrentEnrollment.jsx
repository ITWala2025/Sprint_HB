import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { mockEnrollment } from "@/data/student";
import { formatDateRange } from "@/utils/dates";

/**
 * Current Enrollment — course identity, cohort window, modules cleared and a
 * progress bar. Mirrors the public course cards' chip + bar treatment.
 */
export default function CurrentEnrollment() {
  const {
    courseTitle,
    domain,
    cohortName,
    cohortStart,
    cohortEnd,
    mentorName,
    modulesPassed,
    modulesTotal,
    progressPercent,
    nextMilestone,
    mode,
  } = mockEnrollment;

  const details = [
    {
      id: "cohort-dates",
      label: "Cohort dates",
      value: formatDateRange(cohortStart, cohortEnd),
    },
    {
      id: "modules",
      label: "Modules passed",
      value: `${modulesPassed} of ${modulesTotal}`,
    },
    { id: "mentor", label: "Mentor", value: mentorName },
    { id: "milestone", label: "Next milestone", value: nextMilestone },
  ];

  return (
    <StudentCard
      title="Current Enrollment"
      icon={BookOpen}
      action={
        <span className="rounded-full bg-brand-red-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
          {progressPercent}%
        </span>
      }
    >
      <p className="font-display text-lg font-bold leading-snug text-brand-navy">
        {courseTitle}
      </p>

      <ul className="mt-3 flex flex-wrap gap-2">
        <li className="rounded-full border border-brand-border bg-brand-off-white px-3 py-1 text-[11px] font-semibold text-brand-text-secondary">
          {domain}
        </li>
        <li className="rounded-full border border-brand-border bg-brand-off-white px-3 py-1 text-[11px] font-semibold text-brand-text-secondary">
          {cohortName}
        </li>
      </ul>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {details.map(({ id, label, value }) => (
          <div
            key={id}
            className="rounded-2xl border border-brand-border bg-brand-off-white px-3.5 py-3"
          >
            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-brand-text-muted">{mode}</p>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-brand-text-secondary">
          <span>Course progress</span>
          <span className="text-brand-navy">{progressPercent}%</span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-surface"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Course progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-purple"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <Link
        href="/student/my-course"
        className="sprint-focus group mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-2.5 text-sm font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark sm:self-start"
      >
        View My Course
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </StudentCard>
  );
}
