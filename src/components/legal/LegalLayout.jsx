import LegalNotice from "./LegalNotice";
import LegalSection from "./LegalSection";

export default function LegalLayout({
  eyebrow,
  title,
  description,
  effectiveDate,
  updatedDate,
  sections,
  notice,
}) {
  return (
    <div className="bg-brand-off-white">
      <header className="bg-brand-navy-dark text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {description}
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-xs text-slate-300">
            <div>
              <dt className="font-semibold text-white">Effective date</dt>
              <dd className="mt-1">{effectiveDate}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Last updated</dt>
              <dd className="mt-1">{updatedDate}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <article className="min-w-0 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <LegalNotice>{notice}</LegalNotice>
          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <LegalSection key={section.id} id={section.id} title={section.title}>
                {section.content}
              </LegalSection>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}