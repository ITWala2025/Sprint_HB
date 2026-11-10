"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
    ExternalLink, Megaphone, Pencil, Plus, RefreshCw, Trash2, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPermissions } from "@/app/admin/permissions-context";

const announcementTypes = ["ANNOUNCEMENT", "UPDATES", "HIRING", "MAINTENANCE"] as const;
type AnnouncementType = typeof announcementTypes[number];

type Announcement = {
    id: string;
    type: AnnouncementType;
    message: string;
    link_url: string | null;
    priority: number;
    is_active: boolean;
    created_at: string;
};

type AnnouncementForm = {
    type: AnnouncementType;
    message: string;
    link_url: string;
    priority: string;
    is_active: boolean;
};

type Notice = { type: "success" | "error"; message: string };

const emptyForm: AnnouncementForm = {
    type: "ANNOUNCEMENT",
    message: "",
    link_url: "",
    priority: "1",
    is_active: true,
};

const typeStyles: Record<AnnouncementType, string> = {
    ANNOUNCEMENT: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    UPDATES: "border-blue-400/25 bg-blue-400/10 text-blue-200",
    HIRING: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    MAINTENANCE: "border-amber-400/25 bg-amber-400/10 text-amber-200",
};

function getPreviewHref(value: string): string | null {
    const url = value.trim();
    if (url.startsWith("/") && !url.startsWith("//")) return url;

    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
    } catch {
        return null;
    }
}

function formatCreatedAt(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function AnnouncementManagementPage() {
    const supabase = useMemo(() => createClient(), []);
    const { hasPermission } = useAdminPermissions();
    const canCreate = hasPermission(["cms_announcements", "marketing"], "create");
    const canEdit = hasPermission(["cms_announcements", "marketing"], "edit");
    const canDelete = hasPermission(["cms_announcements", "marketing"], "delete");

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null | undefined>(undefined);
    const [form, setForm] = useState<AnnouncementForm>(emptyForm);

    const loadAnnouncements = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("announcements")
                .select("id, type, message, link_url, priority, is_active, created_at")
                .order("priority", { ascending: true })
                .order("created_at", { ascending: false });

            if (error) {
                setNotice({ type: "error", message: `Announcements could not be loaded: ${error.message}` });
                return;
            }

            setAnnouncements((data ?? []) as Announcement[]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Announcements could not be loaded: ${message}` });
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        void loadAnnouncements();
    }, [loadAnnouncements]);

    function openForm(announcement: Announcement | null) {
        setNotice(null);
        setEditingAnnouncement(announcement);
        setForm(announcement ? {
            type: announcement.type,
            message: announcement.message,
            link_url: announcement.link_url ?? "",
            priority: String(announcement.priority),
            is_active: announcement.is_active,
        } : emptyForm);
    }

    function closeForm() {
        if (isSaving) return;
        setEditingAnnouncement(undefined);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editingAnnouncement ? !canEdit : !canCreate) {
            setNotice({ type: "error", message: "You do not have permission to save announcements." });
            return;
        }

        const priority = Number(form.priority);
        if (!form.message.trim()) {
            setNotice({ type: "error", message: "Enter an announcement message." });
            return;
        }
        if (!form.priority.trim() || !Number.isInteger(priority)) {
            setNotice({ type: "error", message: "Priority must be a whole number." });
            return;
        }

        setIsSaving(true);
        setNotice(null);
        const payload = {
            type: form.type,
            message: form.message.trim(),
            link_url: form.link_url.trim() || null,
            priority,
            is_active: form.is_active,
        };

        try {
            const { error } = editingAnnouncement
                ? await supabase.from("announcements").update(payload).eq("id", editingAnnouncement.id)
                : await supabase.from("announcements").insert(payload);

            if (error) {
                setNotice({ type: "error", message: `Announcement could not be saved: ${error.message}` });
                return;
            }

            setEditingAnnouncement(undefined);
            setNotice({
                type: "success",
                message: `Announcement ${editingAnnouncement ? "updated" : "created"} successfully.`,
            });
            await loadAnnouncements();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Announcement could not be saved: ${message}` });
        } finally {
            setIsSaving(false);
        }
    }

    async function toggleActive(announcement: Announcement) {
        if (!canEdit) {
            setNotice({ type: "error", message: "You do not have permission to change announcement status." });
            return;
        }

        const nextIsActive = !announcement.is_active;
        setSavingId(announcement.id);
        setNotice(null);
        try {
            const { error } = await supabase
                .from("announcements")
                .update({ is_active: nextIsActive })
                .eq("id", announcement.id);

            if (error) {
                setNotice({ type: "error", message: `Status could not be changed: ${error.message}` });
                return;
            }

            setAnnouncements((current) => current.map((item) =>
                item.id === announcement.id ? { ...item, is_active: nextIsActive } : item,
            ));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Status could not be changed: ${message}` });
        } finally {
            setSavingId(null);
        }
    }

    async function deleteAnnouncement(announcement: Announcement) {
        if (!canDelete) {
            setNotice({ type: "error", message: "You do not have permission to delete announcements." });
            return;
        }
        if (!window.confirm("Delete this announcement? This action cannot be undone.")) return;

        setSavingId(announcement.id);
        setNotice(null);
        try {
            const { error } = await supabase
                .from("announcements")
                .delete()
                .eq("id", announcement.id);

            if (error) {
                setNotice({ type: "error", message: `Announcement could not be deleted: ${error.message}` });
                return;
            }

            setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
            setNotice({ type: "success", message: "Announcement deleted." });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Announcement could not be deleted: ${message}` });
        } finally {
            setSavingId(null);
        }
    }

    const activeCount = announcements.filter((announcement) => announcement.is_active).length;

    return (
        <main className="mx-auto max-w-[1500px] space-y-6 text-white">
            <section className="relative overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1528] px-6 py-7 shadow-xl sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(239,62,67,0.16),transparent_35%)]" />
                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-red-400/20 bg-[#ef3e43]/10 text-[#ff777b]">
                            <Megaphone className="size-6" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff999c]">Website content</p>
                            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Announcements &amp; Updates</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                Manage messages displayed across the SPRINT website.
                            </p>
                        </div>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openForm(null)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ef3e43] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ff5055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                        >
                            <Plus className="size-4" aria-hidden="true" /> Add announcement
                        </button>
                    )}
                </div>
            </section>

            {notice && (
                <div
                    role={notice.type === "error" ? "alert" : "status"}
                    className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
                        notice.type === "error"
                            ? "border-red-400/30 bg-red-400/10 text-red-200"
                            : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    }`}
                >
                    <p>{notice.message}</p>
                    <button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)} className="text-current opacity-75 hover:opacity-100">
                        <X className="size-4" aria-hidden="true" />
                    </button>
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#1e293b] bg-[#0b1528] p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total announcements</p>
                    <p className="mt-2 text-3xl font-bold text-white">{announcements.length}</p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#0b1528] p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-300">{activeCount}</p>
                </div>
            </section>

            <section aria-label="Announcements list" className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1528]">
                <div className="flex flex-col gap-3 border-b border-[#1e293b] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="font-semibold text-white">All announcements</h2>
                        <p className="mt-1 text-xs text-slate-400">Sorted by priority, then most recently created.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void loadAnnouncements()}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#334155] px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50 sm:self-auto"
                    >
                        <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
                        Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Type</th>
                                <th scope="col" className="px-5 py-3 font-semibold">Message</th>
                                <th scope="col" className="px-5 py-3 font-semibold">Link</th>
                                <th scope="col" className="px-5 py-3 font-semibold">Priority</th>
                                <th scope="col" className="px-5 py-3 font-semibold">Active</th>
                                <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e293b]">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading announcements…</td></tr>
                            ) : announcements.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Megaphone className="mx-auto size-8 text-slate-600" aria-hidden="true" />
                                        <p className="mt-3 font-medium text-slate-300">No announcements yet</p>
                                        <p className="mt-1 text-sm text-slate-500">Create one to publish a message on the website.</p>
                                    </td>
                                </tr>
                            ) : announcements.map((announcement) => {
                                const previewHref = announcement.link_url ? getPreviewHref(announcement.link_url) : null;
                                const isBusy = savingId === announcement.id;
                                return (
                                    <tr key={announcement.id} className="align-top transition hover:bg-white/[0.02]">
                                        <td className="px-5 py-4 sm:px-6">
                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${typeStyles[announcement.type] ?? "border-slate-500/30 bg-slate-500/10 text-slate-300"}`}>
                                                {announcement.type}
                                            </span>
                                        </td>
                                        <td className="max-w-xl px-5 py-4">
                                            <p className="whitespace-pre-wrap break-words leading-6 text-slate-200">{announcement.message}</p>
                                            <p className="mt-1 text-xs text-slate-500">Created {formatCreatedAt(announcement.created_at)}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {announcement.link_url ? (
                                                previewHref ? (
                                                    <a
                                                        href={previewHref}
                                                        target={previewHref.startsWith("/") ? undefined : "_blank"}
                                                        rel={previewHref.startsWith("/") ? undefined : "noreferrer"}
                                                        className="inline-flex max-w-48 items-center gap-1.5 truncate text-xs text-sky-300 underline-offset-4 hover:underline"
                                                        title={announcement.link_url}
                                                    >
                                                        <span className="truncate">Preview link</span>
                                                        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                                                    </a>
                                                ) : <span className="text-xs text-slate-500">Invalid link</span>
                                            ) : <span className="text-xs text-slate-600">—</span>}
                                        </td>
                                        <td className="px-5 py-4 tabular-nums text-slate-300">{announcement.priority}</td>
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={announcement.is_active}
                                                aria-label={`${announcement.is_active ? "Deactivate" : "Activate"} announcement`}
                                                disabled={!canEdit || isBusy}
                                                onClick={() => void toggleActive(announcement)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    announcement.is_active ? "bg-emerald-500" : "bg-slate-600"
                                                }`}
                                            >
                                                <span className={`inline-block size-4 rounded-full bg-white transition-transform ${announcement.is_active ? "translate-x-6" : "translate-x-1"}`} />
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 sm:px-6">
                                            <div className="flex justify-end gap-2">
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        aria-label="Edit announcement"
                                                        disabled={isBusy}
                                                        onClick={() => openForm(announcement)}
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#334155] text-slate-300 transition hover:border-sky-400/50 hover:text-sky-200 disabled:opacity-50"
                                                    >
                                                        <Pencil className="size-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        aria-label="Delete announcement"
                                                        disabled={isBusy}
                                                        onClick={() => void deleteAnnouncement(announcement)}
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#334155] text-slate-300 transition hover:border-red-400/50 hover:text-red-300 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="size-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                                {!canEdit && !canDelete && <span className="text-xs text-slate-600">View only</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {editingAnnouncement !== undefined && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeForm();
                }}>
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="announcement-dialog-title"
                        className="my-auto w-full max-w-xl rounded-2xl border border-[#334155] bg-[#0b1528] shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-[#1e293b] px-6 py-5">
                            <div>
                                <h2 id="announcement-dialog-title" className="text-lg font-bold text-white">
                                    {editingAnnouncement ? "Edit announcement" : "Add announcement"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">Set the message and how it appears on the website.</p>
                            </div>
                            <button type="button" onClick={closeForm} disabled={isSaving} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50">
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                            <label className="block text-sm font-medium text-slate-200">
                                Type
                                <select
                                    value={form.type}
                                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as AnnouncementType }))}
                                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#111e33] px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef3e43]"
                                >
                                    {announcementTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </label>
                            <label className="block text-sm font-medium text-slate-200">
                                Message
                                <textarea
                                    required
                                    rows={4}
                                    value={form.message}
                                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                                    placeholder="Write the announcement message"
                                    className="mt-2 w-full resize-y rounded-lg border border-[#334155] bg-[#111e33] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#ef3e43]"
                                />
                            </label>
                            <label className="block text-sm font-medium text-slate-200">
                                Link URL <span className="font-normal text-slate-500">(optional)</span>
                                <input
                                    type="url"
                                    value={form.link_url}
                                    onChange={(event) => setForm((current) => ({ ...current, link_url: event.target.value }))}
                                    placeholder="https://example.com"
                                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#111e33] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#ef3e43]"
                                />
                            </label>
                            <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                                <label className="block text-sm font-medium text-slate-200">
                                    Priority
                                    <input
                                        type="number"
                                        step={1}
                                        required
                                        value={form.priority}
                                        onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                                        className="mt-2 w-full rounded-lg border border-[#334155] bg-[#111e33] px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef3e43]"
                                    />
                                </label>
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#334155] bg-[#111e33] px-3 py-3 text-sm text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                                        className="size-4 accent-[#ef3e43]"
                                    />
                                    Active on website
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-[#1e293b] pt-5">
                                <button type="button" onClick={closeForm} disabled={isSaving} className="rounded-lg border border-[#334155] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#ef3e43] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff5055] disabled:cursor-not-allowed disabled:opacity-60">
                                    {isSaving ? "Saving…" : editingAnnouncement ? "Save changes" : "Create announcement"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
