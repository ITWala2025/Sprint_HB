"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck } from "lucide-react";

import { submitStudentEnrollmentAction } from "@/app/student/enroll/actions";
import { createClient } from "@/lib/supabase/client";

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
const ENROLLMENT_DRAFT_KEY = "student_enrollment_draft";

export default function EnrollmentWizard({
  nextPath = "/student/dashboard",
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(createEmptyEnrollment);
  const [errors, setErrors] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState("");
  const [hasCourseEnrollment, setHasCourseEnrollment] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(ENROLLMENT_DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);
      if (!draft.values?.personal) return;

      const empty = createEmptyEnrollment();
      setValues({
        ...empty,
        personal: { ...empty.personal, ...draft.values.personal },
      });
    } catch {
      setSubmitError(
        "Your saved enrollment details could not be restored. Please review and re-enter them.",
      );
    }
  }, []);

  const step = ENROLLMENT_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === ENROLLMENT_STEP_COUNT - 1;
  const StepComponent = step.Component;

  const goToStep = (index) => {
    setErrors({});
    setSubmitError("");
    setStepIndex(index);
  };

  const handleChangeIn = (sliceId) => (field) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({
      ...previous,
      [sliceId]: { ...previous[sliceId], [field]: value },
    }));
    if (sliceId === "personal" && field === "email") {
      setIsEmailVerified(false);
    }
    setSubmitError("");
    setErrors((previous) =>
      previous[field] ? { ...previous, [field]: "" } : previous,
    );
  };

  const handleChange = handleChangeIn(step.id);

  const validatePersonal = useCallback(() => {
    const nextErrors = compactErrors(
      ENROLLMENT_STEPS[0].validate(values.personal ?? {}),
    );
    setErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      document.getElementById(`personal-${firstInvalidField}`)?.focus();
      return false;
    }
    return true;
  }, [values.personal]);

  const saveDraftBeforeAuthRedirect = useCallback(() => {
    try {
      window.sessionStorage.setItem(
        ENROLLMENT_DRAFT_KEY,
        JSON.stringify({ values: { personal: values.personal } }),
      );
    } catch {
      throw new Error(
        "Your enrollment details could not be saved before leaving this page. Please try again.",
      );
    }
  }, [values.personal]);

  const clearSavedDraft = () => {
    try {
      window.sessionStorage.removeItem(ENROLLMENT_DRAFT_KEY);
    } catch {
      setSubmitError(
        "Your submitted enrollment draft could not be cleared from this browser.",
      );
    }
  };

  const handleVerificationChange = useCallback((verified) => {
    setIsEmailVerified(verified);
  }, []);

  const submitEnrollment = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: passwordError } = await supabase.auth.updateUser({
        password: values.password.newPassword,
      });
      if (passwordError) {
        throw new Error(`We couldn't set your password: ${passwordError.message}`);
      }

      const result = await submitStudentEnrollmentAction({
        personal: values.personal,
        education: {},
      });
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      clearSavedDraft();
      setSubmittedApplicationId(result.applicationId);
      setHasCourseEnrollment(result.hasCourseEnrollment);
      setIsComplete(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The registration could not be submitted right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = compactErrors(step.validate(values[step.id] ?? {}));
    setErrors(nextErrors);

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      document.getElementById(`${step.id}-${firstInvalidField}`)?.focus();
      return;
    }

    if (step.id === "personal") {
      if (isEmailVerified) {
        goToStep(stepIndex + 1);
      } else {
        setSubmitError("Verify your email address before continuing.");
      }
      return;
    }

    if (!isEmailVerified) {
      setSubmitError("Verify your email address before creating your account.");
      return;
    }

    await submitEnrollment();
  };

  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    document
      .getElementById(isComplete ? SUCCESS_HEADING_ID : STEP_HEADING_ID)
      ?.focus();
  }, [stepIndex, isComplete]);

  return (
    <div className="min-h-screen bg-brand-off-white">
      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 md:pb-12">
        <div>
          <h1
            id="enrollment-heading"
            className="font-display text-2xl font-bold leading-tight text-brand-navy sm:text-3xl"
          >
            Create your Student Portal account
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-text-secondary">
            Share your personal details, verify your email, and create a
            password. You can apply for courses from their course pages later.
          </p>
        </div>

        <EnrollmentProgress
          steps={ENROLLMENT_STEPS}
          currentIndex={stepIndex}
          isComplete={isComplete}
          onStepSelect={goToStep}
          className="mt-6"
        />

        {submitError ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
          >
            {submitError}
          </div>
        ) : null}

        {isComplete ? (
          <EnrollmentSuccessPanel
            headingId={SUCCESS_HEADING_ID}
            values={values}
            applicationId={submittedApplicationId}
            hasCourseEnrollment={hasCourseEnrollment}
            nextPath={nextPath}
            onContinue={() =>
              window.location.assign(
                nextPath === "/student/dashboard"
                  ? nextPath
                  : `/student/dashboard?${new URLSearchParams({ next: nextPath })}`,
              )
            }
            className="mt-6"
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby={STEP_HEADING_ID}
            className="mt-6"
          >
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={values.personal.email}
              readOnly
              hidden
            />
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
                {...(step.id === "personal"
                  ? {
                      onBeforeAuthRedirect: saveDraftBeforeAuthRedirect,
                      onVerificationChange: handleVerificationChange,
                      onValidatePersonal: validatePersonal,
                      nextPath,
                    }
                  : {})}
              />

              <EnrollmentStepFooter
                onBack={() => goToStep(stepIndex - 1)}
                isFirst={isFirst}
                isLast={isLast}
                stepNumber={stepIndex + 1}
                totalSteps={ENROLLMENT_STEP_COUNT}
                isSubmitting={isSubmitting}
                submitLabel={isLast ? "Complete Registration" : undefined}
                loadingLabel={
                  isLast ? "Creating your account…" : undefined
                }
              />
            </EnrollmentStepPanel>
          </form>
        )}

        <p className="mt-6 flex items-start gap-2 text-center text-[11px] font-medium leading-relaxed text-brand-text-muted md:mt-8">
          <CircleCheck aria-hidden="true" className="mx-auto size-4 shrink-0" />
          Your email must be verified before registration is securely submitted
          to SPRINT.
        </p>
      </div>
    </div>
  );
}
