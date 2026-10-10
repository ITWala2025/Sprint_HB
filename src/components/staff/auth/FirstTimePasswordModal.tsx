"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { completeFirstTimeStaffSetupAction } from "@/app/staff/login/actions";
import { createClient } from "@/lib/supabase/client";

type FirstTimePasswordModalProps = {
    invitationToken?: string;
};

export default function FirstTimePasswordModal({ invitationToken }: FirstTimePasswordModalProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient({ detectSessionInUrl: false });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!newPassword || !confirmation) {
            setError("Enter and confirm your new password.");
            return;
        }
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
            setError("Use at least 8 characters, including one uppercase letter and one number.");
            return;
        }
        if (newPassword !== confirmation) {
            setError("The passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
            if (passwordError) {
                setError(passwordError.message);
                return;
            }

            const result = await completeFirstTimeStaffSetupAction(invitationToken);
            if (result.success === false) {
                setError(result.error);
                return;
            }

            window.location.assign("/staff/dashboard");
        } catch {
            setError("We could not complete your password update. Check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-brand-navy/70 px-4 py-8 backdrop-blur-sm">
            <section role="dialog" aria-modal="true" aria-labelledby="first-time-password-title" aria-describedby="first-time-password-description" className="w-full max-w-md rounded-xl border border-white/50 bg-white p-6 shadow-2xl sm:p-8">
                <span className="flex size-12 items-center justify-center rounded-lg bg-brand-red-light text-brand-red"><ShieldCheck className="size-6" aria-hidden="true" /></span>
                <h1 id="first-time-password-title" className="mt-5 font-display text-2xl font-bold text-brand-navy">Set Your New Password</h1>
                <p id="first-time-password-description" className="mt-2 text-sm leading-6 text-brand-text-secondary">You are currently using a temporary password. Please set a permanent password to continue.</p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                    <div>
                        <label htmlFor="staff-new-password" className="block text-sm font-semibold text-brand-navy">New Password</label>
                        <span className="relative mt-2 block">
                            <input id="staff-new-password" type={showNewPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setError(""); }} readOnly={isSaving} className="w-full rounded-lg border border-brand-border px-3 py-3 pr-12 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                            <button type="button" onClick={() => setShowNewPassword((visible) => !visible)} disabled={isSaving} aria-label={showNewPassword ? "Hide new password" : "Show new password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-text-muted"><PasswordEye visible={showNewPassword} /></button>
                        </span>
                    </div>
                    <div>
                        <label htmlFor="staff-confirm-password" className="block text-sm font-semibold text-brand-navy">Confirm New Password</label>
                        <span className="relative mt-2 block">
                            <input id="staff-confirm-password" type={showConfirmation ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(""); }} readOnly={isSaving} className="w-full rounded-lg border border-brand-border px-3 py-3 pr-12 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                            <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} disabled={isSaving} aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-text-muted"><PasswordEye visible={showConfirmation} /></button>
                        </span>
                    </div>

                    {error && <p className="rounded-lg border border-brand-red/20 bg-brand-red-light px-3 py-2.5 text-sm text-brand-red" role="alert" aria-live="assertive">{error}</p>}

                    <button type="submit" disabled={isSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-70">
                        {isSaving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
                        {isSaving ? "Updating password..." : "Set permanent password"}
                    </button>
                </form>
            </section>
        </div>
    );
}

function PasswordEye({ visible }: { visible: boolean }) {
    return visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />;
}
