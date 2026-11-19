"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import type { StudentDirectoryEntry } from "@/app/admin/students/list/actions";

function ActiveCourseBadges({ student }: { student: StudentDirectoryEntry }) {
    if (!student.activeCourses || student.activeCourses.length === 0) {
        return <span className="text-sm text-brand-text-muted">{student.courseEnrolled || "Not enrolled"}</span>;
    }

    return (
        <div className="flex min-w-0 max-w-full flex-wrap gap-1.5">
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
            className="fixed inset-0 z-[100] flex min-w-0 max-w-full items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="student-details-title"
                className="flex max-h-[90vh] w-full min-w-0 max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
            >
                <header className="flex min-w-0 max-w-full items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
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
                            <dl className="mt-3 grid min-w-0 max-w-full gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                <Detail label="Student ID" value={student.studentId} />
                                <Detail label="Full Name" value={student.name} />
                                <Detail label="Email" value={student.email} />
                                <Detail label="Phone Number" value={student.phone} />
                                <Detail label="College / Institution" value={student.college} />
                                <Detail label="Degree" value={student.degree} />
                                <Detail label="Specialization / Branch" value={student.specialization} />
                                <Detail label="Semester / Year" value={student.semester} />
                                <Detail label="City" value={student.city} />
                                <Detail label="State" value={student.state} />
                                <Detail label="Employment Status" value={student.employmentStatus} />
                                <Detail label="Organization" value={student.organization} />
                                <Detail label="Enrolled Courses / Bundles" value={student.courseEnrolled} />
                                <Detail label="Status" value={student.status} />
                                <Detail label="Date of Enrollment" value={student.dateOfEnrollment} />
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
            <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white" role="region" aria-label="Student directory">
                <div className="w-full max-w-full overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-left text-sm">
                        <colgroup>
                            <col className="w-[14%]" />
                            <col className="w-[12%]" />
                            <col className="w-[23%]" />
                            <col className="w-[18%]" />
                            <col className="w-[11%]" />
                            <col className="w-[13%]" />
                            <col className="w-[9%]" />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="break-words px-2 py-4">Student ID</th>
                                <th className="break-words px-2 py-4">Name</th>
                                <th className="break-words px-2 py-4">Contact</th>
                                <th className="break-words px-2 py-4">College / Institution &amp; Degree</th>
                                <th className="break-words px-2 py-4">Status</th>
                                <th className="break-words px-2 py-4">Date of Enrollment</th>
                                <th className="break-words px-2 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => {
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="break-all px-2 py-4 font-mono text-xs font-bold text-brand-navy">
                                            {student.registrationNumber}
                                        </td>
                                        <td className="break-words px-2 py-4 font-semibold text-brand-navy">
                                            {student.name}
                                        </td>
                                        <td className="break-words px-2 py-4 text-brand-text-secondary">
                                            <div className="min-w-0 space-y-1">
                                                <p className="break-all">{student.email}</p>
                                                <p className="text-xs">{student.phone}</p>
                                            </div>
                                        </td>
                                        <td className="break-words px-2 py-4 text-brand-text-secondary">
                                            <div className="min-w-0 space-y-1">
                                                <p className="break-words font-medium text-brand-navy">{student.college}</p>
                                                <p className="break-words text-xs">{student.degree}</p>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4">
                                            <span className={`inline-flex rounded-full px-1.5 py-1 text-[11px] font-bold ${
                                                student.status.toLowerCase() === "active"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}>
                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="break-words px-2 py-4 text-[11px] text-brand-text-muted">
                                            {student.dateOfEnrollment}
                                        </td>
                                        <td className="px-2 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedStudent(student)}
                                                aria-label={`View details for ${student.name}`}
                                                className="sprint-focus inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-slate-100"
                                            >
                                                <Eye className="size-4" aria-hidden="true" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
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
            </div>
            {selectedStudent && (
                <StudentDetailsModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </>
    );
}
