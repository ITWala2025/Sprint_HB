import Link from "next/link";

export default function LegalTableOfContents({ sections }) {
  return (
    <nav
      aria-label="On this page"
      className="h-fit overflow-hidden rounded-xl border border-brand-navy-light bg-brand-navy-dark shadow-[0_16px_32px_-12px_rgba(1,31,62,0.22)] lg:sticky lg:top-28"
    >
      <div className="border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-brand-red" aria-hidden="true" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
              Document index
            </h2>
          </div>
          <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-300">
            {String(sections.length).padStart(2, "0")} sections
          </span>
        </div>
        <p className="mt-2 pl-3.5 text-xs text-slate-400">Jump to a policy section</p>
      </div>

      <ol className="max-h-[22rem] space-y-0.5 overflow-y-auto p-3 sm:p-4 lg:max-h-[calc(100vh-11rem)]">
        {sections.map((section, index) => (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              className="sprint-focus group flex min-h-10 items-start gap-3 rounded-lg border border-transparent px-3 py-2 text-sm leading-5 text-slate-300 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
            >
              <span className="shrink-0 pt-0.5 font-mono text-[11px] font-semibold text-slate-500 transition-colors group-hover:text-red-200">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 wrap-break-word">{section.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}