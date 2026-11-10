"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";

import HeaderLogo from "@/components/header/HeaderLogo";
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
import { compactErrors, normalizeMobile } from "./enrollment-validation";

const STEP_HEADING_ID = "enrollment-step-heading";
const SUCCESS_HEADING_ID = "enrollment-success-heading";
const ENROLLMENT_DRAFT_KEY = "student_enrollment_draft";

function fillMissingValues(currentValues, profileValues, preserveDraft) {
  return Object.fromEntries(
    Object.entries(profileValues).map(([field, value]) => [
      field,
      preserveDraft ? currentValues[field] : value || currentValues[field],
    ]),
  );
}

/**
 * Enrollment wizard shell.
 *
 * One state object holds every step's answers (`{ personal, password,
 * education }`) and the steps are controlled components reading from it. That is
 * what makes moving back and forth free: going forward merges the step's values
 * into that same object, going back just re-renders the step with the values it
 * left behind.
 *
 * The wizard owns everything generic — which step is active, validation on
 * submit, focus management, the progress indicator and the Back / Skip /
 * Continue bar. Each step only describes its own fields, through the contract
 * documented in `enrollment-steps.js`.
 *
 * A temporary session-storage draft preserves answers across refreshes and
 * while an existing applicant visits the login or password-recovery page.
 */
export default function EnrollmentWizard({ courseSlug = "" }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(createEmptyEnrollment);
  const [errors, setErrors] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [hasCourseEnrollment, setHasCourseEnrollment] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState("");
  const [submitError, setSubmitError] = useState("");
  // One-off message for a visible action (today: skipping an optional step).
  // Cleared by the next navigation so it never lingers on the wrong screen.
  const [statusNotice, setStatusNotice] = useState(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const initializeEnrollment = async () => {
      let hasSavedDraft = false;
      try {
        const saved = window.sessionStorage.getItem(ENROLLMENT_DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.values?.personal && draft.values?.education) {
            const empty = createEmptyEnrollment();
            setValues({
              ...empty,
              ...draft.values,
              personal: { ...empty.personal, ...draft.values.personal },
              education: { ...empty.education, ...draft.values.education },
              password: { ...empty.password },
            });
            setStatusNotice("Your saved enrollment details have been restored.");
            hasSavedDraft = true;
          }
        }
      } catch {
        setSubmitError(
          "Your saved enrollment details could not be restored. Please review and re-enter them.",
        );
      }

      try {
        const supabase = createClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!profile || !active) return;

        const fullName = String(profile.full_name ?? "").trim();
        const nameParts = fullName.split(/\s+/).filter(Boolean);
        const dateOfBirth =
          profile.date_of_birth ?? profile.dob ?? profile.birth_date ?? "";
        const personalProfile = {
          firstName: profile.first_name || nameParts[0] || "",
          lastName: profile.last_name || nameParts.slice(1).join(" "),
          email: profile.email || session.user.email || "",
          dob: typeof dateOfBirth === "string" ? dateOfBirth.slice(0, 10) : "",
          country: profile.country || "",
          state: profile.state || "",
          phone: normalizeMobile(
            String(profile.phone || profile.mobile_number || session.user.phone || ""),
          ).slice(0, 10),
        };
        const educationProfile = {
          collegeInstitution:
            profile.college_institution || profile.college || "",
          courseDegree: profile.course_degree || profile.degree || "",
          semesterYear: profile.year_semester || profile.semester || "",
          currentRole: profile.current_role || profile.employment_status || "",
        };

        setValues((previous) => ({
          ...previous,
          personal: {
            ...previous.personal,
            ...fillMissingValues(
              previous.personal,
              personalProfile,
              hasSavedDraft,
            ),
          },
          education: {
            ...previous.education,
            ...fillMissingValues(
              previous.education,
              educationProfile,
              hasSavedDraft,
            ),
          },
        }));
      } catch (error) {
        if (active) {
          setSubmitError(
            error instanceof Error
              ? `We couldn't load your saved profile: ${error.message}`
              : "We couldn't load your saved profile. Please try again.",
          );
        }
      } finally {
        if (active) setIsDraftLoaded(true);
      }
    };

    void initializeEnrollment();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) return;

    try {
      window.sessionStorage.setItem(
        ENROLLMENT_DRAFT_KEY,
        JSON.stringify({
          values: {
            personal: values.personal,
            education: values.education,
          },
        }),
      );
    } catch {
      setSubmitError(
        "Your enrollment details could not be saved in this browser. Please keep this page open.",
      );
    }
  }, [isDraftLoaded, values.education, values.personal]);

  const step = ENROLLMENT_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === ENROLLMENT_STEP_COUNT - 1;
  const StepComponent = step.Component;

  const goToStep = (index, notice = null) => {
    setErrors({});
    setSubmitError("");
    setIsComplete(false);
    setStatusNotice(notice);
    setStepIndex(index);
  };

  // `handleChangeIn("personal")("phone")` writes into any slice of the shared
  // state; for the active slice it reduces to the plain `handleChange("email")`
  // the fields are wired to.
  const handleChangeIn = (sliceId) => (field) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({
      ...previous,
      [sliceId]: { ...previous[sliceId], [field]: value },
    }));
    if (sliceId === "personal" && field === "email") {
      setIsEmailVerified(false);
      setNeedsPasswordSetup(false);
      setIsPasswordSet(false);
    }
    setSubmitError("");
    // Clear this field's error as soon as the student starts fixing it.
    setErrors((previous) =>
      previous[field] ? { ...previous, [field]: "" } : previous,
    );
  };

  const handleChange = handleChangeIn(step.id);

  const saveDraftBeforeAuthRedirect = useCallback(() => {
    try {
      window.sessionStorage.setItem(
        ENROLLMENT_DRAFT_KEY,
        JSON.stringify({
          values: {
            personal: values.personal,
            education: values.education,
          },
        }),
      );
    } catch {
      throw new Error(
        "Your enrollment details could not be saved before leaving this page. Please try again.",
      );
    }
  }, [values]);

  const clearSavedDraft = useCallback(() => {
    try {
      window.sessionStorage.removeItem(ENROLLMENT_DRAFT_KEY);
    } catch {
      setSubmitError("Your submitted enrollment draft could not be cleared from this browser.");
    }
  }, []);

  const handleVerificationChange = useCallback((verified, shouldSetPassword) => {
    setIsEmailVerified(verified);
    setNeedsPasswordSetup(Boolean(verified && shouldSetPassword));
  }, []);

  const submitEnrollment = async ({ includeSelectedProducts = true } = {}) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const education = values.education ?? {};
      const result = await submitStudentEnrollmentAction({
        personal: values.personal,
        education: {
          ...education,
          courseIds:
            includeSelectedProducts && education.course
              ? [education.course]
              : [],
          bundleIds:
            includeSelectedProducts && Array.isArray(education.bundleIds)
              ? education.bundleIds
              : [],
        },
      });

      if (!result.success) {
        setSubmitError(result.error);
        return false;
      }

      clearSavedDraft();
      setSubmittedApplicationId(result.applicationId);
      setHasCourseEnrollment(result.hasCourseEnrollment);
      setIsComplete(true);
      return true;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The registration could not be submitted right now.",
      );
      return false;
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
      // Same convention the fields use for their ids: `${step.id}-${fieldName}`.
      document.getElementById(`${step.id}-${firstInvalidField}`)?.focus();
      return;
    }

    if (step.id === "personal") {
      if (!isEmailVerified) return;
      goToStep(needsPasswordSetup ? stepIndex + 1 : stepIndex + 2);
      return;
    }

    if (step.id === "password") {
      if (isPasswordSet) {
        goToStep(stepIndex + 1);
        return;
      }

      setSubmitError("");
      setIsSubmitting(true);

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: values.password.newPassword,
        });
        if (error) throw error;

        setIsPasswordSet(true);
        setNeedsPasswordSetup(false);
        setValues((previous) => ({
          ...previous,
          password: { newPassword: "", confirmPassword: "" },
        }));
        goToStep(stepIndex + 1);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? `We couldn't set your password: ${error.message}`
            : "We couldn't set your password. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isLast) {
      await submitEnrollment({ includeSelectedProducts: true });
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
      step.skipNotice ??
      "You can complete this step later from your Student Dashboard.";
    if (isLast) {
      setStatusNotice(notice);
      void submitEnrollment({ includeSelectedProducts: false });
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

    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    document
      .getElementById(isComplete ? SUCCESS_HEADING_ID : STEP_HEADING_ID)
      ?.focus();
  }, [stepIndex, isComplete]);

  useEffect(() => {
    if (!isComplete) return undefined;

    const redirectTimer = window.setTimeout(() => {
      router.push("/student/dashboard");
    }, 2000);

    return () => window.clearTimeout(redirectTimer);
  }, [isComplete, router.push]);

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
            Share your details, verify your email if needed, then add optional
            education and course details. You can move back and forth without
            losing an answer.
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
            <CircleCheck
              aria-hidden="true"
              className="mt-px size-4 shrink-0 text-brand-red"
            />
            <p className="text-xs leading-relaxed text-brand-text-secondary">
              {statusNotice}
            </p>
          </div>
        ) : null}

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
                {...(step.id === "education"
                  ? { courseSlug, isEnrollmentStateReady: isDraftLoaded }
                  : {})}
                {...(step.id === "personal"
                  ? {
                      onBeforeAuthRedirect: saveDraftBeforeAuthRedirect,
                      onVerificationChange: handleVerificationChange,
                    }
                  : {})}
                {...(step.id === "password" ? { isPasswordSet } : {})}
              />

              <EnrollmentStepFooter
                onBack={() => goToStep(stepIndex - 1)}
                onSkip={step.isOptional ? handleSkip : undefined}
                isFirst={isFirst}
                isLast={isLast}
                stepNumber={stepIndex + 1}
                totalSteps={ENROLLMENT_STEP_COUNT}
                isSubmitting={isSubmitting}
                isSubmitDisabled={step.id === "personal" && !isEmailVerified}
              />
            </EnrollmentStepPanel>
          </form>
        )}

        <p className="mt-6 text-center text-[11px] font-medium leading-relaxed text-brand-text-muted md:mt-8">
          Your email must be verified before your registration is submitted
          securely to SPRINT.
        </p>
      </div>
    </div>
  );
}
