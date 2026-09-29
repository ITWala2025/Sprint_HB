import { Bell } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { mockAnnouncements } from "@/data/student";
import { formatShortDate } from "@/utils/dates";

/** Announcements — latest cohort notices with an unread notification badge. */
export default function AnnouncementsCard() {
  const unreadCount = mockAnnouncements.filter((item) => item.unread).length;

  return (
    <StudentCard
      title="Announcements"
      icon={Bell}
      badge={unreadCount ? `${unreadCount} new` : undefined}
      description="Latest notices from your cohort and the placement team."
      className="h-full"
    >
      <ul className="flex flex-col gap-3">
        {mockAnnouncements.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-brand-border bg-brand-off-white px-3.5 py-3"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${
                  item.unread ? "bg-brand-red" : "bg-brand-border"
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-navy">
                  {item.title}
                  {item.unread ? <span className="sr-only"> (unread)</span> : null}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand-text-secondary">
                  {item.body}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-brand-text-muted">
                  <span className="rounded-full bg-brand-white px-2 py-0.5 font-bold uppercase tracking-[0.08em] text-brand-text-muted ring-1 ring-brand-border">
                    {item.tag}
                  </span>
                  {formatShortDate(item.date)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </StudentCard>
  );
}
