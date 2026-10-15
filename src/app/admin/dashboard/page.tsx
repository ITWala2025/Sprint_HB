import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { ArrowUpRight, Award, Building2, CalendarDays, CheckCircle2, Clock3, GraduationCap, PhoneCall, Users } from "lucide-react";
import { roleHasPermission, type AdminPermissionMap } from "@/app/admin/auth-types";

const metrics = [
    { label: "Total Active Students", value: "248", note: "Across 1-Yr, 2-Yr & 3-Yr tracks", icon: Users, accent: "bg-brand-blue-light text-brand-blue", moduleKeys: ["student_ops"] },
    { label: "Pending Student Callbacks", value: "14", note: "New callback requests", icon: PhoneCall, accent: "bg-brand-red-light text-brand-red", moduleKeys: ["admissions", "marketing", "support"] },
    { label: "B2B & College Leads", value: "9", note: "6 corporate + 3 institutional", icon: Building2, accent: "bg-orange-50 text-orange-600", moduleKeys: ["partners"] },
    { label: "Upcoming Evaluations", value: "8", note: "Mock defenses & lab assessments", icon: CalendarDays, accent: "bg-emerald-50 text-emerald-600", moduleKeys: ["academic_ops", "academics"] },
];

const callbacks = [
    { name: "Ananya Sinha", background: "B.Tech", track: "Cloud & DevOps", date: "Today, 10:30 AM", status: "New" },
    { name: "Rohan Kumar", background: "BCA", track: "AI / ML Foundations", date: "Today, 09:15 AM", status: "Contacted" },
    { name: "Meera Patel", background: "MCA", track: "Full Stack Engineering", date: "Yesterday, 04:45 PM", status: "New" },
    { name: "Arjun Das", background: "B.Tech", track: "Data Analytics", date: "Yesterday, 01:20 PM", status: "Enrolled" },
];

const schedule = [
    { batch: "Cloud Cohort B-04", type: "Lab Assessment", date: "Mon, 23 Sep · 11:00 AM", mentor: "Nitin Verma" },
    { batch: "AI/ML Foundation A-02", type: "Mock Defense", date: "Tue, 24 Sep · 02:30 PM", mentor: "Dr. Priya Shah" },
    { batch: "Full Stack Cohort C-01", type: "Lab Assessment", date: "Wed, 25 Sep · 10:00 AM", mentor: "Karan Malhotra" },
    { batch: "Data Analytics D-03", type: "Mock Defense", date: "Thu, 26 Sep · 03:00 PM", mentor: "Nisha Agarwal" },
];

const statusStyles: Record<string, string> = { New: "bg-brand-red-light text-brand-red", Contacted: "bg-amber-50 text-amber-700", Enrolled: "bg-emerald-50 text-emerald-700" };

type Shortcut = { href: string; label: string; description: string; moduleKeys: string[]; icon: typeof Award; color: string };
const shortcuts: Shortcut[] = [
    { href: "/admin/scholarships", label: "Update Scholarship", description: "Manage scholarship details and eligibility.", moduleKeys: ["academic_ops", "academics"], icon: Award, color: "bg-brand-blue-light text-brand-blue" },
    { href: "/admin/academics/assessments/assign", label: "Assign Assessments", description: "Schedule evaluations for active batches.", moduleKeys: ["academic_ops", "academics"], icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { href: "/admin/partners/companies/callbacks", label: "Partner Callbacks", description: "Follow up on corporate hiring leads.", moduleKeys: ["partners"], icon: Building2, color: "bg-orange-50 text-orange-600" },
];

type RoleRow = {
    name: string | null;
    permissions: AdminPermissionMap | null;
    is_active: boolean | null;
};

export default async function AdminDashboardPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Server Components cannot write refreshed auth cookies.
                }
            },
        },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Workspace session verification failed: ${authError.message}`);
    if (!authData.user) redirect("/admin");

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name, is_active, roles(name, permissions, is_active)")
        .eq("id", authData.user.id)
        .maybeSingle();
    if (profileError) throw new Error(`Workspace profile could not be loaded: ${profileError.message}`);
    if (!profile || profile.is_active !== true) redirect("/admin");

    const assignedRole = Array.isArray(profile.roles) ? profile.roles[0] as RoleRow | undefined : profile.roles as RoleRow | null;
    const permissions = assignedRole?.is_active ? assignedRole.permissions : null;
    const isSuperAdmin = profile.role === "admin" || permissions?.full_access === true;
    const assignedRoleName = assignedRole?.is_active ? assignedRole.name : null;
    const roleName = assignedRoleName && !/admin/i.test(assignedRoleName)
        ? assignedRoleName
        : null;
    const displayName = profile.full_name?.trim() || authData.user.email || (isSuperAdmin ? "Admin" : "Staff");
    const canView = (moduleKeys: string | string[]) =>
        isSuperAdmin || (Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys])
            .some((moduleKey) => roleHasPermission(permissions, moduleKey, "view"));
    const visibleMetrics = metrics.filter((metric) => canView(metric.moduleKeys));
    const visibleShortcuts = shortcuts.filter((shortcut) => canView(shortcut.moduleKeys));
    const showCallbacks = canView(["admissions", "marketing", "support"]);
    const showSchedule = canView(["academic_ops", "academics"]);
    const greetingName = displayName.split(/\s+/)[0];
    const workspaceHref = (href: string) => profile.role === "staff" && !isSuperAdmin
        ? `/staff${href.slice("/admin".length)}`
        : href;

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" />
                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">{roleName || (isSuperAdmin ? "Admin Console" : "Staff Workspace")}</p>
                        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Welcome, {greetingName}.</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{isSuperAdmin ? "Here is the latest pulse across your workspace." : "Here are the workspace updates for the modules available to your role."}</p>
                    </div>
                    {showCallbacks && <Link href={workspaceHref("/admin/admissions")} className="sprint-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-purple px-4 py-3 text-sm font-bold text-white shadow-brand-cta transition hover:brightness-110">Review callbacks <ArrowUpRight className="size-4" aria-hidden="true" /></Link>}
                </div>
            </section>

            {visibleMetrics.length > 0 && <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{visibleMetrics.map((metric) => { const Icon = metric.icon; return <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-brand-text-secondary">{metric.label}</p><p className="mt-3 font-display text-3xl font-bold text-brand-navy">{metric.value}</p></div><span className={`flex size-11 items-center justify-center rounded-xl ${metric.accent}`}><Icon className="size-5" aria-hidden="true" /></span></div><p className="mt-3 text-xs text-brand-text-muted">{metric.note}</p></article>; })}</section>}

            {(showCallbacks || showSchedule) && <section className={`grid gap-6 ${showCallbacks && showSchedule ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]" : ""}`}>
                {showCallbacks && <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6"><div><h3 className="font-display text-lg font-bold text-brand-navy">Recent Callback Requests</h3><p className="mt-1 text-xs text-brand-text-muted">Latest student enquiries requiring attention</p></div><Link href={workspaceHref("/admin/admissions")} className="text-xs font-bold text-brand-blue hover:underline">View all</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted"><tr><th className="px-5 py-3 font-bold sm:px-6">Name</th><th className="px-5 py-3 font-bold">Background</th><th className="px-5 py-3 font-bold">Preferred Track</th><th className="px-5 py-3 font-bold">Date / Time</th><th className="px-5 py-3 font-bold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{callbacks.map((callback) => <tr key={callback.name} className="hover:bg-slate-50"><td className="whitespace-nowrap px-5 py-4 font-semibold text-brand-navy sm:px-6">{callback.name}</td><td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{callback.background}</td><td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{callback.track}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-brand-text-muted">{callback.date}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[callback.status]}`}>{callback.status}</span></td></tr>)}</tbody></table></div></article>}

                {showSchedule && <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-5"><h3 className="font-display text-lg font-bold text-brand-navy">Upcoming Assessment & Mock Schedule</h3><p className="mt-1 text-xs text-brand-text-muted">This week&apos;s academic calendar</p></div><div className="divide-y divide-slate-100">{schedule.map((item) => <div key={`${item.batch}-${item.date}`} className="flex gap-3 px-5 py-4"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue"><GraduationCap className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-brand-navy">{item.batch}</p><p className="mt-1 text-xs font-medium text-brand-red">{item.type}</p><p className="mt-1 flex items-center gap-1 text-xs text-brand-text-muted"><Clock3 className="size-3" aria-hidden="true" />{item.date}</p><p className="mt-1 text-xs text-brand-text-secondary">Mentor: {item.mentor}</p></div></div>)}</div></article>}
            </section>}

            {visibleShortcuts.length > 0 && <section>
                <div className="mb-4"><h3 className="font-display text-lg font-bold text-brand-navy">Quick Shortcuts</h3><p className="mt-1 text-xs text-brand-text-muted">Jump directly into common workspace tasks</p></div>
                <div className="grid gap-4 md:grid-cols-3">
                    {visibleShortcuts.map((shortcut) => {
                        const Icon = shortcut.icon;
                        return <Link key={shortcut.href} href={workspaceHref(shortcut.href)} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"><span className={`flex size-10 items-center justify-center rounded-xl ${shortcut.color}`}><Icon className="size-5" aria-hidden="true" /></span><p className="mt-4 font-display font-bold text-brand-navy">{shortcut.label}</p><p className="mt-1 text-xs leading-5 text-brand-text-muted">{shortcut.description}</p><ArrowUpRight className="mt-4 size-4 text-brand-blue transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></Link>;
                    })}
                </div>
            </section>}
        </div>
    );
}
