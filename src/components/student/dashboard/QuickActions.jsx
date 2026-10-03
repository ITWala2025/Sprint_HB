import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { mockQuickActions } from "@/data/student";

const ACTION_ICONS = {
  "qa-assignments": ClipboardList,
  "qa-resources": BookOpen,
  "qa-result": GraduationCap,
  "qa-certificates": Award,
};

/**
 * Quick Actions — the four shortcuts most used from the dashboard. Routes are
 * the same portal placeholders the sidebar points at.
 */
export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="flex items-center gap-2 font-display text-base font-bold text-brand-navy"
      >
        <Sparkles className="size-4 text-brand-red" aria-hidden="true" />
        Quick Actions
      </h2>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4 sm:gap-x-4">
        {mockQuickActions.map((action) => {
          const Icon = ACTION_ICONS[action.id] ?? ArrowRight;

          return (
            <li key={action.id}>
              <Link
                href={action.href}
                className="sprint-focus group flex min-h-11 items-center gap-2 rounded-md text-xs font-semibold text-brand-text-secondary transition-colors hover:text-brand-red sm:text-sm"
              >
                <Icon
                  className="size-4 shrink-0 text-brand-red"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">{action.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
