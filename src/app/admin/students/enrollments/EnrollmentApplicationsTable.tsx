"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Check, Eye, Trash2, X } from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import TablePagination from "@/components/admin/TablePagination";
import {
    formatSearchableDate,
    matchesTableDateFilter,
    type TableDateFilter,
} from "@/lib/admin/student-table-filters";
import {
    approveRegistration,
    deleteRegistration,
    rejectRegistration,
    type EnrollmentRegistration,
} from "@/app/admin/students/enrollments/actions";
import RegistrationDetailsModal from "@/app/admin/students/enrollments/RegistrationDetailsModal";

const PAGE_SIZE = 15;

const statusStyles: Record<string, string> = {
    pending: "bg-brand-red-light text-brand-red",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-slate-100 text-slate-600",
    enrolled: "bg-blue-50 text-blue-700",
    cancelled: "bg-slate-100 text-slate-600",
};

function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatSubmittedDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EnrollmentApplicationsTable({
    registrations,
}: {
    registrations: EnrollmentRegistration[];
}) {
    const router = useRouter();
    const { hasPermission } = useAdminPermissions();
    const canEditApplications = hasPermission("student_ops", "edit");
    const canDeleteApplications = hasPermission("student_ops", "delete");
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
    const closeDetails = useCallback(() => setSelectedRegistrationId(null), []);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [programFilter, setProgramFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<TableDateFilter>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const programs = [...new Set(registrations.flatMap((registration) => registration.programs))].sort((a, b) => a.localeCompare(b));
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredRegistrations = [...registrations]
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
        .filter((registration) => {
            const searchText = [
                registration.full_name,
                registration.email,
                registration.phone,
                registration.application_number,
                registration.courseReference,
                ...registration.programs,
                formatSearchableDate(registration.created_at),
            ].join(" ").toLowerCase();
            return (statusFilter === "all" || registration.status.toLowerCase() === statusFilter) &&
                (programFilter === "all" || registration.programs.includes(programFilter)) &&
                matchesTableDateFilter(registration.created_at, dateFilter, fromDate, toDate) &&
                (!normalizedQuery || searchText.includes(normalizedQuery));
        });
    const totalPages = Math.ceil(filteredRegistrations.length / PAGE_SIZE);
    const page = Math.min(currentPage, Math.max(totalPages, 1));
    const paginatedRegistrations = filteredRegistrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasActiveFilters = Boolean(normalizedQuery) ||
        statusFilter !== "all" ||
        programFilter !== "all" ||
        dateFilter !== "all" ||
        Boolean(fromDate || toDate);

    function resetPage() {
        setCurrentPage(1);
    }

    function clearFilters() {
        setSearchQuery("");
        setStatusFilter("all");
        setProgramFilter("all");
        setDateFilter("all");
        setFromDate("");
        setToDate("");
        resetPage();
    }

    function reviewRegistration(id: string, newStatus: "approved" | "rejected") {
        setFeedback(null);
        startTransition(async () => {
            try {
                const result = newStatus === "approved"
                    ? await approveRegistration(id)
                    : await rejectRegistration(id);
                if ("error" in result) {
                    setFeedback({ type: "error", message: result.error });
                    return;
                }

                setFeedback({ type: "success", message: result.message });
                router.refresh();
            } catch (error) {
                console.error("[EnrollmentApplications] Could not update application:", error);
                if (error instanceof Error && /Server Action .* was not found on the server/i.test(error.message)) {
                    setFeedback({
                        type: "error",
                        message: "Application state updated or server refreshed. Please reload the page.",
                    });
                    router.refresh();
                    return;
                }

                setFeedback({
                    type: "error",
                    message: error instanceof Error
                        ? error.message
                        : "The enrollment application could not be updated. Please try again.",
                });
            }
        });
    }

    function removeRegistration(registration: EnrollmentRegistration) {
        const applicantName = registration.full_name || registration.email;
        if (!window.confirm(`Delete the enrollment application for ${applicantName}? This cannot be undone.`)) return;

        setFeedback(null);
        startTransition(async () => {
            const result = await deleteRegistration(registration.id);
            if ("error" in result) {
                setFeedback({ type: "error", message: result.error });
                return;
            }

            setFeedback({ type: "success", message: result.message });
            if (selectedRegistrationId === registration.id) closeDetails();
            router.refresh();
        });
    }

    return (
        <>
            <section className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Enrollment applications">
                {feedback && (
                    <p
                        className={`border-b px-5 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-brand-red" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
                        role={feedback.type === "error" ? "alert" : "status"}
                        aria-live="polite"
                    >
                        {feedback.message}
                    </p>
                )}
                <div className="flex min-w-0 max-w-full flex-wrap items-end gap-3 border-b border-slate-200 px-4 py-4 sm:px-6" role="group" aria-label="Filter enrollment applications">
                    <label className="min-w-[180px] max-w-full flex-1">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">Search applications</span>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                resetPage();
                            }}
                            placeholder="Name, email, phone, program, date..."
                            className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-brand-navy"
                        />
                    </label>
                    <label className="min-w-[130px] max-w-full">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">Status</span>
                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value);
                                resetPage();
                            }}
                            className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </label>
                    <label className="min-w-[160px] max-w-full">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">Course / Bundle</span>
                        <select
                            value={programFilter}
                            onChange={(event) => {
                                setProgramFilter(event.target.value);
                                resetPage();
                            }}
                            className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy"
                        >
                            <option value="all">All Programs</option>
                            {programs.map((program) => <option key={program} value={program}>{program}</option>)}
                        </select>
                    </label>
                    <label className="min-w-[140px] max-w-full">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">Submitted</span>
                        <select
                            value={dateFilter}
                            onChange={(event) => {
                                setDateFilter(event.target.value as TableDateFilter);
                                resetPage();
                            }}
                            className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="last7">Last 7 Days</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </label>
                    {dateFilter === "custom" && (
                        <>
                            <label className="min-w-[135px] max-w-full">
                                <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">From</span>
                                <input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); resetPage(); }} className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy" />
                            </label>
                            <label className="min-w-[135px] max-w-full">
                                <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">To</span>
                                <input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); resetPage(); }} className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy" />
                            </label>
                        </>
                    )}
                    {hasActiveFilters && (
                        <button type="button" onClick={clearFilters} className="sprint-focus rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-slate-50">
                            Clear filters
                        </button>
                    )}
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Program</th>
                                <th className="px-6 py-4">Submitted</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedRegistrations.map((registration) => (
                                <tr key={registration.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-brand-navy">{registration.full_name || "Unnamed applicant"}</p>
                                        {registration.application_number && (
                                            <p className="font-mono text-xs font-semibold text-brand-navy/80">
                                                {registration.application_number}
                                            </p>
                                        )}
                                        <p className="mt-0.5 text-xs text-brand-text-muted">{registration.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-brand-text-secondary">{registration.courseReference}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-xs text-brand-text-muted">{formatSubmittedDate(registration.created_at)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[registration.status] ?? "bg-slate-100 text-slate-600"}`}>
                                            {formatStatus(registration.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRegistrationId(registration.id)}
                                                aria-label={`View details for ${registration.full_name}`}
                                                className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-slate-100 disabled:opacity-50"
                                                disabled={isPending}
                                            >
                                                <Eye className="size-4" aria-hidden="true" />
                                            </button>
                                            {canEditApplications && registration.status === "pending" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => reviewRegistration(registration.id, "approved")}
                                                        disabled={isPending}
                                                        aria-label={`Verify and approve ${registration.full_name}`}
                                                        className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <Check className="size-4" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => reviewRegistration(registration.id, "rejected")}
                                                        disabled={isPending}
                                                        aria-label={`Reject ${registration.full_name}`}
                                                        className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg bg-brand-red-light text-brand-red transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <X className="size-4" aria-hidden="true" />
                                                    </button>
                                                </>
                                            )}
                                            {canDeleteApplications && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRegistration(registration)}
                                                    disabled={isPending}
                                                    aria-label={`Delete ${registration.full_name || registration.email}`}
                                                    className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-brand-red transition hover:border-brand-red/20 hover:bg-brand-red-light disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Trash2 className="size-4" aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRegistrations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                        No enrollment applications match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <TablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={filteredRegistrations.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
            </section>
            {selectedRegistrationId && (
                <RegistrationDetailsModal
                    registrationId={selectedRegistrationId}
                    onClose={closeDetails}
                />
            )}
        </>
    );
}
