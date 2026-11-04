"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import {
    getEnrollmentRegistrationDetails,
    type EnrollmentRegistrationDetails,
} from "@/app/admin/students/enrollments/actions";

const statusStyles: Record<string, string> = {
    pending: "bg-brand-red-light text-brand-red",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-slate-100 text-slate-600",
    enrolled: "bg-blue-50 text-blue-700",
    cancelled: "bg-slate-100 text-slate-600",
};

function displayValue(value: string | null | undefined) {
    return value?.trim() || "Not provided";
}

function formatDate(value: string | null | undefined) {
    if (!value) return "Not provided";
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

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs font-semibold text-brand-text-muted">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-brand-navy">{value}</dd>
        </div>
    );
}

export default function RegistrationDetailsModal({
    registrationId,
    onClose,
}: {
    registrationId: string;
    onClose: () => void;
}) {
    const [details, setDetails] = useState<EnrollmentRegistrationDetails | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError("");

        void getEnrollmentRegistrationDetails(registrationId)
            .then((result) => {
                if (!isMounted) return;
                setDetails(result);
                if (!result) setError("This enrollment application no longer exists.");
            })
            .catch((loadError: unknown) => {
                if (!isMounted) return;
                setError(loadError instanceof Error ? loadError.message : "Could not load enrollment details.");
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [registrationId]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const registration = details?.registration;
    const productDetails = [
        details?.course && `Course: ${details.course.title}`,
        details?.bundle && `Bundle: ${details.bundle.title}`,
    ].filter(Boolean);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="registration-details-title"
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">Student Operations</p>
                        <h2 id="registration-details-title" className="mt-1 font-display text-xl font-bold text-brand-navy">
                            {registration?.full_name || "Enrollment Details"}
                        </h2>
                        {registration && <p className="mt-1 text-xs text-brand-text-muted">{registration.email}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        autoFocus
                        className="sprint-focus flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition hover:bg-slate-100 hover:text-brand-navy"
                        aria-label="Close enrollment details"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </header>

                <div className="overflow-y-auto p-5 sm:p-7">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-12 text-sm font-medium text-brand-text-secondary" role="status">
                            <LoaderCircle className="size-4 animate-spin text-brand-red" aria-hidden="true" />
                            Loading enrollment details...
                        </div>
                    ) : error ? (
                        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-brand-red" role="alert">{error}</p>
                    ) : registration && details ? (
                        <div className="space-y-6">
                            <section aria-labelledby="registration-personal-heading">
                                <h3 id="registration-personal-heading" className="font-display text-sm font-bold text-brand-navy">Personal Information</h3>
                                <dl className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                    <Detail label="Application ID" value={registration.id} />
                                    <Detail label="Full Name" value={displayValue(registration.full_name)} />
                                    <Detail label="Email" value={displayValue(registration.email)} />
                                    <Detail label="Phone Number" value={displayValue(registration.phone)} />
                                    <Detail label="Registration Number" value={displayValue(registration.registration_number)} />
                                    <Detail label="Linked Student Account ID" value={displayValue(registration.user_id)} />
                                    <Detail label="City" value={displayValue(registration.city)} />
                                    <Detail label="State" value={displayValue(registration.state)} />
                                    <Detail label="Employment Status" value={displayValue(registration.employment_status)} />
                                    <Detail label="Organization" value={displayValue(registration.organization_name)} />
                                </dl>
                            </section>

                            <section aria-labelledby="registration-academic-heading">
                                <h3 id="registration-academic-heading" className="font-display text-sm font-bold text-brand-navy">Academic Details</h3>
                                <dl className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                    <Detail label="College / Institution" value={displayValue(registration.college_institution)} />
                                    <Detail label="Degree" value={displayValue(registration.course_degree)} />
                                    <Detail label="Branch / Department" value={displayValue(registration.specialization_branch)} />
                                    <Detail label="Semester / Year" value={displayValue(registration.year_semester)} />
                                </dl>
                            </section>

                            <section aria-labelledby="registration-course-heading">
                                <h3 id="registration-course-heading" className="font-display text-sm font-bold text-brand-navy">Course / Bundle</h3>
                                <dl className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                    <Detail label="Selected Program" value={productDetails.join(" · ") || "Not specified"} />
                                    {details.course && (
                                        <>
                                            <Detail label="Course Category" value={details.course.category} />
                                            <Detail label="Difficulty" value={details.course.difficulty_level} />
                                            <Detail label="Duration" value={details.course.duration} />
                                            <Detail label="Delivery Method" value={details.course.delivery_method} />
                                        </>
                                    )}
                                    {details.bundle && (
                                        <>
                                            <Detail label="Bundle Category" value={details.bundle.category} />
                                            <Detail label="Bundle Pathway" value={displayValue(details.bundle.pathway)} />
                                            <div className="sm:col-span-2">
                                                <Detail label="Bundle Description" value={details.bundle.description} />
                                            </div>
                                        </>
                                    )}
                                    {details.batch && (
                                        <>
                                            <Detail label="Batch" value={`${details.batch.batch_name} (${details.batch.batch_code})`} />
                                            <Detail label="Batch Start Date" value={formatDate(details.batch.start_date)} />
                                            <Detail label="Batch End Date" value={formatDate(details.batch.end_date)} />
                                            <Detail label="Batch Mode / Status" value={`${details.batch.mode} · ${details.batch.status}`} />
                                        </>
                                    )}
                                </dl>
                            </section>

                            {details.enrollments.length > 0 && (
                                <section aria-labelledby="registration-enrollments-heading">
                                    <h3 id="registration-enrollments-heading" className="font-display text-sm font-bold text-brand-navy">Student Enrollments</h3>
                                    <div className="mt-3 space-y-3">
                                        {details.enrollments.map((enrollment, index) => (
                                            <dl key={`${enrollment.courseTitle}-${enrollment.batchName}-${index}`} className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                                <Detail label="Course" value={displayValue(enrollment.courseTitle)} />
                                                <Detail label="Batch" value={displayValue(enrollment.batchName)} />
                                                <Detail label="Status" value={enrollment.status} />
                                                <Detail label="Progress" value={`${enrollment.progress_percentage}%`} />
                                                <Detail label="Enrolled At" value={formatDate(enrollment.enrolled_at)} />
                                                <Detail label="Completed At" value={formatDate(enrollment.completed_at)} />
                                                <Detail label="Certificate Issued" value={enrollment.certificate_issued ? "Yes" : "No"} />
                                            </dl>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section aria-labelledby="registration-submission-heading">
                                <h3 id="registration-submission-heading" className="font-display text-sm font-bold text-brand-navy">Submission & Status</h3>
                                <dl className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                    <Detail label="Submitted" value={formatDate(registration.created_at)} />
                                    <div>
                                        <dt className="text-xs font-semibold text-brand-text-muted">Current Status</dt>
                                        <dd className="mt-1">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[registration.status] ?? "bg-slate-100 text-slate-600"}`}>
                                                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                                            </span>
                                        </dd>
                                    </div>
                                    <Detail label="Last Updated" value={formatDate(registration.updated_at)} />
                                    <Detail label="Information Source" value={displayValue(registration.source_of_info)} />
                                    <Detail label="Terms Accepted" value={registration.terms_accepted ? "Yes" : "No"} />
                                    <Detail label="Communication Consent" value={registration.communication_consent ? "Yes" : "No"} />
                                    <div className="sm:col-span-2"><Detail label="Admin Notes" value={displayValue(registration.admin_notes)} /></div>
                                </dl>
                            </section>
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
