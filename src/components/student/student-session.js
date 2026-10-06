/**
 * Student session bookkeeping shared by the portal shell and the Sign In screen.
 *
 * Kept apart from the button component so the auth routes can read the
 * sign-out marker without importing any UI.
 */

/** Where the student lands once the session is gone (matches the edge guard). */
export const LOGOUT_REDIRECT_PATH = "/student/login";

/**
 * Browser storage keys holding learner-specific data.
 *
 * Supabase's own session material is cookie-backed and is destroyed by
 * `auth.signOut()`, but anything the portal itself wrote for the signed-in
 * student has to go as well — otherwise the next person to open the portal on
 * a shared device could still read it.
 */
export const STUDENT_SESSION_STORAGE_KEYS = ["student_recovery_email"];

/**
 * One-shot marker read by the Sign In screen so the student gets confirmation
 * that the portal ended their session rather than silently landing there.
 */
export const STUDENT_SIGNOUT_FLAG = "student_signed_out";

/**
 * Record that a sign-out just completed. Written after the session is gone so
 * the flag can never claim a logout that failed.
 */
export function markStudentSignedOut() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STUDENT_SIGNOUT_FLAG, "1");
  } catch {
    // Storage unavailable — the redirect still happens without the notice.
  }
}

/**
 * Read and consume the sign-out marker. Consuming on read keeps the notice
 * from reappearing on a later manual visit to Sign In.
 */
export function consumeStudentSignOutFlag() {
  if (typeof window === "undefined") return false;

  try {
    const flagged = window.sessionStorage.getItem(STUDENT_SIGNOUT_FLAG) === "1";
    window.sessionStorage.removeItem(STUDENT_SIGNOUT_FLAG);
    return flagged;
  } catch {
    return false;
  }
}

/**
 * Purge learner-scoped browser storage.
 *
 * Storage access throws in Safari private mode and when cookies are blocked,
 * so a failure here must never prevent the redirect.
 */
export function clearStudentSessionCache() {
  if (typeof window === "undefined") return;

  STUDENT_SESSION_STORAGE_KEYS.forEach((key) => {
    try {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    } catch {
      // Storage unavailable — there is nothing left to clear.
    }
  });
}