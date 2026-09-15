"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

import navigation from "@/config/navigation.json";

/**
 * Global sticky Header.
 * Spec: docs/md/HEADER_DOCUMENTATION.md + About_Page.md §3.1 (HDR-01 … HDR-08).
 * - Sticky + compact (blur/shadow) when scrollY > 20 (HDR-02)
 * - Active route indicator via usePathname (HDR-03)
 * - "Enroll Now" primary CTA + "Student Login" secondary (HDR-04)
 * - Accessible mobile drawer (aria-expanded, closes on Escape / link click) (HDR-05/06)
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Scroll state transition (HDR-02)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes (HDR-05)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the drawer (HDR-05)
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const headerClasses = [
    "sticky top-0 z-50 w-full border-b transition-all duration-300",
    "border-brand-border/60 supports-[backdrop-filter]:bg-white/75 supports-[backdrop-filter]:backdrop-blur-xl",
    scrolled
      ? "bg-white/90 py-2.5 shadow-[0_8px_24px_-16px_rgba(1,31,62,0.25)]"
      : "bg-white/60 py-4",
  ].join(" ");

  return (
    <header className={headerClasses}>
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1200px] items-center gap-4 px-6"
      >
        {/* Brand — logo monogram "S" with gradient ring (HDR-08) */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="relative inline-block size-10 shrink-0" aria-hidden="true">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-red to-brand-purple" />
            <span className="absolute inset-[2px] grid place-items-center rounded-[10px] bg-brand-navy">
              <span className="text-base font-black leading-none text-white">S</span>
            </span>
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-navy">
            SPRINT
          </span>
        </Link>

        {/* Desktop navigation (md+) */}
        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "sprint-focus relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-brand-navy text-white"
                      : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-navy",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop actions */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link
            href="/student/login"
            className="sprint-focus rounded-full px-3 py-2 text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-navy"
          >
            Student Login
          </Link>
          <Link
            href="/register"
            className="sprint-focus group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
          >
            Enroll Now
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close navigation menu" : "Toggle navigation menu"}
          className="sprint-focus grid size-11 shrink-0 place-items-center rounded-full text-brand-navy transition-colors hover:bg-brand-surface md:hidden"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile drawer (md:hidden) — HDR-05 */}
      <div
        id="mobile-menu"
        className={[
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="min-h-0">
          <ul className="space-y-1 border-t border-brand-border bg-white/95 px-6 pb-6 pt-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "sprint-focus block rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-brand-navy text-white"
                        : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-navy",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/student/login"
                className="sprint-focus flex min-h-[44px] items-center rounded-2xl bg-brand-surface px-4 py-3 text-sm font-medium text-brand-text-secondary hover:text-brand-navy"
              >
                Student Login
              </Link>
            </li>
            <li>
              <Link
                href="/admin/login"
                className="sprint-focus flex min-h-[44px] items-center rounded-2xl bg-brand-surface px-4 py-3 text-sm font-medium text-brand-text-secondary hover:text-brand-navy"
              >
                Admin Console
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-base font-semibold text-white hover:bg-brand-red-dark"
              >
                Enroll Now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}