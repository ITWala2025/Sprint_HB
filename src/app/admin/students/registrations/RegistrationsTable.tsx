"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import RegistrationDetailsModal from "@/app/admin/students/enrollments/RegistrationDetailsModal";

export type RegistrationListItem = {
    id: string;
    application_number?: string;
    full_name: string;
    email: string;
    courseReference: string;
    created_at: string;
    status: string;
};

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

export default function RegistrationsTable({ registrations }: { registrations: RegistrationListItem[] }) {
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Registrations list">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Course Interest</th>
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
                                        {registration.application_number && (
                                            <p className="font-mono text-xs font-semibold text-brand-navy/80">
                                                {registration.application_number}
                                            </p>
                                        )}
                                        <p className="mt-0.5 text-xs text-brand-text-muted">{registration.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-brand-text-secondary">{registration.courseReference || "Not specified"}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-xs text-brand-text-muted">{formatSubmittedDate(registration.created_at)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[registration.status] ?? "bg-slate-100 text-slate-600"}`}>
                                            {formatStatus(registration.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRegistrationId(registration.id)}
                                            aria-label={`View details for ${registration.full_name}`}
                                            className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-slate-100"
                                        >
                                            <Eye className="size-4" aria-hidden="true" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {registrations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                        No registrations are available.
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
                    onClose={() => setSelectedRegistrationId(null)}
                />
            )}
        </>
    );
}
