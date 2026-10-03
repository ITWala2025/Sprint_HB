"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Mail,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import "./check-email.css";

const RESEND_COOLDOWN = 30;

export default function CheckEmailPage() {
  const [email, setEmail] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    try {
      const storedEmail = window.sessionStorage.getItem(
        "student_recovery_email"
      );

      if (storedEmail) {
        setEmail(storedEmail);
      }
    } catch {
      // Session storage may be unavailable.
    }
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (resending || secondsLeft > 0) {
      return;
    }

    setResendSuccess("");
    setResendError("");

    if (!email) {
      setResendError(
        "We couldn't find the recovery email. Please return to Sign In and try again."
      );
      return;
    }

    setResending(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/set-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
        }
      );

      /*
       * Keep the response generic. We do not expose whether
       * the email belongs to an existing account.
       */
      if (error) {
        console.warn(
          "Password recovery resend:",
          error.message
        );
      }

      setResendSuccess(
        "A new password reset link has been sent to your email."
      );

      setSecondsLeft(RESEND_COOLDOWN);
    } catch (error) {
      console.error(
        "Password recovery resend failed:",
        error
      );

      setResendError(
        "We couldn't resend the email right now. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = (() => {
    if (!email) {
      return "your registered email address";
    }

    const [localPart, domain] = email.split("@");

    if (!localPart || !domain) {
      return email;
    }

    if (localPart.length <= 2) {
      return `${localPart.charAt(0)}•••@${domain}`;
    }

    return `${localPart.slice(0, 2)}•••@${domain}`;
  })();

  return (
    <main className="student-check-email-page">
      <section
        className="student-check-email-card"
        aria-label="SPRINT Check Your Email"
      >
        {/* =====================================================
            LEFT — HERO IMAGE
        ====================================================== */}
        <div className="student-check-email-visual">
          <Image
            src="/images/student/sprint-auth-shared-hero.webp"
            alt="SPRINT Student Portal"
            fill
            priority
            sizes="(max-width: 767px) 0px, 42vw"
            className="student-check-email-visual__image"
          />
        </div>

        {/* =====================================================
            RIGHT — CONTENT
        ====================================================== */}
        <section className="student-check-email-panel">
          <div className="student-check-email-wrapper">
            {/* Mobile-only logo */}
            <div className="student-check-email-mobile-logo">
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
              className="student-check-email-back"
            >
              <ArrowLeft size={16} strokeWidth={1.9} />
              <span>Back to Sign In</span>
            </Link>

            {/* Email icon */}
            <div
              className="student-check-email-icon"
              aria-hidden="true"
            >
              <Mail size={29} strokeWidth={1.7} />
            </div>

            {/* Heading */}
            <header className="student-check-email-heading">
              <span className="student-check-email-eyebrow">
                PASSWORD RECOVERY
              </span>

              <h1>
                Check Your <strong>Email</strong>
              </h1>

              <p>
                We've sent a password reset link to your
                registered email address.
              </p>

              {email && (
                <div className="student-check-email-address">
                  <Mail size={15} strokeWidth={1.8} />

                  <span>{maskedEmail}</span>
                </div>
              )}

              <p>
                Please check your inbox and follow the
                instructions to create a new password.
              </p>
            </header>

            {/* Spam tip */}
            <div className="student-check-email-tip">
              <div
                className="student-check-email-tip-icon"
                aria-hidden="true"
              >
                <Clock3 size={17} strokeWidth={1.8} />
              </div>

              <div>
                <strong>Didn't receive the email?</strong>

                <p>
                  Check your spam or junk folder. It may take
                  a few moments for the email to arrive.
                </p>
              </div>
            </div>

            {/* Resend */}
            <div className="student-check-email-resend">
              <span>Still haven't received it?</span>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || secondsLeft > 0}
              >
                {resending ? (
                  <>
                    <RefreshCw
                      size={15}
                      strokeWidth={1.9}
                      className="student-check-email-spin"
                    />
                    Sending...
                  </>
                ) : secondsLeft > 0 ? (
                  <>
                    <Clock3
                      size={15}
                      strokeWidth={1.9}
                    />
                    Resend in {secondsLeft}s
                  </>
                ) : (
                  <>
                    <RefreshCw
                      size={15}
                      strokeWidth={1.9}
                    />
                    Resend Email
                  </>
                )}
              </button>
            </div>

            {/* Success */}
            {resendSuccess && (
              <div
                className="student-check-email-success"
                role="status"
                aria-live="polite"
              >
                <Check
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>{resendSuccess}</span>
              </div>
            )}

            {/* Error */}
            {resendError && (
              <div
                className="student-check-email-error"
                role="alert"
                aria-live="polite"
              >
                {resendError}
              </div>
            )}

            {/* Sign in */}
            <Link
              href="/student/login"
              className="student-check-email-signin"
            >
              <ArrowLeft size={17} strokeWidth={1.9} />
              Back to Sign In
            </Link>

            {/* Footer */}
            <footer className="student-check-email-footer">
              © {new Date().getFullYear()} SPRINT. All rights reserved.
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}