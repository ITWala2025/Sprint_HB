"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import SignupModal from "@/components/student/auth/SignupModal";

import "./login.css";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("student-auth-page");

    return () => {
      document.body.classList.remove("student-auth-page");
    };
  }, []);

  /*
   * Seamless portal entry: when an already-signed-in student opens the Sign In
   * page (e.g. via the "Student Portal" header button) they are sent straight
   * to the dashboard. Any other session is cleared so the form stays usable.
   * The middleware performs this redirect server-side; this is the client-side
   * fallback for transitions that never hit the network.
   */
  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted || !user) {
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) {
          return;
        }

        if (profile?.role === "student" && profile?.status === "active") {
          window.location.href = "/student/dashboard";
          return;
        }

        // A session without an active student profile is stale on this screen.
        await supabase.auth.signOut();
      } catch {
        // Treat any failure as a fresh sign-in flow.
      }
    };

    checkExistingSession();

    return () => {
      mounted = false;
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

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (signInError) {
        const message = `${signInError.message}`.toLowerCase();

        if (message.includes("email not confirmed")) {
          setError(
            "Please confirm your email before signing in. Check your inbox for the confirmation link."
          );
        } else if (message.includes("rate limit")) {
          setError("Too many attempts. Please try again in a moment.");
        } else {
          setError(
            "Invalid email or password. Please try again."
          );
        }
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        setError("We couldn't sign you in right now. Please try again.");
        return;
      }

      /*
       * Verify the student profile before granting access — the dashboard is
       * only reachable for role = "student" with status = "active".
       */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", userId)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError(
          "We couldn't find your student profile. Please contact support."
        );
        return;
      }

      if (profile.role !== "student") {
        await supabase.auth.signOut();
        setError(
          "This account does not have Student Portal access. Please sign in with a student account."
        );
        return;
      }

      if (profile.status !== "active") {
        await supabase.auth.signOut();
        setError(
          "Your account is currently inactive. Please contact SPRINT support."
        );
        return;
      }

      window.location.href = "/student/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="student-login-page">
      <section
        className="student-login-card"
        aria-label="SPRINT Student Portal Login"
      >
        {/* =========================
            LEFT — HERO IMAGE
        ========================== */}
        <div className="student-login-visual">
          <Image
            src="/images/student/sprint-auth-shared-hero.webp"
            alt="SPRINT Student Portal"
            fill
            priority
            sizes="(max-width: 767px) 0px, 42vw"
            className="student-login-visual__image"
          />
        </div>

        {/* =========================
            RIGHT — LOGIN FORM
        ========================== */}
        <section className="student-login-form-panel">
          <div className="student-login-form-wrapper">
            {/* Mobile-only logo */}
            <div className="student-login-mobile-logo">
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

            {/* Top account link */}
            <div className="student-login-top-link">
              <span>Don't have an account?</span>

              <button
                type="button"
                className="student-login-top-enroll"
                onClick={() => setIsSignupOpen(true)}
                disabled={loading}
              >
                Enroll Now
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Heading */}
            <header className="student-login-heading">
              <span className="student-login-eyebrow">
                STUDENT PORTAL
              </span>

              <h1>
                Welcome <strong>Back!</strong>
              </h1>

              <p>
                Sign in to your account and continue your learning
                journey with SPRINT.
              </p>
            </header>

            {/* Form */}
            <form
              className="student-login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email */}
              <div className="student-login-field">
                <label htmlFor="student-login-email">
                  Email Address
                </label>

                <div className="student-login-input">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="student-login-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="student-login-field">
                <div className="student-login-label-row">
                  <label htmlFor="student-login-password">
                    Password
                  </label>
                </div>

                <div className="student-login-input">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="student-login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="student-login-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="student-login-options">
                <label className="student-login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    disabled={loading}
                  />

                  <span className="student-login-checkmark">
                    ✓
                  </span>

                  <span>Remember me</span>
                </label>

                <Link href="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="student-login-error"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="student-login-submit"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing In..." : "Sign In"}
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

            {/* Divider */}
            <div className="student-login-divider">
              <span>OR</span>
            </div>

            {/* Enrollment */}
            <p className="student-login-enroll">
              Don't have a SPRINT account?

              <button
                type="button"
                className="student-login-enroll-btn"
                onClick={() => setIsSignupOpen(true)}
                disabled={loading}
              >
                Enroll Now
              </button>
            </p>

            {/* Security */}
            <div className="student-login-security">
              <LockKeyhole
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span>
                Your account and learning information are securely
                protected.
              </span>
            </div>

            {/* Footer */}
            <footer className="student-login-footer">
              © {new Date().getFullYear()} SPRINT. All rights reserved.
            </footer>
          </div>
        </section>
      </section>

      {/* Signup opens as a modal on top of Sign In — no separate route. */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
      />
    </main>
  );
}