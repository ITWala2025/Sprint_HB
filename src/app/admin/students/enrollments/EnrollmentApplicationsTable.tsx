"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Check, Eye, Trash2, X } from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import {
    approveRegistration,
    deleteRegistration,
    rejectRegistration,
    type EnrollmentRegistration,
} from "@/app/admin/students/enrollments/actions";
import RegistrationDetailsModal from "@/app/admin/students/enrollments/RegistrationDetailsModal";

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

    function reviewRegistration(id: string, newStatus: "approved" | "rejected") {
        setFeedback(null);
        startTransition(async () => {
            const result = newStatus === "approved"
                ? await approveRegistration(id)
                : await rejectRegistration(id);
            if ("error" in result) {
                setFeedback({ type: "error", message: result.error });
                return;
            }

            setFeedback({ type: "success", message: result.message });
            router.refresh();
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
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Enrollment applications">
                {feedback && (
                    <p
                        className={`border-b px-5 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-brand-red" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
                        role={feedback.type === "error" ? "alert" : "status"}
                        aria-live="polite"
                    >
                        {feedback.message}
                    </p>
                )}
                <div className="overflow-x-auto">
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
                            {registrations.map((registration) => (
                                <tr key={registration.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-brand-navy">{registration.full_name || "Unnamed applicant"}</p>
                                        <p className="mt-1 text-xs text-brand-text-muted">{registration.email}</p>
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
                            {registrations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                        No enrollment applications have been submitted.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
