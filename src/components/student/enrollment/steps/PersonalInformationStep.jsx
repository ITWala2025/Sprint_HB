"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Globe,
  Mail,
  Map,
  Phone,
  User,
  UserRound,
} from "lucide-react";

import AuthButton from "@/components/student/auth/AuthButton";
import AuthField from "@/components/student/auth/AuthField";
import { createClient } from "@/lib/supabase/client";
import { checkEnrollmentEmailAction } from "@/app/student/enroll/actions";

import { DEFAULT_COUNTRY, COUNTRY_OPTIONS, getStatesForCountry } from "../enrollment-locations";
import { normalizeMobile, EMAIL_PATTERN } from "../enrollment-validation";

export default function PersonalInformationStep({
  idPrefix,
  values = {},
  errors = {},
  onChange,
  onBeforeAuthRedirect,
  onVerificationChange,
}) {
  const router = useRouter();
  const country = values.country ?? DEFAULT_COUNTRY;
  const stateOptions = getStatesForCountry(country);
  const email = values.email?.trim().toLowerCase() ?? "";
  const [emailStatus, setEmailStatus] = useState("idle");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    let active = true;
    setOtp("");
    setOtpSent(false);
    setVerificationError("");

    if (!EMAIL_PATTERN.test(email)) {
      setEmailStatus("idle");
      onVerificationChange?.(false, false);
      return () => {
        active = false;
      };
    }

    setEmailStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (
          session?.user?.email_confirmed_at &&
          session.user.email?.toLowerCase() === email
        ) {
          if (!active) return;
          setEmailStatus("verified");
          onVerificationChange?.(true, false);
          return;
        }

        const result = await checkEnrollmentEmailAction(email);
        if (!result.success) throw new Error(result.error);
        if (!active) return;

        setEmailStatus(result.exists ? "existing" : "new");
        onVerificationChange?.(false, false);
      } catch (error) {
        if (!active) return;
        setEmailStatus("error");
        setVerificationError(
          error instanceof Error
            ? error.message
            : "We couldn't check this email. Please try again.",
        );
        onVerificationChange?.(false, false);
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [email, onVerificationChange]);

  const handleCountryChange = (event) => {
    onChange("country")(event);
    onChange("state")({ target: { value: "" } });
  };

  const handlePhoneChange = (event) => {
    onChange("phone")({
      target: { value: normalizeMobile(event.target.value).slice(0, 10) },
    });
  };

  const handleSendOtp = async () => {
    if (!email || isSendingOtp) return;
    setVerificationError("");
    setIsSendingOtp(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim(),
            first_name: values.firstName ?? "",
            last_name: values.lastName ?? "",
            mobile_number: values.phone ?? "",
          },
        },
      });

      if (error) throw error;
      setOtpSent(true);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? `We couldn't send the verification code: ${error.message}`
          : "We couldn't send the verification code. Please try again.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp) || isVerifyingOtp) return;
    setVerificationError("");
    setIsVerifyingOtp(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      if (
        !data.session?.user?.email_confirmed_at ||
        data.session.user.email?.toLowerCase() !== email
      ) {
        throw new Error(
          "The code did not create a verified session for the email address in this form.",
        );
      }

      setEmailStatus("verified");
      onVerificationChange?.(true, true);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? `We couldn't verify that code: ${error.message}`
          : "We couldn't verify that code. Check it and try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleChangeEmail = () => {
    setOtp("");
    setOtpSent(false);
    setVerificationError("");
    setEmailStatus("new");
    onVerificationChange?.(false, false);
  };

  const routeToAccount = async (path) => {
    setVerificationError("");
    try {
      onBeforeAuthRedirect?.();
      router.push(path);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Your enrollment details could not be saved before leaving this page.",
      );
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-brand-text-muted">
        All seven fields are required — they open your student file.
      </p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <AuthField
          id={`${idPrefix}-firstName`}
          name="firstName"
          label="First Name"
          value={values.firstName ?? ""}
          onChange={onChange("firstName")}
          error={errors.firstName}
          placeholder="Ananya"
          autoComplete="given-name"
          icon={<User aria-hidden="true" className="size-4.5" />}
          hint="Spell it exactly as it should appear on your certificate."
          required
        />
        <AuthField
          id={`${idPrefix}-lastName`}
          name="lastName"
          label="Last Name"
          value={values.lastName ?? ""}
          onChange={onChange("lastName")}
          error={errors.lastName}
          placeholder="Sharma"
          autoComplete="family-name"
          icon={<UserRound aria-hidden="true" className="size-4.5" />}
          required
        />
        <AuthField
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          label="Email Address"
          value={values.email ?? ""}
          onChange={onChange("email")}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          icon={<Mail aria-hidden="true" className="size-4.5" />}
          hint="We will verify this address with a six-digit code."
          required
          disabled={
            otpSent ||
            isSendingOtp ||
            isVerifyingOtp
          }
        />
        <AuthField
          id={`${idPrefix}-dob`}
          name="dob"
          type="date"
          label="Date of Birth"
          value={values.dob ?? ""}
          onChange={onChange("dob")}
          error={errors.dob}
          autoComplete="bday"
          icon={<CalendarDays aria-hidden="true" className="size-4.5" />}
          showIcon={false}
          required
        />
        <AuthField
          id={`${idPrefix}-country`}
          name="country"
          label="Country"
          value={country}
          onChange={handleCountryChange}
          error={errors.country}
          placeholder="Select a country"
          autoComplete="country-name"
          options={COUNTRY_OPTIONS}
          icon={<Globe aria-hidden="true" className="size-4.5" />}
          required
        />
        <AuthField
          id={`${idPrefix}-state`}
          name="state"
          label="State"
          value={values.state ?? ""}
          onChange={onChange("state")}
          error={errors.state}
          placeholder={country ? "Select a state" : "Select a country first"}
          autoComplete="address-level1"
          options={stateOptions}
          icon={<Map aria-hidden="true" className="size-4.5" />}
          disabled={!country}
          hint={
            country
              ? "The list matches the country selected next to it."
              : "Choose a Country above to unlock the State list."
          }
          required
        />
        <AuthField
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          label="Phone Number"
          value={values.phone ?? ""}
          onChange={handlePhoneChange}
          error={errors.phone}
          placeholder="9876543210"
          autoComplete="tel"
          inputMode="tel"
          prefix="+91"
          icon={<Phone aria-hidden="true" className="size-4.5" />}
          hint="Class reminders and mentor calls are made to this number."
          required
        />
      </div>

      <section
        aria-label="Email verification"
        className="space-y-3 rounded-xl border border-brand-border bg-brand-off-white p-4"
      >
        {emailStatus === "checking" ? (
          <p role="status" className="text-sm text-brand-text-secondary">
            Checking this email…
          </p>
        ) : null}
        {emailStatus === "existing" ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-brand-navy">
              An account is already registered with this email. Sign in or
              reset your password to continue.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <AuthButton
                type="button"
                onClick={() =>
                  routeToAccount("/student/login?next=%2Fstudent%2Fdashboard")
                }
              >
                Log In to Existing Account
              </AuthButton>
              <AuthButton
                type="button"
                variant="secondary"
                onClick={() =>
                  routeToAccount(
                    "/student/forgot-password?next=%2Fstudent%2Fdashboard",
                  )
                }
              >
                Forgot Password?
              </AuthButton>
            </div>
          </div>
        ) : null}
        {emailStatus === "new" && !otpSent ? (
          <AuthButton
            type="button"
            loading={isSendingOtp}
            loadingLabel="Sending code…"
            onClick={handleSendOtp}
          >
            Send Verification Code
          </AuthButton>
        ) : null}
        {emailStatus === "new" && otpSent ? (
          <div className="space-y-3">
            <p role="status" className="text-sm text-brand-text-secondary">
              Enter the six-digit code sent to {email}.
            </p>
            <div
              className="flex items-center justify-center gap-2 sm:gap-3"
              role="group"
              aria-label="Six-digit verification code"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  id={`${idPrefix}-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={otp[index] ?? ""}
                  onChange={(event) => {
                    const digit = event.target.value.replace(/\D/g, "").slice(-1);
                    const next = (otp + "      ").slice(0, 6).split("");
                    next[index] = digit;
                    setOtp(next.join("").replace(/\s/g, ""));
                    if (digit && index < 5) {
                      const nextInput = document.getElementById(
                        `${idPrefix}-otp-${index + 1}`,
                      );
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Backspace" &&
                      !(otp[index] ?? "") &&
                      index > 0
                    ) {
                      const prevInput = document.getElementById(
                        `${idPrefix}-otp-${index - 1}`,
                      );
                      prevInput?.focus();
                    }
                  }}
                  onPaste={(event) => {
                    const pasted = event.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    if (pasted) {
                      event.preventDefault();
                      setOtp(pasted);
                      const targetIndex = Math.min(pasted.length, 5);
                      const target = document.getElementById(
                        `${idPrefix}-otp-${targetIndex}`,
                      );
                      target?.focus();
                    }
                  }}
                  className="h-12 w-10 rounded-lg border border-brand-border bg-brand-white text-center text-lg font-semibold text-brand-navy focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30 sm:h-14 sm:w-12"
                  required={index === 0}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AuthButton
                type="button"
                loading={isVerifyingOtp}
                loadingLabel="Verifying code…"
                disabled={otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                Verify Code
              </AuthButton>
              <AuthButton
                type="button"
                variant="secondary"
                loading={isSendingOtp}
                loadingLabel="Sending code…"
                onClick={handleSendOtp}
              >
                Resend Code
              </AuthButton>
            </div>
            <AuthButton
              type="button"
              variant="ghost"
              onClick={handleChangeEmail}
            >
              Use a different email
            </AuthButton>
          </div>
        ) : null}
        {emailStatus === "verified" ? (
          <p role="status" className="text-sm font-semibold text-emerald-800">
            Email verified. You can continue.
          </p>
        ) : null}
        {emailStatus === "error" || verificationError ? (
          <p role="alert" className="text-sm font-medium text-brand-red">
            {verificationError}
          </p>
        ) : null}
        {emailStatus === "new" && !verificationError ? (
          <p className="text-xs text-brand-text-muted">
            Verify your email before continuing to the next step.
          </p>
        ) : null}
      </section>
    </div>
  );
}
