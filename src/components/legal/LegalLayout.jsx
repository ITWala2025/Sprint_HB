import LegalNotice from "./LegalNotice";
import LegalSection from "./LegalSection";
import LegalTableOfContents from "./LegalTableOfContents";

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
      <header className="bg-brand-navy-dark text-white covers-watermark">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {description}
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-sm text-slate-300">
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

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <LegalTableOfContents sections={sections} />
        <article className="min-w-0 rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-8 lg:p-12">
          <LegalNotice>{notice}</LegalNotice>
          <div className="mt-10 space-y-12">
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