import { Cloud, Sparkles, Terminal, TrendingUp } from "lucide-react";

const iconMap = {
  sparkles: Sparkles,
  cloud: Cloud,
  terminal: Terminal,
};

/**
 * Industry skill card — About_Page.md §3.7 (IND-02).
 * Icon, title, 2-line description, "industry demand" tag.
 * Icons are decorative (aria-hidden), text explains meaning (IND-05).
 */
export default function SkillCard({ skill }) {
  const Icon = iconMap[skill.icon] ?? Sparkles;

  return (
    <article className="sprint-card-interactive flex h-full flex-col rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-brand-card">
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple text-white"
      >
        <Icon className="size-6" />
      </span>
      <h4 className="mt-5 text-lg font-bold text-brand-navy">{skill.title}</h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-text-secondary">
        {skill.description}
      </p>
      <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text">
        <TrendingUp className="size-3.5 text-brand-success" aria-hidden="true" />
        {skill.tag}
      </span>
    </article>
  );
}