import { GraduationCap, Handshake, TrendingUp } from "lucide-react";

const impacts = [
  {
    title: "Talent Transformation",
    description:
      "Transform degree-holders into job-ready professionals. Formal, well-paid, skilled employment is exactly where tech-talent is supposed to lead.",
    icon: GraduationCap,
    accent: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-700",
    iconBackground: "bg-blue-100",
  },
  {
    title: "Inclusive Development",
    description:
      "Premium upskilling opportunity and real industrial experience to every student irrespective of caste/creed or location.",
    icon: Handshake,
    accent: "from-brand-red to-brand-purple",
    iconColor: "text-brand-red-accessible",
    iconBackground: "bg-brand-red-light",
  },
  {
    title: "Economic Growth",
    description:
      "Skilled workforce drives economic diversification → employment → financial independence → family transformation.",
    icon: TrendingUp,
    accent: "from-teal-400 to-emerald-500",
    iconColor: "text-teal-700",
    iconBackground: "bg-teal-100",
  },
];

export default function ImpactWeCreate() {
  return (
    <section
      id="impact-we-create"
      aria-labelledby="impact-we-create-heading"
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
          <p className="mb-3 text-[10px] font-extrabold tracking-[0.3em] text-brand-red-accessible sm:mb-4 sm:text-xs sm:tracking-[0.4em]">
            THE IMPACT WE CREATE
          </p>
          <h2
            id="impact-we-create-heading"
            className="text-[clamp(2rem,4.5vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.045em] text-[#08143c]"
          >
            Job-Ready Talent Is Where{" "}
            <span className="relative z-0 inline-block">
              <span
                aria-hidden="true"
                className="absolute -inset-x-1 bottom-[5%] -z-10 h-[60%] -rotate-2 rounded-[45%_20%_40%_20%] bg-gradient-to-r from-teal-200 to-cyan-100"
              />
              Economic Change Begins
            </span>
          </h2>
        </header>

        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {impacts.map((impact) => (
            <article
              key={impact.title}
              className="group/card relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-[0_4px_14px_rgba(30,55,90,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl motion-reduce:transition-none sm:rounded-[18px] sm:p-6"
            >
              <div
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${impact.accent}`}
              />
              <div className="flex items-start gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${impact.iconBackground}`}
                >
                  <impact.icon
                    aria-hidden="true"
                    className={`size-6 ${impact.iconColor}`}
                    strokeWidth={1.8}
                  />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold leading-tight tracking-tight text-[#08143c] sm:text-2xl">
                    {impact.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base sm:leading-[1.65]">
                {impact.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
