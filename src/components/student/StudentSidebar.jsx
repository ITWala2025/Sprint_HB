"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  BookPlus,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";

import navigation from "@/config/student-navigation.json";
import { mockStudent } from "@/data/student";

/* Icon registry — the nav config stays JSON-only (SSOT) while icons stay typed. */
const ICONS = {
  award: Award,
  bookOpen: BookOpen,
  bookPlus: BookPlus,
  clipboardList: ClipboardList,
  graduationCap: GraduationCap,
  layoutDashboard: LayoutDashboard,
  lifeBuoy: LifeBuoy,
  userRound: UserRound,
};

/**
 * Student portal sidebar.
 *
 * - `variant="sidebar"` — desktop rail; collapses to icon-only via `collapsed`.
 * - `variant="drawer"` — inside the mobile top drawer; always expanded.
 * Active item is derived from the current pathname, so Dashboard is highlighted
 * by default on /student/dashboard.
 */
export default function StudentSidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  variant = "sidebar",
  className = "",
}) {
  const pathname = usePathname() ?? "";
  const isActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Student portal navigation"
      className={`flex flex-col gap-1 rounded-3xl border border-brand-border bg-brand-white p-3 shadow-sm ${className}`}
    >
      {onToggleCollapse && variant === "sidebar" ? (
        <div
          className={`flex items-center gap-2 px-1 pb-3 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sprint-focus grid size-9 shrink-0 place-items-center rounded-xl border border-brand-border text-brand-text-muted transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4.5" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : null}

      <ul className="flex flex-col gap-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = ICONS[item.icon] ?? LayoutDashboard;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={`sprint-focus group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  active
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-navy"
                }`}
              >
                <Icon
                  className={`size-4.5 shrink-0 ${
                    active
                      ? "text-brand-red-light"
                      : "text-brand-text-muted group-hover:text-brand-navy"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}
                >
                  {item.label}
                </span>
                {!collapsed && item.badge ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-brand-red-light text-brand-red"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-brand-border pt-3">
        <div
          className={`flex items-center gap-3 rounded-2xl bg-brand-off-white px-3 py-2.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-navy text-[11px] font-bold text-white">
            {mockStudent.initials}
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-brand-navy">
                {mockStudent.fullName}
              </span>
              <span className="block truncate text-[11px] text-brand-text-muted">
                {mockStudent.id}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
