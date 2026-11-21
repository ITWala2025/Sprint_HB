"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, Trash2, X } from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import TablePagination from "@/components/admin/TablePagination";
import {
    activateStudent,
    deactivateStudent,
    type StudentStatusActionResult,
} from "@/app/admin/students/list/actions";
import {
    formatSearchableDate,
    matchesTableDateFilter,
    type TableDateFilter,
} from "@/lib/admin/student-table-filters";
import type { StudentDirectoryEntry } from "@/app/admin/students/list/actions";

const PAGE_SIZE = 15;

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
    const router = useRouter();
    const { hasPermission } = useAdminPermissions();
    const canManageStudents = hasPermission("student_ops", "edit");
    const [directoryStudents, setDirectoryStudents] = useState(students);
    const [selectedStudent, setSelectedStudent] = useState<StudentDirectoryEntry | null>(null);
    const [activeView, setActiveView] = useState<"active" | "deactivated">("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [programFilter, setProgramFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<TableDateFilter>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

    useEffect(() => setDirectoryStudents(students), [students]);

    const activeStudents = directoryStudents.filter((student) => student.status.toLowerCase() !== "deactivated");
    const deactivatedStudents = directoryStudents.filter((student) => student.status.toLowerCase() === "deactivated");
    const viewStudents = activeView === "active" ? activeStudents : deactivatedStudents;
    const programs = [...new Set(directoryStudents.flatMap((student) => student.activeCourses.map((course) => course.title)))].sort((a, b) => a.localeCompare(b));
    const states = [...new Set(directoryStudents.map((student) => student.state.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredStudents = [...viewStudents]
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
        .filter((student) => {
            const searchText = [
                student.registrationNumber,
                student.name,
                student.email,
                student.phone,
                student.college,
                student.degree,
                student.state,
                student.city,
                student.courseEnrolled,
                ...student.activeCourses.map((course) => course.title),
                student.dateOfEnrollment,
                formatSearchableDate(student.created_at),
            ].join(" ").toLowerCase();
            const isActive = student.status.toLowerCase() === "active";
            return (statusFilter === "all" || (statusFilter === "active" ? isActive : !isActive)) &&
                (stateFilter === "all" || student.state === stateFilter) &&
                (programFilter === "all" || student.activeCourses.some((course) => course.title === programFilter)) &&
                matchesTableDateFilter(student.created_at, dateFilter, fromDate, toDate) &&
                (!normalizedQuery || searchText.includes(normalizedQuery));
        });
    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const page = Math.min(currentPage, Math.max(totalPages, 1));
    const paginatedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasActiveFilters = Boolean(normalizedQuery) ||
        programFilter !== "all" ||
        statusFilter !== "all" ||
        stateFilter !== "all" ||
        dateFilter !== "all" ||
        Boolean(fromDate || toDate);

    function resetPage() {
        setCurrentPage(1);
    }

    function clearFilters() {
        setSearchQuery("");
        setProgramFilter("all");
        setStatusFilter("all");
        setStateFilter("all");
        setDateFilter("all");
        setFromDate("");
        setToDate("");
        resetPage();
    }

    async function changeStudentStatus(student: StudentDirectoryEntry, status: "active" | "deactivated") {
        if (status === "deactivated" && !window.confirm(`Deactivate ${student.name}? They will lose access to the Student Portal.`)) {
            return;
        }

        setBusyStudentId(student.id);
        setFeedback(null);
        try {
            const result: StudentStatusActionResult = status === "deactivated"
                ? await deactivateStudent(student.id)
                : await activateStudent(student.id);
            if ("error" in result) {
                setFeedback({ type: "error", message: result.error });
                return;
            }

            setDirectoryStudents((current) => current.map((item) =>
                item.id === student.id ? { ...item, status } : item,
            ));
            setSelectedStudent((current) =>
                current?.id === student.id ? { ...current, status } : current,
            );
            setCurrentPage(1);
            setFeedback({ type: "success", message: result.message });
            router.refresh();
        } catch (error) {
            setFeedback({
                type: "error",
                message: error instanceof Error ? error.message : "Could not update the student account.",
            });
        } finally {
            setBusyStudentId(null);
        }
    }

    return (
        <>
            <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white" role="region" aria-label="Student directory">
                {feedback && (
                    <p
                        className={`border-b px-5 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-brand-red" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
                        role={feedback.type === "error" ? "alert" : "status"}
                        aria-live="polite"
                    >
                        {feedback.message}
                    </p>
                )}
                <div className="flex min-w-0 max-w-full flex-wrap gap-2 border-b border-slate-200 px-4 py-3 sm:px-6" role="group" aria-label="Student status views">
                    <button
                        type="button"
                        aria-pressed={activeView === "active"}
                        onClick={() => { setActiveView("active"); resetPage(); }}
                        className={`sprint-focus rounded-full px-4 py-2 text-xs font-semibold transition ${activeView === "active" ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-text-secondary hover:bg-slate-200"}`}
                    >
                        Active Students ({activeStudents.length})
                    </button>
                    <button
                        type="button"
                        aria-pressed={activeView === "deactivated"}
                        onClick={() => { setActiveView("deactivated"); resetPage(); }}
                        className={`sprint-focus rounded-full px-4 py-2 text-xs font-semibold transition ${activeView === "deactivated" ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-text-secondary hover:bg-slate-200"}`}
                    >
                        Deactivated Students ({deactivatedStudents.length})
                    </button>
                </div>
                <div className="flex min-w-0 max-w-full flex-wrap items-end gap-3 border-b border-slate-200 px-4 py-4 sm:px-6" role="group" aria-label="Filter student directory">
                    <label className="min-w-[180px] max-w-full flex-1">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">Search students</span>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                resetPage();
                            }}
                            placeholder="Student ID, name, contact, course, date..."
                            className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-brand-navy"
                        />
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </label>
                    <label className="min-w-[130px] max-w-full">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">State</span>
                        <select
                            value={stateFilter}
                            onChange={(event) => {
                                setStateFilter(event.target.value);
                                resetPage();
                            }}
                            className="sprint-focus w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy"
                        >
                            <option value="all">All States</option>
                            {states.map((state) => <option key={state} value={state}>{state}</option>)}
                        </select>
                    </label>
                    <label className="min-w-[140px] max-w-full">
                        <span className="mb-1 block text-[11px] font-semibold text-brand-text-muted">Enrollment Date</span>
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
                <div className="w-full max-w-full overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-left text-sm">
                        <colgroup>
                            <col className="w-[13%]" />
                            <col className="w-[11%]" />
                            <col className="w-[20%]" />
                            <col className="w-[17%]" />
                            <col className="w-[10%]" />
                            <col className="w-[12%]" />
                            <col className="w-[17%]" />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="break-words px-2 py-4">Student ID</th>
                                <th className="break-words px-2 py-4">Name</th>
                                <th className="break-words px-2 py-4">Contact</th>
                                <th className="break-words px-2 py-4">College / Institution &amp; Degree</th>
                                <th className="break-words px-2 py-4">Status</th>
                                <th className="break-words px-2 py-4">Date of Enrollment</th>
                                <th className="break-words px-2 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedStudents.map((student) => {
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
                                            <div className="flex flex-nowrap items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStudent(student)}
                                                    aria-label={`View details for ${student.name}`}
                                                    title="View Details"
                                                    className="sprint-focus inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-slate-100"
                                                >
                                                    <Eye className="size-4" aria-hidden="true" />
                                                </button>
                                                {canManageStudents && activeView === "active" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void changeStudentStatus(student, "deactivated")}
                                                        disabled={busyStudentId === student.id}
                                                        aria-label="Deactivate student"
                                                        title="Deactivate student"
                                                        className="sprint-focus inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-brand-red transition hover:bg-brand-red-light disabled:opacity-50"
                                                    >
                                                        <Trash2 className="size-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                                {canManageStudents && activeView === "deactivated" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void changeStudentStatus(student, "active")}
                                                        disabled={busyStudentId === student.id}
                                                        aria-label="Activate student"
                                                        title="Activate"
                                                        className="sprint-focus inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                                    >
                                                        <RotateCcw className="size-4" aria-hidden="true" />
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-brand-text-muted">
                                        No students match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <TablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={filteredStudents.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
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
