"use client";

import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import { Eye, Mail, Phone, Search, Trash2, X } from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import TablePagination from "@/components/admin/TablePagination";
import { deleteEnquiry, updateEnquiryStatus } from "@/app/admin/enquiries/actions";
import type {
    Enquiry,
    EnquiryAudience,
    EnquiryStatus,
} from "@/components/admin/enquiries-types";

const pageSize = 15;
const statusOptions: EnquiryStatus[] = ["new", "contacted", "resolved"];
const categories: { value: EnquiryAudience | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "student", label: "Student" },
    { value: "working_professional", label: "Working Professional" },
    { value: "institute", label: "Institute" },
    { value: "company", label: "Company" },
];

const categoryLabels: Record<EnquiryAudience, string> = {
    student: "Student",
    working_professional: "Working Professional",
    institute: "Institute",
    company: "Company",
};

const statusStyles: Record<string, string> = {
    new: "bg-brand-red-light text-brand-red",
    contacted: "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
    in_progress: "bg-blue-50 text-blue-700",
    converted: "bg-violet-50 text-violet-700",
    closed: "bg-slate-100 text-slate-600",
};

function formatValue(value: unknown): string {
    if (value == null || value === "") return "Not provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "Not provided";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    const parts = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((item) => item.type === type)?.value ?? "";
    const day = part("day");
    const month = part("month");
    const year = part("year");
    const hour = part("hour");
    const minute = part("minute");
    const dayPeriod = part("dayPeriod").toUpperCase();
    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
}

function interestSummary(enquiry: Enquiry): string {
    const selected = enquiry.audience_type === "institute"
        ? enquiry.services ?? enquiry.interested_services
        : enquiry.audience_type === "company"
            ? enquiry.purpose_types ?? enquiry.purposes
            : enquiry.interested_courses ?? enquiry.interested_programs;
    return selected?.length ? selected.join(", ") : enquiry.message || "Not specified";
}

function organizationName(enquiry: Enquiry): string | null {
    if (enquiry.audience_type === "institute") return enquiry.institute_name ?? null;
    if (enquiry.audience_type === "company") return enquiry.company_name ?? null;
    if (enquiry.audience_type === "working_professional") return enquiry.current_company ?? enquiry.company_name ?? null;
    return null;
}

function detailFields(enquiry: Enquiry): [string, unknown][] {
    const common: [string, unknown][] = [
        ["Full name", enquiry.full_name],
        ["Email", enquiry.email],
        ["Phone", enquiry.phone],
        ["Message", enquiry.message],
    ];

    switch (enquiry.audience_type) {
        case "student":
            return [...common, ["Interested courses", enquiry.interested_courses ?? enquiry.interested_programs]];
        case "working_professional":
            return [
                ...common,
                ["Current company", enquiry.current_company ?? enquiry.company_name],
                ["Current designation", enquiry.current_designation ?? enquiry.designation],
                ["Total experience", enquiry.total_experience],
                ["Interested program / course", enquiry.interested_courses ?? enquiry.interested_programs],
            ];
        case "institute":
            return [
                ...common,
                ["Institute name", enquiry.institute_name],
                ["Contact person name", enquiry.contact_person_name ?? enquiry.full_name],
                ["Role / designation", enquiry.role_designation ?? enquiry.designation],
                ["Services", enquiry.services ?? enquiry.interested_services],
                ["Official email", enquiry.email],
                ["Official phone", enquiry.phone],
                ["Website", enquiry.website_url ?? enquiry.website],
                ["Preferred contact time", enquiry.preferred_contact_time],
            ];
        case "company":
            return [
                ...common,
                ["Company name", enquiry.company_name],
                ["Company domain", enquiry.company_domain ?? enquiry.domain],
                ["Contact person name", enquiry.contact_person_name ?? enquiry.full_name],
                ["Role", enquiry.role_designation ?? enquiry.designation],
                ["Official email", enquiry.email],
                ["Official phone", enquiry.phone],
                ["Website", enquiry.website_url ?? enquiry.website],
                ["Available time", enquiry.preferred_contact_time],
                ["Purpose types", enquiry.purpose_types ?? enquiry.purposes],
            ];
    }
}

export default function EnquiriesCategoryView({
    enquiries: initialEnquiries,
    category = "all",
    allowDelete = true,
}: {
    enquiries: Enquiry[];
    category?: EnquiryAudience | "all";
    allowDelete?: boolean;
}) {
    const { hasPermission } = useAdminPermissions();
    const canEdit = hasPermission(["admissions", "marketing", "support"], "edit");
    const canDelete = allowDelete && hasPermission(["admissions", "marketing", "support"], "delete");
    const [enquiries, setEnquiries] = useState(initialEnquiries);
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<EnquiryAudience | "all">(category);
    const [statusFilter, setStatusFilter] = useState<"all" | EnquiryStatus>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notice, setNotice] = useState("");
    const [isPending, startTransition] = useTransition();

    const filteredEnquiries = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();
        return enquiries.filter((enquiry) => {
            if (categoryFilter !== "all" && enquiry.audience_type !== categoryFilter) return false;
            if (statusFilter !== "all" && enquiry.status !== statusFilter) return false;
            if (!searchTerm) return true;

            const searchable = [
                enquiry.full_name,
                enquiry.email,
                enquiry.phone,
                enquiry.company_name,
                enquiry.current_company,
                enquiry.institute_name,
                enquiry.contact_person_name,
                enquiry.current_designation,
                enquiry.role_designation,
                enquiry.domain,
                enquiry.company_domain,
                enquiry.message,
                interestSummary(enquiry),
            ].filter(Boolean).join(" ").toLowerCase();
            return searchable.includes(searchTerm);
        });
    }, [categoryFilter, enquiries, query, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize));
    const pageRows = filteredEnquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    function handleStatusChange(enquiry: Enquiry, event: ChangeEvent<HTMLSelectElement>) {
        const nextStatus = event.target.value as EnquiryStatus;
        setNotice("");
        setBusyId(enquiry.id);
        startTransition(async () => {
            try {
                const result = await updateEnquiryStatus(enquiry.id, nextStatus);
                if (result.success === false) {
                    setNotice(result.error);
                } else {
                    setEnquiries((current) => current.map((item) =>
                        item.id === enquiry.id ? { ...item, status: nextStatus } : item,
                    ));
                    setSelectedEnquiry((current) => current?.id === enquiry.id
                        ? { ...current, status: nextStatus }
                        : current);
                }
            } catch (error) {
                setNotice(error instanceof Error ? error.message : "Could not update enquiry status.");
            } finally {
                setBusyId(null);
            }
        });
    }

    function handleDelete(enquiry: Enquiry) {
        if (!window.confirm(`Delete the enquiry from ${enquiry.full_name}? This cannot be undone.`)) return;
        setNotice("");
        setBusyId(enquiry.id);
        startTransition(async () => {
            try {
                const result = await deleteEnquiry(enquiry.id);
                if (result.success === false) {
                    setNotice(result.error);
                } else {
                    setEnquiries((current) => current.filter((item) => item.id !== enquiry.id));
                    setSelectedEnquiry((current) => current?.id === enquiry.id ? null : current);
                    setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil((filteredEnquiries.length - 1) / pageSize))));
                }
            } catch (error) {
                setNotice(error instanceof Error ? error.message : "Could not delete enquiry.");
            } finally {
                setBusyId(null);
            }
        });
    }

    return (
        <div className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
                {category === "all" && (
                    <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" aria-label="Filter enquiries by category">
                        {categories.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                    setCategoryFilter(item.value);
                                    setCurrentPage(1);
                                }}
                                aria-pressed={categoryFilter === item.value}
                                className={`sprint-focus shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                                    categoryFilter === item.value
                                        ? "bg-brand-navy text-white"
                                        : "bg-slate-100 text-brand-text-secondary hover:bg-slate-200"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                    <label className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-text-muted" aria-hidden="true" />
                        <span className="sr-only">Search enquiries</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search name, organization, contact, or interest"
                            className="sprint-focus w-full min-w-0 rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-brand-navy outline-none placeholder:text-brand-text-muted"
                        />
                    </label>
                    <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-brand-text-secondary">
                        <span>Status</span>
                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value as "all" | EnquiryStatus);
                                setCurrentPage(1);
                            }}
                            className="sprint-focus rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy"
                        >
                            <option value="all">All</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </label>
                </div>
            </div>

            {notice && <p className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 sm:mx-5" role="alert">{notice}</p>}

            <div className="w-full max-w-full min-w-0 overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted">
                        <tr>
                            <th className="px-4 py-3 font-bold">Name / Organization</th>
                            {category === "all" && <th className="px-4 py-3 font-bold">Category</th>}
                            <th className="px-4 py-3 font-bold">Contact</th>
                            <th className="px-4 py-3 font-bold">Interest / Purpose</th>
                            <th className="px-4 py-3 font-bold">Submitted</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pageRows.map((enquiry) => {
                            const organization = organizationName(enquiry);
                            const statusClass = statusStyles[enquiry.status] ?? statusStyles.closed;
                            const currentStatusIsEditable = statusOptions.includes(enquiry.status as EnquiryStatus);
                            return (
                                <tr key={enquiry.id} className="align-top hover:bg-slate-50/70">
                                    <td className="max-w-[220px] px-4 py-4">
                                        <p className="break-words font-semibold text-brand-navy">{organization || enquiry.full_name}</p>
                                        {organization && <p className="mt-1 break-words text-xs text-brand-text-secondary">{enquiry.full_name}</p>}
                                        {enquiry.audience_type === "working_professional" && (enquiry.current_designation || enquiry.designation) && (
                                            <p className="mt-1 break-words text-xs text-brand-text-muted">{enquiry.current_designation ?? enquiry.designation}</p>
                                        )}
                                    </td>
                                    {category === "all" && (
                                        <td className="px-4 py-4">
                                            <span className="inline-flex max-w-[150px] rounded-full bg-brand-blue-light px-2.5 py-1 text-[11px] font-bold text-brand-blue">
                                                {categoryLabels[enquiry.audience_type]}
                                            </span>
                                        </td>
                                    )}
                                    <td className="max-w-[210px] px-4 py-4 text-xs text-brand-text-secondary">
                                        <p className="flex items-start gap-1.5 break-all"><Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{enquiry.email}</p>
                                        <p className="mt-1.5 flex items-start gap-1.5 break-all"><Phone className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{enquiry.phone}</p>
                                    </td>
                                    <td className="max-w-[230px] px-4 py-4 text-xs leading-5 text-brand-text-secondary">
                                        <span className="line-clamp-3 break-words">{interestSummary(enquiry)}</span>
                                        {enquiry.audience_type === "company" && (enquiry.company_domain || enquiry.domain) && (
                                            <span className="mt-1 block break-words text-brand-text-muted">Domain: {enquiry.company_domain ?? enquiry.domain}</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-xs text-brand-text-muted">{formatDate(enquiry.created_at)}</td>
                                    <td className="px-4 py-4">
                                        {canEdit ? (
                                            <select
                                                aria-label={`Update status for ${enquiry.full_name}`}
                                                value={currentStatusIsEditable ? enquiry.status : ""}
                                                disabled={busyId === enquiry.id || isPending}
                                                onChange={(event) => handleStatusChange(enquiry, event)}
                                                className={`sprint-focus max-w-[135px] rounded-full px-2.5 py-1.5 text-[11px] font-bold outline-none disabled:opacity-60 ${statusClass}`}
                                            >
                                                {!currentStatusIsEditable && <option value="" disabled>{enquiry.status.replace(/_/g, " ")}</option>}
                                                {statusOptions.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}>{enquiry.status.replace(/_/g, " ")}</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedEnquiry(enquiry)}
                                                className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-blue transition hover:bg-brand-blue-light"
                                                aria-label={`View details for ${enquiry.full_name}`}
                                            >
                                                <Eye className="size-4" aria-hidden="true" />
                                            </button>
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    disabled={busyId === enquiry.id || isPending}
                                                    onClick={() => handleDelete(enquiry)}
                                                    className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-red transition hover:bg-brand-red-light disabled:opacity-50"
                                                    aria-label={`Delete enquiry from ${enquiry.full_name}`}
                                                >
                                                    <Trash2 className="size-4" aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {pageRows.length === 0 && (
                            <tr>
                                <td colSpan={category === "all" ? 7 : 6} className="px-4 py-12 text-center text-sm text-brand-text-muted">
                                    No enquiries match these filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEnquiries.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
            />

            {selectedEnquiry && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setSelectedEnquiry(null);
                }}>
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="enquiry-details-title"
                        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-red">{categoryLabels[selectedEnquiry.audience_type]} enquiry</p>
                                <h2 id="enquiry-details-title" className="mt-1 break-words font-display text-xl font-bold text-brand-navy">{selectedEnquiry.full_name}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEnquiry(null)}
                                className="sprint-focus inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-text-muted hover:bg-slate-100 hover:text-brand-navy"
                                aria-label="Close enquiry details"
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </header>
                        <div className="max-h-[calc(90vh-76px)] overflow-y-auto p-5 sm:p-6">
                            <dl className="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">
                                {detailFields(selectedEnquiry).map(([label, value], index) => (
                                    <div key={`${label}-${index}`} className={`${label === "Message" ? "sm:col-span-2" : ""} min-w-0`}>
                                        <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">{label}</dt>
                                        <dd className="mt-1 break-words text-sm leading-6 text-brand-navy">{formatValue(value)}</dd>
                                    </div>
                                ))}
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">Submitted</dt>
                                    <dd className="mt-1 text-sm text-brand-navy">{formatDate(selectedEnquiry.created_at)}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">Status</dt>
                                    <dd className="mt-1 text-sm capitalize text-brand-navy">{selectedEnquiry.status.replace(/_/g, " ")}</dd>
                                </div>
                            </dl>
                            {selectedEnquiry.metadata && (
                                <details className="mt-6 rounded-xl border border-slate-200 p-4">
                                    <summary className="cursor-pointer text-sm font-bold text-brand-navy">Raw submitted payload</summary>
                                    <dl className="mt-4 grid min-w-0 gap-x-6 gap-y-3 sm:grid-cols-2">
                                        {Object.entries(selectedEnquiry.metadata).map(([key, value]) => (
                                            <div key={key} className="min-w-0">
                                                <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">{key.replace(/([A-Z])/g, " $1")}</dt>
                                                <dd className="mt-1 break-words text-sm text-brand-navy">{formatValue(value)}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </details>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
