import { CheckCircle2 } from "lucide-react";

import AuthButton from "@/components/student/auth/AuthButton";

/**
 * Shown once the registration is saved.
 *
 * Echoes the collected values after the server confirms the enrollment was
 * submitted, which also makes the shared wizard state visible to the student.
 */
const SUMMARY_ROWS = [
  { field: "firstName", label: "First name" },
  { field: "lastName", label: "Last name" },
  { field: "email", label: "Email address" },
  { field: "phone", label: "Phone number" },
  { field: "dob", label: "Date of birth" },
  { field: "city", label: "Town / City" },
  { field: "country", label: "Country" },
  { field: "state", label: "State" },
];

export default function EnrollmentSuccessPanel({
  headingId,
  values,
  applicationId,
  hasCourseEnrollment,
  nextPath = "/student/dashboard",
  onContinue,
  className = "",
}) {
  const personal = values?.personal ?? {};
  const rows = SUMMARY_ROWS.filter((row) => String(personal[row.field] ?? "").trim());

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border border-brand-border bg-brand-white p-5 shadow-brand-card sm:p-6 ${className}`}
    >
      <div
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-2xl bg-brand-success/10 text-brand-success ring-1 ring-brand-success/20"
      >
        <CheckCircle2 className="size-6" />
      </div>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red">
        Registration complete
      </p>
      <h2
        id={headingId}
        tabIndex={-1}
        className="sprint-focus mt-2 rounded font-display text-xl font-bold leading-tight text-brand-navy sm:text-2xl"
      >
        Your registration is complete
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-brand-text-secondary">
        {hasCourseEnrollment
          ? "Your registration and course enrollment have been submitted and are waiting for review."
          : "Your registration has been saved. You can apply for a course from any course page."}
      </p>

      {applicationId ? (
        <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
            Application ID
          </p>
          <p className="mt-1 font-mono text-base font-bold text-brand-navy">
            {applicationId}
          </p>
          <p className="mt-0.5 text-xs text-brand-text-secondary">
            Save this ID for tracking your application and future correspondence.
          </p>
        </div>
      ) : null}

      {rows.length ? (
        <dl className="mt-5 grid gap-3 rounded-xl border border-brand-border bg-brand-off-white p-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.field} className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
                {row.label}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium text-brand-navy">
                {personal[row.field]}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="mt-4 rounded-xl bg-brand-surface px-3.5 py-3 text-[11px] font-medium leading-relaxed text-brand-text-secondary">
        Your password is set. Sign in with {personal.email} and the password
        you created during registration.
      </p>

      <div className="mt-5">
        <AuthButton type="button" onClick={onContinue}>
          {nextPath === "/student/dashboard"
            ? "Go to Dashboard →"
            : "Continue to Course →"}
        </AuthButton>
      </div>
    </section>
  );
}
