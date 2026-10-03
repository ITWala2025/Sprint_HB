"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { EMAIL_PATTERN } from "./auth-validation";

import "./signup-modal.css";

/**
 * Accepts an Indian 10-digit mobile (optionally prefixed with +91 / 0). Dashes,
 * spaces and parentheses are stripped before testing.
 */
const MOBILE_PATTERN = /^(\+91|0)?[6-9]\d{9}$/;

/** Normalise a mobile number to plain 10 digits for storage. */
const normalizeMobile = (value) => {
  const digits = value.replace(/[\s()-]/g, "");
  return /^(\+91|0)/.test(digits) ? digits.slice(-10) : digits;
};

/** A throw-away password Supabase requires at sign-up; the student replaces it at /set-password. */
const generateTemporaryPassword = () => {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let password = "";
  for (const byte of bytes) {
    password += alphabet[byte % alphabet.length];
  }
  return password;
};

/**
 * SignupModal — "Enroll Now / Create Account" dialog on top of the Student
 * Login page.
 *
 * Deliberately asks no password: the student receives a secure link to
 * /set-password where they create their own password. The open state
 * (`isOpen`) is owned by the login page so the modal sits on top of the
 * existing screen without a route of its own.
 */
export default function SignupModal({ isOpen, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const firstNameRef = useRef(null);
  const lastFocusRef = useRef(null);
  const loadingRef = useRef(false);

  // Keep the latest value readable by the Escape handler without re-binding it.
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  /*
   * Runs only when the dialog opens: reset the form, lock page scroll and move
   * focus into the first field. Deliberately NOT keyed on `loading` — a submit
   * toggling `loading` must never wipe the success state.
   */
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    lastFocusRef.current = document.activeElement;
    setErrors({});
    setFormError("");
    setIsComplete(false);

    // Lock page scroll behind the dialog.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    firstNameRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      lastFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Escape closes the dialog, except while a request is in flight.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loadingRef.current) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const validate = () => {
    const nextErrors = {};

    const trimmedFirstName = firstName.trim();
    if (!trimmedFirstName) {
      nextErrors.firstName = "Please enter your first name.";
    }

    const trimmedLastName = lastName.trim();
    if (!trimmedLastName) {
      nextErrors.lastName = "Please enter your last name.";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const trimmedMobile = mobile.trim();
    if (!trimmedMobile) {
      nextErrors.mobile = "Please enter your mobile number.";
    } else if (!MOBILE_PATTERN.test(trimmedMobile)) {
      nextErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedMobile = normalizeMobile(mobile);

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        // Supabase Auth owns the password; the student replaces this random
        // value at /set-password. No password is ever stored in our profiles.
        password: generateTemporaryPassword(),
        options: {
          data: {
            first_name: normalizedFirstName,
            last_name: normalizedLastName,
            full_name: `${normalizedFirstName} ${normalizedLastName}`,
            mobile_number: normalizedMobile,
            role: "student",
          },
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      });

      if (signUpError) {
        const message = `${signUpError.message}`.toLowerCase();
        if (
          message.includes("already registered") ||
          message.includes("already been registered")
        ) {
          setFormError(
            "This email is already registered. Please sign in or use Forgot Password."
          );
        } else if (message.includes("rate limit")) {
          setFormError(
            "Too many attempts. Please wait a moment and try again."
          );
        } else {
          setFormError(
            "We couldn't create your account right now. Please try again."
          );
        }
        return;
      }

      // The student does not know the temporary password, so no session may
      // linger from the sign-up call.
      await supabase.auth.signOut();

      /*
       * Create the student profile. The database trigger
       * (`handle_new_user`) normally creates it from the sign-up metadata —
       * this upsert keeps the profile complete when the trigger is not
       * installed. RLS allows a user to insert only their own row.
       */
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user?.id,
            first_name: normalizedFirstName,
            last_name: normalizedLastName,
            email: normalizedEmail,
            mobile_number: normalizedMobile,
            role: "student",
            status: "active",
          },
          { onConflict: "id" }
        );

      if (profileError) {
        // The user is already created — do not fail the whole flow if the
        // profile upsert races with the DB trigger.
        console.warn(
          "[SPRINT Signup] Profile upsert skipped:",
          profileError.message
        );
      }

      /*
       * Password setup email:
       * - E-mail confirmation is usually enabled, so the sign-up confirmation
       *   e-mail IS the secure /set-password invitation.
       * - If the instance auto-confirms, send a recovery e-mail so the link to
       *   /set-password is still delivered.
       */
      const emailWasConfirmationPending = !data.user?.email_confirmed_at;
      if (!emailWasConfirmationPending) {
        await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/set-password`,
        });
      }

      setIsComplete(true);
    } catch {
      setFormError(
        "We couldn't complete your request right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return isOpen ? (
    <div className="student-signup-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-signup-heading"
        aria-describedby="student-signup-description"
        className="student-signup-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        {isComplete ? (
          /* ================= SUCCESS STATE ================= */
          <section className="student-signup-success" aria-labelledby="student-signup-success-heading">
            <div className="student-signup-success-icon" aria-hidden="true">
              <Check size={36} strokeWidth={2.2} />
            </div>

            <header className="student-signup-success-head">
              <h2 id="student-signup-success-heading" className="student-signup-heading-title">
                Account created successfully!
              </h2>

              <p className="student-signup-description">
                Check your email to set your password.
              </p>

              <p className="student-signup-success-note">
                We've sent a secure link to set up your password. Once you've
                created it, you'll be signed in to your Student Dashboard
                automatically.
              </p>
            </header>

            <button
              type="button"
              className="student-signup-primary"
              onClick={onClose}
            >
              <span>Back to Sign In</span>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </section>
        ) : (
<>
          /* ================= SIGNUP FORM ================= */
          <div className="student-signup-head">
            <span className="student-signup-eyebrow">STUDENT PORTAL</span>

            <h2 id="student-signup-heading" className="student-signup-heading-title">
              Create your <strong>account</strong>
            </h2>

            <p id="student-signup-description">
              Enroll in seconds — we'll email you a secure link to set your
              password.
            </p>

            <button
              type="button"
              className="student-signup-close"
              onClick={onClose}
              aria-label="Close sign up"
              disabled={loading}
            >
              <X size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <form className="student-signup-form" onSubmit={handleSubmit} noValidate>
            {/* First Name */}
            <div className="student-signup-field">
              <label htmlFor="student-signup-first-name">First Name</label>
              <div className={`student-signup-input ${errors.firstName ? "has-error" : ""}`}>
                <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />
                <input
                  id="student-signup-first-name"
                  ref={firstNameRef}
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    if (errors.firstName) setErrors({ ...errors, firstName: "" });
                  }}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  disabled={loading}
                  aria-invalid={errors.firstName ? "true" : undefined}
                  aria-describedby={errors.firstName ? "student-signup-first-name-error" : undefined}
                  required
                />
              </div>
              {errors.firstName ? (
                <p id="student-signup-first-name-error" className="student-signup-field-error" role="alert">
                  <CircleAlert size={13} strokeWidth={1.9} aria-hidden="true" />
                  {errors.firstName}
                </p>
              ) : null}
            </div>

            {/* Last Name */}
            <div className="student-signup-field">
              <label htmlFor="student-signup-last-name">Last Name</label>
              <div className={`student-signup-input ${errors.lastName ? "has-error" : ""}`}>
                <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />
                <input
                  id="student-signup-last-name"
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    if (errors.lastName) setErrors({ ...errors, lastName: "" });
                  }}
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                  disabled={loading}
                  aria-invalid={errors.lastName ? "true" : undefined}
                  aria-describedby={errors.lastName ? "student-signup-last-name-error" : undefined}
                  required
                />
              </div>
              {errors.lastName ? (
                <p id="student-signup-last-name-error" className="student-signup-field-error" role="alert">
                  <CircleAlert size={13} strokeWidth={1.9} aria-hidden="true" />
                  {errors.lastName}
                </p>
              ) : null}
            </div>

            {/* Email */}
            <div className="student-signup-field">
              <label htmlFor="student-signup-email">Email Address</label>
              <div className={`student-signup-input ${errors.email ? "has-error" : ""}`}>
                <Mail size={17} strokeWidth={1.8} aria-hidden="true" />
                <input
                  id="student-signup-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  inputMode="email"
                  disabled={loading}
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={errors.email ? "student-signup-email-error" : undefined}
                  required
                />
              </div>
              {errors.email ? (
                <p id="student-signup-email-error" className="student-signup-field-error" role="alert">
                  <CircleAlert size={13} strokeWidth={1.9} aria-hidden="true" />
                  {errors.email}
                </p>
              ) : null}
            </div>

            {/* Mobile */}
            <div className="student-signup-field">
              <label htmlFor="student-signup-mobile">Mobile Number</label>
              <div className={`student-signup-input ${errors.mobile ? "has-error" : ""}`}>
                <Phone size={17} strokeWidth={1.8} aria-hidden="true" />
                <input
                  id="student-signup-mobile"
                  type="tel"
                  name="mobile"
                  value={mobile}
                  onChange={(event) => {
                    setMobile(event.target.value);
                    if (errors.mobile) setErrors({ ...errors, mobile: "" });
                  }}
                  placeholder="Enter your 10-digit mobile number"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={15}
                  disabled={loading}
                  aria-invalid={errors.mobile ? "true" : undefined}
                  aria-describedby={errors.mobile ? "student-signup-mobile-error" : undefined}
                  required
                />
              </div>
              {errors.mobile ? (
                <p id="student-signup-mobile-error" className="student-signup-field-error" role="alert">
                  <CircleAlert size={13} strokeWidth={1.9} aria-hidden="true" />
                  {errors.mobile}
                </p>
              ) : null}
            </div>

            {formError ? (
              <div className="student-signup-error" role="alert" aria-live="polite">
                <CircleAlert size={16} strokeWidth={1.9} aria-hidden="true" />
                <span>{formError}</span>
              </div>
            ) : null}

            <button type="submit" className="student-signup-primary" disabled={loading}>
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              {!loading && <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
            </button>

            <button
              type="button"
              className="student-signup-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>

            <p className="student-signup-security">
              <Check size={13} strokeWidth={2} aria-hidden="true" />
              Your password is set after account creation — Supabase protects
              it securely.
            </p>
          </form>
</>
        )}
      </div>
    </div>
  ) : null;
}