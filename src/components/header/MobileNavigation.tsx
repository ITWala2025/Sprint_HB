"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, UserRound, X } from "lucide-react";

interface MobileNavigationProps {
  pathname: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isAdmin?: boolean;
  accessibleBrandRed?: boolean;
}

const navigation = [
  { label: "Home", href: "/home" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function MobileNavigation({
  pathname,
  isOpen,
  setIsOpen,
  isAdmin = false,
  accessibleBrandRed = false,
}: MobileNavigationProps) {
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [setIsOpen]);

  const isActive = (href: string) =>
    href === "/home" ? pathname === "/home" : pathname.startsWith(href);

  return (
    <div className="min-w-0 shrink-0 lg:hidden">
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {isAdmin ? (
          <Link
            href="/admin/dashboard"
            aria-label="Admin dashboard"
            title="Admin dashboard"
            className="sprint-focus inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-xl bg-brand-navy px-3 py-2 text-sm font-bold text-white shadow-sm"
          >
            Admin
          </Link>
        ) : (
          <a
            href="/student/enroll"
            aria-label="Enroll Now"
            title="Enroll Now"
            className={`sprint-enroll-button sprint-focus inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-white shadow-sm ${
              accessibleBrandRed ? "bg-brand-red-accessible" : "bg-brand-red"
            }`}
          >
            <span className="floating-dots" aria-hidden="true">{Array.from({ length: 10 }).map((_, i) => <i key={i} className="dot" aria-hidden="true" style={{ animationName: "sprint-floating-dots" }} />)}</span>
            <span className="min-[420px]:hidden">Enroll</span>
            <span className="hidden min-[420px]:inline">Enroll Now</span>
            <ArrowRight className="enroll-arrow size-4" aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          className="sprint-focus flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-navy shadow-sm"
        >
          {isOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="sprint-mobile-drawer absolute left-0 right-0 top-full w-full border-b border-brand-border bg-white px-5 py-5 shadow-lg"
        >
          <nav aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                      active
                        ? "bg-brand-navy text-white"
                        : "text-brand-navy hover:bg-brand-surface"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 border-t border-brand-border pt-4">
              {!isAdmin ? (
                <Link
                  href="/student/login"
                  onClick={() => setIsOpen(false)}
                  className="sprint-focus flex items-center justify-center gap-2 rounded-lg border border-brand-border px-4 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-surface"
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  Student Portal
                </Link>
              ) : (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg bg-brand-navy px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
