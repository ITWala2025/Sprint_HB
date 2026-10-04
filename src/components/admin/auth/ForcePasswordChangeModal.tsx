"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ForcePasswordChangeModalProps = {
    onSuccess: () => void;
};

export default function ForcePasswordChangeModal({ onSuccess }: ForcePasswordChangeModalProps) {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const router = useRouter();
    const supabase = createClient();

    const passwordRules = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "One number", valid: /\d/.test(password) },
        { label: "Passwords match", valid: Boolean(password) && password === confirmation },
    ];
    const strength = passwordRules.slice(0, 3).filter((rule) => rule.valid).length;
    const strengthLabel = !password ? "Enter a password" : ["Weak", "Fair", "Good", "Strong"][strength];

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        passwordRef.current?.focus();

        function keepDialogOpen(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.key !== "Tab") return;

            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                'input:not([disabled]), button:not([disabled])',
            );
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!dialogRef.current?.contains(document.activeElement)) {
                event.preventDefault();
                first.focus();
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", keepDialogOpen, true);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", keepDialogOpen, true);
        };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setHasSubmitted(true);
        setError("");

        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            setError("Use at least 8 characters, including one uppercase letter and one number.");
            return;
        }
        if (password !== confirmation) {
            setError("The passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            const { error: passwordError } = await supabase.auth.updateUser({ password });
            if (passwordError) {
                setError(passwordError.message);
                return;
            }

            const { data: resetComplete, error: resetError } = await supabase.rpc("complete_staff_password_reset");
            if (resetError || resetComplete !== true) {
                setError("Your password changed, but the required reset could not be verified. Submit again or contact an administrator.");
                return;
            }

            router.refresh();
            onSuccess();
        } catch {
            setError("We could not complete the password update. Check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-brand-navy/70 px-4 py-8 backdrop-blur-sm">
            <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className="w-full max-w-md rounded-xl border border-white/50 bg-white p-6 shadow-2xl sm:p-8">
                <span className="flex size-12 items-center justify-center rounded-lg bg-brand-red-light text-brand-red"><KeyRound className="size-6" aria-hidden="true" /></span>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-brand-red">Account security</p>
                <h1 id={`${id}-title`} className="mt-2 font-display text-2xl font-bold text-brand-navy">Set your permanent password</h1>
                <p id={`${id}-description`} className="mt-2 text-sm leading-6 text-brand-text-secondary">You are logged in for the first time. Please set your permanent password to continue.</p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                    <div>
                        <label htmlFor={`${id}-password`} className="mb-2 block text-sm font-semibold text-brand-navy">New Password</label>
                        <div className="relative">
                            <input ref={passwordRef} id={`${id}-password`} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} readOnly={isSaving} aria-invalid={hasSubmitted && password.length < 8} aria-describedby={`${id}-strength`} className="w-full rounded-lg border border-brand-border px-3 py-3 pr-12 text-sm text-brand-text outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                            <button type="button" onClick={() => setShowPassword((visible) => !visible)} disabled={isSaving} aria-label={showPassword ? "Hide new password" : "Show new password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-text-muted"><EyeToggle visible={showPassword} /></button>
                        </div>
                        <div id={`${id}-strength`} className="mt-2" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={3} aria-valuenow={strength}>
                            <div className="flex gap-1" aria-hidden="true">{[0, 1, 2].map((segment) => <span key={segment} className={`h-1.5 flex-1 rounded-full ${segment < strength ? strength === 3 ? "bg-emerald-500" : "bg-amber-500" : "bg-slate-200"}`} />)}</div>
                            <p className="mt-1 text-xs text-brand-text-muted">Password strength: {strengthLabel}</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor={`${id}-confirmation`} className="mb-2 block text-sm font-semibold text-brand-navy">Confirm Password</label>
                        <div className="relative">
                            <input id={`${id}-confirmation`} type={showConfirmation ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(""); }} readOnly={isSaving} aria-invalid={hasSubmitted && password !== confirmation} className="w-full rounded-lg border border-brand-border px-3 py-3 pr-12 text-sm text-brand-text outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                            <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} disabled={isSaving} aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmation} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-text-muted"><EyeToggle visible={showConfirmation} /></button>
                        </div>
                        <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs" aria-label="Password requirements">
                            {passwordRules.map((rule) => <li key={rule.label} className={rule.valid ? "text-emerald-700" : "text-brand-text-muted"}>{rule.valid ? "✓" : "·"} {rule.label}</li>)}
                        </ul>
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

function EyeToggle({ visible }: { visible: boolean }) {
    return visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />;
}