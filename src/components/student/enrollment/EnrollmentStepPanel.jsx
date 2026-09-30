/**
 * The white step card of the enrollment wizard.
 *
 * Mirrors `AuthCard` from the Phase 1 auth kit (same surface, border radius,
 * shadow and eyebrow treatment) but renders an `<h2>`: the wizard page already
 * owns the page-level `<h1>`, so each step has to sit one level below it.
 *
 * The heading carries `tabIndex={-1}` because the wizard moves focus here after
 * every step change, which is what tells a screen reader that the form content
 * underneath has been replaced.
 */
export default function EnrollmentStepPanel({
  step,
  stepNumber,
  totalSteps,
  headingId,
  children,
  className = "",
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border border-brand-border bg-brand-white p-5 shadow-brand-card sm:p-6 ${className}`}
    >
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red">
            Step {stepNumber} of {totalSteps}
          </p>
          {step.isScaffolded ? (
            <span className="rounded-full border border-brand-border bg-brand-off-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-text-muted">
              Scaffolded
            </span>
          ) : null}
          {step.isOptional ? (
            <span className="rounded-full border border-brand-navy/15 bg-brand-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-text-secondary">
              Optional
            </span>
          ) : null}
        </div>

        <h2
          id={headingId}
          tabIndex={-1}
          className="sprint-focus mt-2 rounded font-display text-xl font-bold leading-tight text-brand-navy sm:text-2xl"
        >
          {step.title}
        </h2>

        {step.description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-brand-text-secondary">
            {step.description}
          </p>
        ) : null}
      </header>

      <div className="mt-5">{children}</div>
    </section>
  );
}
