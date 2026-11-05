import { useEffect, useState } from "react";
import { Check, Mail } from "lucide-react";

import { catalogueItems } from "@/data/courses";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/student/auth/AuthButton";

/**
 * Step 3 — verify the enrollment email with a Supabase magic link.
 */
export default function AccountStep({
  stepNumber = 3,
  headingId,
  summaryValues = {},
  onBeforeMagicLink,
  onVerificationChange,
}) {
  const personal = summaryValues.personal ?? {};
  const education = summaryValues.education ?? {};
  const selectedCourse = catalogueItems.find(
    (item) =>
      item.kind === "course" &&
      (item.slug === education.course || item.id === education.course),
  );
  const [databaseCourseTitle, setDatabaseCourseTitle] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(true);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const describeLinkError = (error) => {
    const message = String(error?.message ?? "").toLowerCase();
    const code = String(error?.code ?? "").toLowerCase();

    if (
      message.includes("redirect") &&
      (message.includes("not allowed") || message.includes("allow"))
    ) {
      return `Supabase does not allow the return address ${window.location.origin}/student/enroll. Add this URL (or its wildcard form) under Authentication → URL Configuration → Redirect URLs, then try again.`;
    }

    if (
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      code.includes("rate_limit")
    ) {
      return "Too many verification emails were requested. Wait a minute before trying again.";
    }

    if (
      message.includes("error sending") ||
      message.includes("smtp") ||
      message.includes("email provider")
    ) {
      return "Supabase could not deliver the verification email. Check the project's email/SMTP settings and try again.";
    }

    return error?.message
      ? `We couldn't send the verification link: ${error.message}`
      : "We couldn't send the verification link. Please check your connection and try again.";
  };

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

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const updateVerification = (user) => {
      if (!active) return;
      const verified = Boolean(
        user?.email_confirmed_at &&
          user.email?.toLowerCase() === personal.email?.trim().toLowerCase(),
      );
      setIsEmailVerified(verified);
      onVerificationChange?.(verified);
      setIsCheckingEmail(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateVerification(session?.user);
    });

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setVerificationError(
            "We couldn't check your email verification. Please try again.",
          );
        }
        updateVerification(data?.user);
      })
      .catch(() => {
        if (!active) return;
        setVerificationError(
          "We couldn't check your email verification. Please try again.",
        );
        setIsCheckingEmail(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [onVerificationChange, personal.email]);

  const handleSendMagicLink = async () => {
    const email = personal.email?.trim().toLowerCase();
    if (!email || isSendingLink) return;

    setVerificationError("");
    setLinkSent(false);
    setIsSendingLink(true);

    try {
      onBeforeMagicLink?.();
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            full_name: `${summaryValues?.personal?.firstName ?? ""} ${summaryValues?.personal?.lastName ?? ""}`.trim(),
            first_name: summaryValues?.personal?.firstName ?? "",
            last_name: summaryValues?.personal?.lastName ?? "",
            mobile_number: summaryValues?.personal?.phone ?? "",
          },
          emailRedirectTo: new URL(
            "/student/enroll?email_verified=1",
            window.location.origin,
          ).toString(),
        },
      });

      if (error) {
        setVerificationError(describeLinkError(error));
        return;
      }

      setLinkSent(true);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "We couldn't send the verification link. Please check your connection and try again.",
      );
    } finally {
      setIsSendingLink(false);
    }
  };

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
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          Verify that you can access this email address before submitting your
          enrollment. We will send a secure sign-in link to confirm it.
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
          {isEmailVerified ? (
            <Check className="size-5" aria-hidden="true" />
          ) : (
            <Mail className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold text-brand-navy">
            {isEmailVerified ? "Email verified" : "Verify your email"}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-brand-text-secondary">
            {isCheckingEmail
              ? "Checking your verification status…"
              : isEmailVerified
                ? `The address ${personal.email} is verified. You can submit your enrollment.`
                : linkSent
                  ? `A secure link was sent to ${personal.email}. Open it in this same browser tab to verify your email and continue.`
                  : "A magic link will be sent to the email address above. Open the link to verify your email before submitting."}
          </p>
          {!isEmailVerified ? (
            <AuthButton
              type="button"
              onClick={handleSendMagicLink}
              loading={isSendingLink}
              loadingLabel="Sending link…"
              disabled={isCheckingEmail || isSendingLink}
              icon={<Mail aria-hidden="true" className="size-4" />}
              className="mt-3 sm:w-auto"
            >
              {linkSent ? "Resend verification link" : "Send verification link"}
            </AuthButton>
          ) : null}
          {verificationError ? (
            <p className="mt-2 text-xs font-medium text-red-700" role="alert">
              {verificationError}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
