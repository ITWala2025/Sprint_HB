"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/lib/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");

        const authenticated = loginAdmin(adminId.trim(), password);

        if (authenticated) {
            router.push("/admin/dashboard");
            return;
        }

        setError("Invalid Admin ID or Password. Please try again.");
        setIsSubmitting(false);
    }

    return (
        <section className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden bg-brand-off-white px-4 py-16 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,99,182,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(248,21,41,0.1),transparent_32%)]" />
            <div className="relative w-full max-w-md rounded-3xl border border-brand-border bg-white p-8 shadow-brand-card sm:p-10">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-navy text-white">
                        <ShieldCheck className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-red">SPRINT Console</p>
                        <p className="mt-1 text-sm text-brand-text-muted">Authorized access only</p>
                    </div>
                </div>

                <h1 className="font-display text-3xl font-bold text-brand-navy">Admin Sign In</h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">Access the temporary administration console.</p>

                {error && (
                    <div role="alert" className="mt-6 rounded-xl border border-brand-red/20 bg-brand-red-light px-4 py-3 text-sm font-medium text-brand-red-dark">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="admin-id" className="mb-2 block text-sm font-semibold text-brand-navy">Admin ID</label>
                        <input
                            id="admin-id"
                            name="adminId"
                            type="text"
                            autoComplete="username"
                            value={adminId}
                            onChange={(event) => setAdminId(event.target.value)}
                            required
                            className="sprint-focus w-full rounded-xl border border-brand-border bg-brand-off-white px-4 py-3 text-brand-text outline-none transition focus:border-brand-blue"
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-brand-navy">Password</label>
                        <input
                            id="admin-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="sprint-focus w-full rounded-xl border border-brand-border bg-brand-off-white px-4 py-3 text-brand-text outline-none transition focus:border-brand-blue"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="sprint-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-purple px-5 py-3.5 font-semibold text-white shadow-brand-cta transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                        {!isSubmitting && <ArrowRight className="size-4" aria-hidden="true" />}
                    </button>
                </form>
            </div>
        </section>
    );
}