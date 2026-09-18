"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileNavigationProps {
  pathname: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const navigation = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function MobileNavigation({ pathname, isOpen, setIsOpen }: MobileNavigationProps) {
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
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="shrink-0 lg:hidden">
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/register" className="sprint-focus rounded-lg bg-brand-red px-4 py-2.5 text-sm font-semibold text-white">
          Enroll
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          className="sprint-focus flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border text-brand-navy"
        >
          {isOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="sprint-mobile-drawer absolute left-0 right-0 top-full w-full border-b border-brand-border bg-white px-5 py-5 shadow-lg">
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
                      active ? "bg-brand-navy text-white" : "text-brand-navy hover:bg-brand-surface"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 border-t border-brand-border pt-4">
              <Link href="/student/login" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-surface">
                Student Login
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="mt-2 block rounded-lg bg-brand-red px-4 py-3 text-center text-sm font-semibold text-white">
                Enroll Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
