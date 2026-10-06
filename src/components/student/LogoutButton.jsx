"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  LOGOUT_REDIRECT_PATH,
  clearStudentSessionCache,
  markStudentSignedOut,
} from "./student-session";

/**
 * LogoutButton — ends the student session from anywhere in the portal.
 *
 * Lives in the sidebar identity block, mirroring the admin shell where the
 * identity card and "Sign Out" sit together, so the rail (desktop) and the
 * top drawer (mobile) both inherit it from StudentSidebar.
 *
 * On success: `auth.signOut()` invalidates the token server-side and clears
 * the auth cookies, learner-scoped storage is purged, and the browser is hard
 * navigated to Sign In. The navigation is deliberately a full page load rather
 * than `router.push` — the portal is guarded by edge middleware, which only
 * re-checks the session on a real request.
 *
 * On failure the student stays put with an inline, announced error and a
 * re-enabled button, because redirecting on a failed sign-out would strand
 * them on a login page while their session is still live.
 */
export default function LogoutButton({ collapsed = false, className = "" }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setError("");
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      clearStudentSessionCache();

      /* Written after the purge so the marker survives into Sign In. */
      markStudentSignedOut();

      window.location.assign(LOGOUT_REDIRECT_PATH);
    } catch (signOutError) {
      console.error("Student sign-out failed:", signOutError);
      setError("We couldn't sign you out. Please try again.");
      setIsSigningOut(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-busy={isSigningOut ? "true" : undefined}
        className={`sprint-focus group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-brand-text-secondary transition-colors hover:bg-brand-red-light hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-70 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        {isSigningOut ? (
          <Loader2
            className="size-4.5 shrink-0 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <LogOut
            className="size-4.5 shrink-0 text-brand-text-muted transition-colors group-hover:text-brand-red"
            aria-hidden="true"
          />
        )}
        <span className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}>
          {isSigningOut ? "Signing out…" : "Logout"}
        </span>
      </button>

      {error ? (
        <p
          role="alert"
          className="mt-2 px-1 text-xs font-medium text-brand-red"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}