"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Award, Bell, BookOpen, Briefcase, Building2, ChevronDown, ChevronRight, ClipboardCheck,
    ExternalLink, FileEdit, FileText, Globe, GraduationCap, LayoutDashboard, Layers, LogOut,
    Menu, Megaphone, PhoneCall, Search, School, ShieldAlert, ShieldCheck, UserCheck, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { adminRoutePermissions, canAccessAdminRoute, roleHasPermission, type AdminPermissionMap } from "@/app/admin/auth-types";
import { AdminPermissionsProvider } from "@/app/admin/permissions-context";
import ForcePasswordChangeModal from "@/components/admin/auth/ForcePasswordChangeModal";

type InitialProfile = {
    role: string | null;
    is_active: boolean;
    must_change_password: boolean;
    role_name: string | null;
    permissions: AdminPermissionMap | null;
    full_name: string | null;
    email: string | null;
};

type Icon = typeof LayoutDashboard;
type NavigationItem = { label: string; href: string; icon: Icon; badge?: string };
type NavigationGroup = { label: string; icon: Icon; items: NavigationItem[] };
type PermissionMap = AdminPermissionMap;

const directItems: NavigationItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
];

const navigationGroups: NavigationGroup[] = [
    {
        label: "Admissions & Enquiries", icon: PhoneCall, items: [
            { label: "Enquiries", href: "/admin/enquiries", icon: PhoneCall },
            { label: "Std/Emp Enquiries", href: "/admin/admissions/students", icon: PhoneCall, badge: "14" },
            { label: "Partner Company Enquiries", href: "/admin/admissions/companies", icon: Building2 },
            { label: "Partner College Enquiries", href: "/admin/admissions/colleges", icon: School },
        ]
    },
    {
        label: "Website CMS", icon: Globe, items: [
            { label: "Homepage CMS", href: "/admin/cms/home", icon: Globe },
            { label: "About Us CMS", href: "/admin/cms/about", icon: FileEdit },
            { label: "Course & Bundle CMS", href: "/admin/cms/courses", icon: Layers },
            { label: "Contact & Center CMS", href: "/admin/cms/contact", icon: PhoneCall },
            { label: "Careers & Openings CMS", href: "/admin/cms/careers", icon: Briefcase },
            { label: "Ticker & Campus Announcements", href: "/admin/cms/announcements", icon: Megaphone },
            { label: "Legal & Compliance CMS", href: "/admin/cms/legal", icon: ShieldCheck },
        ]
    },
    {
        label: "Training & Courses", icon: BookOpen, items: [
            { label: "Course Management", href: "/admin/courses", icon: BookOpen },
            { label: "Update Scholarship", href: "/admin/scholarships", icon: Award },
        ]
    },
    {
        label: "Student Operations", icon: Users, items: [
            { label: "Enrollment Applications", href: "/admin/students/enrollments", icon: GraduationCap, badge: "7" },
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
        ]
    },
    {
        label: "Partner Colleges / Institutes", icon: School, items: [
            { label: "List of Colleges", href: "/admin/partners/colleges/list", icon: School },
        ]
    },
    {
        label: "Trainer Management", icon: UserCheck, items: [
            { label: "Trainer Profiles", href: "/admin/trainers/list", icon: UserCheck },
            { label: "Trainer Assignments", href: "/admin/trainers/assignments", icon: ClipboardCheck },
            { label: "Batch Allocations", href: "/admin/trainers/batches", icon: GraduationCap },
        ]
    },
    {
        label: "Access Management",
        icon: ShieldCheck,
        items: [
            { label: "Staff & User Directory", href: "/admin/users", icon: Users },
            { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
        ]
    },
];

const updatesItem: NavigationItem = { label: "Announcements & Updates", href: "/admin/updates", icon: Megaphone };
const legalGroup: NavigationGroup = {
    label: "System & Legal", icon: ShieldAlert, items: [
        { label: "Privacy Policy", href: "/privacy", icon: ShieldAlert },
        { label: "Terms & Conditions", href: "/terms", icon: FileText },
    ]
};

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

function getAdminPathname(pathname: string) {
    return pathname === "/staff" || pathname.startsWith("/staff/")
        ? `/admin${pathname.slice("/staff".length)}`
        : pathname;
}

function getPageLabel(pathname: string, isAdmin: boolean) {
    const labels: Record<string, string> = {
        "/admin": "Sign In",
        "/admin/login": "Sign In",
        "/admin/dashboard": "Dashboard",
        "/admin/users": "Staff & User Directory",
        "/admin/enquiries": "Enquiries",
        "/admin/roles": "Roles & Permissions",
        "/admin/courses": "Courses",
        "/admin/students/enrollments": "Enrollment Applications",
    };
    if (labels[pathname]) return labels[pathname];
    const leaf = pathname.split("/").filter(Boolean).pop();
    return leaf
        ? leaf.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
        : isAdmin ? "Admin Console" : "Workspace";
}

function canViewItem(item: NavigationItem, permissionMap: PermissionMap | null, isAdmin: boolean, isLoading: boolean) {
    if (isLoading || !item.href.startsWith("/admin/")) return true;
    const matchingRoute = Object.keys(adminRoutePermissions)
        .sort((left, right) => right.length - left.length)
        .find((route) => item.href === route || item.href.startsWith(`${route}/`));
    if (!matchingRoute) return false;

    const moduleKeys = matchingRoute === "/admin/dashboard"
        ? ["dashboard"]
        : adminRoutePermissions[matchingRoute];
    return isAdmin || moduleKeys.some((moduleKey) => roleHasPermission(permissionMap, moduleKey, "view"));
}

function Sidebar({ pathname, onNavigate, permissionMap, brandSubtitle, displayName, email, isAdmin, isStaffWorkspace, isLoading }: { pathname: string; onNavigate?: () => void; permissionMap: PermissionMap | null; brandSubtitle: string; displayName: string; email: string; isAdmin: boolean; isStaffWorkspace: boolean; isLoading: boolean }) {
    const showStandardNavigation = isLoading || isAdmin;
    const canNavigateToDashboard = isAdmin || roleHasPermission(permissionMap, "dashboard", "view");
    const visibleGroups = useMemo(() => showStandardNavigation ? navigationGroups : navigationGroups.map((group) => ({ ...group, items: group.items.filter((item) => canViewItem(item, permissionMap, isAdmin, isLoading)) })).filter((group) => group.items.length > 0), [isAdmin, isLoading, permissionMap, showStandardNavigation]);
    const visibleLegalGroup = showStandardNavigation ? legalGroup : { ...legalGroup, items: legalGroup.items.filter((item) => canViewItem(item, permissionMap, isAdmin, isLoading)) };
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries([...navigationGroups, legalGroup].map((group) => [group.label, group.items.some((item) => isActive(pathname, item.href))])),
    );

    function renderLink(item: NavigationItem, nested = false) {
        const active = isActive(pathname, item.href);
        const ItemIcon = item.icon;
        const href = isStaffWorkspace && item.href.startsWith("/admin/")
            ? `/staff${item.href.slice("/admin".length)}`
            : item.href;
        return (
            <Link key={item.href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${nested ? "ml-3 pl-4" : ""} ${active ? "bg-brand-navy text-white shadow-sm" : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-navy"}`}>
                <ItemIcon className={`size-4 shrink-0 ${active ? "text-brand-red-light" : "text-brand-text-muted group-hover:text-brand-navy"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-white/15 text-white" : "bg-brand-red-light text-brand-red"}`}>{item.badge}</span>}
            </Link>
        );
    }

    function renderGroup(group: NavigationGroup) {
        const open = openGroups[group.label];
        const GroupIcon = group.icon;
        return <div key={group.label}><button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.label]: !current[group.label] }))} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-brand-text-secondary transition-colors hover:bg-brand-surface hover:text-brand-navy" aria-expanded={open}><GroupIcon className="size-4 shrink-0 text-brand-text-muted group-hover:text-brand-navy" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{group.label}</span>{open ? <ChevronDown className="size-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="size-4 shrink-0" aria-hidden="true" />}</button>{open && <div className="mt-1 space-y-1 border-l border-slate-200 pl-1">{group.items.map((item) => renderLink(item, true))}</div>}</div>;
    }

    return (
        <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-20 items-center border-b border-slate-200 px-6">{canNavigateToDashboard ? <Link href={isStaffWorkspace ? "/staff/dashboard" : "/admin/dashboard"} onClick={onNavigate} className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-navy font-display text-lg font-bold text-white">S</span><span><span className="block font-display text-lg font-bold leading-none text-brand-navy">SPRINT</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">{brandSubtitle}</span></span></Link> : <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-navy font-display text-lg font-bold text-white">S</span><span><span className="block font-display text-lg font-bold leading-none text-brand-navy">SPRINT</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">{brandSubtitle}</span></span></div>}</div>
            <nav aria-label={isAdmin ? "Admin navigation" : "Workspace navigation"} className="flex flex-1 flex-col space-y-1 overflow-y-auto px-4 py-5">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">Overview</p>
                {directItems.filter((item) => showStandardNavigation || canViewItem(item, permissionMap, isAdmin, isLoading)).map((item) => renderLink(item))}
                <p className="mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">Management</p>
                {visibleGroups.map(renderGroup)}
                {(showStandardNavigation || canViewItem(updatesItem, permissionMap, isAdmin, isLoading)) && <div className="space-y-1 pt-1">{renderLink(updatesItem)}</div>}
                <div className="mt-auto border-t border-slate-200 pt-5">
                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">System</p>
                    {visibleLegalGroup.items.length > 0 && renderGroup(visibleLegalGroup)}
                </div>
            </nav>
            <div className="border-t border-slate-200 p-4"><div className="flex items-center gap-3 rounded-xl bg-brand-off-white px-3 py-3"><span className="flex size-9 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-bold text-brand-navy">{displayName}</p><p className="truncate text-[11px] text-brand-text-muted">{email}</p></div></div></div>
        </aside>
    );
}

export default function AdminLayoutClient({
    children,
    initialProfile,
}: {
    children: ReactNode;
    initialProfile: InitialProfile | null;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [permissionMap, setPermissionMap] = useState<PermissionMap | null>(initialProfile?.permissions ?? null);
    const [profileRole, setProfileRole] = useState<string | null>(initialProfile?.role ?? null);
    const [roleName, setRoleName] = useState<string | null>(initialProfile?.role_name ?? initialProfile?.role ?? null);
    const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
    const [email, setEmail] = useState(initialProfile?.email ?? "");
    const [isAdmin, setIsAdmin] = useState(initialProfile?.role === "admin" || initialProfile?.permissions?.full_access === true);
    const [mustChangePassword, setMustChangePassword] = useState(initialProfile?.must_change_password === true && initialProfile.role !== "admin" && initialProfile.permissions?.full_access !== true);
    const [isAuthorized, setIsAuthorized] = useState(Boolean(
        initialProfile?.is_active &&
        (initialProfile.role === "admin" || initialProfile.role_name || initialProfile.permissions?.full_access === true),
    ));
    const [accessError, setAccessError] = useState("");
    const [isAccessLoading, setIsAccessLoading] = useState(!initialProfile);
    const [verifiedPath, setVerifiedPath] = useState("");
    const adminPathname = getAdminPathname(pathname);
    const isLoginRoute = adminPathname === "/admin" || adminPathname === "/admin/login";
    const isStaffWorkspace = profileRole === "staff" && !isAdmin;
    const safeStaffRoleName = roleName && !/admin/i.test(roleName) ? roleName : "Staff";
    const displayRoleName = isAdmin ? (roleName && roleName !== "admin" ? roleName : "Admin") : safeStaffRoleName;
    const displayName = fullName.trim() || email || (isAdmin ? "Administrator" : "Staff");
    const brandSubtitle = isAdmin ? "Admin Console" : roleName && safeStaffRoleName !== "Staff" ? safeStaffRoleName : "Staff Workspace";
    const currentLabel = getPageLabel(adminPathname, isAdmin);

    useEffect(() => {
        document.title = isAdmin
            ? `${currentLabel} | SPRINT Admin Console`
            : `${currentLabel} | SPRINT Workspace`;
    }, [currentLabel, isAdmin, pathname]);

    useEffect(() => {
        let isMounted = true;
        async function loadAccess() {
            if (isLoginRoute) {
                setVerifiedPath(pathname);
                setIsAccessLoading(false);
                return;
            }

            setIsAccessLoading(true);
            const { data: userData, error: authError } = await supabase.auth.getUser();
            if (authError || !userData.user) {
                if (!isMounted) return;
                setIsAuthorized(false);
                setIsAccessLoading(false);
                setVerifiedPath(pathname);
                router.replace(isStaffWorkspace ? "/staff/login" : "/admin/login");
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role, is_active, must_change_password, full_name, email, roles(name, permissions, is_active)")
                .eq("id", userData.user.id)
                .maybeSingle();
            if (!isMounted) return;
            if (profileError || !profile || profile.is_active !== true) {
                setAccessError(profileError?.message ?? "An active staff profile could not be verified.");
                setIsAuthorized(false);
                setIsAccessLoading(false);
                setVerifiedPath(pathname);
                return;
            }

            const assignedRole = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
            const assignedPermissions = assignedRole?.permissions as AdminPermissionMap | null;
            const superAdmin = profile.role === "admin" || assignedPermissions?.full_access === true;
            setIsAdmin(superAdmin);
            setProfileRole(profile.role ?? null);
            setMustChangePassword(profile.must_change_password === true && !superAdmin);
            setRoleName(profile.role ?? null);
            const validAssignedRole = Boolean(assignedRole?.name && assignedRole.is_active !== false);
            setRoleName(assignedRole?.name ?? profile.role ?? null);
            setPermissionMap(assignedPermissions ?? null);
            setFullName(profile.full_name ?? "");
            setEmail(profile.email ?? userData.user.email ?? "");
            setIsAuthorized(superAdmin || validAssignedRole);
            setAccessError(superAdmin || validAssignedRole ? "" : "This account does not have an active role assigned.");
            setIsAccessLoading(false);
            setVerifiedPath(pathname);
        }
        void loadAccess();
        return () => { isMounted = false; };
    }, [isLoginRoute, isStaffWorkspace, pathname, router, supabase]);

    async function handleSignOut() {
        const destination = profileRole === "staff" && !isAdmin
            ? "/staff/login"
            : "/admin";
        await supabase.auth.signOut();
        router.replace(destination);
        router.refresh();
    }

    if (isLoginRoute) return children;

    if (isAccessLoading || verifiedPath !== pathname) {
        return <main className="flex min-h-screen items-center justify-center bg-brand-off-white" role="status" aria-live="polite"><p className="text-sm font-medium text-brand-text-secondary">Verifying staff access...</p></main>;
    }

    if (!isAuthorized || !canAccessAdminRoute(adminPathname, permissionMap as AdminPermissionMap | null, profileRole)) {
        return (
            <>
                <main className="flex min-h-screen items-center justify-center bg-brand-off-white px-4 py-12">
                    <section className="w-full max-w-lg rounded-xl border border-brand-border bg-white p-8 text-center shadow-brand-card" aria-labelledby="admin-access-denied-title">
                        <ShieldAlert className="mx-auto size-10 text-brand-red" aria-hidden="true" />
                        <h1 id="admin-access-denied-title" className="mt-4 font-display text-2xl font-bold text-brand-navy">Access Denied</h1>
                        <p className="mt-2 text-sm leading-6 text-brand-text-secondary">{accessError || "Your assigned role does not have permission to view this page."}</p>
                        <div className="mt-6 flex justify-center gap-3">
                            {isAuthorized && <Link href={isStaffWorkspace ? "/staff/dashboard" : "/admin/dashboard"} className="rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">Return to dashboard</Link>}
                            <button type="button" onClick={handleSignOut} className="rounded-lg border border-brand-border px-4 py-2.5 text-sm font-bold text-brand-navy">Sign out</button>
                        </div>
                    </section>
                </main>
                {mustChangePassword && <ForcePasswordChangeModal mode="first_login" onSuccess={() => { setMustChangePassword(false); router.refresh(); }} />}
            </>
        );
    }

    return (
        <>
        <div className="min-h-[calc(100vh-5rem)] bg-slate-50 lg:flex">
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-brand-navy/35 transition-opacity lg:hidden ${isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={() => setIsMobileOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Container */}
            <div
                className={`fixed inset-y-0 left-0 z-[70] transition-transform duration-300 lg:static lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Sidebar pathname={adminPathname} onNavigate={() => setIsMobileOpen(false)} permissionMap={permissionMap} brandSubtitle={brandSubtitle} displayName={displayName} email={email} isAdmin={isAdmin} isStaffWorkspace={isStaffWorkspace} isLoading={isAccessLoading} />
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(true)}
                            className="sprint-focus flex size-10 items-center justify-center rounded-xl border border-slate-200 text-brand-navy lg:hidden"
                            aria-label={isAdmin ? "Open admin navigation" : "Open workspace navigation"}
                        >
                            <Menu className="size-5" aria-hidden="true" />
                        </button>
                        <div className="min-w-0">
                            <div className="hidden items-center gap-2 text-xs text-brand-text-muted sm:flex">
                                <span>{isAdmin ? "Admin" : "Workspace"}</span>
                                <ChevronRight className="size-3" aria-hidden="true" />
                                <span className="font-semibold text-brand-navy">{currentLabel}</span>
                            </div>
                            <h1 className="truncate font-display text-lg font-bold text-brand-navy sm:mt-1 sm:text-xl">
                                {currentLabel}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-brand-text-muted md:flex">
                            <Search className="size-4" aria-hidden="true" />
                            <span className="sr-only">{isAdmin ? "Search admin console" : "Search workspace"}</span>
                            <input
                                type="search"
                                placeholder={isAdmin ? "Search console" : "Search workspace"}
                                className="w-32 bg-transparent outline-none placeholder:text-brand-text-muted lg:w-44"
                            />
                        </label>

                        <button
                            type="button"
                            className="relative hidden size-10 items-center justify-center rounded-xl text-brand-text-secondary hover:bg-brand-surface sm:flex"
                            aria-label="View notifications"
                        >
                            <Bell className="size-5" aria-hidden="true" />
                            <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-red" />
                        </button>

                        <Link
                            href="/home"
                            className="sprint-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-surface sm:px-4"
                        >
                            <ExternalLink className="size-4" aria-hidden="true" />
                            <span className="hidden sm:inline">View Website</span>
                            <span className="sm:hidden">Home</span>
                        </Link>

                        <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 md:flex">
                            <span className="flex size-9 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                                {displayName.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="hidden text-right xl:block">
                                <span className="block text-xs font-bold text-brand-navy">
                                    {displayRoleName}
                                </span>
                                <span className="block text-[11px] text-emerald-600">● Active · {displayName}</span>
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="sprint-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-red-light hover:text-brand-red sm:px-4"
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </header>

                <main className="min-h-[calc(100vh-10rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <AdminPermissionsProvider permissions={permissionMap} isSuperAdmin={isAdmin}>
                        {children}
                    </AdminPermissionsProvider>
                </main>
            </div>
        </div>
        {mustChangePassword && <ForcePasswordChangeModal mode="first_login" onSuccess={() => { setMustChangePassword(false); router.refresh(); }} />}
        </>
    );
}