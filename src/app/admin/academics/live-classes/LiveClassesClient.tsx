"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
    AlertCircle, CalendarDays, Check, Clock3, ExternalLink, Link2, LoaderCircle, MapPin,
    Pencil, Plus, Search, Video, X,
} from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import { getLiveClassesAction, saveLiveClassAction, updateLiveClassStatusAction } from "./actions";
import type { LiveClass, LiveClassInput, LiveClassPlatform, LiveClassStatus } from "./types";

type Notice = { type: "success" | "error"; message: string };
const access = ["academic_ops", "academics"];
const inputClass = "sprint-focus mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-text-muted";
const labelClass = "block text-xs font-bold text-brand-navy";

function emptyForm(): LiveClassInput {
    return {
        title: "",
        course_name: "",
        batch_name: "",
        mentor_name: "",
        scheduled_at: "",
        duration_mins: 60,
        platform: "Google Meet",
        meeting_url: "",
        status: "scheduled",
    };
}

function toLocalDateTime(value: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function formatSchedule(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
        }).format(date);
}

function safeMeetingUrl(value: string | null) {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
}

function statusStyle(status: LiveClassStatus) {
    switch (status) {
        case "scheduled": return "bg-blue-50 text-blue-700";
        case "live": return "bg-emerald-50 text-emerald-700";
        case "completed": return "bg-slate-100 text-slate-600";
        case "cancelled": return "bg-rose-50 text-rose-700";
    }
}

export default function LiveClassesClient({
    initialClasses,
    initialError,
}: {
    initialClasses: LiveClass[];
    initialError?: string;
}) {
    const { hasPermission } = useAdminPermissions();
    const canCreate = hasPermission(access, "create");
    const canEdit = hasPermission(access, "edit");
    const [classes, setClasses] = useState(initialClasses);
    const [notice, setNotice] = useState<Notice | null>(initialError ? { type: "error", message: initialError } : null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editing, setEditing] = useState<LiveClass | null | undefined>(undefined);
    const [form, setForm] = useState<LiveClassInput>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return classes.filter((item) => {
            const matches = !query || [item.title, item.course_name, item.batch_name, item.mentor_name]
                .some((value) => value.toLowerCase().includes(query));
            return matches && (statusFilter === "all" || item.status === statusFilter);
        });
    }, [classes, search, statusFilter]);
    const upcoming = classes.filter((item) => item.status === "scheduled" && new Date(item.scheduled_at).getTime() >= Date.now()).length;
    const liveCount = classes.filter((item) => item.status === "live").length;

    async function refresh() {
        const result = await getLiveClassesAction();
        if (result.error) {
            setNotice({ type: "error", message: result.error });
            return;
        }
        setClasses(result.classes);
    }

    function openEditor(item: LiveClass | null) {
        setNotice(null);
        setEditing(item);
        setForm(item ? {
            title: item.title,
            course_name: item.course_name,
            batch_name: item.batch_name,
            mentor_name: item.mentor_name,
            scheduled_at: toLocalDateTime(item.scheduled_at),
            duration_mins: Number(item.duration_mins),
            platform: item.platform,
            meeting_url: item.meeting_url ?? "",
            status: item.status,
        } : emptyForm());
    }

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!formRef.current?.reportValidity()) return;
        setIsSaving(true);
        setNotice(null);
        const result = await saveLiveClassAction({
            ...form,
            scheduled_at: new Date(form.scheduled_at).toISOString(),
            meeting_url: form.meeting_url?.trim() || null,
        }, editing?.id);
        if (!result.success) {
            setNotice({ type: "error", message: result.error ?? "Live class could not be saved." });
            setIsSaving(false);
            return;
        }
        setEditing(undefined);
        setNotice({ type: "success", message: editing ? "Live class updated." : "Live class scheduled." });
        await refresh();
        setIsSaving(false);
    }

    async function updateStatus(item: LiveClass, status: LiveClassStatus) {
        if (status === "cancelled" && !window.confirm(`Cancel "${item.title}"?`)) return;
        setUpdatingId(item.id);
        setNotice(null);
        const result = await updateLiveClassStatusAction(item.id, status);
        if (!result.success) {
            setNotice({ type: "error", message: result.error ?? "Session status could not be updated." });
        } else {
            setClasses((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
            setNotice({ type: "success", message: status === "cancelled" ? "Session cancelled." : `Session marked ${status}.` });
        }
        setUpdatingId(null);
    }

    const stats = [
        { label: "Total sessions", value: classes.length, icon: Video, color: "bg-blue-50 text-brand-navy" },
        { label: "Upcoming", value: upcoming, icon: CalendarDays, color: "bg-amber-50 text-amber-700" },
        { label: "Live now", value: liveCount, icon: MapPin, color: "bg-emerald-50 text-emerald-700" },
    ];

    return (
        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Academic & Curriculum</p>
                    <h1 className="mt-1 font-display text-3xl font-bold text-brand-navy">Live classes</h1>
                    <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">Schedule, reschedule, and manage live sessions for each course batch.</p>
                </div>
                {canCreate && <button type="button" onClick={() => openEditor(null)} className="sprint-focus inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90"><Plus className="size-4" /> Schedule live class</button>}
            </header>

            {notice && <div role="status" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                {notice.type === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}<span>{notice.message}</span>
            </div>}

            <section aria-label="Live class summary" className="grid gap-4 sm:grid-cols-3">
                {stats.map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><span className="text-sm font-semibold text-brand-text-secondary">{label}</span><span className={`flex size-10 items-center justify-center rounded-xl ${color}`}><Icon className="size-5" /></span></div>
                    <p className="mt-4 font-display text-3xl font-bold text-brand-navy">{value}</p>
                </article>)}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-5">
                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Search className="size-4 text-brand-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, course, batch, or mentor" className="sprint-focus min-w-0 flex-1 py-2.5 text-sm outline-none" /></label>
                    <select aria-label="Filter by session status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass.replace("mt-1.5 ", "")}><option value="all">All statuses</option><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                </div>
                <div className="divide-y divide-slate-100">
                    {filtered.length === 0 ? <div className="px-6 py-16 text-center"><Video className="mx-auto size-10 text-slate-300" /><h2 className="mt-3 font-bold text-brand-navy">{classes.length ? "No matching sessions" : "No live classes scheduled"}</h2><p className="mt-1 text-sm text-brand-text-secondary">{classes.length ? "Try another search or status." : "Schedule a class to add it to the calendar."}</p></div>
                        : filtered.map((item) => {
                            const link = safeMeetingUrl(item.meeting_url);
                            return <article key={item.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-bold text-brand-navy">{item.title}</h2><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle(item.status)}`}>{item.status}</span></div>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-text-secondary">
                                        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{formatSchedule(item.scheduled_at)}</span>
                                        <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{item.duration_mins} min</span>
                                        <span>{item.course_name} · {item.batch_name}</span>
                                        <span>Mentor: {item.mentor_name}</span>
                                        <span>{item.platform}</span>
                                    </div>
                                    {link && <a href={link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-red hover:underline"><Link2 className="size-4" />Join meeting<ExternalLink className="size-3.5" /></a>}
                                </div>
                                {canEdit && <div className="flex flex-wrap gap-2 lg:justify-end">
                                    <button type="button" onClick={() => openEditor(item)} className="sprint-focus inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-brand-surface"><Pencil className="size-4" />Edit / reschedule</button>
                                    {item.status === "scheduled" && <button type="button" disabled={updatingId === item.id} onClick={() => void updateStatus(item, "live")} className="sprint-focus rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60">Start class</button>}
                                    {item.status === "live" && <button type="button" disabled={updatingId === item.id} onClick={() => void updateStatus(item, "completed")} className="sprint-focus rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-50 disabled:opacity-60">Mark completed</button>}
                                    {["scheduled", "live"].includes(item.status) && <button type="button" disabled={updatingId === item.id} onClick={() => void updateStatus(item, "cancelled")} className="sprint-focus rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60">{updatingId === item.id ? "Updating…" : "Cancel session"}</button>}
                                </div>}
                            </article>;
                        })}
                </div>
            </section>

            {editing !== undefined && <div className="fixed inset-0 z-[150] flex justify-end bg-brand-navy/55 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setEditing(undefined); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="live-class-drawer-title" className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
                        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">Live class</p><h2 id="live-class-drawer-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{editing ? "Edit / reschedule class" : "Schedule a class"}</h2></div>
                        <button type="button" onClick={() => setEditing(undefined)} disabled={isSaving} aria-label="Close live class form" className="sprint-focus rounded-lg p-2 text-brand-text-secondary hover:bg-slate-100"><X className="size-5" /></button>
                    </div>
                    <form ref={formRef} onSubmit={(event) => void save(event)} className="flex-1 space-y-5 p-5 sm:p-7">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className={`${labelClass} sm:col-span-2`}>Session title<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="e.g. Data structures live session" /></label>
                            <label className={labelClass}>Course<input required maxLength={120} value={form.course_name} onChange={(event) => setForm({ ...form, course_name: event.target.value })} className={inputClass} /></label>
                            <label className={labelClass}>Batch<input required maxLength={120} value={form.batch_name} onChange={(event) => setForm({ ...form, batch_name: event.target.value })} className={inputClass} /></label>
                            <label className={labelClass}>Mentor<input required maxLength={120} value={form.mentor_name} onChange={(event) => setForm({ ...form, mentor_name: event.target.value })} className={inputClass} /></label>
                            <label className={labelClass}>Platform<select value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value as LiveClassPlatform })} className={inputClass}><option>Google Meet</option><option>Zoom</option><option>Other</option></select></label>
                            <label className={`${labelClass} sm:col-span-2`}>Date & time<input required type="datetime-local" value={form.scheduled_at} onChange={(event) => setForm({ ...form, scheduled_at: event.target.value })} className={inputClass} /></label>
                            <label className={labelClass}>Duration (minutes)<input required type="number" min="1" max="1440" step="1" value={form.duration_mins} onChange={(event) => setForm({ ...form, duration_mins: Number(event.target.value) })} className={inputClass} /></label>
                            <label className={labelClass}>Session status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as LiveClassStatus })} className={inputClass}><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
                            <label className={`${labelClass} sm:col-span-2`}>Meeting URL<input type="url" value={form.meeting_url ?? ""} onChange={(event) => setForm({ ...form, meeting_url: event.target.value })} className={inputClass} placeholder="https://meet.google.com/..." /></label>
                        </div>
                    </form>
                    <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end sm:px-7">
                        <button type="button" onClick={() => setEditing(undefined)} disabled={isSaving} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={() => formRef.current?.requestSubmit()} disabled={isSaving} className="sprint-focus inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-red/90 disabled:opacity-60">{isSaving && <LoaderCircle className="size-4 animate-spin" />}{editing ? "Save changes" : "Schedule live class"}</button>
                    </div>
                </section>
            </div>}
        </main>
    );
}
