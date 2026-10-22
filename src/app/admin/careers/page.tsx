"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
    Briefcase, Check, Clock, Edit3, Eye, LayoutGrid, List, MapPin, Plus, Search, Tag, Trash2, X, Archive
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPermissions } from "@/app/admin/permissions-context";

export interface JobItem {
    id: string;
    title: string;
    type: string;
    location: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    duration: string | null;
    stipend: string | null;
    status: "draft" | "published" | "closed";
    posted_date: string;
}

type JobStatus = JobItem["status"];
type JobPayload = Omit<JobItem, "id" | "posted_date">;
type Notice = { type: "success" | "error"; message: string };
type CatalogView = "grid" | "table";
type CareerJobRow = Record<string, unknown>;

const jobTypes = [
    { value: "internship", label: "Internship" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
];

const jobStatuses = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "closed", label: "Closed" },
];

const inputClass = "sprint-focus mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-text-muted";
const labelClass = "block text-xs font-bold text-brand-navy";
const iconButtonClass = "sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-brand-surface disabled:opacity-50";

function normalizeStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
}

function isJobStatus(value: unknown): value is JobStatus {
    return value === "draft" || value === "published" || value === "closed";
}

function normalizeJob(row: CareerJobRow): JobItem {
    return {
        id: typeof row.id === "string" ? row.id : String(row.id ?? ""),
        title: typeof row.title === "string" ? row.title : "",
        type: typeof row.type === "string" ? row.type : "full-time",
        location: typeof row.location === "string" ? row.location : "",
        description: typeof row.description === "string" ? row.description : "",
        responsibilities: normalizeStringArray(row.responsibilities),
        requirements: normalizeStringArray(row.requirements),
        duration: typeof row.duration === "string" ? row.duration : "",
        stipend: typeof row.stipend === "string" ? row.stipend : "",
        status: isJobStatus(row.status) ? row.status : "draft",
        posted_date: typeof row.posted_date === "string" ? row.posted_date : "",
    };
}

export default function CareerManagementPage() {
    const supabase = useMemo(() => createClient(), []);
    const { hasPermission } = useAdminPermissions();
    const [jobs, setJobs] = useState<JobItem[]>([]);
    
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [catalogView, setCatalogView] = useState<CatalogView>("table");
    
    const [isLoading, setIsLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [loadError, setLoadError] = useState("");
    
    const [editingJob, setEditingJob] = useState<JobItem | null | undefined>(undefined);
    const [viewingJob, setViewingJob] = useState<JobItem | null>(null);

    // Using 'careers' as the module name for permissions matching your existing context setup
    const hasCareerPermission = (capability: string) => hasPermission(["careers", "cms_careers", "admin"], capability);

    useEffect(() => {
        let active = true;
        async function loadJobs() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("sprint_careers_jobs")
                    .select("*")
                    .order("posted_date", { ascending: false });

                if (!active) return;
                if (error) {
                    setLoadError(error.message);
                    setNotice({ type: "error", message: `Jobs could not be loaded: ${error.message}` });
                } else {
                    setJobs((data ?? []).map((row) => normalizeJob(row as CareerJobRow)));
                    setLoadError("");
                }
            } catch (error) {
                if (active) {
                    const message = error instanceof Error ? error.message : String(error);
                    setLoadError(message);
                    setNotice({ type: "error", message: `Jobs could not be loaded: ${message}` });
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }
        void loadJobs();
        return () => { active = false; };
    }, [supabase]);

    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();
        return jobs.filter((job) => {
            const matchesSearch = !query || `${job.title} ${job.location}`.toLowerCase().includes(query);
            const matchesType = typeFilter === "all" || job.type === typeFilter;
            const matchesStatus = statusFilter === "all" || job.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [jobs, search, typeFilter, statusFilter]);

    const publishedCount = jobs.filter((job) => job.status === "published").length;
    const internshipCount = jobs.filter((job) => job.type === "internship").length;
    const closedCount = jobs.filter((job) => job.status === "closed").length;

    async function saveJob(payload: JobPayload, id?: string) {
        const capability = id ? "edit" : "create";
        if (!hasCareerPermission(capability)) {
            setNotice({ type: "error", message: `You do not have permission to ${capability} jobs.` });
            return false;
        }
        
        setSavingId(id ?? "new");
        setNotice(null);

        try {
            const query = id
                ? supabase.from("sprint_careers_jobs").update(payload).eq("id", id).select("*").single()
                : supabase.from("sprint_careers_jobs").insert({
                    ...payload,
                    posted_date: new Date().toISOString().slice(0, 10),
                }).select("*").single();

            const { data, error } = await query;
            if (error) {
                setNotice({ type: "error", message: `Job could not be saved: ${error.message}` });
                return false;
            }

            const saved = normalizeJob(data as CareerJobRow);
            setJobs((current) => id
                ? current.map((job) => job.id === id ? saved : job)
                : [saved, ...current]
            );

            setEditingJob(undefined);
            setNotice({ type: "success", message: `"${saved.title}" ${id ? "updated" : "created"} successfully.` });
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Job could not be saved: ${message}` });
            return false;
        } finally {
            setSavingId(null);
        }
    }

    async function deleteJob(job: JobItem) {
        if (!hasCareerPermission("delete")) {
            setNotice({ type: "error", message: "You do not have permission to delete jobs." });
            return;
        }
        if (!window.confirm(`Delete “${job.title}”? This will also delete any related applications. This cannot be undone.`)) return;
        
        setSavingId(job.id);
        try {
            const { error } = await supabase
                .from("sprint_careers_jobs")
                .delete()
                .eq("id", job.id)
                .select("id")
                .single();

            if (error) {
                setNotice({ type: "error", message: `Job could not be deleted: ${error.message}` });
                return;
            }

            setJobs((current) => current.filter((item) => item.id !== job.id));
            setNotice({ type: "success", message: `"${job.title}" has been deleted.` });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Job could not be deleted: ${message}` });
        } finally {
            setSavingId(null);
        }
    }

    async function updateJobStatus(job: JobItem, newStatus: JobStatus) {
        if (!hasCareerPermission("edit")) {
            setNotice({ type: "error", message: "You do not have permission to edit jobs." });
            return;
        }
        
        setSavingId(job.id);
        try {
            const { error } = await supabase
                .from("sprint_careers_jobs")
                .update({ status: newStatus })
                .eq("id", job.id)
                .select("id")
                .single();

            if (error) {
                setNotice({ type: "error", message: `Status could not be changed: ${error.message}` });
                return;
            }

            setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status: newStatus } : item));
            setNotice({ type: "success", message: `"${job.title}" is now ${newStatus}.` });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ type: "error", message: `Status could not be changed: ${message}` });
        } finally {
            setSavingId(null);
        }
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" />
                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-100">Team & Culture</p>
                        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Career Management</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Manage open positions, internships, and applicant visibility for the SPRINT careers page.</p>
                    </div>
                    {hasCareerPermission("create") && (
                        <button type="button" onClick={() => setEditingJob(null)} className="sprint-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-brand-cta transition hover:brightness-110">
                            <Plus className="size-4" aria-hidden="true" /> Add New Job
                        </button>
                    )}
                </div>
            </section>

            {notice && <div className="fixed right-4 top-24 z-[120] w-[min(36rem,calc(100vw-2rem))]"><NoticeBanner notice={notice} onDismiss={() => setNotice(null)} /></div>}

            <section aria-label="Job summary metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Roles" value={jobs.length} note="All roles in database" icon={Briefcase} />
                <MetricCard label="Published (Live)" value={publishedCount} note="Currently accepting applications" icon={Check} />
                <MetricCard label="Total Internships" value={internshipCount} note="Internship & Entry-level" icon={Tag} />
                <MetricCard label="Closed Roles" value={closedCount} note="Archived listings" icon={Archive} />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Careers List">
                {loadError && (
                    <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 sm:px-6">
                        Jobs could not be loaded from <code>sprint_careers_jobs</code>: {loadError}. Verify that the careers migration has been run and that this account has view access.
                    </p>
                )}
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:px-6">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-brand-text-muted sm:max-w-md">
                        <Search className="size-4 shrink-0" aria-hidden="true" />
                        <span className="sr-only">Search jobs by title</span>
                        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job title or location" className="min-w-0 flex-1 bg-transparent text-brand-navy outline-none placeholder:text-brand-text-muted" />
                    </label>
                    
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <label className="sr-only" htmlFor="job-type-filter">Filter by Type</label>
                            <select id="job-type-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="sprint-focus rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy">
                                <option value="all">All Types</option>
                                {jobTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                            
                            <label className="sr-only" htmlFor="job-status-filter">Filter by Status</label>
                            <select id="job-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="sprint-focus rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy">
                                <option value="all">All Statuses</option>
                                {jobStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                            </select>
                        </div>
                        
                        <div className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Catalog view">
                            <button type="button" aria-label="Card view" aria-pressed={catalogView === "grid"} onClick={() => setCatalogView("grid")} className={`sprint-focus inline-flex size-9 items-center justify-center rounded-md ${catalogView === "grid" ? "bg-white text-brand-navy shadow-sm" : "text-brand-text-muted hover:text-brand-navy"}`}><LayoutGrid className="size-4" aria-hidden="true" /></button>
                            <button type="button" aria-label="Table view" aria-pressed={catalogView === "table"} onClick={() => setCatalogView("table")} className={`sprint-focus inline-flex size-9 items-center justify-center rounded-md ${catalogView === "table" ? "bg-white text-brand-navy shadow-sm" : "text-brand-text-muted hover:text-brand-navy"}`}><List className="size-4" aria-hidden="true" /></button>
                        </div>
                    </div>
                </div>

                {catalogView === "table" && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted">
                                <tr>
                                    <th className="px-5 py-3 font-bold sm:px-6">Job Title & Location</th>
                                    <th className="px-4 py-3 font-bold">Type</th>
                                    <th className="px-4 py-3 font-bold">Duration / Stipend</th>
                                    <th className="px-4 py-3 font-bold">Status</th>
                                    <th className="px-5 py-3 text-right font-bold sm:px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-brand-text-muted">Loading careers…</td></tr>
                                    : loadError ? <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-brand-text-muted">Unable to display jobs until the database query succeeds.</td></tr>
                                    : filteredJobs.length === 0 ? <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-brand-text-muted">{jobs.length ? "No jobs match these filters." : "No jobs have been posted yet."}</td></tr>
                                    : filteredJobs.map((job) => (
                                        <JobRow 
                                            key={job.id} 
                                            job={job} 
                                            isBusy={savingId === job.id} 
                                            canEdit={hasCareerPermission("edit")} 
                                            canDelete={hasCareerPermission("delete")} 
                                            onView={() => setViewingJob(job)} 
                                            onEdit={() => setEditingJob(job)} 
                                            onDelete={() => void deleteJob(job)}
                                            onStatusChange={(status) => void updateJobStatus(job, status)}
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {catalogView === "grid" && (
                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                        {isLoading ? <p className="col-span-full py-12 text-center text-sm text-brand-text-muted">Loading careers…</p> 
                        : filteredJobs.length ? filteredJobs.map((job) => (
                            <AdminJobCard 
                                key={job.id} 
                                job={job} 
                                isBusy={savingId === job.id} 
                                canEdit={hasCareerPermission("edit")} 
                                canDelete={hasCareerPermission("delete")} 
                                onEdit={() => setEditingJob(job)} 
                                onDelete={() => void deleteJob(job)} 
                                onStatusChange={(status) => void updateJobStatus(job, status)}
                            />
                        )) 
                        : loadError ? <p className="col-span-full py-12 text-center text-sm text-brand-text-muted">Unable to display jobs until the database query succeeds.</p>
                        : <p className="col-span-full py-12 text-center text-sm text-brand-text-muted">{jobs.length ? "No jobs match these filters." : "No jobs have been posted yet."}</p>}
                    </div>
                )}
                
                <div className="border-t border-slate-100 px-5 py-3 text-xs text-brand-text-muted sm:px-6">Showing {filteredJobs.length} of {jobs.length} jobs</div>
            </section>

            {editingJob !== undefined && <JobModal job={editingJob} isSaving={savingId === (editingJob?.id ?? "new")} onClose={() => setEditingJob(undefined)} onSave={(payload) => saveJob(payload, editingJob?.id)} />}
            {viewingJob && <JobDetailsModal job={viewingJob} canEdit={hasCareerPermission("edit")} onClose={() => setViewingJob(null)} onEdit={() => { setViewingJob(null); setEditingJob(viewingJob); }} />}
        </div>
    );
}

// --- SUB-COMPONENTS --- //

function MetricCard({ label, value, note, icon: Icon }: { label: string; value: ReactNode; note: string; icon: typeof Briefcase }) {
    return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-brand-text-secondary">{label}</p><p className="mt-3 font-display text-3xl font-bold text-brand-navy">{value}</p></div><span className="flex size-11 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Icon className="size-5" aria-hidden="true" /></span></div>
        <p className="mt-3 text-xs text-brand-text-muted">{note}</p>
    </article>;
}

function NoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
    const success = notice.type === "success";
    return <div role="status" className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-brand-red-light text-brand-red"}`}>
        <p>{notice.message}</p><button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="sprint-focus rounded p-0.5"><X className="size-4" aria-hidden="true" /></button>
    </div>;
}

function StatusBadge({ status }: { status: JobItem["status"] }) {
    if (status === "published") return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Published</span>;
    if (status === "closed") return <span className="rounded-full bg-brand-red-light px-2.5 py-1 text-[10px] font-bold text-brand-red">Closed</span>;
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">Draft</span>;
}

function AdminJobCard({ job, isBusy, canEdit, canDelete, onEdit, onDelete, onStatusChange }: { job: JobItem; isBusy: boolean; canEdit: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void; onStatusChange: (status: JobStatus) => void; }) {
    return <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">{jobTypes.find(t => t.value === job.type)?.label || job.type}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-brand-navy">{job.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-brand-text-secondary"><MapPin className="size-3" aria-hidden="true" /> {job.location}</p>
            </div>
            <StatusBadge status={job.status} />
        </div>
        
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-brand-text-muted">{job.description}</p>
        
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-brand-text-secondary">
            {job.duration && <span className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1"><Clock className="size-3" aria-hidden="true" /> {job.duration}</span>}
            {job.stipend && <span className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1">{job.stipend}</span>}
        </div>
        
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            {canEdit && <button type="button" onClick={onEdit} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-brand-surface"><Edit3 className="size-3.5" aria-hidden="true" />Edit</button>}
            {canEdit && (
                <select 
                    value={job.status} 
                    onChange={(e) => {
                        if (isJobStatus(e.target.value)) onStatusChange(e.target.value);
                    }}
                    disabled={isBusy}
                    className="sprint-focus rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-brand-navy disabled:opacity-50"
                >
                    <option value="draft">Mark as Draft</option>
                    <option value="published">Publish Job</option>
                    <option value="closed">Close Job</option>
                </select>
            )}
            {canDelete && <button type="button" onClick={onDelete} disabled={isBusy} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-brand-red hover:bg-brand-red-light disabled:opacity-50"><Trash2 className="size-3.5" aria-hidden="true" /></button>}
        </footer>
    </article>;
}

function JobRow({ job, isBusy, canEdit, canDelete, onView, onEdit, onDelete, onStatusChange }: { job: JobItem; isBusy: boolean; canEdit: boolean; canDelete: boolean; onView: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: (status: JobStatus) => void; }) {
    return <tr className="hover:bg-slate-50/70">
        <td className="max-w-[280px] px-5 py-4 sm:px-6">
            <p className="truncate font-semibold text-brand-navy">{job.title}</p>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-brand-text-muted"><MapPin className="size-3" aria-hidden="true" /> {job.location}</p>
        </td>
        <td className="px-4 py-4"><span className="inline-flex rounded-full bg-brand-blue-light px-2.5 py-1 text-[10px] font-semibold text-brand-blue">{jobTypes.find(t => t.value === job.type)?.label || job.type}</span></td>
        <td className="whitespace-nowrap px-4 py-4 text-xs text-brand-text-secondary">
            {job.duration && <p className="flex items-center gap-1.5"><Clock className="size-3.5 text-brand-text-muted" aria-hidden="true" />{job.duration}</p>}
            {job.stipend && <p className="mt-1 text-[11px] text-brand-text-muted">{job.stipend}</p>}
        </td>
        <td className="px-4 py-4">
            {canEdit ? (
                <select value={job.status} onChange={(e) => {
                    if (isJobStatus(e.target.value)) onStatusChange(e.target.value);
                }} disabled={isBusy} className="sprint-focus rounded-md border border-slate-200 bg-white py-1 pl-2 pr-6 text-[10px] font-bold uppercase tracking-wide text-brand-navy">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                </select>
            ) : <StatusBadge status={job.status} />}
        </td>
        <td className="px-5 py-4 sm:px-6"><div className="flex justify-end gap-1.5">
            <button type="button" onClick={onView} className={iconButtonClass} aria-label={`View ${job.title}`} title="View"><Eye className="size-4" aria-hidden="true" /></button>
            {canEdit && <button type="button" onClick={onEdit} className={iconButtonClass} aria-label={`Edit ${job.title}`} title="Edit"><Edit3 className="size-4" aria-hidden="true" /></button>}
            {canDelete && <button type="button" onClick={onDelete} disabled={isBusy} className={`${iconButtonClass} text-brand-red hover:border-brand-red hover:bg-brand-red-light`} aria-label={`Delete ${job.title}`} title="Delete"><Trash2 className="size-4" aria-hidden="true" /></button>}
        </div></td>
    </tr>;
}

// --- MODALS --- //

function emptyJob(): JobPayload {
    return {
        title: "", type: "full-time", location: "Hazaribagh, Jharkhand (On-site)",
        description: "", responsibilities: [""], requirements: [""],
        duration: "", stipend: "", status: "draft"
    };
}

function DynamicListSection({ title, items, onChange, placeholder }: { title: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
    return (
        <FormSection title={title}>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <textarea 
                            rows={2}
                            value={item} 
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[index] = e.target.value;
                                onChange(newItems);
                            }} 
                            className={inputClass} 
                            placeholder={placeholder} 
                        />
                        <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="sprint-focus mt-1.5 shrink-0 rounded-lg p-2.5 text-brand-text-muted hover:bg-brand-red-light hover:text-brand-red" aria-label="Remove item">
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => onChange([...items, ""])} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-50">
                    <Plus className="size-3.5" aria-hidden="true" /> Add another bullet point
                </button>
            </div>
        </FormSection>
    );
}

function JobModal({ job, isSaving, onClose, onSave }: { job: JobItem | null; isSaving: boolean; onClose: () => void; onSave: (payload: JobPayload) => Promise<boolean> }) {
    const [form, setForm] = useState<JobPayload>(() => job ? { 
        ...job, 
        responsibilities: job.responsibilities.length ? [...job.responsibilities] : [""],
        requirements: job.requirements.length ? [...job.requirements] : [""] 
    } : emptyJob());
    
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape" && !isSaving) onClose(); }
        document.addEventListener("keydown", onKeyDown);
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
    }, [isSaving, onClose]);

    function setField<Key extends keyof JobPayload>(key: Key, value: JobPayload[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Clean up empty array items before saving
        const cleanedPayload = {
            ...form,
            responsibilities: form.responsibilities.map(r => r.trim()).filter(Boolean),
            requirements: form.requirements.map(r => r.trim()).filter(Boolean),
        };
        await onSave(cleanedPayload);
    }

    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="job-modal-title" className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">Team & Careers</p>
                    <h2 id="job-modal-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{job ? "Edit Job Listing" : "Create Job Listing"}</h2>
                </div>
                <button ref={closeRef} type="button" onClick={onClose} disabled={isSaving} className={iconButtonClass} aria-label="Close form"><X className="size-4" aria-hidden="true" /></button>
            </header>
            
            <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-7">
                    
                    <FormSection title="Basic Info">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className={`${labelClass} sm:col-span-2`}>Job Title<input required value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="e.g. Lead Next.js Developer" /></label>
                            <label className={labelClass}>Job Type<select value={form.type} onChange={(event) => setField("type", event.target.value)} className={inputClass}>{jobTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
                            <label className={labelClass}>Status<select value={form.status} onChange={(event) => {
                                if (isJobStatus(event.target.value)) setField("status", event.target.value);
                            }} className={inputClass}>{jobStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
                            <label className={`${labelClass} sm:col-span-2`}>Location<input required value={form.location} onChange={(event) => setField("location", event.target.value)} className={inputClass} placeholder="e.g. Hazaribagh (On-site) or Remote" /></label>
                        </div>
                    </FormSection>

                    <FormSection title="Time & Compensation">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className={labelClass}>Duration (Optional)<input value={form.duration || ""} onChange={(event) => setField("duration", event.target.value)} className={inputClass} placeholder="e.g. 6 Months (for Internships)" /></label>
                            <label className={labelClass}>Stipend / Salary (Optional)<input value={form.stipend || ""} onChange={(event) => setField("stipend", event.target.value)} className={inputClass} placeholder="e.g. ₹10,000 / month or Competitive" /></label>
                        </div>
                    </FormSection>

                    <FormSection title="Overview">
                        <label className={labelClass}>Short Description<textarea required rows={4} value={form.description} onChange={(event) => setField("description", event.target.value)} className={inputClass} placeholder="A short 2-3 line summary about the role..." /></label>
                    </FormSection>

                    <DynamicListSection 
                        title="Key Responsibilities" 
                        items={form.responsibilities} 
                        onChange={(val) => setField("responsibilities", val)} 
                        placeholder="e.g. Develop and maintain Next.js web applications..." 
                    />

                    <DynamicListSection 
                        title="Requirements / Skills" 
                        items={form.requirements} 
                        onChange={(val) => setField("requirements", val)} 
                        placeholder="e.g. Strong proficiency in React, TypeScript, and Tailwind CSS..." 
                    />
                </div>
                
                <footer className="flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                    <button type="button" onClick={onClose} disabled={isSaving} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-brand-surface">Cancel</button>
                    <button type="submit" disabled={isSaving} className="sprint-focus inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-70">
                        {isSaving && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                        {isSaving ? "Saving…" : "Save Job Listing"}
                    </button>
                </footer>
            </form>
        </section>
    </div>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
    return <section className="space-y-3"><h3 className="border-b border-slate-100 pb-2 font-display text-sm font-bold text-brand-navy">{title}</h3>{children}</section>;
}

function JobDetailsModal({ job, canEdit, onClose, onEdit }: { job: JobItem; canEdit: boolean; onClose: () => void; onEdit: () => void }) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
        document.addEventListener("keydown", onKeyDown);
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
    }, [onClose]);

    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="job-details-title" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
                <div>
                    <p className="text-xs font-semibold text-brand-red uppercase tracking-wider">{jobTypes.find(t => t.value === job.type)?.label || job.type}</p>
                    <h2 id="job-details-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{job.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-brand-text-muted"><MapPin className="size-3" aria-hidden="true"/> {job.location}</p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close details" className={iconButtonClass}><X className="size-4" aria-hidden="true" /></button>
            </header>
            
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
                <div className="grid gap-3 sm:grid-cols-3">
                    <DetailValue label="Status" value={<StatusBadge status={job.status} />} />
                    <DetailValue label="Duration" value={job.duration || "Not specified"} />
                    <DetailValue label="Stipend / Salary" value={job.stipend || "Not specified"} />
                </div>
                
                <DetailSection title="Overview">
                    <p className="text-sm leading-6 text-brand-text-secondary">{job.description}</p>
                </DetailSection>
                
                <DetailSection title="Responsibilities">
                    {job.responsibilities.length ? (
                        <ul className="list-inside list-disc space-y-1.5 text-sm text-brand-text-secondary">
                            {job.responsibilities.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                    ) : <p className="text-sm text-brand-text-muted">None specified.</p>}
                </DetailSection>

                <DetailSection title="Requirements & Skills">
                    {job.requirements.length ? (
                        <ul className="list-inside list-disc space-y-1.5 text-sm text-brand-text-secondary">
                            {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                    ) : <p className="text-sm text-brand-text-muted">None specified.</p>}
                </DetailSection>
            </div>
            
            <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 sm:px-7">
                <button type="button" onClick={onClose} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-brand-surface">Close</button>
                {canEdit && <button type="button" onClick={onEdit} className="sprint-focus inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"><Edit3 className="size-4" aria-hidden="true" /> Edit Job</button>}
            </footer>
        </section>
    </div>;
}

function DetailValue({ label, value }: { label: string; value: ReactNode }) {
    return <div className="rounded-lg border border-slate-200 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-brand-text-muted">{label}</p><div className="mt-1 text-sm font-semibold text-brand-navy">{value}</div></div>;
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return <section><h3 className="mb-2 font-display text-sm font-bold text-brand-navy">{title}</h3>{children}</section>;
}