/**
 * Minimal footer shell. Detailed Footer requirements are out of scope for
 * this document (Section 4 note, Section 19) — replace with the full
 * Footer component once that spec is available.
 */
export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-white py-10">
      <div className="mx-auto max-w-7xl px-6 text-sm text-brand-text-muted">
        © {new Date().getFullYear()} SPRINT. All rights reserved.
      </div>
    </footer>
  );
}
