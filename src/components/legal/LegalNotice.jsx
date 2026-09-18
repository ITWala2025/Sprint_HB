export default function LegalNotice({ children }) {
  return (
    <aside className="rounded-2xl border-l-4 border-brand-red bg-brand-red-light p-5 text-sm leading-relaxed text-brand-text shadow-sm">
      <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-brand-red">
        Educational demo notice
      </p>
      <div className="mt-2">{children}</div>
    </aside>
  );
}