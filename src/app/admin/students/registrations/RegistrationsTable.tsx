"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import {
    deleteRegistration,
    updateRegistration,
    type RegistrationActionResult,
    type RegistrationListItem,
    type RegistrationUpdateInput,
} from "@/app/admin/students/registrations/actions";

function formatSubmittedDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
}

function RegistrationEditor({
    registration,
    busy,
    onClose,
    onSave,
}: {
    registration: RegistrationListItem;
    busy: boolean;
    onClose: () => void;
    onSave: (input: RegistrationUpdateInput) => void;
}) {
    const [form, setForm] = useState<RegistrationUpdateInput>({
        full_name: registration.full_name,
        email: registration.email,
        phone: registration.phone,
        college_institution: registration.college_institution ?? "",
        admin_notes: registration.admin_notes ?? "",
    });

    function updateField(field: keyof RegistrationUpdateInput, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="registration-editor-title"
                className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
                    <div>
                        <h2 id="registration-editor-title" className="font-display text-xl font-bold text-brand-navy">
                            Edit registration
                        </h2>
                        <p className="mt-1 text-xs text-brand-text-muted">Submitted {formatSubmittedDate(registration.created_at)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Close registration editor"
                        className="sprint-focus flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition hover:bg-slate-100 hover:text-brand-navy disabled:opacity-50"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </header>
                <form
                    className="space-y-4 p-5 sm:p-7"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSave(form);
                    }}
                >
                    {([
                        ["full_name", "Applicant name", "text"],
                        ["email", "Email", "email"],
                        ["phone", "Phone", "tel"],
                        ["college_institution", "College / institution", "text"],
                    ] as const).map(([field, label, type]) => (
                        <label key={field} className="block">
                            <span className="text-xs font-semibold text-brand-text-secondary">{label}</span>
                            <input
                                type={type}
                                value={form[field]}
                                onChange={(event) => updateField(field, event.target.value)}
                                required={field !== "college_institution"}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                            />
                        </label>
                    ))}
                    <label className="block">
                        <span className="text-xs font-semibold text-brand-text-secondary">Admin notes</span>
                        <textarea
                            value={form.admin_notes}
                            onChange={(event) => updateField("admin_notes", event.target.value)}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                        />
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="sprint-focus rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="sprint-focus rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function RegistrationsTable({
    registrations,
}: {
    registrations: RegistrationListItem[];
}) {
    const router = useRouter();
    const { hasPermission } = useAdminPermissions();
    const canEdit = hasPermission("student_ops", "edit");
    const canDelete = hasPermission("student_ops", "delete");
    const [isPending, startTransition] = useTransition();
    const [editingRegistration, setEditingRegistration] = useState<RegistrationListItem | null>(null);
    const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

    function handleResult(result: RegistrationActionResult) {
        if ("error" in result) {
            setFeedback({ type: "error", message: result.error });
            return false;
        }
        setFeedback({ type: "success", message: result.message });
        router.refresh();
        return true;
    }

    function saveRegistration(input: RegistrationUpdateInput) {
        if (!editingRegistration) return;
        setFeedback(null);
        startTransition(async () => {
            const result = await updateRegistration(editingRegistration.id, input);
            if (handleResult(result)) setEditingRegistration(null);
        });
    }

    function removeRegistration(registration: RegistrationListItem) {
        const applicantName = registration.full_name || registration.email;
        if (!window.confirm(`Delete the registration for ${applicantName}? This cannot be undone.`)) return;

        setFeedback(null);
        startTransition(async () => {
            handleResult(await deleteRegistration(registration.id));
        });
    }

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Student registrations">
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
                    <table className="w-full min-w-[1050px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">College / Institution</th>
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
                                    <td className="whitespace-nowrap px-6 py-4 text-brand-text-secondary">{registration.phone}</td>
                                    <td className="px-6 py-4 text-brand-text-secondary">{registration.college_institution || "Not provided"}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-xs text-brand-text-muted">{formatSubmittedDate(registration.created_at)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                            registration.status === "pending"
                                                ? "bg-brand-red-light text-brand-red"
                                                : registration.status === "approved"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingRegistration(registration)}
                                                    disabled={isPending}
                                                    aria-label={`Edit ${registration.full_name}`}
                                                    className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-slate-100 disabled:opacity-50"
                                                >
                                                    <Pencil className="size-4" aria-hidden="true" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRegistration(registration)}
                                                    disabled={isPending}
                                                    aria-label={`Delete ${registration.full_name || registration.email}`}
                                                    className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-brand-red transition hover:border-brand-red/20 hover:bg-brand-red-light disabled:opacity-50"
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                        No course-free student registrations are available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {editingRegistration && (
                <RegistrationEditor
                    registration={editingRegistration}
                    busy={isPending}
                    onClose={() => setEditingRegistration(null)}
                    onSave={saveRegistration}
                />
            )}
        </>
    );
}
