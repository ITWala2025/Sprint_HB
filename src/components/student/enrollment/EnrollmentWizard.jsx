"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

import HeaderLogo from "@/components/header/HeaderLogo";

import EnrollmentProgress from "./EnrollmentProgress";
import EnrollmentStepFooter from "./EnrollmentStepFooter";
import EnrollmentStepPanel from "./EnrollmentStepPanel";
import EnrollmentSuccessPanel from "./EnrollmentSuccessPanel";
import {
  ENROLLMENT_STEP_COUNT,
  ENROLLMENT_STEPS,
  createEmptyEnrollment,
} from "./enrollment-steps";
import { compactErrors } from "./enrollment-validation";

const STEP_HEADING_ID = "enrollment-step-heading";
const SUCCESS_HEADING_ID = "enrollment-success-heading";

/**
 * Enrollment wizard shell (Phase 1 — UI + client-side state only).
 *
 * One state object holds every step's answers (`{ personal, education,
 * specialization, learningPath, account }`) and the steps are controlled
 * components reading from it. That is what makes moving back and forth free:
 * going forward merges the step's values into that same object, going back just
 * re-renders the step with the values it left behind.
 *
 * The wizard owns everything generic — which step is active, validation on
 * submit, focus management, the progress indicator and the Back / Skip /
 * Continue bar. Each step only describes its own fields, through the contract
 * documented in `enrollment-steps.js`.
 *
 * Nothing is submitted anywhere yet: the last step switches to a success panel
 * that echoes the collected values. There is no backend, no persistence and no
 * URL sync, so a browser refresh restarts the wizard by design.
 */
export default function EnrollmentWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(createEmptyEnrollment);
  const [errors, setErrors] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  // One-off message for a visible action (today: skipping an optional step).
  // Cleared by the next navigation so it never lingers on the wrong screen.
  const [statusNotice, setStatusNotice] = useState(null);

  const step = ENROLLMENT_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === ENROLLMENT_STEP_COUNT - 1;
  const StepComponent = step.Component;

  const goToStep = (index, notice = null) => {
    setErrors({});
    setIsComplete(false);
    setStatusNotice(notice);
    setStepIndex(index);
  };

  // `handleChangeIn("specialization")("track")` writes into any slice of the
  // shared state — that is how Step 2 collects the specialization choice Step 3
  // will later read. For the active slice it reduces to the plain
  // `handleChange("email")` the fields are wired to.
  const handleChangeIn = (sliceId) => (field) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({
      ...previous,
      [sliceId]: { ...previous[sliceId], [field]: value },
    }));
    // Clear this field's error as soon as the student starts fixing it.
    setErrors((previous) => (previous[field] ? { ...previous, [field]: "" } : previous));
  };

  const handleChange = handleChangeIn(step.id);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = compactErrors(step.validate(values[step.id] ?? {}));
    setErrors(nextErrors);

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      // Same convention the fields use for their ids: `${step.id}-${fieldName}`.
      document.getElementById(`${step.id}-${firstInvalidField}`)?.focus();
      return;
    }

    if (isLast) {
      setIsComplete(true);
      return;
    }

    goToStep(stepIndex + 1);
  };

  // "Skip for now": an optional step must never block progress, so validation
  // is deliberately bypassed. The typed answers stay in shared state (nothing
  // is cleared) and the landing step shows the step's `skipNotice`, so skipping
  // reads as a decision rather than a silent failure.
  const handleSkip = () => {
    const notice =
      step.skipNotice ?? "You can complete this step later from your Student Dashboard.";
    if (isLast) {
      setStatusNotice(notice);
      setIsComplete(true);
      return;
    }
    goToStep(stepIndex + 1, notice);
  };

  // Announce the swap: focus the new heading and return to the top of the page.
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    document.getElementById(isComplete ? SUCCESS_HEADING_ID : STEP_HEADING_ID)?.focus();
  }, [stepIndex, isComplete]);

  return (
    <div className="min-h-screen bg-brand-off-white">
      <div
        className={`mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6 sm:pt-10 md:pb-12 ${
          step.isOptional && !isComplete ? "pb-44" : "pb-28"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <HeaderLogo />
          <Link
            href="/student/login"
            className="sprint-focus rounded-lg text-xs font-semibold text-brand-navy hover:text-brand-red sm:text-sm"
          >
            Already enrolled? Sign in
          </Link>
        </div>

        <div className="mt-7">
          <h1
            id="enrollment-heading"
            className="font-display text-2xl font-bold leading-tight text-brand-navy sm:text-3xl"
          >
            Start your enrollment
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-text-secondary">
            Five short steps — your details, education, specialization, learning path and portal
            account. You can move back and forth at any point without losing an answer.
          </p>
        </div>

        <EnrollmentProgress
          steps={ENROLLMENT_STEPS}
          currentIndex={stepIndex}
          isComplete={isComplete}
          onStepSelect={goToStep}
          className="mt-6"
        />

        {statusNotice ? (
          <div
            role="status"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-border bg-brand-white px-4 py-3 shadow-brand-card sm:px-5"
          >
            <CircleCheck aria-hidden="true" className="mt-px size-4 shrink-0 text-brand-red" />
            <p className="text-xs leading-relaxed text-brand-text-secondary">{statusNotice}</p>
          </div>
        ) : null}

        {isComplete ? (
          <EnrollmentSuccessPanel
            headingId={SUCCESS_HEADING_ID}
            values={values}
            onReviewDetails={() => goToStep(0)}
            className="mt-6"
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby={STEP_HEADING_ID}
            className="mt-6"
          >
            <EnrollmentStepPanel
              step={step}
              stepNumber={stepIndex + 1}
              totalSteps={ENROLLMENT_STEP_COUNT}
              headingId={STEP_HEADING_ID}
            >
              <StepComponent
                idPrefix={step.id}
                values={values[step.id]}
                errors={errors}
                onChange={handleChange}
                onChangeIn={handleChangeIn}
                specialization={values.specialization}
              />

              <EnrollmentStepFooter
                onBack={() => goToStep(stepIndex - 1)}
                onSkip={step.isOptional ? handleSkip : undefined}
                isFirst={isFirst}
                isLast={isLast}
                stepNumber={stepIndex + 1}
                totalSteps={ENROLLMENT_STEP_COUNT}
              />
            </EnrollmentStepPanel>
          </form>
        )}

        <p className="mt-6 text-center text-[11px] font-medium leading-relaxed text-brand-text-muted md:mt-8">
          Preview build — answers stay in this browser tab and nothing is submitted to SPRINT.
        </p>
      </div>
    </div>
  );
}
