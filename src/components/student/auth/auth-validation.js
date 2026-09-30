/**
 * Client-side validation for the Student Portal auth screens.
 *
 * Phase 1 checks only what the user can see and fix immediately: required
 * fields, a sane email shape, the two password fields matching, and the inline
 * password rules. Real security validation (strength scoring, breach checks,
 * rate limiting, server-side enforcement) arrives with the Supabase phase — the
 * copy stays deliberately simple so nothing here promises more than it does.
 */

/**
 * Deliberately permissive: deliverability is verified by the mail provider the
 * reset link is sent through, not by this pattern.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Inline requirements shown under the password fields (single source of truth). */
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (value) => /\d/.test(value),
  },
  {
    id: "symbol",
    label: "One special character (!@#$…)",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

/** Rule list annotated with the live met / not-met state for a typed value. */
export const getPasswordRuleState = (value = "") =>
  PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(value) }));

export const passwordMeetsAllRules = (value = "") =>
  PASSWORD_RULES.every((rule) => rule.test(value));

/** @returns {string} an inline error message, or "" when the field is valid. */
export function validateEmailField(value = "") {
  if (!value.trim()) return "Please enter your email.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Please enter a valid email address.";
  return "";
}

/** @returns {string} an inline error message, or "" when the field is valid. */
export function validateRequiredField(value = "", message) {
  return value.trim() ? "" : message;
}

/** @returns {string} an inline error message, or "" when the field is valid. */
export function validateNewPassword(value = "") {
  if (!value) return "Please enter a new password.";
  if (!passwordMeetsAllRules(value)) {
    return "Please meet all password requirements listed below.";
  }
  return "";
}

/** @returns {string} an inline error message, or "" when the field is valid. */
export function validateConfirmPassword(password = "", confirmation = "") {
  if (!confirmation) return "Please confirm your new password.";
  if (password !== confirmation) return "Passwords do not match.";
  return "";
}
