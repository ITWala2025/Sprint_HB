"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import StudentSidebar from "./StudentSidebar";
import { mockStudent } from "@/data/student";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

/**
 * StudentLayout — the shared shell for every /student/* portal page.
 *
 * It does NOT render a top bar of its own: the public SPRINT header + campus
 * ticker + footer already come from `PublicSiteShell` (root layout), so the
 * portal sits underneath the site's existing chrome.
 *
 * Layout:
 * - lg+ : sticky collapsible sidebar on the left, page content on the right.
 * - <lg : the sidebar becomes a slide-down top drawer opened from a compact
 *         portal bar. No auth, no route guards — this pass is UI only.
 */
export default function StudentLayout({ children }) {
  const pathname = usePathname() ?? "";
  const isDashboard = pathname === "/student/dashboard";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* Close the drawer automatically when the layout reaches the desktop rail. */
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event) => {
      if (event.matches) setIsDrawerOpen(false);
    };

    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, []);

  /* Escape closes the drawer. */
  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  /* Lock page scroll behind the drawer. */
  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isDrawerOpen]);

  return (
    <div className="min-h-screen bg-brand-off-white">
      {/* Compact portal bar (below the lg breakpoint the rail becomes a drawer). */}
      <div className="sticky top-20 z-40 border-b border-brand-border bg-brand-white lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-controls="student-sidebar-drawer"
            className="sprint-focus grid size-10 shrink-0 place-items-center rounded-xl border border-brand-border text-brand-navy transition-colors hover:bg-brand-surface"
          >
            <Menu className="size-5" aria-hidden="true" />
            <span className="sr-only">Open student portal navigation</span>
          </button>
          {!isDashboard ? (
            <p className="min-w-0 flex-1 truncate font-display text-sm font-bold text-brand-navy">
              Student Portal
            </p>
          ) : null}
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-navy text-[11px] font-bold text-white">
            {mockStudent.initials}
          </span>
        </div>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
            data-testid="student-drawer-backdrop"
            aria-hidden="true"
          />
          <div className="sprint-mobile-drawer absolute inset-x-0 top-0 max-h-[88vh] overflow-y-auto rounded-b-3xl border-b border-brand-border bg-brand-white p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3 pb-3">
              <p className="font-display text-sm font-bold text-brand-navy">
                {isDashboard ? "Navigation" : "Student Portal"}
              </p>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="sprint-focus grid size-10 place-items-center rounded-xl border border-brand-border text-brand-navy transition-colors hover:bg-brand-surface"
              >
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">Close student portal navigation</span>
              </button>
            </div>
            <div id="student-sidebar-drawer">
              <StudentSidebar
                variant="drawer"
                onNavigate={() => setIsDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Same container edge as the site header (max-w-7xl + responsive gutters). */}
      <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-4 py-6 sm:px-6 lg:gap-6 lg:px-8 lg:py-8">
        <div
          className={`hidden lg:sticky lg:top-24 lg:block lg:shrink-0 ${
            isCollapsed ? "lg:w-[76px]" : "lg:w-[264px]"
          }`}
        >
          <StudentSidebar
            collapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((value) => !value)}
          />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
