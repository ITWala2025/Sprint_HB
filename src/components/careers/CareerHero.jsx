
import Link from "next/link";

export default function CareerHero() {
  return (
    <section
      aria-labelledby="careers-hero-title"
      className="relative isolate overflow-hidden bg-[#061d3d] text-white"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/careers/sprint-careers-mentor-workshop.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[58%_center]"
        />
      </div>

      {/* Navy overlay: darker on the left for readable text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-gradient-to-r from-[#061d3d] via-[#061d3d]/90 to-[#061d3d]/20"
      />

      {/* Extra overlay for small screens */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[#061d3d]/20 md:bg-transparent"
      />

      {/* Hero content */}
      <div className="relative z-20 mx-auto flex min-h-[480px] w-full max-w-[1200px] items-center px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[430px] lg:px-6">
        <div className="w-full max-w-[570px]">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex items-center gap-2 text-sm text-white/75"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="text-white">
              Careers
            </span>
          </nav>

          {/* Hiring badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#ff4655]"
            />
            We're Hiring
          </div>

          {/* Heading */}
          <h1
            id="careers-hero-title"
            className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Build the Future of
            <span className="mt-1 block text-[#ff4655]">
              Tech Education
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[510px] text-sm leading-7 text-white/90 sm:text-base">
            Join a team that bridges the academic-industry gap with
            hands-on, mentor-led programs. We are looking for engineers,
            educators, and operators who want to shape how India learns
            emerging technologies.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="#open-positions"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#ef233c] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#d91f35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              View Open Roles
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Key highlights */}
          <div className="mt-9 grid max-w-[540px] grid-cols-2 gap-x-5 gap-y-5 text-xs sm:grid-cols-4">
            <div>
              <p className="font-semibold text-white">Meaningful Impact</p>
              <p className="mt-1 leading-5 text-white/70">
                Shape future talent
              </p>
            </div>

            <div>
              <p className="font-semibold text-white">
                Collaborative Culture
              </p>
              <p className="mt-1 leading-5 text-white/70">
                Learn and grow together
              </p>
            </div>

            <div>
              <p className="font-semibold text-white">Flexible Work</p>
              <p className="mt-1 leading-5 text-white/70">
                People-first policies
              </p>
            </div>

            <div>
              <p className="font-semibold text-white">Career Growth</p>
              <p className="mt-1 leading-5 text-white/70">
                Build what matters
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
