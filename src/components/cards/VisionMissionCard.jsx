import { Compass, Target } from "lucide-react";

/**
 * Vision & Mission card system — About_Page.md §3.4
 * Two visually distinct glass cards (statement vs pillar-list).
 * Shared container: rgba(255,255,255,0.85) blur surface, 20px radius,
 * 6px gradient accent bar, unique position per card.
 *
 * `variant`: "vision" (statement) | "mission" (pillar-list)
 */
export default function VisionMissionCard({ variant, data }) {
  const isVision = variant === "vision";

  return (
    <section
      id={data.anchor}
      aria-labelledby={`${data.anchor}-heading`}
      className="sprint-glass-card sprint-card-interactive flex h-full flex-col p-6 sm:p-8"
    >
      {/* Unique gradient accent bar (rose -> plum), edge differs per card */}
      <span
        aria-hidden="true"
        className={[
          "sprint-accent",
          isVision ? "left-0" : "right-0",
        ].join(" ")}
      />

      {/* Decorative icon tile (aria-hidden) */}
      <span
        aria-hidden="true"
        className={[
          "sprint-icon-tile grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white",
          isVision ? "from-brand-red to-brand-purple" : "from-brand-purple to-brand-red",
        ].join(" ")}
      >
        {isVision ? (
          <Compass className="size-6" />
        ) : (
          <Target className="size-6" />
        )}
      </span>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
        {data.kicker}
      </p>
      <h3 id={`${data.anchor}-heading`} className="mt-2 text-2xl font-bold text-brand-navy">
        {data.title}
      </h3>

      {isVision ? (
        <>
          <p className="mt-4 text-lg font-medium italic leading-relaxed text-brand-text">
            {data.statement}
          </p>
          <p className="mt-3 leading-relaxed text-brand-text-secondary">
            {data.supportingLine}
          </p>
          <span className="mt-auto inline-flex w-fit items-center rounded-full bg-brand-navy px-4 py-2 text-xs font-medium text-brand-off-white">
            {data.footerChip}
          </span>
        </>
      ) : (
        <>
          <p className="mt-4 leading-relaxed text-brand-text-secondary">
            {data.statement}
          </p>
          <ul className="mt-6 space-y-2">
            {data.pillars.map((pillar) => (
              <li
                key={pillar.text}
                className="sprint-pillar flex min-h-[56px] items-start gap-3 rounded-2xl px-3 py-3"
              >
                <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-purple" />
                <span className="text-sm font-medium leading-snug text-brand-text">
                  {pillar.text}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}