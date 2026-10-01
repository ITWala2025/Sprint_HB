import { TrendingUp } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { mockEnrollment, mockLearningProgress } from "@/data/student";
import { formatDateRange, formatShortDate } from "@/utils/dates";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularProgress({ value, compact = false }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      className={`relative grid ${compact ? "size-28" : "size-32"} shrink-0 place-items-center`}
    >
      <svg
        viewBox="0 0 128 128"
        className={`${compact ? "size-28" : "size-32"} -rotate-90`}
        role="img"
        aria-label={`${clamped} percent learning progress`}
      >
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className={compact ? "stroke-white/25" : "stroke-brand-surface"}
        />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
          className={compact ? "stroke-brand-red-light" : "stroke-brand-red"}
        />
      </svg>
      <span
        className={`absolute font-display text-2xl font-bold ${compact ? "text-white" : "text-brand-navy"}`}
      >
        {clamped}%
      </span>
    </div>
  );
}

/**
 * My Learning Progress — circular completion chart plus the live attendance
 * counters. The counters stay inline: attendance is no longer its own portal
 * section, so the card is the single source for the learner's session record.
 */
export default function LearningProgress({ compact = false }) {
  const {
    completionPercent,
    status,
    attendedSessions,
    missedSessions,
    totalSessions,
    streakDays,
    lastUpdated,
  } = mockLearningProgress;

  const stats = [
    {
      id: "attended",
      label: "Attended",
      value: attendedSessions,
      tone: "text-brand-success",
    },
    {
      id: "missed",
      label: "Missed",
      value: missedSessions,
      tone: "text-brand-red",
    },
    {
      id: "total",
      label: "Total",
      value: totalSessions,
      tone: "text-brand-navy",
    },
  ];

  if (compact) {
    return (
      <section
        aria-labelledby="student-progress-heading"
        className="mx-auto w-full max-w-sm"
      >
        <h2
          id="student-progress-heading"
          className="mb-3 text-center text-sm font-bold text-brand-white sm:text-left"
        >
          My Learning Progress
        </h2>
        <div className="flex items-center justify-center gap-4 sm:justify-start">
          <div className="flex min-w-0 flex-col items-center gap-1.5">
            <CircularProgress value={completionPercent} compact />
            <p className="text-center text-[11px] font-medium text-brand-white/80">
              Cohort:{" "}
              {formatDateRange(
                mockEnrollment.cohortStart,
                mockEnrollment.cohortEnd,
                " – ",
              )}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-300/15 px-3 py-1.5 text-xs font-bold text-emerald-100 ring-1 ring-emerald-200/30">
            {status}
          </span>
        </div>
      </section>
    );
  }

  return (
    <StudentCard
      title="My Learning Progress"
      icon={TrendingUp}
      description={`Updated ${formatShortDate(lastUpdated)} · ${streakDays}-day learning streak`}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <CircularProgress value={completionPercent} />

        <div className="w-full min-w-0">
          <span className="inline-flex items-center rounded-full bg-brand-red-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
            {status}
          </span>

          <dl className="mt-4 grid grid-cols-3 gap-2.5">
            {stats.map(({ id, label, value, tone }) => (
              <div
                key={id}
                className="rounded-2xl border border-brand-border bg-brand-off-white px-3 py-2.5 text-center"
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-text-muted">
                  {label}
                </dt>
                <dd className={`mt-1 font-display text-lg font-bold ${tone}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </StudentCard>
  );
}
