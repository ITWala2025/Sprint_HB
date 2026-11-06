"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import type { StudentDirectoryEntry } from "@/app/admin/students/list/actions";

function ActiveCourseBadges({ student }: { student: StudentDirectoryEntry }) {
    if (!student.activeCourses || student.activeCourses.length === 0) {
        return <span className="text-sm text-brand-text-muted">{student.courseEnrolled || "Not enrolled"}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {student.activeCourses.map((course, index) => (
                <span
                    key={`${course.kind}-${course.title}-${index}`}
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        course.kind === "bundle"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-blue-50 text-blue-700"
                    }`}
                >
                    {course.title}
                    <span className="sr-only">{course.kind === "bundle" ? " career bundle" : " course"}</span>
                </span>
            ))}
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs font-semibold text-brand-text-muted">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-brand-navy">{value}</dd>
        </div>
    );
}

function StudentDetailsModal({
    student,
    onClose,
}: {
    student: StudentDirectoryEntry;
    onClose: () => void;
}) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

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
                aria-labelledby="student-details-title"
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">Student Directory</p>
                        <h2 id="student-details-title" className="mt-1 font-display text-xl font-bold text-brand-navy">
                            {student.name}
                        </h2>
                        <p className="mt-1 font-mono text-xs font-semibold text-brand-text-muted">{student.studentId}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        autoFocus
                        className="sprint-focus flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition hover:bg-slate-100 hover:text-brand-navy"
                        aria-label="Close student details"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </header>

                <div className="overflow-y-auto p-5 sm:p-7">
                    <div className="space-y-6">
                        <section aria-labelledby="student-contact-heading">
                            <h3 id="student-contact-heading" className="font-display text-sm font-bold text-brand-navy">Enrollment & Profile Information</h3>
                            <dl className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                <Detail label="Student ID" value={student.studentId} />
                                <Detail label="Name" value={student.name} />
                                <Detail label="Email" value={student.email} />
                                <Detail label="Phone" value={student.phone} />
                                <Detail label="Course Enrolled In" value={student.courseEnrolled} />
                                <Detail label="Status" value={student.status} />
                                <Detail label="Date of Enrollment" value={student.dateOfEnrollment} />
                                <Detail label="College / Institution" value={student.college} />
                            </dl>
                        </section>

                        <section aria-labelledby="student-courses-heading">
                            <h3 id="student-courses-heading" className="font-display text-sm font-bold text-brand-navy">
                                Active Courses & Career Bundles
                            </h3>
                            <div className="mt-3 rounded-xl border border-slate-200 p-4">
                                <ActiveCourseBadges student={student} />
                            </div>
                        </section>

                        <section aria-labelledby="student-attendance-heading">
                            <h3 id="student-attendance-heading" className="font-display text-sm font-bold text-brand-navy">Attendance</h3>
                            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                Attendance history is not available because no attendance table is configured in the current Supabase schema.
                            </p>
                        </section>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function StudentsDirectoryTable({
    students,
}: {
    students: StudentDirectoryEntry[];
}) {
    const [selectedStudent, setSelectedStudent] = useState<StudentDirectoryEntry | null>(null);

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Student directory">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">Student ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Course Enrolled In</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date of Enrollment</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-6 py-4 font-mono font-bold text-brand-navy">
                                        {student.studentId}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-brand-navy">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-brand-text-secondary">{student.email}</p>
                                        <p className="mt-1 text-xs text-brand-text-muted">{student.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-brand-navy">
                                        <ActiveCourseBadges student={student} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                            student.status.toLowerCase() === "active"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-xs text-brand-text-muted">
                                        {student.dateOfEnrollment}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStudent(student)}
                                            aria-label={`View details for ${student.name}`}
                                            className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-slate-100"
                                        >
                                            <Eye className="size-4" aria-hidden="true" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                        No verified active students are available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {selectedStudent && (
                <StudentDetailsModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </>
    );
}
