import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
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
    <StudentCard title="Quick Actions" icon={Sparkles}>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {mockQuickActions.map((action) => {
          const Icon = ACTION_ICONS[action.id] ?? ArrowRight;

          return (
            <li key={action.id}>
              <Link
                href={action.href}
                className="sprint-focus group flex h-full items-center gap-3 rounded-2xl border border-brand-border bg-brand-off-white px-4 py-4 transition-colors hover:border-brand-red hover:bg-brand-red-light"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-white text-brand-red ring-1 ring-brand-border">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-brand-navy">
                  {action.label}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-brand-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-red"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </StudentCard>
  );
}
