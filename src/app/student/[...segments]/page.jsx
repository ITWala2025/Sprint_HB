import Link from "next/link";

export default async function StudentFallbackPage({ params }) {
  const { segments } = await params;
  const requestedPath = segments.join("/");

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-2xl border border-brand-border bg-brand-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-red">
          Student Portal
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
          This page isn&apos;t available yet
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-brand-text-muted sm:text-base">
          We couldn&apos;t find a student portal page for{" "}
          <span className="font-medium text-brand-navy">{requestedPath}</span>.
          Check the address or return to your dashboard.
        </p>
        <Link
          href="/student/dashboard"
          className="sprint-focus mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
        >
          Go to student dashboard
        </Link>
      </section>
    </main>
  );
}
