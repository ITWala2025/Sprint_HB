export default function LegalNotice({ children }) {
  return (
    <aside className="rounded-xl border-l-4 border-brand-red bg-brand-red-light p-4 text-xs leading-relaxed text-brand-text shadow-sm">
      <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-brand-red">
        Educational demo notice
      </p>
      <div className="mt-2">{children}</div>
    </aside>
  );
}