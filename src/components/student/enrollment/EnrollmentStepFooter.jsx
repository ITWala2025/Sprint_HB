import { ArrowLeft, ArrowRight } from "lucide-react";

import AuthButton from "@/components/student/auth/AuthButton";

/**
 * Back / Skip / Continue controls for the active step.
 *
 * Sits inside the step's `<form>` so Continue is a real submit button (Enter in
 * any field advances the wizard) while Back and Skip are `type="button"` and
 * can never submit the form.
 *
 * Mobile-first: the bar is pinned to the bottom of the viewport with the step
 * counter above the buttons, so the primary action and the progress are always
 * reachable with a thumb. Back and Skip share one row under Continue on small
 * screens (the optional-step bar stays two rows tall), and `md:contents`
 * unwraps that group so the desktop toolbar reads [Back] [Skip] [Continue] in
 * order. From `md` up the whole bar falls back into the step card. Every
 * control is `h-12` (48px), above the 44px touch-target floor.
 */
export default function EnrollmentStepFooter({
  onBack,
  isFirst,
  isLast,
  stepNumber,
  totalSteps,
  submitLabel,
  onSkip,
  skipLabel = "Skip for now",
  className = "",
}) {
  const label = submitLabel ?? (isLast ? "Submit Enrollment" : "Continue");

  const backButton = isFirst ? null : (
    <AuthButton
      type="button"
      variant="secondary"
      onClick={onBack}
      className="md:w-auto md:min-w-32"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back
    </AuthButton>
  );

  const skipButton = onSkip ? (
    <AuthButton type="button" variant="ghost" onClick={onSkip} className="md:w-auto md:min-w-32">
      {skipLabel}
    </AuthButton>
  ) : null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-brand-border bg-brand-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:inset-auto md:z-auto md:mt-6 md:bg-transparent md:px-0 md:pb-0 md:pt-5 md:backdrop-blur-none ${className}`}
    >
      <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted md:hidden">
        Step {stepNumber} of {totalSteps}
      </p>

      <div
        className={`mx-auto flex w-full max-w-2xl flex-col-reverse gap-3 md:max-w-none md:flex-row md:items-center ${
          isFirst ? "md:justify-end" : "md:justify-between"
        }`}
      >
        {skipButton ? (
          <div className="flex w-full gap-3 md:contents">
            {backButton}
            {skipButton}
          </div>
        ) : (
          backButton
        )}

        <AuthButton
          type="submit"
          icon={<ArrowRight aria-hidden="true" className="size-4" />}
          className="md:w-auto md:min-w-32"
        >
          {label}
        </AuthButton>
      </div>
    </div>
  );
}
