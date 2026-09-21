"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Award, Bell, BookOpen, Building2, ChevronDown, ChevronRight, ClipboardCheck,
    GraduationCap, LayoutDashboard, LogOut, Menu, Megaphone, PhoneCall, Search,
    School, Users,
} from "lucide-react";
import { logoutAdmin } from "@/lib/auth";

type Icon = typeof LayoutDashboard;
type NavigationItem = { label: string; href: string; icon: Icon; badge?: string };
type NavigationGroup = { label: string; icon: Icon; items: NavigationItem[] };

const directItems: NavigationItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Admissions & Callbacks", href: "/admin/admissions", icon: PhoneCall, badge: "14" },
];

const navigationGroups: NavigationGroup[] = [
    {
        label: "Training & Courses", icon: BookOpen, items: [
            { label: "Edit Courses", href: "/admin/courses/edit", icon: BookOpen },
            { label: "Update Scholarship", href: "/admin/courses/scholarships", icon: Award },
        ]
    },
    {
        label: "Student Operations", icon: Users, items: [
            { label: "Student Directory & Attendance", href: "/admin/students/list", icon: Users },
        ]
    },
    {
        label: "Academic & Curriculum", icon: ClipboardCheck, items: [
            { label: "Assign Assessments", href: "/admin/academics/assessments/assign", icon: ClipboardCheck },
            { label: "Assessment Results", href: "/admin/academics/assessments/results", icon: Award },
            { label: "Mock Results", href: "/admin/academics/mocks/results", icon: GraduationCap },
        ]
    },
    {
        label: "Partner Companies (B2B Hiring)", icon: Building2, items: [
            { label: "List of Partners", href: "/admin/partners/companies/list", icon: Building2 },
            { label: "Inquiries & Callbacks", href: "/admin/partners/companies/callbacks", icon: PhoneCall },
        ]
    },
    {
        label: "Partner Colleges / Institutes", icon: School, items: [
            { label: "List of Colleges", href: "/admin/partners/colleges/list", icon: School },
            { label: "Inquiries & Callbacks", href: "/admin/partners/colleges/callbacks", icon: PhoneCall },
        ]
    },
];

const updatesItem: NavigationItem = { label: "Announcements & Updates", href: "/admin/updates", icon: Megaphone };

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(navigationGroups.map((group) => [group.label, group.items.some((item) => isActive(pathname, item.href))])),
    );

    function renderLink(item: NavigationItem, nested = false) {
        const active = isActive(pathname, item.href);
        const ItemIcon = item.icon;
        return (
            <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${nested ? "ml-3 pl-4" : ""} ${active ? "bg-brand-navy text-white shadow-sm" : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-navy"}`}>
                <ItemIcon className={`size-4 shrink-0 ${active ? "text-brand-red-light" : "text-brand-text-muted group-hover:text-brand-navy"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-white/15 text-white" : "bg-brand-red-light text-brand-red"}`}>{item.badge}</span>}
            </Link>
        );
    }

    return (
        <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-20 items-center border-b border-slate-200 px-6"><Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-navy font-display text-lg font-bold text-white">S</span><span><span className="block font-display text-lg font-bold leading-none text-brand-navy">SPRINT</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">Admin Console</span></span></Link></div>
            <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">Overview</p>
                {directItems.map((item) => renderLink(item))}
                <p className="mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">Management</p>
                {navigationGroups.map((group) => { const open = openGroups[group.label]; const GroupIcon = group.icon; return <div key={group.label}><button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.label]: !current[group.label] }))} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-brand-text-secondary transition-colors hover:bg-brand-surface hover:text-brand-navy" aria-expanded={open}><GroupIcon className="size-4 shrink-0 text-brand-text-muted group-hover:text-brand-navy" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{group.label}</span>{open ? <ChevronDown className="size-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="size-4 shrink-0" aria-hidden="true" />}</button>{open && <div className="mt-1 space-y-1 border-l border-slate-200 pl-1">{group.items.map((item) => renderLink(item, true))}</div>}</div>; })}
                <div className="pt-1">{renderLink(updatesItem)}</div>
            </nav>
            <div className="border-t border-slate-200 p-4"><div className="flex items-center gap-3 rounded-xl bg-brand-off-white px-3 py-3"><span className="flex size-9 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">AD</span><div className="min-w-0"><p className="truncate text-xs font-bold text-brand-navy">Administrator</p><p className="truncate text-[11px] text-brand-text-muted">admin@sprint.institute</p></div></div></div>
        </aside>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    if (pathname === "/admin") return children;

    function handleSignOut() { logoutAdmin(); router.push("/admin"); }
    const currentLabel = pathname === "/admin/dashboard" ? "Dashboard" : "Admin Console";

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-slate-50 lg:flex">
            <div className={`fixed inset-0 z-[60] bg-brand-navy/35 transition-opacity lg:hidden ${isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setIsMobileOpen(false)} aria-hidden="true" />
            <div className={`fixed inset-y-0 left-0 z-[70] transition-transform duration-300 lg:static lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}><Sidebar pathname={pathname} onNavigate={() => setIsMobileOpen(false)} /></div>
            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setIsMobileOpen(true)} className="sprint-focus flex size-10 items-center justify-center rounded-xl border border-slate-200 text-brand-navy lg:hidden" aria-label="Open admin navigation"><Menu className="size-5" aria-hidden="true" /></button><div className="min-w-0"><div className="hidden items-center gap-2 text-xs text-brand-text-muted sm:flex"><span>Admin</span><ChevronRight className="size-3" aria-hidden="true" /><span className="font-semibold text-brand-navy">{currentLabel}</span></div><h1 className="truncate font-display text-lg font-bold text-brand-navy sm:mt-1 sm:text-xl">{currentLabel}</h1></div></div>
                    <div className="flex items-center gap-2 sm:gap-4"><label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-brand-text-muted md:flex"><Search className="size-4" aria-hidden="true" /><span className="sr-only">Search admin console</span><input type="search" placeholder="Search console" className="w-32 bg-transparent outline-none placeholder:text-brand-text-muted lg:w-44" /></label><button type="button" className="relative hidden size-10 items-center justify-center rounded-xl text-brand-text-secondary hover:bg-brand-surface sm:flex" aria-label="View notifications"><Bell className="size-5" aria-hidden="true" /><span className="absolute right-2 top-2 size-2 rounded-full bg-brand-red" /></button><div className="hidden items-center gap-2 border-l border-slate-200 pl-4 md:flex"><span className="flex size-9 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">AD</span><span className="hidden text-right xl:block"><span className="block text-xs font-bold text-brand-navy">admin@sprint.institute</span><span className="block text-[11px] text-brand-success">● Active</span></span></div><button type="button" onClick={handleSignOut} className="sprint-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-red-light hover:text-brand-red sm:px-4"><LogOut className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Sign Out</span></button></div>
                </header>
                <main className="min-h-[calc(100vh-10rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
            </div>
        </div>
    );
}