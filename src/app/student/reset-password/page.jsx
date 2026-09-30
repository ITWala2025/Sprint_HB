"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  LockKeyhole,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import "./reset-password.css";

const PASSWORD_RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "number",
    label: "One number",
    test: (password) => /\d/.test(password),
  },
  {
    key: "special",
    label: "One special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export default function ResetPasswordPage() {
  const [supabase] = useState(() => createClient());

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  /*
   * This state is intentionally NOT used to hide the form.
   *
   * The Create New Password UI should be visible when the
   * page opens. We only use this information when the user
   * submits the new password.
   */
  const [hasRecoverySession, setHasRecoverySession] =
    useState(false);

  const [error, setError] = useState("");

  const passwordRules = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      valid: rule.test(newPassword),
    }));
  }, [newPassword]);

  const passwordIsValid =
    newPassword.length > 0 &&
    passwordRules.every((rule) => rule.valid);

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const confirmPasswordHasError =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  /*
   * ---------------------------------------------------------
   * RECOVERY SESSION
   * ---------------------------------------------------------
   *
   * We check the session in the background.
   *
   * IMPORTANT:
   * We do NOT show a "Verifying reset link" screen.
   * We do NOT hide the password form.
   */
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (session) {
          setHasRecoverySession(true);
        }
      } catch (sessionError) {
        console.warn(
          "Initial recovery session check failed:",
          sessionError
        );
      }
    };

    checkSession();

    /*
     * Supabase may establish the recovery session after
     * the page has already rendered.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          if (session) {
            setHasRecoverySession(true);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  /*
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
     * Validate password requirements first.
     */
    if (!passwordIsValid) {
      setError(
        "Please meet all password requirements before continuing."
      );
      return;
    }

    /*
     * Validate matching passwords.
     */
    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Do one fresh session check at submit time.
       *
       * This is important because the recovery session may
       * have been established after the page initially loaded.
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Recovery session check failed:",
          sessionError
        );

        setError(
          "We couldn't verify your password reset session. Please open the reset link from your email again."
        );

        return;
      }

      if (!session) {
        setHasRecoverySession(false);

        setError(
          "This password reset link is invalid or has expired. Please request a new reset link."
        );

        return;
      }

      setHasRecoverySession(true);

      /*
       * Update password.
       */
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        console.error(
          "Password update failed:",
          updateError
        );

        setError(
          "We couldn't reset your password. Please try again or request a new reset link."
        );

        return;
      }

      /*
       * Remove temporary recovery email.
       */
      try {
        window.sessionStorage.removeItem(
          "student_recovery_email"
        );
      } catch {
        // Ignore storage errors.
      }

      /*
       * Password successfully updated.
       */
      window.location.href =
        "/student/password-reset-success";
    } catch (resetError) {
      console.error(
        "Unexpected password reset error:",
        resetError
      );

      setError(
        "Something went wrong while resetting your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="student-reset-page">
      <section
        className="student-reset-card"
        aria-label="SPRINT Create New Password"
      >
        {/* =====================================================
            LEFT — HERO IMAGE
        ====================================================== */}
        <div className="student-reset-visual">
          <Image
            src="/images/student/sprint-auth-shared-hero.webp"
            alt="SPRINT Student Portal"
            fill
            priority
            sizes="(max-width: 767px) 0px, 42vw"
            className="student-reset-visual__image"
          />
        </div>

        {/* =====================================================
            RIGHT — PASSWORD FORM
        ====================================================== */}
        <section className="student-reset-panel">
          <div className="student-reset-wrapper">
            {/* Mobile-only logo */}
            <div className="student-reset-mobile-logo">
              <Link href="/" aria-label="SPRINT Home">
                <Image
                  src="/images/student/sprint-full-logo.webp"
                  alt="SPRINT - School of Professional Studies & Information Technology"
                  width={500}
                  height={130}
                  priority
                />
              </Link>
            </div>

            {/* Back */}
            <Link
              href="/student/login"
              className="student-reset-back"
            >
              <ArrowLeft size={16} strokeWidth={1.9} />
              <span>Back to Sign In</span>
            </Link>

            {/* Heading */}
            <header className="student-reset-heading">
              <span className="student-reset-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>
                Create a new <strong>password</strong>
              </h1>

              <p>
                Choose a strong password to keep your SPRINT
                account secure.
              </p>
            </header>

            {/* =================================================
                FORM
            ================================================== */}
            <form
              className="student-reset-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* New Password */}
              <div className="student-reset-field">
                <label htmlFor="student-new-password">
                  New Password
                </label>

                <div className="student-reset-input">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="student-new-password"
                    name="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    autoFocus
                    disabled={loading}
                    aria-describedby="password-requirements"
                  />

                  <button
                    type="button"
                    className="student-reset-password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showNewPassword}
                    disabled={loading}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div
                id="password-requirements"
                className="student-reset-requirements"
              >
                <div className="student-reset-requirements-title">
                  <span>Password requirements</span>
                </div>

                <div className="student-reset-rules">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.key}
                      className={`student-reset-rule ${
                        rule.valid ? "is-valid" : ""
                      }`}
                    >
                      <span className="student-reset-rule-icon">
                        <Check
                          size={12}
                          strokeWidth={2.4}
                          aria-hidden="true"
                        />
                      </span>

                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="student-reset-field">
                <label htmlFor="student-confirm-password">
                  Confirm New Password
                </label>

                <div
                  className={`student-reset-input ${
                    confirmPasswordHasError
                      ? "has-error"
                      : ""
                  } ${
                    passwordsMatch
                      ? "has-success"
                      : ""
                  }`}
                >
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="student-confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    aria-invalid={
                      confirmPasswordHasError
                    }
                  />

                  <button
                    type="button"
                    className="student-reset-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={
                      showConfirmPassword
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                {confirmPasswordHasError && (
                  <span className="student-reset-field-error">
                    Passwords do not match.
                  </span>
                )}

                {passwordsMatch && (
                  <span className="student-reset-field-success">
                    Passwords match.
                  </span>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  className="student-reset-error"
                  role="alert"
                  aria-live="polite"
                >
                  <CircleAlert
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="student-reset-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Resetting Password..."
                    : "Reset Password"}
                </span>

                {!loading && (
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </button>
            </form>

            {/* =================================================
                SECURITY NOTE
            ================================================== */}
            <div className="student-reset-security">
              <LockKeyhole
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <p>
                Your password is securely encrypted and
                will never be shared with anyone.
              </p>
            </div>

            {/* Footer */}
            <footer className="student-reset-footer">
              © {new Date().getFullYear()} SPRINT. All rights
              reserved.
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}