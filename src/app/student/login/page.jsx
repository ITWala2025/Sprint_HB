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
import { consumeStudentSignOutFlag } from "@/components/student/student-session";
import { resolveStudentLoginNextPath } from "@/lib/student-login-redirect";

import "./login.css";

const DEACTIVATED_ACCOUNT_MESSAGE = "Your account is deactivated. Contact to SPRINT.";

function escapeIlike(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

async function hasDeactivatedRegistration(supabase, userId, email) {
  const { data: byUserId, error: userIdError } = await supabase
    .from("registrations")
    .select("id")
    .eq("status", "deactivated")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (userIdError) throw new Error(`Could not verify registration status: ${userIdError.message}`);
  if (byUserId) return true;
  if (!email) return false;

  const { data: byEmail, error: emailError } = await supabase
    .from("registrations")
    .select("id")
    .eq("status", "deactivated")
    .ilike("email", escapeIlike(email))
    .limit(1)
    .maybeSingle();

  if (emailError) throw new Error(`Could not verify registration status: ${emailError.message}`);
  return Boolean(byEmail);
}

async function signOutDeactivatedStudent(supabase) {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[StudentLogin] Could not sign out a deactivated account:", error.message);
  } catch (error) {
    console.error("[StudentLogin] Could not sign out a deactivated account:", error);
  }
}

function getEnrollmentReturnPath() {
  if (typeof window === "undefined") return "/student/dashboard";
  return resolveStudentLoginNextPath(window.location.search);
}

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedOutNotice, setSignedOutNotice] = useState("");
  const [nextPath, setNextPath] = useState("/student/dashboard");

  useEffect(() => {
    document.body.classList.add("student-auth-page");
    setNextPath(getEnrollmentReturnPath());

    return () => {
      document.body.classList.remove("student-auth-page");
    };
  }, []);

  /*
   * Arriving here straight from the portal's Logout button shows a
   * confirmation, so the student knows the session was ended rather than
   * the page simply having thrown them out.
   */
  useEffect(() => {
    if (consumeStudentSignOutFlag()) {
      setSignedOutNotice("You have been signed out. Please sign in again.");
    }
  }, []);

  /*
   * Seamless portal entry: when an already-signed-in student opens the Sign In
   * page from the header they are sent straight to the
   * dashboard. Any other session is cleared so the form stays usable.
   * The middleware performs this redirect server-side; this is the client-side
   * fallback for transitions that never hit the network.
   */
  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      const supabase = createClient();
      if (new URLSearchParams(window.location.search).get("deactivated") === "1") {
        await signOutDeactivatedStudent(supabase);
        setError(DEACTIVATED_ACCOUNT_MESSAGE);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted || !user) {
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status, is_active, onboarding_completed, email")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) {
          return;
        }

        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("status")
          .eq("id", user.id)
          .maybeSingle();

        if (studentError) {
          await supabase.auth.signOut();
          if (mounted) setError("We couldn't verify your Student Portal account. Please try again or contact SPRINT support.");
          return;
        }
        const deactivated = profile?.is_active === false ||
          student?.status === "deactivated" ||
          (!student && await hasDeactivatedRegistration(
            supabase,
            user.id,
            profile?.email || user.email || "",
          ));

        if (!mounted) {
          return;
        }

        if (deactivated) {
          await signOutDeactivatedStudent(supabase);
          setError(DEACTIVATED_ACCOUNT_MESSAGE);
          return;
        }

        if (profile?.role === "student" && profile?.status === "active" && profile?.is_active !== false) {
          window.location.assign(
            profile.onboarding_completed === false
              ? getEnrollmentPath()
              : getEnrollmentReturnPath(),
          );
          return;
        }

        if (
          profile?.role === "student" &&
          profile?.onboarding_completed === false &&
          profile?.is_active !== false
        ) {
          window.location.assign(getEnrollmentPath());
          return;
        }

        // A session without an active student profile is stale on this screen.
        await supabase.auth.signOut();
      } catch (error) {
        console.error("[StudentLogin] Could not verify the current account:", error);
        if (mounted) {
          setError("We couldn't verify your Student Portal account. Please try again or contact SPRINT support.");
        }
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

    let authTimeout;
    try {
      const supabase = createClient();
      const authPromise = supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
      const timeoutPromise = new Promise((_, reject) => {
        authTimeout = window.setTimeout(
          () =>
            reject(
              new Error(
                "Authentication request timed out (8s limit). Please check your network connection.",
              ),
            ),
          8000,
        );
      });
      const { data, error: signInError } = await Promise.race([
        authPromise,
        timeoutPromise,
      ]);
      window.clearTimeout(authTimeout);

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
        .select("role, status, is_active, onboarding_completed, email")
        .eq("id", userId)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError(
          "We couldn't find your Student Portal profile. If you have submitted an enrollment, use Forgot Password or contact SPRINT support."
        );
        return;
      }

      if (profile.is_active === false) {
        await signOutDeactivatedStudent(supabase);
        setError(DEACTIVATED_ACCOUNT_MESSAGE);
        return;
      }

      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("status")
        .eq("id", userId)
        .maybeSingle();

      if (studentError) {
        await supabase.auth.signOut();
        setError("We couldn't verify your Student Portal account. Please try again or contact SPRINT support.");
        return;
      }

      let registrationDeactivated = false;
      if (!student) {
        try {
          registrationDeactivated = await hasDeactivatedRegistration(
            supabase,
            userId,
            profile.email || data.user.email || trimmedEmail,
          );
        } catch {
          await supabase.auth.signOut();
          setError("We couldn't verify your Student Portal account. Please try again or contact SPRINT support.");
          return;
        }
      }

      if (profile.is_active === false || student?.status === "deactivated" || registrationDeactivated) {
        await signOutDeactivatedStudent(supabase);
        setError(DEACTIVATED_ACCOUNT_MESSAGE);
        return;
      }

      if (profile.role !== "student") {
        await supabase.auth.signOut();
        setError(
          "This account does not have Student Portal access. Please sign in with a student account."
        );
        return;
      }

      if (profile.status !== "active" || profile.is_active === false) {
        await supabase.auth.signOut();
        setError(
          "Your account is currently inactive. Please contact SPRINT support."
        );
        return;
      }

      if (profile.onboarding_completed === false) {
        window.location.assign(getEnrollmentPath());
        return;
      }

      window.location.assign(getEnrollmentReturnPath());
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message.includes("timed out")
          ? caught.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      if (authTimeout) window.clearTimeout(authTimeout);
      setLoading(false);
    }
  };

  const getEnrollmentPath = () =>
    nextPath === "/student/dashboard"
      ? "/student/enroll"
      : `/student/enroll?${new URLSearchParams({ next: nextPath })}`;
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
            {/* Heading */}
            <header className="student-login-heading">
              <span className="student-login-eyebrow">
                STUDENT PORTAL
              </span>

              <h1>
                Welcome <strong>Back!</strong>
              </h1>

              <p>
                <q>
                  Your dedication today is the foundation of your success
                  tomorrow.
                </q>
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

                <Link
                  href={
                    nextPath === "/student/dashboard"
                      ? "/student/forgot-password"
                      : `/student/forgot-password?${new URLSearchParams({ next: nextPath })}`
                  }
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Signed-out confirmation (see LogoutButton) */}
              {signedOutNotice && (
                <div
                  className="student-login-notice"
                  role="status"
                  aria-live="polite"
                >
                  {signedOutNotice}
                </div>
              )}

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

          </div>
        </section>
      </section>

    </main>
  );
}