import { Bell } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { formatShortDate } from "@/utils/dates";

/** Announcements — latest cohort notices with an unread notification badge. */
export default function AnnouncementsCard({ items = [] }) {
  const unreadCount = items.filter((item) => item.unread).length;

  return (
    <StudentCard
      id="dashboard-announcements"
      title="Announcements"
      icon={Bell}
      badge={unreadCount ? `${unreadCount} new` : undefined}
      description="Latest notices from your cohort and the placement team."
      className="h-full"
    >
      {items.length > 0 ? (
        <ul className="divide-y divide-brand-border">
          {items.map((item) => (
            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
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
                    {item.unread ? (
                      <span className="sr-only"> (unread)</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-brand-text-secondary">
                    {item.body}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-brand-text-muted">
                    <span className="rounded-full bg-brand-surface px-2 py-0.5 font-bold uppercase tracking-[0.08em] text-brand-text-secondary">
                      {item.tag}
                    </span>
                    {item.date ? formatShortDate(item.date) : null}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-border bg-brand-off-white px-6 py-10 text-center">
          <p className="font-display text-base font-bold text-brand-navy">
            No announcements yet
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-brand-text-secondary">
            There are no cohort notices available right now.
          </p>
        </div>
      )}
    </StudentCard>
  );
}
