import Link from "next/link";
import { stats } from "@/data/data";

/**
 * Hero Section — Requirements 6.1.
 *
 * - Full-screen background visual (video, ~10s, loops). Video src/poster
 *   are TBD per the doc — paths below point at where the final assets
 *   should live; until then the poster/gradient fallback carries the
 *   section so nothing breaks with missing media.
 * - Content is left-aligned on desktop, stacks and centers on mobile.
 * - A navy scrim sits over the video so text stays readable regardless of
 *   footage (explicit requirement, not just a style choice).
 * - Statistics row anchored to the bottom edge of the hero.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-brand-navy">
      {/* Background video. autoPlay+muted+playsInline is required for
          browsers to allow autoplay; poster covers slow connections and
          the (TBD) case where video is dropped in favor of a static image. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero/hero-poster.jpg"
      >
        <source src="/hero/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Readability scrim — required by spec ("visual shall not reduce
          text readability; an overlay ... may be used"). Stronger on the
          left where the copy sits, fading out toward the right. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-brand-navy-dark via-brand-navy/85 to-brand-navy/40"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex flex-1 w-full max-w-7xl px-6 py-24 flex-col justify-between">
        <div className="max-w-3xl text-left">
          {/* Primary H1 (Section 14: exactly one per page) */}
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-brand-white sm:text-6xl lg:text-7xl tracking-tight">
            Skill Up. Get Ahead
          </h1>

          {/* Supporting description */}
          <p className="mt-6 max-w-md text-lg text-brand-white/85">
            Mentor-led programs built with engineers from top companies —
            learn the skills that get you hired, not just certified.
          </p>

          <div className="mt-10 max-w-md">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark"
            >
              Explore Programs
            </Link>
          </div>
        </div>

        {/* Statistics row — anchored to bottom of hero */}
        <div className="w-full" aria-label="SPRINT impact statistics">
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.id}
                className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-4xl font-bold text-brand-white lg:text-5xl">
                  {stat.value}
                </dd>
                <p className="mt-1.5 text-sm text-brand-white/70 max-w-xs lg:text-base">
                  {stat.label}
                </p>
                {/* Subtle vertical separator between items (not on last item) */}
                {index < stats.length - 1 && (
                  <span
                    className="hidden absolute right-0 top-1/2 h-10 w-px -translate-y-1/2 bg-brand-white/10 lg:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
