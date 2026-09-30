"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("student-auth-page");

    return () => {
      document.body.classList.remove("student-auth-page");
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const redirectTo = `${window.location.origin}/student/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo,
        });

      /*
       * Store the email only for the current recovery flow.
       * It allows the Check Email page to display the
       * address that the student entered.
       */
      try {
        window.sessionStorage.setItem(
          "student_recovery_email",
          trimmedEmail
        );
      } catch {
        // Session storage may be unavailable in some environments.
      }

      /*
       * Do not reveal whether the email exists.
       * The user is taken to Check Email even when Supabase
       * returns a recovery-related error.
       */
      if (resetError) {
        console.warn(
          "Password recovery request:",
          resetError.message
        );
      }

      window.location.href = "/student/check-email";
    } catch (requestError) {
      console.error(
        "Password recovery request failed:",
        requestError
      );

      /*
       * Keep the account-recovery response generic.
       */
      window.location.href = "/student/check-email";
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="student-forgot-page">
      <section
        className="student-forgot-card"
        aria-label="SPRINT Password Recovery"
      >
        {/* =====================================================
            LEFT — HERO IMAGE
        ====================================================== */}
        <div className="student-forgot-visual">
          <Image
            src="/images/student/sprint-auth-shared-hero.webp"
            alt="SPRINT Student Portal"
            fill
            priority
            sizes="(max-width: 767px) 0px, 42vw"
            className="student-forgot-visual__image"
          />
        </div>

        {/* =====================================================
            RIGHT — FORM
        ====================================================== */}
        <section className="student-forgot-form-panel">
          <div className="student-forgot-form-wrapper">
            {/* Mobile-only logo */}
            <div className="student-forgot-mobile-logo">
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

            {/* Back to sign in */}
            <Link
              href="/student/login"
              className="student-forgot-back"
            >
              <ArrowLeft size={16} strokeWidth={1.9} />
              <span>Back to Sign In</span>
            </Link>

            {/* Icon */}
            <div
              className="student-forgot-icon"
              aria-hidden="true"
            >
              <Mail size={25} strokeWidth={1.8} />
            </div>

            {/* Heading */}
            <header className="student-forgot-heading">
              <span className="student-forgot-eyebrow">
                ACCOUNT RECOVERY
              </span>

              <h1>
                Forgot <strong>Password?</strong>
              </h1>

              <p>
                Enter your registered email address and we'll
                send you a secure link to reset your password.
              </p>
            </header>

            {/* Form */}
            <form
              className="student-forgot-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="student-forgot-field">
                <label htmlFor="student-forgot-email">
                  Email Address
                </label>

                <div className="student-forgot-input">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="student-forgot-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="student-forgot-error"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="student-forgot-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Sending Reset Link..."
                    : "Send Reset Link"}
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

            {/* Security information */}
            <div className="student-forgot-security">
              <strong>Secure account recovery</strong>

              <p>
                For your security, you'll receive instructions
                by email to create a new password.
              </p>
            </div>

            {/* Footer */}
            <footer className="student-forgot-footer">
              © {new Date().getFullYear()} SPRINT. All rights reserved.
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}