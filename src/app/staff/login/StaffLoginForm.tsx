"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn, ShieldCheck } from "lucide-react";
import FirstTimePasswordModal from "@/components/staff/auth/FirstTimePasswordModal";
import { createClient } from "@/lib/supabase/client";

type StaffLoginFormProps = {
    initialEmail: string;
    invitationToken?: string;
};

export default function StaffLoginForm({ initialEmail, invitationToken }: StaffLoginFormProps) {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswordSetup, setShowPasswordSetup] = useState(false);
    const supabase = useMemo(() => createClient({ detectSessionInUrl: false }), []);

    useEffect(() => {
        if (window.location.hash.includes("access_token=") || window.location.hash.includes("error=")) {
            window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });
            if (authError || !data.user) {
                setError(authError?.message ?? "The email or password is incorrect.");
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("first_login, must_change_password, is_active")
                .eq("id", data.user.id)
                .single();

            if (profileError || !profile || profile.is_active !== true) {
                await supabase.auth.signOut();
                setError(profileError?.message ?? "This staff account is inactive or unavailable.");
                return;
            }

            if (profile.must_change_password || profile.first_login) {
                setShowPasswordSetup(true);
                return;
            }

            window.location.assign("/staff/dashboard");
        } catch {
            setError("We could not sign you in. Check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <main className="flex min-h-screen items-center justify-center bg-brand-off-white px-4 py-12">
                <section className="w-full max-w-md space-y-6 rounded-2xl border border-brand-border bg-white p-8 shadow-xl" aria-labelledby="staff-login-title">
                    <header className="space-y-2 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                            <ShieldCheck className="size-3.5" aria-hidden="true" /> SPRINT Staff Portal
                        </span>
                        <h1 id="staff-login-title" className="pt-2 font-display text-2xl font-bold text-brand-navy">Authorized Staff Access Only</h1>
                        <p className="text-sm text-brand-text-muted">Sign in with your staff email and password.</p>
                    </header>

                    {error && <p className="rounded-lg border border-brand-red/20 bg-brand-red-light px-3.5 py-3 text-sm text-brand-red" role="alert" aria-live="assertive">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label htmlFor="staff-email" className="block text-sm font-semibold text-brand-navy">
                            Email
                            <input id="staff-email" type="email" required autoComplete="username" readOnly={Boolean(initialEmail)} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-brand-border px-3.5 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 read-only:bg-slate-50" />
                        </label>
                        <div>
                            <label htmlFor="staff-password" className="block text-sm font-semibold text-brand-navy">Password</label>
                            <span className="relative mt-2 block">
                                <input id="staff-password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} className="w-full rounded-lg border border-brand-border px-3.5 py-3 pr-12 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                                <button type="button" onClick={() => setShowPassword((visible) => !visible)} disabled={isSubmitting} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-text-muted"><PasswordEye visible={showPassword} /></button>
                            </span>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-70">
                            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </section>
            </main>
            {showPasswordSetup && <FirstTimePasswordModal invitationToken={invitationToken} />}
        </>
    );
}

function PasswordEye({ visible }: { visible: boolean }) {
    return visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />;
}
