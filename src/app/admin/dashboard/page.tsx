import Link from "next/link";
import { ArrowUpRight, Award, Building2, CalendarDays, CheckCircle2, Clock3, GraduationCap, PhoneCall, Users } from "lucide-react";

const metrics = [
    { label: "Total Active Students", value: "248", note: "Across 1-Yr, 2-Yr & 3-Yr tracks", icon: Users, accent: "bg-brand-blue-light text-brand-blue" },
    { label: "Pending Student Callbacks", value: "14", note: "New callback requests", icon: PhoneCall, accent: "bg-brand-red-light text-brand-red" },
    { label: "B2B & College Leads", value: "9", note: "6 corporate + 3 institutional", icon: Building2, accent: "bg-orange-50 text-orange-600" },
    { label: "Upcoming Evaluations", value: "8", note: "Mock defenses & lab assessments", icon: CalendarDays, accent: "bg-emerald-50 text-emerald-600" },
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

export default function AdminDashboardPage() {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" />
                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">Monday, 21 September 2026</p>
                        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Good morning, Admin.</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Here is the latest pulse across admissions, learners, partners, and academic operations.</p>
                    </div>
                    <Link href="/admin/admissions" className="sprint-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-purple px-4 py-3 text-sm font-bold text-white shadow-brand-cta transition hover:brightness-110">Review callbacks <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                </div>
            </section>

            <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => { const Icon = metric.icon; return <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-brand-text-secondary">{metric.label}</p><p className="mt-3 font-display text-3xl font-bold text-brand-navy">{metric.value}</p></div><span className={`flex size-11 items-center justify-center rounded-xl ${metric.accent}`}><Icon className="size-5" aria-hidden="true" /></span></div><p className="mt-3 text-xs text-brand-text-muted">{metric.note}</p></article>; })}</section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6"><div><h3 className="font-display text-lg font-bold text-brand-navy">Recent Callback Requests</h3><p className="mt-1 text-xs text-brand-text-muted">Latest student enquiries requiring attention</p></div><Link href="/admin/admissions" className="text-xs font-bold text-brand-blue hover:underline">View all</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted"><tr><th className="px-5 py-3 font-bold sm:px-6">Name</th><th className="px-5 py-3 font-bold">Background</th><th className="px-5 py-3 font-bold">Preferred Track</th><th className="px-5 py-3 font-bold">Date / Time</th><th className="px-5 py-3 font-bold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{callbacks.map((callback) => <tr key={callback.name} className="hover:bg-slate-50"><td className="whitespace-nowrap px-5 py-4 font-semibold text-brand-navy sm:px-6">{callback.name}</td><td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{callback.background}</td><td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{callback.track}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-brand-text-muted">{callback.date}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[callback.status]}`}>{callback.status}</span></td></tr>)}</tbody></table></div></article>

                <article className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-5"><h3 className="font-display text-lg font-bold text-brand-navy">Upcoming Assessment & Mock Schedule</h3><p className="mt-1 text-xs text-brand-text-muted">This week&apos;s academic calendar</p></div><div className="divide-y divide-slate-100">{schedule.map((item) => <div key={`${item.batch}-${item.date}`} className="flex gap-3 px-5 py-4"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue"><GraduationCap className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-brand-navy">{item.batch}</p><p className="mt-1 text-xs font-medium text-brand-red">{item.type}</p><p className="mt-1 flex items-center gap-1 text-xs text-brand-text-muted"><Clock3 className="size-3" aria-hidden="true" />{item.date}</p><p className="mt-1 text-xs text-brand-text-secondary">Mentor: {item.mentor}</p></div></div>)}</div></article>
            </section>

            <section>
                <div className="mb-4"><h3 className="font-display text-lg font-bold text-brand-navy">Quick Shortcuts</h3><p className="mt-1 text-xs text-brand-text-muted">Jump directly into common admin workflows</p></div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/admin/courses/scholarships" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Award className="size-5" aria-hidden="true" /></span><p className="mt-4 font-display font-bold text-brand-navy">Update Scholarship</p><p className="mt-1 text-xs leading-5 text-brand-text-muted">Manage scholarship details and eligibility.</p><ArrowUpRight className="mt-4 size-4 text-brand-blue transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></Link>
                    <Link href="/admin/academics/assessments/assign" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-5" aria-hidden="true" /></span><p className="mt-4 font-display font-bold text-brand-navy">Assign Assessments</p><p className="mt-1 text-xs leading-5 text-brand-text-muted">Schedule evaluations for active batches.</p><ArrowUpRight className="mt-4 size-4 text-brand-blue transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></Link>
                    <Link href="/admin/partners/companies/callbacks" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Building2 className="size-5" aria-hidden="true" /></span><p className="mt-4 font-display font-bold text-brand-navy">Partner Callbacks</p><p className="mt-1 text-xs leading-5 text-brand-text-muted">Follow up on corporate hiring leads.</p><ArrowUpRight className="mt-4 size-4 text-brand-blue transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></Link>
                </div>
            </section>
        </div>
    );
}