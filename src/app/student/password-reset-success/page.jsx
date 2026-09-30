"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  Check,
  LockKeyhole,
} from "lucide-react";

import "./password-reset-success.css";

export default function PasswordResetSuccessPage() {
  useEffect(() => {
    document.body.classList.add("student-auth-page");

    return () => {
      document.body.classList.remove("student-auth-page");
    };
  }, []);

  return (
    <main className="student-reset-success-page">
      <section
        className="student-reset-success-card"
        aria-label="SPRINT Password Reset Successful"
      >
        {/* =====================================================
            LEFT — HERO IMAGE
        ====================================================== */}
        <div className="student-reset-success-visual">
          <Image
            src="/images/student/sprint-auth-shared-hero.webp"
            alt="SPRINT Student Portal"
            fill
            priority
            sizes="(max-width: 767px) 0px, 42vw"
            className="student-reset-success-visual__image"
          />
        </div>

        {/* =====================================================
            RIGHT — SUCCESS CONTENT
        ====================================================== */}
        <section className="student-reset-success-panel">
          <div className="student-reset-success-wrapper">
            {/* Mobile-only logo */}
            <div className="student-reset-success-mobile-logo">
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

            {/* Success Icon */}
            <div
              className="student-reset-success-icon"
              aria-hidden="true"
            >
              <Check
                size={31}
                strokeWidth={2.2}
              />
            </div>

            {/* Heading */}
            <header className="student-reset-success-heading">
              <span className="student-reset-success-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>
                Password Reset <strong>Successfully!</strong>
              </h1>

              <p>
                Your password has been updated successfully.
                You can now sign in to your SPRINT Student
                Portal using your new password.
              </p>
            </header>

            {/* Primary CTA */}
            <Link
              href="/student/login"
              className="student-reset-success-signin"
            >
              <span>Sign In to Student Portal</span>

              <ArrowRight
                size={18}
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>

            {/* Homepage */}
            <Link
              href="/"
              className="student-reset-success-home"
            >
              Go to Homepage
            </Link>

            {/* Security Tip */}
            <div className="student-reset-success-security">
              <div
                className="student-reset-success-security-icon"
                aria-hidden="true"
              >
                <LockKeyhole
                  size={16}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <strong>Keep your account secure</strong>

                <p>
                  Never share your password or account
                  credentials with anyone. Use a unique
                  password for your SPRINT account.
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="student-reset-success-footer">
              © {new Date().getFullYear()} SPRINT. All rights
              reserved.
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}