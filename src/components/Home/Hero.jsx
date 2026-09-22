import Image from "next/image";
import Link from "next/link";
import { stats } from "@/data/data";

/**
 * Hero Section — Requirements 6.1.
 *
 * - Full-screen background visual with a navy readability overlay.
 * - Content is left-aligned on desktop, stacks and centers on mobile.
 * - A navy scrim sits over the image so text stays readable regardless of
 *   the photo (explicit requirement, not just a style choice).
 * - Statistics row anchored to the bottom edge of the hero.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[80svh] flex-col overflow-hidden bg-brand-navy">
      <Image
        src="/images/home/home-hero.jpg"
        alt="Mentor guiding students working on a laptop at SPRINT"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />

      {/* Keep the copy on the existing navy field while letting the photo
          emerge gradually on the right. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 via-[40%] to-transparent to-[70%] md:from-brand-navy md:via-brand-navy/85 md:via-[40%] md:to-transparent md:to-[65%]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 via-[45%] to-brand-navy/70 md:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-between px-6 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl text-left">
          {/* <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-red-light">
            SPRINT Institutional Training Hub
          </p> */}
          {/* Primary H1 (Section 14: exactly one per page) */}
          <h1 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight text-brand-white sm:text-5xl md:text-6xl">
            Skill Up.. Get Ahead
          </h1>

          {/* Supporting description */}
          <p className="mt-6 max-w-md text-lg text-brand-white/85">
            Mentor-led programs built with engineers from top companies — learn
            the skills that get you hired, not just certified.
          </p>

          <div className="mt-10 max-w-md">
            <Link
              href="/courses"
              className="sprint-focus inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-red px-7 py-3 text-base font-semibold text-brand-white shadow-brand-cta transition-colors hover:bg-brand-red-dark"
            >
              Explore Programs
            </Link>
          </div>
        </div>

        {/* Statistics row — anchored to bottom of hero */}
        <div className="w-full" aria-label="SPRINT impact statistics">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
