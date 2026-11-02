"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import { verifyRegistration, type EnrollmentRegistration } from "@/app/admin/students/enrollments/actions";

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
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

    function reviewRegistration(id: string, newStatus: "approved" | "rejected") {
        setFeedback(null);
        startTransition(async () => {
            const result = await verifyRegistration(id, newStatus);
            if ("error" in result) {
                setFeedback({ type: "error", message: result.error });
                return;
            }

            setFeedback({ type: "success", message: result.message });
            router.refresh();
        });
    }

    return (
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
                <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted">
                        <tr>
                            <th className="px-5 py-3 font-bold sm:px-6">Applicant</th>
                            <th className="px-5 py-3 font-bold">Phone</th>
                            <th className="px-5 py-3 font-bold">Course / Bundle</th>
                            <th className="px-5 py-3 font-bold">Submitted</th>
                            <th className="px-5 py-3 font-bold">Status</th>
                            <th className="px-5 py-3 text-right font-bold sm:px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {registrations.map((registration) => (
                            <tr key={registration.id} className="hover:bg-slate-50">
                                <td className="px-5 py-4 sm:px-6">
                                    <p className="font-semibold text-brand-navy">{registration.full_name || "Unnamed applicant"}</p>
                                    <p className="mt-1 text-xs text-brand-text-muted">{registration.email}</p>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{registration.phone || "—"}</td>
                                <td className="px-5 py-4 text-brand-text-secondary">{registration.courseReference}</td>
                                <td className="whitespace-nowrap px-5 py-4 text-xs text-brand-text-muted">{formatSubmittedDate(registration.created_at)}</td>
                                <td className="px-5 py-4">
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[registration.status] ?? "bg-slate-100 text-slate-600"}`}>
                                        {formatStatus(registration.status)}
                                    </span>
                                </td>
                                <td className="px-5 py-4 sm:px-6">
                                    {canEditApplications && registration.status === "pending" ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => reviewRegistration(registration.id, "approved")}
                                                disabled={isPending}
                                                aria-label={`Approve ${registration.full_name}`}
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
                                        </div>
                                    ) : (
                                        <span className="block text-right text-xs text-brand-text-muted">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                    No enrollment applications have been submitted.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
