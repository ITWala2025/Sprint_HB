import Link from "next/link";

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
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-brand-navy">
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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24">
        <div className="max-w-xl text-left">
          {/* Primary H1 (Section 14: exactly one per page) */}
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-brand-white sm:text-6xl">
            Skill Up..Get Ahead
          </h1>

          {/* Supporting description — content TBD, placeholder below */}
          <p className="mt-6 max-w-md text-lg text-brand-white/85">
            Mentor-led programs built with engineers from top companies —
            learn the skills that get you hired, not just certified.
          </p>

          <div className="mt-10">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-full bg-brand-red px-8 py-4 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
