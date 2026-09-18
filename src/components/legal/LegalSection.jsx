export default function LegalSection({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28">
      <h2
        id={`${id}-heading`}
        className="font-display text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-8 text-brand-text-secondary">
        {children}
      </div>
    </section>
  );
}