"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { mockCalendar } from "@/data/student";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const buildMonthCells = (year, month) => {
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: leadingBlanks }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return cells;
};

/**
 * Calendar widget — current month with today highlighted and brand-red
 * markers on class days. `today` is resolved after mount so the server and
 * client markup always match; month navigation is client-only UI.
 */
export default function DashboardCalendar() {
  const [today, setToday] = useState(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    setToday(new Date());
  }, []);

  const cells = useMemo(
    () => buildMonthCells(cursor.year, cursor.month),
    [cursor],
  );

  const isCurrentMonth = today
    ? today.getFullYear() === cursor.year && today.getMonth() === cursor.month
    : false;

  const shiftMonth = (delta) =>
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const returnToToday = () => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  };

  return (
    <StudentCard
      title="Calendar"
      icon={CalendarDays}
      action={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="sprint-focus grid size-9 place-items-center rounded-xl border border-brand-border text-brand-text-muted transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="sr-only">Previous month</span>
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="sprint-focus grid size-9 place-items-center rounded-xl border border-brand-border text-brand-text-muted transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="sr-only">Next month</span>
          </button>
        </div>
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm font-bold text-brand-navy">
          {MONTH_LABELS[cursor.month]} {cursor.year}
        </p>
        <button
          type="button"
          onClick={returnToToday}
          className="sprint-focus rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-red transition-colors hover:bg-brand-red-light"
        >
          Today
        </button>
      </div>

      <div
        className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-brand-text-muted"
        aria-hidden="true"
      >
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <ul className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <li key={`blank-${index}`} aria-hidden="true" />;
          }

          const isToday = Boolean(today) && isCurrentMonth && today.getDate() === day;
          const isClassDay = mockCalendar.classDays.includes(day);

          return (
            <li key={`day-${day}`}>
              <span
                aria-current={isToday ? "date" : undefined}
                className={`relative grid aspect-square place-items-center rounded-xl text-xs font-semibold transition-colors ${
                  isToday
                    ? "bg-brand-red text-white shadow-brand-cta"
                    : isClassDay
                      ? "bg-brand-red-light text-brand-red"
                      : "text-brand-text-secondary hover:bg-brand-surface"
                }`}
              >
                {day}
                {isClassDay && !isToday ? (
                  <span
                    className="absolute bottom-1 size-1 rounded-full bg-brand-red"
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>

      <ul className="mt-4 flex flex-wrap items-center gap-4 border-t border-brand-border pt-3 text-[11px] text-brand-text-muted">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-red" aria-hidden="true" />
          Today
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-red-light ring-1 ring-brand-red/40" aria-hidden="true" />
          Class day
        </li>
      </ul>
    </StudentCard>
  );
}
