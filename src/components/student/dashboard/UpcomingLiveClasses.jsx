"use client";

import { CalendarDays, Video } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { mockUpcomingClasses } from "@/data/student";
import { formatShortDate } from "@/utils/dates";

/**
 * Upcoming Live Classes.
 * `mockUpcomingClasses` is intentionally empty in this pass, so the empty
 * state is what renders; the list branch is already wired for real data.
 */
export default function UpcomingLiveClasses() {
  const hasClasses = mockUpcomingClasses.length > 0;

  return (
    <StudentCard
      title="Upcoming Live Classes"
      icon={Video}
      description={
        hasClasses
          ? `${mockUpcomingClasses.length} sessions scheduled`
          : "Your mentor publishes sessions here before each cohort week."
      }
    >
      {hasClasses ? (
        <ul className="flex flex-col gap-3">
          {mockUpcomingClasses.map((session) => (
            <li
              key={session.id}
              className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-off-white px-3.5 py-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-red ring-1 ring-brand-border">
                <Video className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-navy">
                  {session.title}
                </p>
                <p className="mt-0.5 text-xs text-brand-text-muted">
                  {formatShortDate(session.startsAt)} · {session.mentor}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-border bg-brand-off-white px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-red-light text-brand-red">
            <CalendarDays className="size-6" aria-hidden="true" />
          </span>
          <h3 className="font-display text-base font-bold text-brand-navy">
            No live classes scheduled yet
          </h3>
          <p className="max-w-sm text-xs leading-relaxed text-brand-text-secondary">
            When your mentor schedules the next session it will appear here with
            the joining link, along with reminders on your calendar.
          </p>
        </div>
      )}
    </StudentCard>
  );
}
