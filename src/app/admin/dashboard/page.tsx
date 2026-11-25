import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowUpRight,
    BookOpen,
    Building2,
    Megaphone,
    PhoneCall,
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

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
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const ist = new Date(date.getTime() + 330 * 60 * 1000);
    const day = String(ist.getUTCDate()).padStart(2, "0");
    const month = MONTHS[ist.getUTCMonth()];
    const year = ist.getUTCFullYear();
    const rawHours = ist.getUTCHours();
    const period = rawHours >= 12 ? "PM" : "AM";
    const hours = rawHours % 12 || 12;
    const minutes = String(ist.getUTCMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes} ${period}`;
}

type Metric = {
    label: string;
    value: string;
    note: string;
    href: string;
    icon: typeof Users;
    accent: string;
};

function emptyCountResult() {
    return { count: 0, error: null };
}

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
    const canViewStudents = canView("student_ops");
    const canViewCourses = canView(["courses", "cms_courses"]);
    const canViewStaff = canView(["user_management", "access_control"]);
    const showEnquiries = canView(["admissions", "marketing", "support"]);
    const showAnnouncements = canView(["cms_announcements", "marketing"]);
    const workspacePath = (adminPath: string) => session.role === "staff" && !session.isAdmin
        ? `/staff${adminPath.slice("/admin".length)}`
        : adminPath;
    const displayName = session.fullName?.trim() || session.email || (session.isAdmin ? "Admin" : "Staff");

    const [
        studentsResult,
        pendingRegistrationsCount,
        coursesResult,
        staffResult,
        announcementsResult,
    ] = await Promise.all([
        canViewStudents
            ? serviceClient.from("students").select("id", { count: "exact", head: true })
            : Promise.resolve(emptyCountResult()),
        canViewStudents ? getPendingCourseFreeRegistrationCount() : Promise.resolve(0),
        canViewCourses
            ? serviceClient.from("courses").select("id", { count: "exact", head: true })
            : Promise.resolve(emptyCountResult()),
        canViewStaff
            ? serviceClient.from("staff").select("id", { count: "exact", head: true }).eq("is_active", true)
            : Promise.resolve(emptyCountResult()),
        showAnnouncements
            ? serviceClient.from("announcements").select("*").order("created_at", { ascending: false })
            : Promise.resolve({ data: null, error: null }),
    ]);

    const queryErrors: { name: string; message: string }[] = [];
    if (studentsResult.error) queryErrors.push({ name: "students", message: studentsResult.error.message });
    if (coursesResult.error) queryErrors.push({ name: "courses", message: coursesResult.error.message });
    if (staffResult.error) queryErrors.push({ name: "active staff", message: staffResult.error.message });
    for (const error of queryErrors) {
        console.error("[admin-dashboard] summary query failed", { query: error.name, message: error.message });
    }

    let announcementRows = showAnnouncements
        ? announcementsResult.data as Record<string, unknown>[] | null
        : null;
    let announcementsError = showAnnouncements ? announcementsResult.error?.message ?? null : null;
    if (showAnnouncements && (announcementsResult.error || !announcementRows?.length)) {
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

    const metrics: Metric[] = [];
    if (canViewStudents) {
        metrics.push(
            { label: "Total Students", value: String(studentsResult.count ?? 0), note: "Registered student records", href: workspacePath("/admin/students/list"), icon: Users, accent: "bg-brand-blue-light text-brand-blue" },
            { label: "Pending Registrations", value: String(pendingRegistrationsCount), note: "Registered leads without a course", href: workspacePath("/admin/students/registrations"), icon: PhoneCall, accent: "bg-brand-red-light text-brand-red" },
        );
    }
    if (canViewCourses) {
        metrics.push({ label: "Total Courses", value: String(coursesResult.count ?? 0), note: "Courses in the catalogue", href: workspacePath("/admin/courses"), icon: BookOpen, accent: "bg-orange-50 text-orange-600" });
    }
    if (canViewStaff) {
        metrics.push({ label: "Total Staffs", value: String(staffResult.count ?? 0), note: "Active staff accounts", href: workspacePath("/admin/users"), icon: Building2, accent: "bg-emerald-50 text-emerald-600" });
    }
    const dashboardError = queryErrors.length
        ? `Some dashboard totals could not be loaded: ${queryErrors.map(({ name, message }) => `${name}: ${message}`).join("; ")}`
        : null;

    return (
        <div className="mx-auto w-full max-w-[1500px] min-w-0 space-y-6 overflow-hidden">
            <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" />
                <div className="relative flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">{session.roleName || (session.isAdmin ? "Admin Console" : "Staff Workspace")}</p>
                        <h1 className="mt-2 break-words font-display text-2xl font-bold sm:text-3xl">Welcome, {displayName.split(/\s+/)[0]}.</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Here is the latest pulse across your workspace.</p>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                        {showEnquiries && <Link href={workspacePath("/admin/enquiries/students")} className="sprint-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-purple px-4 py-3 text-sm font-bold text-white shadow-brand-cta transition hover:brightness-110">Review enquiries <ArrowUpRight className="size-4" aria-hidden="true" /></Link>}
                        {canView(["courses", "cms_courses"]) && (
                            <Link href={workspacePath("/admin/courses")} className="sprint-focus inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                                Manage Courses <ArrowUpRight className="size-4 opacity-70" aria-hidden="true" />
                            </Link>
                        )}
                        {canView(["user_management", "access_control"]) && (
                            <Link href={workspacePath("/admin/users")} className="sprint-focus inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                                Manage Staff <ArrowUpRight className="size-4 opacity-70" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
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
                            <Link href={workspacePath("/admin/enquiries/students")} className="shrink-0 text-xs font-bold text-brand-blue hover:underline">View all</Link>
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
                            <Link href={workspacePath("/admin/updates")} className="shrink-0 text-xs font-bold text-brand-blue hover:underline">View all</Link>
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

        </div>
    );
}
