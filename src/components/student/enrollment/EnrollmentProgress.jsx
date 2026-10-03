import { Check } from "lucide-react";

/**
 * Progress indicator for the enrollment wizard.
 *
 * Two presentations, one source of truth (`currentIndex`):
 * - below `md`: a compact "Step 2 of 3" counter with a progress bar, because
 *   three labels do not fit next to each other on a phone;
 * - from `md` up: a full numbered stepper with the completed steps as a check
 *   mark. Completed steps are buttons — a student who is on step 3 can jump
 *   back to step 1 without losing anything. Steps that have not been reached
 *   are disabled, so nobody can skip ahead into an empty form.
 *
 * State is never carried by colour alone: every step appends a screen-reader
 * only phrase ("completed", "current step", "not started yet").
 */
const STATE_SR_TEXT = {
  complete: " — completed",
  current: " — current step",
  upcoming: " — not started yet",
};

const CIRCLE_CLASSES = {
  complete: "bg-brand-navy text-brand-white",
  current: "bg-brand-red text-white ring-4 ring-brand-red/15",
  upcoming: "bg-brand-surface text-brand-text-muted ring-1 ring-brand-border",
};

const LABEL_CLASSES = {
  complete: "text-brand-navy",
  current: "text-brand-navy",
  upcoming: "text-brand-text-muted",
};

export default function EnrollmentProgress({
  steps,
  currentIndex,
  isComplete = false,
  onStepSelect,
  className = "",
}) {
  const total = steps.length;
  const activeStep = steps[Math.min(currentIndex, total - 1)];
  const percent = isComplete ? 100 : Math.round(((currentIndex + 1) / total) * 100);

  return (
    <nav aria-label="Enrollment progress" className={className}>
      <div className="md:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold text-brand-navy">
            {isComplete ? `All ${total} steps complete` : `Step ${currentIndex + 1} of ${total}`}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
            {isComplete ? "Complete" : activeStep.label}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-surface"
        >
          <div
            className="h-full rounded-full bg-brand-red transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center gap-1.5 md:flex">
        {steps.map((step, index) => {
          const state = isComplete || index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
          const isCurrent = state === "current";

          return (
            <li
              key={step.id}
              className={`flex min-w-0 items-center gap-1.5 ${index === total - 1 ? "" : "flex-1"}`}
            >
              <button
                type="button"
                onClick={() => onStepSelect?.(index)}
                disabled={state !== "complete"}
                aria-current={isCurrent ? "step" : undefined}
                className={`sprint-focus flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                  state === "complete" ? "hover:bg-brand-surface" : ""
                } disabled:cursor-not-allowed ${LABEL_CLASSES[state]}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${CIRCLE_CLASSES[state]}`}
                >
                  {state === "complete" ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 truncate">{step.label}</span>
                <span className="sr-only">{STATE_SR_TEXT[state]}</span>
              </button>

              {index < total - 1 ? (
                <span aria-hidden="true" className="h-px flex-1 bg-brand-border" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
