"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck, X } from "lucide-react";
import ForcePasswordChangeModal from "@/components/admin/auth/ForcePasswordChangeModal";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = useMemo(() => createClient(), []);

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetRequestSubmitted, setResetRequestSubmitted] = useState(false);
  const [resetRequestError, setResetRequestError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowPasswordReset(true);
      }
    });

    const query = new URLSearchParams(window.location.search);
    if (query.get("password_reset") === "success") {
      setSuccessNotice("Password reset successfully. Please log in with your new password.");
      query.delete("password_reset");
      const remainingQuery = query.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}`,
      );
    }

    if (query.get("reset") === "true") {
      void supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (sessionError) {
          setError("We could not verify your password reset session. Please open the link from your email again.");
          return;
        }
        if (data.session?.user) setShowPasswordReset(true);
      });
    }

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSendingReset(true);
    setResetRequestError("");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;
    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: `${siteUrl}/admin?reset=true` },
      );

      if (requestError) {
        setResetRequestError("We couldn't send the reset request right now. Please try again.");
        return;
      }

      setResetRequestSubmitted(true);
    } catch {
      setResetRequestError("We couldn't send the reset request right now. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Authenticate with an 8-second timeout guard
      const authPromise = supabase.auth.signInWithPassword({
        email: adminId.trim(),
        password,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Authentication request timed out. Please check your network connection.")),
          8000
        )
      );

      const { data, error: authError } = await Promise.race([authPromise, timeoutPromise]);

      if (authError || !data?.user) {
        throw new Error(authError?.message || "Invalid Admin ID or Password.");
      }

      // 2. Fetch role from public.profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active, roles(name, is_active)")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error(`Profile check failed: ${profileError.message}`);
      }

      const assignedRole = Array.isArray(profile?.roles)
        ? profile.roles[0]
        : profile?.roles;
      const hasAdminAccess = profile?.role === "admin" || Boolean(
        profile?.is_active && assignedRole?.name && assignedRole.is_active !== false
      );

      if (!profile || !hasAdminAccess) {
        await supabase.auth.signOut();
        throw new Error("Access denied: your account does not have an active admin role assigned.");
      }

      // 3. Hard navigation ensures fresh Supabase SSR cookies are sent to middleware
      window.location.assign("/admin/dashboard");
    } catch (err: any) {
      console.error("[SPRINT Admin Auth]", err);
      setError(err?.message || "Failed to authenticate.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-off-white px-4">
      <div className="w-full max-w-md bg-brand-white border border-brand-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-red bg-brand-red/10 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </div>
          <h1 className="text-2xl font-bold font-display text-brand-navy">
            Sign in to SPRINT
          </h1>
          <p className="text-sm text-brand-text-muted font-body">
            Authorized personnel only
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 text-sm text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-xl">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-body text-xs leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-text">
              Admin Email / ID
            </label>
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="admin@sprint.institute"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-body disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-text">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isSubmitting}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-body disabled:opacity-50"
            />
          </div>

          <div className="-mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResetEmail(adminId.trim());
                setResetRequestSubmitted(false);
                setResetRequestError("");
                setIsForgotPasswordOpen(true);
              }}
              className="text-xs font-semibold text-brand-text-muted underline-offset-4 transition hover:text-brand-blue hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-brand-white bg-brand-red hover:opacity-95 rounded-lg shadow-md transition disabled:opacity-50 font-body"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
      {successNotice && (
        <div className="fixed left-1/2 top-5 z-[150] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 shadow-lg" role="status" aria-live="polite">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{successNotice}</span>
        </div>
      )}

      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-brand-navy/60 px-4 py-8 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl border border-white/50 bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-red">Account recovery</p>
                <h2 id="forgot-password-title" className="mt-2 font-display text-xl font-bold text-brand-navy">Forgot Password?</h2>
              </div>
              <button type="button" onClick={() => setIsForgotPasswordOpen(false)} aria-label="Close forgot password dialog" className="rounded-lg p-2 text-brand-text-muted hover:bg-slate-100">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {resetRequestSubmitted ? (
              <>
                <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800" role="status" aria-live="polite">
                  If this email belongs to a registered account, a password reset link has been sent to your inbox.
                </p>
                <button type="button" onClick={() => setIsForgotPasswordOpen(false)} className="mt-5 w-full rounded-lg bg-brand-navy px-4 py-3 text-sm font-bold text-white">
                  Done
                </button>
              </>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                <p className="text-sm leading-6 text-brand-text-secondary">Enter the email address associated with your account.</p>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-brand-text">
                  Registered Email
                  <input
                    id="reset-email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    disabled={isSendingReset}
                    className="mt-2 w-full rounded-lg border border-brand-border px-3.5 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-60"
                  />
                </label>
                {resetRequestError && (
                  <p className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-3 py-2.5 text-sm text-brand-red" role="alert" aria-live="assertive">
                    {resetRequestError}
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setIsForgotPasswordOpen(false)} disabled={isSendingReset} className="flex-1 rounded-lg border border-brand-border px-4 py-3 text-sm font-bold text-brand-navy disabled:opacity-60">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSendingReset} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                    {isSendingReset && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    {isSendingReset ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {showPasswordReset && (
        <ForcePasswordChangeModal
          mode="password_reset"
          onSuccess={() => setShowPasswordReset(false)}
        />
      )}
    </div>
  );
}