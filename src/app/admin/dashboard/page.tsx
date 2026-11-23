import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowUpRight,
    BookOpen,
    Building2,
    Megaphone,
    PhoneCall,
    ShieldCheck,
    Users,
} from "lucide-react";
import EnquiriesCategoryView from "@/components/admin/EnquiriesCategoryView";
import type { Enquiry } from "@/components/admin/enquiries-types";
import { roleHasPermission } from "@/app/admin/auth-types";
import { getAdminSession } from "@/app/admin/session";
import { getPendingCourseFreeRegistrationCount } from "@/app/admin/students/registrations/actions";
import { createServiceClient } from "@/lib/supabase/service";

type DashboardAnnouncement = {
    id: string;
    title: string;
    category: string;
    message: string;
    created_at: string;
};

function isAnnouncementActive(row: Record<string, unknown>) {
    if (row.is_active === false || row.is_published === false) return false;
    const status = typeof row.status === "string" ? row.status.toLowerCase() : "";
    return !["draft", "inactive", "unpublished", "archived"].includes(status);
}

function toDashboardAnnouncement(row: Record<string, unknown>, index: number): DashboardAnnouncement {
    const message = String(row.message ?? row.summary ?? "");
    const title = String(row.title ?? message.split(/\r?\n/, 1)[0] ?? "Announcement").trim();
    return {
        id: String(row.id ?? `announcement-${index}`),
        title: title || "Announcement",
        category: String(row.category ?? row.type ?? "Announcement"),
        message,
        created_at: String(row.created_at ?? ""),
    };
}

function formatAnnouncementDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

type Metric = {
    label: string;
    value: string;
    note: string;
    href: string;
    icon: typeof Users;
    accent: string;
};

const shortcuts = [
    { href: "/admin/courses", label: "Manage Courses", description: "Review and update course catalogue.", icon: BookOpen, color: "bg-brand-blue-light text-brand-blue", moduleKeys: ["courses", "cms_courses"] },
    { href: "/admin/enquiries/students", label: "Review Enquiries", description: "Follow up on the latest admissions enquiries.", icon: PhoneCall, color: "bg-brand-red-light text-brand-red", moduleKeys: ["admissions", "marketing", "support"] },
    { href: "/admin/users", label: "Manage Staff", description: "Review staff accounts and access roles.", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600", moduleKeys: ["user_management", "access_control"] },
];

export default async function AdminDashboardPage() {
    const session = await getAdminSession();
    if (!session || !session.isActive) redirect("/admin");

    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }

    const canView = (moduleKeys: string | string[]) =>
        session.isAdmin || (Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys])
            .some((moduleKey) => roleHasPermission(session.permissions, moduleKey, "view"));
    const showEnquiries = canView(["admissions", "marketing", "support"]);
    const showAnnouncements = canView(["cms_announcements", "marketing"]);
    const displayName = session.fullName?.trim() || session.email || (session.isAdmin ? "Admin" : "Staff");

    const [
        studentsResult,
        pendingRegistrationsCount,
        coursesResult,
        profilesResult,
        announcementsResult,
    ] = await Promise.all([
        serviceClient.from("students").select("id", { count: "exact", head: true }),
        getPendingCourseFreeRegistrationCount(),
        serviceClient.from("courses").select("id", { count: "exact", head: true }),
        serviceClient.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true).neq("role", "student"),
        serviceClient.from("announcements").select("*").order("created_at", { ascending: false }),
    ]);

    const queryErrors: { name: string; message: string }[] = [];
    if (studentsResult.error) queryErrors.push({ name: "students", message: studentsResult.error.message });
    if (coursesResult.error) queryErrors.push({ name: "courses", message: coursesResult.error.message });
    if (profilesResult.error) queryErrors.push({ name: "active staff", message: profilesResult.error.message });
    for (const error of queryErrors) {
        console.error("[admin-dashboard] summary query failed", { query: error.name, message: error.message });
    }

    let announcementRows = announcementsResult.data as Record<string, unknown>[] | null;
    let announcementsError = announcementsResult.error?.message ?? null;
    if (announcementsResult.error || !announcementRows?.length) {
        const { data, error } = await serviceClient
            .from("campus_updates")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            console.error("[admin-dashboard] announcements query failed", {
                announcements: announcementsError,
                campus_updates: error.message,
            });
            announcementsError = announcementsError
                ? `${announcementsError}; campus updates: ${error.message}`
                : error.message;
        } else {
            announcementRows = data as Record<string, unknown>[];
            announcementsError = null;
        }
    } else {
        announcementsError = null;
    }
    const announcements = (announcementRows ?? [])
        .filter(isAnnouncementActive)
        .map(toDashboardAnnouncement)
        .slice(0, 6);

    let enquiries: Enquiry[] = [];
    let enquiriesError: string | null = null;
    if (showEnquiries) {
        const { data, error } = await serviceClient
            .from("enquiries")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            enquiriesError = error.message;
            console.error("[admin-dashboard] enquiries query failed", { message: error.message });
        } else {
            enquiries = (data ?? []) as Enquiry[];
        }
    }

    const metrics: Metric[] = [
        { label: "Total Students", value: String(studentsResult.count ?? 0), note: "Registered student records", href: "/admin/students/list", icon: Users, accent: "bg-brand-blue-light text-brand-blue" },
        { label: "Pending Registrations", value: String(pendingRegistrationsCount), note: "Registered leads without a course", href: "/admin/students/registrations", icon: PhoneCall, accent: "bg-brand-red-light text-brand-red" },
        { label: "Total Courses", value: String(coursesResult.count ?? 0), note: "Courses in the catalogue", href: "/admin/courses", icon: BookOpen, accent: "bg-orange-50 text-orange-600" },
        { label: "Total Staffs", value: String(profilesResult.count ?? 0), note: "Active admin and staff accounts", href: "/admin/users", icon: Building2, accent: "bg-emerald-50 text-emerald-600" },
    ];
    const visibleShortcuts = shortcuts.filter((shortcut) => canView(shortcut.moduleKeys));
    const dashboardError = queryErrors.length
        ? `Some dashboard totals could not be loaded: ${queryErrors.map(({ name, message }) => `${name}: ${message}`).join("; ")}`
        : null;

    return (
        <div className="mx-auto w-full max-w-[1500px] min-w-0 space-y-6 overflow-hidden">
            <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" />
                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">{session.roleName || (session.isAdmin ? "Admin Console" : "Staff Workspace")}</p>
                        <h1 className="mt-2 break-words font-display text-2xl font-bold sm:text-3xl">Welcome, {displayName.split(/\s+/)[0]}.</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Here is the latest pulse across your workspace.</p>
                    </div>
                    {showEnquiries && <Link href="/admin/enquiries/students" className="sprint-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-purple px-4 py-3 text-sm font-bold text-white shadow-brand-cta transition hover:brightness-110">Review enquiries <ArrowUpRight className="size-4" aria-hidden="true" /></Link>}
                </div>
            </section>

            {dashboardError && (
                <section className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm" aria-live="polite">
                    {dashboardError}
                </section>
            )}

            <section aria-label="Key performance indicators" className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Link
                            key={metric.label}
                            href={metric.href}
                            className="group w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="break-words text-sm font-medium text-brand-text-secondary">{metric.label}</p>
                                    <p className="mt-3 font-display text-3xl font-bold text-brand-navy">{metric.value}</p>
                                </div>
                                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${metric.accent}`}><Icon className="size-5" aria-hidden="true" /></span>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                                <p className="min-w-0 break-words text-xs text-brand-text-muted">{metric.note}</p>
                                <ArrowUpRight className="size-4 shrink-0 text-brand-blue transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                            </div>
                        </Link>
                    );
                })}
            </section>

            <section className={`grid min-w-0 gap-6 ${showEnquiries && showAnnouncements ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]" : ""}`}>
                {showEnquiries && (
                    <article className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                            <div className="min-w-0">
                                <h2 className="font-display text-lg font-bold text-brand-navy">Live Enquiries</h2>
                                <p className="mt-1 text-xs text-brand-text-muted">Latest submissions across all enquiry categories</p>
                            </div>
                            <Link href="/admin/enquiries/students" className="shrink-0 text-xs font-bold text-brand-blue hover:underline">View all</Link>
                        </header>
                        {enquiriesError
                            ? <p className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load enquiries: {enquiriesError}</p>
                            : <EnquiriesCategoryView enquiries={enquiries} category="all" allowDelete={false} />}
                    </article>
                )}

                {showAnnouncements && (
                    <article className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
                            <div className="min-w-0">
                                <h2 className="font-display text-lg font-bold text-brand-navy">Announcements &amp; Updates</h2>
                                <p className="mt-1 text-xs text-brand-text-muted">Latest published workspace notices</p>
                            </div>
                            <Link href="/admin/updates" className="shrink-0 text-xs font-bold text-brand-blue hover:underline">View all</Link>
                        </header>
                        {announcementsError
                            ? <p className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load announcements: {announcementsError}</p>
                            : announcements.length === 0
                                ? <p className="px-5 py-10 text-center text-sm text-brand-text-muted">No active announcements.</p>
                                : <div className="divide-y divide-slate-100">
                                    {announcements.map((announcement) => (
                                        <div key={announcement.id} className="flex min-w-0 gap-3 px-5 py-4">
                                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue"><Megaphone className="size-4" aria-hidden="true" /></span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                    <h3 className="min-w-0 break-words text-sm font-bold text-brand-navy">{announcement.title}</h3>
                                                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-brand-text-secondary">{announcement.category}</span>
                                                </div>
                                                <p className="mt-1 line-clamp-3 break-words text-xs leading-5 text-brand-text-secondary">{announcement.message}</p>
                                                <p className="mt-2 text-[11px] text-brand-text-muted">{formatAnnouncementDate(announcement.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>}
                    </article>
                )}
            </section>

            {visibleShortcuts.length > 0 && (
                <section className="min-w-0">
                    <div className="mb-4">
                        <h2 className="font-display text-lg font-bold text-brand-navy">Quick Shortcuts</h2>
                        <p className="mt-1 text-xs text-brand-text-muted">Jump directly into common workspace tasks</p>
                    </div>
                    <div className="grid min-w-0 gap-4 md:grid-cols-3">
                        {visibleShortcuts.map((shortcut) => {
                            const Icon = shortcut.icon;
                            return (
                                <Link key={shortcut.href} href={shortcut.href} className="group w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md">
                                    <span className={`flex size-10 items-center justify-center rounded-xl ${shortcut.color}`}><Icon className="size-5" aria-hidden="true" /></span>
                                    <p className="mt-4 font-display font-bold text-brand-navy">{shortcut.label}</p>
                                    <p className="mt-1 text-xs leading-5 text-brand-text-muted">{shortcut.description}</p>
                                    <ArrowUpRight className="mt-4 size-4 text-brand-blue transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
