import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, GraduationCap } from "lucide-react";
import about from "@/data/about.json";
import { programs } from "@/data/programs";

const featuredPrograms = [
  {
    slug: "sprint-rise",
    number: "01",
    icon: GraduationCap,
    accent: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-700",
    iconBackground: "bg-blue-100",
  },
  {
    slug: "career-accelerator",
    number: "02",
    icon: BriefcaseBusiness,
    accent: "from-brand-red to-brand-purple",
    iconColor: "text-brand-red-accessible",
    iconBackground: "bg-brand-red-light",
  },
].map((featured) => {
  const program = programs.find((item) => item.slug === featured.slug);
  if (!program) {
    throw new Error(`Signature program "${featured.slug}" is missing.`);
  }
  return { ...featured, program };
});

export default function IndustryAcademicConnection() {
  return (
    <section
      id="industry-connection"
      aria-labelledby="industry-connection-heading"
      className="sprint-anchor relative isolate overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/70 py-6 md:py-8 lg:py-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rotate-45 rounded-[60px] border border-blue-100/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-96 w-96 rotate-45 rounded-[60px] border border-teal-100/80"
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <header className="mx-auto mb-6 max-w-4xl text-center">
          <p className="mb-3 text-[10px] font-extrabold tracking-[0.3em] text-[#405e84] sm:mb-4 sm:text-xs sm:tracking-[0.4em]">
            INDUSTRY &amp; ACADEMIC CONNECTION
          </p>
          <h2
            id="industry-connection-heading"
            className="text-[clamp(2rem,4.5vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.045em] text-[#08143c]"
          >
            {about.industry.heading}
          </h2>
        </header>

        <div className="mx-auto mb-7 max-w-4xl text-center text-sm leading-relaxed text-slate-700 sm:text-base">
          <p className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-white/80 px-5 py-4 font-semibold text-[#08143c] shadow-sm">
            {about.industry.approach}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {featuredPrograms.map(({ number, icon: Icon, accent, iconColor, iconBackground, program }) => (
            <Link
              href={`/programs/${program.slug}`}
              aria-label={`View the complete ${program.title} program page`}
              data-track={`about_program_${program.slug}`}
              key={program.slug}
              className="group/card relative block min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 text-inherit no-underline shadow-[0_4px_14px_rgba(30,55,90,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl motion-reduce:transition-none sm:rounded-[18px] sm:p-6"
            >
              <div
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`}
              />
              <div className="flex items-start gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${iconBackground}`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`size-6 ${iconColor}`}
                    strokeWidth={1.8}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500">
                    SIGNATURE PROGRAM {number}
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-[#08143c] sm:text-3xl">
                    {program.title}
                  </h3>
                  {program.headline ? (
                    <p className="mt-2 font-semibold text-brand-blue">
                      {program.headline}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base sm:leading-[1.65]">
                    {program.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {[program.duration, program.delivery, program.audience]
                      .filter(Boolean)
                      .map((detail) => (
                        <li
                          key={detail}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          {detail}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={about.industry.cta.href}
            data-track="industry_courses_link"
            className="sprint-focus group inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-red to-brand-purple px-7 py-2.5 text-base font-bold text-white shadow-brand-cta transition hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
          >
            {about.industry.cta.label}
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
