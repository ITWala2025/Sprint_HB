"use client";

export default function StaffDirectoryError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <section className="mx-auto mt-12 max-w-xl rounded-xl border border-brand-border bg-white p-8 text-center shadow-sm" role="alert">
            <h2 className="font-display text-xl font-bold text-brand-navy">Staff directory unavailable</h2>
            <p className="mt-2 text-sm text-brand-text-secondary">We could not load staff records. Try again in a moment.</p>
            <button type="button" onClick={reset} className="mt-5 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">Try again</button>
        </section>
    );
}