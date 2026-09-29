import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import StudentCard from "./StudentCard";

/**
 * Lightweight body for the portal sections that are still placeholders in this
 * UI-only pass. Keeps every secondary route tiny and consistent.
 */
export default function StudentPlaceholderPage({
  title,
  description,
  icon: Icon,
  note,
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="inline-flex items-center rounded-full bg-brand-red-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red">
          Student Portal
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-text-secondary">
            {description}
          </p>
        ) : null}
      </header>

      <StudentCard>
        <div className="flex flex-col items-center gap-4 px-2 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-red-light text-brand-red">
            {Icon ? <Icon className="size-6" aria-hidden="true" /> : null}
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-brand-navy">
              This section is being built
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-text-secondary">
              {note ??
                "The layout is in place. Records and workflows are wired in a later sprint."}
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="sprint-focus inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Dashboard
          </Link>
        </div>
      </StudentCard>
    </div>
  );
}
