"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  LOGOUT_REDIRECT_PATH,
  clearStudentSessionCache,
  markStudentSignedOut,
} from "@/components/student/student-session";

export default function StudentAvatarDropdown({ initials = "S", fullName = "Student" }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const signOut = async () => {
    setError("");
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      clearStudentSessionCache();
      markStudentSignedOut();
      window.location.assign(LOGOUT_REDIRECT_PATH);
    } catch (e) {
      console.error("Sign-out failed:", e);
      setError("We couldn't sign you out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Student account menu"
        className="inline-flex size-10 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-dark"
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Student account menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-brand-border bg-brand-white p-2 shadow-lg"
        >
          <div className="flex items-center gap-3 rounded-xl bg-brand-off-white px-3 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-navy text-[11px] font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-brand-navy">
                {fullName}
              </span>
              <span className="block truncate text-[11px] text-brand-text-muted">
                Student account
              </span>
            </span>
          </div>
          <div className="my-1 h-px bg-brand-border" />
          <Link
            href="/student/dashboard"
            role="menuitem"
            className="sprint-focus flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-surface"
            onClick={() => setOpen(false)}
          >
            <UserRound className="size-4.5" aria-hidden="true" />
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={signOut}
            className="sprint-focus flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red-light disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
          {error ? (
            <p role="alert" className="px-3 pb-2 text-xs font-medium text-brand-red">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}