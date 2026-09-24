"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClient();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error(`Profile check failed: ${profileError.message}`);
      }

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error(
          `Access denied: Your account role is "${profile?.role || "none"}". Admin access required.`
        );
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
    </div>
  );
}