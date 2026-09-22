export default function LegalSection({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28">
      <h2
        id={`${id}-heading`}
        className="font-display text-xl font-bold tracking-tight text-brand-navy sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-brand-text-secondary">
        {children}
      </div>
    </section>
  );
}