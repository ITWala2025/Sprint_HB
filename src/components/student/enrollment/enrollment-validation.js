/**
 * Client-side validation for the enrollment wizard.
 *
 * Email rules are imported from the Phase 1 auth validation module instead of
 * being copied, so the wizard and the sign-in screens can never drift apart.
 *
 * Every validator returns an **error message or an empty string**, and the
 * aggregate helpers return a full `{ field: message }` map. The wizard filters
 * the empty entries with `compactErrors` and focuses the first remaining key —
 * which is why field names here must match the field ids in the step
 * components (`${step.id}-${fieldName}`).
 *
 * The Education & Career Profile step is optional, so its validator only ever
 * flags a field the student actually filled in: an empty step always passes and
 * "Skip for now" needs no special case.
 */

import {
  EMAIL_PATTERN,
  validateEmailField as validateAuthEmailField,
  validateRequiredField,
} from "@/components/student/auth/auth-validation";

export { EMAIL_PATTERN };

/** Letters plus the separators real names use — digits and symbols are rejected. */
export const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;

/** Indian mobile numbers: ten digits starting 6-9. */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Trims the shapes people actually type — "98765 43210", "+91 98765 43210",
 * "098765 43210" — down to ten digits. The country prefix is only stripped when
 * the remainder is exactly ten digits long, so a number that genuinely starts
 * with 91 (e.g. 9123456789) is never mangled.
 */
export function normalizeMobile(value = "") {
  const digits = String(value)
    .replace(/[\s()\-.]/g, "")
    .replace(/^\+/, "");

  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

/**
 * @returns {string} an inline error message, or "" when the field is valid.
 * `emptyMessage` lets each caller name its own field — First Name and Last Name
 * share every rule with the old single name field but need their own prompt.
 */
export function validateNameField(value = "", emptyMessage = "Please enter your full name.") {
  const trimmed = String(value).trim();
  if (!trimmed) return emptyMessage;
  if (trimmed.length < 2) return "Your name needs at least 2 characters.";
  if (!NAME_PATTERN.test(trimmed)) {
    return "Please use letters only — spaces, hyphens and apostrophes are fine.";
  }
  return "";
}

/** @returns {string} an inline error message, or "" when the field is valid. */
export function validateMobileField(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return "Please enter your mobile number.";
  if (!MOBILE_PATTERN.test(normalizeMobile(trimmed))) {
    return "Please enter a valid 10-digit mobile number.";
  }
  return "";
}

/** Date of birth — presence is the only rule; the input already restricts shape. */
export function validateDateOfBirthField(value = "") {
  if (!String(value).trim()) return "Please enter your date of birth.";
  return "";
}

/**
 * Step 1 — Personal Information.
 *
 * Seven required fields in the order they appear on the page, so the wizard's
 * "focus the first invalid field" walk matches the visual left-to-right,
 * top-to-bottom reading order.
 */
export function validatePersonalInformation(values = {}) {
  return {
    firstName: validateNameField(values.firstName ?? "", "Please enter your first name."),
    lastName: validateNameField(values.lastName ?? "", "Please enter your last name."),
    email: validateAuthEmailField(values.email ?? ""),
    dob: validateDateOfBirthField(values.dob ?? ""),
    country: validateRequiredField(values.country ?? "", "Please select your country."),
    state: validateRequiredField(values.state ?? "", "Please select your state."),
    phone: validateMobileField(values.phone ?? ""),
  };
}

/** Earliest graduation year we accept — anything older is almost certainly a typo. */
const MIN_GRADUATION_YEAR = 1980;

/** How far ahead a planned graduation may be (a long degree started today, plus slack). */
const YEARS_AHEAD_LIMIT = 8;

/**
 * Step 2 — Education & Career Profile.
 *
 * The whole step is optional, so an empty form must pass: only a *filled* field
 * can fail. Graduation year is the one answer with a rule worth enforcing,
 * because "20" or "abcd" would poison the cohort planning this profile feeds.
 *
 * @returns {string} an inline error message, or "" when the field is valid.
 */
export function validateGraduationYearField(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (!/^\d{4}$/.test(trimmed)) {
    return "Please enter a 4-digit year (for example 2027).";
  }

  const year = Number(trimmed);
  const latest = new Date().getFullYear() + YEARS_AHEAD_LIMIT;
  if (year < MIN_GRADUATION_YEAR || year > latest) {
    return `Please enter a year between ${MIN_GRADUATION_YEAR} and ${latest}.`;
  }
  return "";
}

/** Every other answer in Step 2 is free text and knowingly accepted as typed. */
export function validateEducationProfile(values = {}) {
  return {
    graduationYear: validateGraduationYearField(values.graduationYear ?? ""),
  };
}

/**
 * The last step — Account — is scaffolded in this phase, so there is nothing to
 * validate yet. It uses this no-op so the registry keeps a uniform `validate`
 * contract and the wizard stays generic.
 */
export const validateNoFieldsYet = () => ({});

/** Drops the "valid" entries, leaving only the fields the user must fix. */
export const compactErrors = (errors = {}) =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
