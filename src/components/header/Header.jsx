import Link from "next/link";

/**
 * Minimal header shell.
 *
 * The requirements doc explicitly scopes detailed Header/Navigation
 * behavior out to a separate document (Section 4 note, Section 19). This
 * is a lightweight, functional stand-in so the home page has real
 * navigation today — swap it for the full Header component once that spec
 * lands. It implements only the destinations listed in Section 8.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo -> Home Page (Section 8) */}
        <Link href="/" className="font-display text-xl font-bold text-brand-navy">
          SPRINT
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <Link href="/courses" className="text-sm font-medium text-brand-text-secondary hover:text-brand-navy">
            Courses
          </Link>
          <Link href="/contact" className="text-sm font-medium text-brand-text-secondary hover:text-brand-navy">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-brand-text-secondary hover:text-brand-navy"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-navy-light"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
