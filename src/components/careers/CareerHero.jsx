import Link from "next/link";

export default function CareerHero() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-brand-navy">
      {/* Subtle CSS-only decorative background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgba(248,21,41,0.12),transparent_60%),radial-gradient(ellipse_50%_45%_at_80%_90%,rgba(11,99,182,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:48px_48px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-[1200px] items-center px-6 py-14">
        <div className="w-full max-w-2xl text-left">
          <nav
            className="sprint-hero-breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Careers</span>
          </nav>

          <h1 className="font-display text-4xl font-bold leading-[1.1] text-brand-white sm:text-5xl md:text-6xl">
            Build the Future of
            <br />
            <span className="text-brand-red">Tech Education</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-white/80">
            Join a team that bridges the academic–industry gap with hands-on,
            mentor-led programs. We are looking for engineers, educators, and
            operators who want to shape how India learns emerging technologies.
          </p>

          <div className="mt-10 flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="#open-positions"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark sm:w-auto"
            >
              View Open Roles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}