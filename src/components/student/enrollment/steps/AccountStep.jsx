import { useEffect, useState } from "react";
import { Check, UserRound } from "lucide-react";

import { catalogueItems } from "@/data/courses";
import { createClient } from "@/lib/supabase/client";

/**
 * Step 3 — account setup preview. Collected values are display-only here;
 * submission and validation remain owned by the wizard.
 */
export default function AccountStep({
  stepNumber = 3,
  headingId,
  summaryValues = {},
}) {
  const personal = summaryValues.personal ?? {};
  const education = summaryValues.education ?? {};
  const selectedCourse = catalogueItems.find(
    (item) =>
      item.kind === "course" &&
      (item.slug === education.course || item.id === education.course),
  );
  const [databaseCourseTitle, setDatabaseCourseTitle] = useState("");

  useEffect(() => {
    if (!education.course || selectedCourse) {
      setDatabaseCourseTitle("");
      return undefined;
    }

    let active = true;
    const supabase = createClient();
    supabase
      .from("courses")
      .select("title")
      .eq("id", education.course)
      .maybeSingle()
      .then(({ data, error }) => {
        if (active && !error) setDatabaseCourseTitle(data?.title ?? "");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [education.course, selectedCourse]);

  const fullName =
    [personal.firstName, personal.lastName].filter(Boolean).join(" ") || "—";
  const learningPath =
    selectedCourse?.title || databaseCourseTitle || education.course || "—";
  const details = [
    { label: "Email", value: personal.email || "—" },
    { label: "Phone", value: personal.phone ? `+91 ${personal.phone}` : "—" },
    { label: "State", value: personal.state || "—" },
    { label: "Learning Path", value: learningPath },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">
          STEP {String(stepNumber).padStart(2, "0")}
        </p>
        <h2
          id={headingId}
          tabIndex={-1}
          className="sprint-focus mt-2 rounded font-display text-xl font-bold leading-tight text-brand-navy sm:text-2xl"
        >
          Create Your SPRINT Account
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          Your selected enrollment details are ready. Account creation will be
          connected to the secure SPRINT authentication flow.
        </p>
      </header>

      <section
        aria-labelledby="enrollment-summary-heading"
        className="rounded-2xl border border-brand-border bg-brand-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4
              id="enrollment-summary-heading"
              className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-text-muted"
            >
              Enrollment Summary
            </h4>
            <p className="mt-2 break-words font-display text-lg font-bold text-brand-navy sm:text-xl">
              {fullName}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Check className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="my-4 border-t border-brand-border" />

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-text-muted">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold text-brand-navy">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-off-white p-4 sm:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-white text-brand-red ring-1 ring-brand-border">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold text-brand-navy">
            Account creation
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-brand-text-secondary">
            The next implementation will add secure password creation, Terms of
            Service and Privacy Policy consent, account creation, email
            verification and enrollment confirmation.
          </p>
        </div>
      </section>
    </div>
  );
}
