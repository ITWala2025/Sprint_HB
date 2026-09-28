import Link from "next/link";

/**
 * Careers Hero — Single-column layout with navy gradient background.
 * No external image assets. Subtle CSS-only decorative radial glow.
 *
 * Alignment: the content column reuses the shared site grid
 * (`mx-auto max-w-[1200px] px-6` — the same container edge as the Home/About
 * heroes, the section wrappers and the footer) so the hero copy starts on the
 * same left edge as the global header brand lockup, on every page.
 */
export default function CareerHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-brand-navy">
      {/* Subtle CSS-only decorative background: soft radial glows */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgba(248,21,41,0.12),transparent_60%),radial-gradient(ellipse_50%_45%_at_80%_90%,rgba(11,99,182,0.1),transparent_50%)]"
        aria-hidden="true"
      />

      {/* Optional: very subtle grid pattern for texture */}
      <div
        className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:48px_48px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-14 text-left">
        <nav className="sprint-hero-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Careers</span>
        </nav>

        <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.1] text-brand-white sm:text-5xl md:text-6xl">
          Build the Future of
          <br />
          <span className="text-brand-red">Tech Education</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-white/80">
          Join a team that bridges the academic–industry gap with hands-on,
          mentor-led programs. We are looking for engineers, educators, and
          operators who want to shape how India learns emerging technologies.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4">
          <Link
            href="#open-positions"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark w-full sm:w-auto"
          >
            View Open Roles
          </Link>
        </div>
      </div>
    </section>
  );
}
