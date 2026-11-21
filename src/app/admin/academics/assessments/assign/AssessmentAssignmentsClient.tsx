"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
    AlertCircle, Award, BookOpen, CalendarDays, Check, ClipboardCheck, Clock3, ExternalLink,
    FileText, GraduationCap, ListFilter, LoaderCircle, Pencil, Plus, Search, X,
} from "lucide-react";
import { useAdminPermissions } from "@/app/admin/permissions-context";
import {
    getAssessmentSubmissionsAction,
    getAssessmentsAction,
    gradeAssessmentSubmissionAction,
    saveAssessmentAction,
} from "./actions";
import type {
    Assessment,
    AssessmentCourseOption,
    AssessmentInput,
    AssessmentStatus,
    AssessmentSubmission,
} from "./types";

type Notice = { type: "success" | "error"; message: string };
type AssessmentForm = AssessmentInput;
type CourseOption = AssessmentCourseOption & { kind: "course" | "bundle" | "flagship"; value: string };

const access = ["academic_ops", "academics"];
const inputClass = "sprint-focus mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-text-muted";
const labelClass = "block text-xs font-bold text-brand-navy";

function emptyForm(): AssessmentForm {
    return {
        title: "",
        description: "",
        course_id: null,
        course_name: "",
        batch_name: "",
        week_label: "",
        mentor_name: "",
        type: "Assignment",
        max_marks: 100,
        due_date: null,
        submission_type: "File Upload",
        attachment_url: null,
        status: "active",
    };
}

function normalizeCourseName(value: string | null | undefined) {
    return value?.trim().toLowerCase() ?? "";
}

function CourseOptionGroups({ options }: { options: CourseOption[] }) {
    return <>
        <optgroup label="Flagship Programs">
            {options.filter((option) => option.kind === "flagship").map((option) => <option key={option.value} value={option.value}>{option.title}</option>)}
        </optgroup>
        <optgroup label="Course Bundles">
            {options.filter((option) => option.kind === "bundle").map((option) => <option key={option.value} value={option.value}>{option.title}</option>)}
        </optgroup>
        <optgroup label="Courses">
            {options.filter((option) => option.kind === "course").map((option) => <option key={option.value} value={option.value}>{option.title}</option>)}
        </optgroup>
    </>;
}

function dateOnly(value: string | null) {
    return value ? value.slice(0, 10) : "";
}

function formatDate(value: string | null) {
    if (!value) return "No due date";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeZone: "Asia/Kolkata",
        }).format(date);
}

function safeWebLink(value: string | null) {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
}

function isOverdue(assessment: Assessment) {
    return assessment.status === "active"
        && Boolean(assessment.due_date)
        && new Date(assessment.due_date as string).getTime() < new Date(new Date().toDateString()).getTime();
}

function statusStyle(status: AssessmentStatus) {
    if (status === "active") return "bg-emerald-50 text-emerald-700";
    if (status === "closed") return "bg-slate-100 text-slate-600";
    return "bg-amber-50 text-amber-700";
}

export default function AssessmentAssignmentsClient({
    initialAssessments,
    initialCourses,
    initialCourseBundles,
    initialFlagshipPrograms,
    initialError,
}: {
    initialAssessments: Assessment[];
    initialCourses: AssessmentCourseOption[];
    initialCourseBundles: AssessmentCourseOption[];
    initialFlagshipPrograms: AssessmentCourseOption[];
    initialError?: string;
}) {
    const { hasPermission } = useAdminPermissions();
    const canCreate = hasPermission(access, "create");
    const canEdit = hasPermission(access, "edit");
    const [assessments, setAssessments] = useState(initialAssessments);
    const [notice, setNotice] = useState<Notice | null>(initialError ? { type: "error", message: initialError } : null);
    const [search, setSearch] = useState("");
    const [batchFilter, setBatchFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [selectedCourseValue, setSelectedCourseValue] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [editing, setEditing] = useState<Assessment | null | undefined>(undefined);
    const [form, setForm] = useState<AssessmentForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [gradingAssessment, setGradingAssessment] = useState<Assessment | null>(null);
    const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
    const [submissionError, setSubmissionError] = useState("");
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [gradeDrafts, setGradeDrafts] = useState<Record<string, { score: string; feedback: string }>>({});
    const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const courseOptions = useMemo<CourseOption[]>(() => [
        ...initialFlagshipPrograms.map((option) => ({ ...option, kind: "flagship" as const, value: `flagship:${option.id}` })),
        ...initialCourseBundles.map((option) => ({ ...option, kind: "bundle" as const, value: `bundle:${option.id}` })),
        ...initialCourses.map((option) => ({ ...option, kind: "course" as const, value: `course:${option.id}` })),
    ], [initialCourses, initialCourseBundles, initialFlagshipPrograms]);
    const batches = useMemo(() => [...new Set(assessments.map((item) => item.batch_name).filter(Boolean))].sort(), [assessments]);
    const types = useMemo(() => [...new Set(assessments.map((item) => item.type).filter(Boolean))].sort(), [assessments]);
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        const selectedFilterCourse = courseOptions.find((option) => option.value === courseFilter);
        return assessments.filter((item) => {
            const matchesQuery = !query || [item.title, item.course_name, item.batch_name, item.mentor_name, item.week_label]
                .some((value) => value?.toLowerCase().includes(query));
            const matchesCourse = courseFilter === "all" || Boolean(selectedFilterCourse && (
                (selectedFilterCourse.kind === "course" && item.course_id === selectedFilterCourse.id)
                || normalizeCourseName(item.course_name) === normalizeCourseName(selectedFilterCourse.title)
            ));
            return matchesQuery
                && (batchFilter === "all" || item.batch_name === batchFilter)
                && matchesCourse
                && (typeFilter === "all" || item.type === typeFilter);
        });
    }, [assessments, batchFilter, courseFilter, courseOptions, search, typeFilter]);
    const overdueCount = assessments.filter(isOverdue).length;
    const reviewCount = assessments.reduce((total, item) => total + item.review_count, 0);

    function openEditor(assessment: Assessment | null) {
        setNotice(null);
        setEditing(assessment);
        const matchingOption = assessment
            ? courseOptions.find((option) =>
                (assessment.course_id && option.kind === "course" && option.id === assessment.course_id)
                || normalizeCourseName(option.title) === normalizeCourseName(assessment.course_name),
            )
            : null;
        setSelectedCourseValue(matchingOption?.value ?? "");
        setForm(assessment ? {
            title: assessment.title,
            description: assessment.description ?? "",
            course_id: assessment.course_id ?? null,
            course_name: assessment.course_name,
            batch_name: assessment.batch_name,
            week_label: assessment.week_label ?? "",
            mentor_name: assessment.mentor_name ?? "",
            type: assessment.type,
            max_marks: Number(assessment.max_marks),
            due_date: dateOnly(assessment.due_date),
            submission_type: assessment.submission_type ?? "File Upload",
            attachment_url: assessment.attachment_url,
            status: assessment.status,
        } : emptyForm());
    }

    function selectCourse(value: string) {
        const option = courseOptions.find((item) => item.value === value);
        setSelectedCourseValue(option?.value ?? "");
        setForm({
            ...form,
            course_id: option?.kind === "course" ? option.id : null,
            course_name: option?.title ?? "",
        });
    }

    async function refreshAssessments() {
        const result = await getAssessmentsAction();
        setAssessments(result.assessments);
        if (result.error) {
            setNotice({ type: "error", message: result.error });
            return;
        }
    }

    async function save(status: AssessmentStatus) {
        if (!formRef.current?.reportValidity()) return;
        setIsSaving(true);
        setNotice(null);
        const result = await saveAssessmentAction(
            { ...form, status, due_date: form.due_date || null, attachment_url: form.attachment_url?.trim() || null },
            editing?.id,
        );
        if (!result.success) {
            setNotice({ type: "error", message: result.error ?? "Assessment could not be saved." });
            setIsSaving(false);
            return;
        }
        setEditing(undefined);
        setNotice({ type: "success", message: status === "draft" ? "Draft saved." : "Assessment assigned successfully." });
        await refreshAssessments();
        setIsSaving(false);
    }

    async function openGrading(assessment: Assessment) {
        setGradingAssessment(assessment);
        setSubmissions([]);
        setSubmissionError("");
        setLoadingSubmissions(true);
        const result = await getAssessmentSubmissionsAction(assessment.id);
        setSubmissions(result.submissions);
        setSubmissionError(result.error ?? "");
        setGradeDrafts(Object.fromEntries(result.submissions.map((item) => [item.id, {
            score: item.score === null ? "" : String(item.score),
            feedback: item.mentor_feedback ?? "",
        }])));
        setLoadingSubmissions(false);
    }

    async function saveGrade(submission: AssessmentSubmission) {
        const draft = gradeDrafts[submission.id];
        const score = Number(draft?.score);
        if (!draft || draft.score.trim() === "" || !Number.isFinite(score) || score < 0 || score > Number(gradingAssessment?.max_marks)) {
            setSubmissionError(`Enter a score from 0 to ${gradingAssessment?.max_marks ?? "the maximum marks"}.`);
            return;
        }
        setSavingGradeId(submission.id);
        setSubmissionError("");
        const result = await gradeAssessmentSubmissionAction(submission.id, score, draft.feedback);
        if (!result.success) {
            setSubmissionError(result.error ?? "Grade could not be saved.");
            setSavingGradeId(null);
            return;
        }
        setSubmissions((current) => current.map((item) => item.id === submission.id
            ? { ...item, score, mentor_feedback: draft.feedback.trim() || null, status: "graded", graded_at: new Date().toISOString() }
            : item));
        setNotice({ type: "success", message: `${submission.student_name}'s grade was saved.` });
        await refreshAssessments();
        setSavingGradeId(null);
    }

    const activeCount = assessments.filter((item) => item.status !== "draft").length;
    const kpis = [
        { label: "Total Assigned", value: activeCount, icon: ClipboardCheck, tone: "text-brand-navy bg-blue-50" },
        { label: "Overdue", value: overdueCount, icon: Clock3, tone: "text-rose-700 bg-rose-50" },
        { label: "Under Review", value: reviewCount, icon: Award, tone: "text-amber-700 bg-amber-50" },
    ];

    return (
        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Academic & Curriculum</p>
                    <h1 className="mt-1 font-display text-3xl font-bold text-brand-navy">Assessment assignments</h1>
                    <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">Create assignments, track batch submissions, and review student work.</p>
                </div>
                {canCreate && <button type="button" onClick={() => openEditor(null)} className="sprint-focus inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90">
                    <Plus className="size-4" aria-hidden="true" /> Assign New
                </button>}
            </header>

            {notice && <div role="status" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                {notice.type === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}
                <span>{notice.message}</span>
            </div>}

            <section aria-label="Assessment summary" className="grid gap-4 sm:grid-cols-3">
                {kpis.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><span className="text-sm font-semibold text-brand-text-secondary">{label}</span><span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" /></span></div>
                    <p className="mt-4 font-display text-3xl font-bold text-brand-navy">{value}</p>
                </article>)}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-navy"><ListFilter className="size-4" /> Assessments</div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Search className="size-4 text-brand-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assessments" className="sprint-focus min-w-0 flex-1 py-2.5 text-sm outline-none" /></label>
                        <select aria-label="Filter by batch" value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)} className={inputClass.replace("mt-1.5 ", "")}><option value="all">All batches</option>{batches.map((item) => <option key={item}>{item}</option>)}</select>
                        <select aria-label="Filter by course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className={inputClass.replace("mt-1.5 ", "")}>
                            <option value="all">All courses</option>
                            <CourseOptionGroups options={courseOptions} />
                        </select>
                        <select aria-label="Filter by type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={inputClass.replace("mt-1.5 ", "")}><option value="all">All types</option>{types.map((item) => <option key={item}>{item}</option>)}</select>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {filtered.length === 0 ? <div className="px-6 py-16 text-center">
                        <ClipboardCheck className="mx-auto size-10 text-slate-300" />
                        <h2 className="mt-3 font-bold text-brand-navy">{assessments.length ? "No matching assessments" : "No assessments yet"}</h2>
                        <p className="mt-1 text-sm text-brand-text-secondary">{assessments.length ? "Try another search or filter." : "Create an assessment to start tracking submissions."}</p>
                    </div> : filtered.map((assessment) => {
                        const expected = assessment.expected_students;
                        const progress = expected ? Math.min(100, Math.round(assessment.submission_count / expected * 100)) : 0;
                        return <article key={assessment.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-display text-lg font-bold text-brand-navy">{assessment.title}</h2>
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle(assessment.status)}`}>{assessment.status}</span>
                                    {isOverdue(assessment) && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">Overdue</span>}
                                </div>
                                {assessment.description && <p className="mt-1 line-clamp-2 text-sm text-brand-text-secondary">{assessment.description}</p>}
                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-text-secondary">
                                    <span className="inline-flex items-center gap-1"><BookOpen className="size-3.5" />{assessment.course_name}</span>
                                    <span className="inline-flex items-center gap-1"><GraduationCap className="size-3.5" />{assessment.batch_name}</span>
                                    <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />Due {formatDate(assessment.due_date)}</span>
                                    <span className="inline-flex items-center gap-1"><FileText className="size-3.5" />{assessment.type} · {assessment.max_marks} marks</span>
                                    {assessment.week_label && <span>{assessment.week_label}</span>}
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-brand-navy">Submissions</span><span className="text-brand-text-secondary">{assessment.submission_count}{expected > 0 ? ` / ${expected}` : ""}</span></div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${assessment.title} submission progress`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                                    <div className="h-full rounded-full bg-brand-red transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="mt-2 text-[11px] text-brand-text-muted">{assessment.review_count} under review · {assessment.graded_count} graded</p>
                            </div>
                            <div className="flex gap-2 lg:justify-end">
                                <button type="button" onClick={() => void openGrading(assessment)} className="sprint-focus inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-brand-surface"><Award className="size-4" /> Grade</button>
                                {canEdit && <button type="button" aria-label={`Edit ${assessment.title}`} onClick={() => openEditor(assessment)} className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:bg-brand-surface"><Pencil className="size-4" /></button>}
                            </div>
                        </article>;
                    })}
                </div>
            </section>

            {editing !== undefined && <div className="fixed inset-0 z-[150] flex justify-end bg-brand-navy/55 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setEditing(undefined); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="assessment-drawer-title" className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
                        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">Assessment</p><h2 id="assessment-drawer-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{editing ? "Edit assignment" : "Create assignment"}</h2></div>
                        <button type="button" onClick={() => setEditing(undefined)} disabled={isSaving} aria-label="Close assessment form" className="sprint-focus rounded-lg p-2 text-brand-text-secondary hover:bg-slate-100"><X className="size-5" /></button>
                    </div>
                    <form ref={formRef} className="flex-1 space-y-5 p-5 sm:p-7" onSubmit={(event: FormEvent) => { event.preventDefault(); void save(form.status); }}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className={`${labelClass} sm:col-span-2`}>Assessment title<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="e.g. Week 4 Python assessment" /></label>
                            <label className={labelClass}>Course<select required value={selectedCourseValue} onChange={(event) => selectCourse(event.target.value)} className={inputClass}>
                                <option value="">Select a course</option>
                                <CourseOptionGroups options={courseOptions} />
                            </select></label>
                            <label className={labelClass}>Batch<input required maxLength={120} value={form.batch_name} onChange={(event) => setForm({ ...form, batch_name: event.target.value })} className={inputClass} placeholder="Batch name" /></label>
                            <label className={labelClass}>Assessment type<input required maxLength={60} list="assessment-types" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={inputClass} placeholder="Assignment, quiz, project..." /><datalist id="assessment-types"><option value="Assignment" /><option value="Quiz" /><option value="Project" /><option value="Exam" /></datalist></label>
                            <label className={labelClass}>Maximum marks<input required type="number" min="0.01" step="any" value={form.max_marks} onChange={(event) => setForm({ ...form, max_marks: Number(event.target.value) })} className={inputClass} /></label>
                            <label className={labelClass}>Week / module<input maxLength={80} value={form.week_label} onChange={(event) => setForm({ ...form, week_label: event.target.value })} className={inputClass} placeholder="Week 4" /></label>
                            <label className={labelClass}>Mentor<input maxLength={120} value={form.mentor_name} onChange={(event) => setForm({ ...form, mentor_name: event.target.value })} className={inputClass} placeholder="Mentor name" /></label>
                            <label className={labelClass}>Due date<input type="date" value={dateOnly(form.due_date)} onChange={(event) => setForm({ ...form, due_date: event.target.value || null })} className={inputClass} /></label>
                            <label className={labelClass}>Submission method<select value={form.submission_type} onChange={(event) => setForm({ ...form, submission_type: event.target.value })} className={inputClass}><option>File Upload</option><option>Link</option><option>Text Entry</option></select></label>
                            <label className={`${labelClass} sm:col-span-2`}>Reference attachment URL<input type="url" value={form.attachment_url ?? ""} onChange={(event) => setForm({ ...form, attachment_url: event.target.value || null })} className={inputClass} placeholder="https://..." /></label>
                            <label className={`${labelClass} sm:col-span-2`}>Instructions<textarea rows={4} maxLength={4000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} placeholder="Share instructions and expectations." /></label>
                            {editing && <label className={labelClass}>Assignment status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AssessmentStatus })} className={inputClass}><option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option></select></label>}
                        </div>
                    </form>
                    <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end sm:px-7">
                        <button type="button" onClick={() => setEditing(undefined)} disabled={isSaving} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={() => void save(editing ? form.status : "draft")} disabled={isSaving} className="sprint-focus rounded-lg border border-brand-navy px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-slate-50 disabled:opacity-60">{isSaving ? "Saving…" : "Save draft"}</button>
                        <button type="button" onClick={() => void save(editing ? form.status : "active")} disabled={isSaving} className="sprint-focus inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-red/90 disabled:opacity-60">{isSaving && <LoaderCircle className="size-4 animate-spin" />}{editing ? "Save changes" : "Assign assessment"}</button>
                    </div>
                </section>
            </div>}

            {gradingAssessment && <div className="fixed inset-0 z-[160] flex justify-end bg-brand-navy/55 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setGradingAssessment(null); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="grading-drawer-title" className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
                    <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
                        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">Submissions · {gradingAssessment.batch_name}</p><h2 id="grading-drawer-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{gradingAssessment.title}</h2><p className="mt-1 text-sm text-brand-text-secondary">Maximum score: {gradingAssessment.max_marks}</p></div>
                        <button type="button" onClick={() => setGradingAssessment(null)} aria-label="Close grading drawer" className="sprint-focus rounded-lg p-2 text-brand-text-secondary hover:bg-slate-100"><X className="size-5" /></button>
                    </div>
                    {submissionError && <p role="alert" className="mx-5 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:mx-7">{submissionError}</p>}
                    <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
                        {loadingSubmissions ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-brand-text-secondary"><LoaderCircle className="size-5 animate-spin" /> Loading submissions…</div>
                            : submissions.length === 0 ? <div className="py-16 text-center"><FileText className="mx-auto size-10 text-slate-300" /><p className="mt-3 font-bold text-brand-navy">No submissions received</p></div>
                                : submissions.map((submission) => {
                                    const draft = gradeDrafts[submission.id] ?? { score: "", feedback: "" };
                                    const submissionLink = safeWebLink(submission.submission_url);
                                    const fileLink = safeWebLink(submission.file_signed_url);
                                    return <article key={submission.id} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                            <div><h3 className="font-bold text-brand-navy">{submission.student_name}</h3><p className="mt-0.5 text-xs text-brand-text-secondary">{submission.student_email || submission.student_id} · Submitted {formatDate(submission.submitted_at)}</p></div>
                                            <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${submission.status === "graded" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{submission.status.replace("_", " ")}</span>{submission.is_late && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">Late</span>}</div>
                                        </div>
                                        {submission.student_notes && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-brand-text-secondary">{submission.student_notes}</p>}
                                        {(submissionLink || fileLink) && <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                            {submissionLink && <a href={submissionLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-red hover:underline">Open submission <ExternalLink className="size-3.5" /></a>}
                                            {fileLink && <a href={fileLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-red hover:underline">View file <ExternalLink className="size-3.5" /></a>}
                                        </div>}
                                        {canEdit ? <div className="mt-4 grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-end">
                                            <label className={labelClass}>Score<input type="number" min="0" max={gradingAssessment.max_marks} step="any" value={draft.score} onChange={(event) => setGradeDrafts({ ...gradeDrafts, [submission.id]: { ...draft, score: event.target.value } })} className={inputClass} placeholder={`0–${gradingAssessment.max_marks}`} /></label>
                                            <label className={labelClass}>Mentor feedback<textarea rows={2} maxLength={3000} value={draft.feedback} onChange={(event) => setGradeDrafts({ ...gradeDrafts, [submission.id]: { ...draft, feedback: event.target.value } })} className={inputClass} placeholder="Feedback for the student" /></label>
                                            <button type="button" onClick={() => void saveGrade(submission)} disabled={savingGradeId === submission.id} className="sprint-focus inline-flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-3 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-60">{savingGradeId === submission.id ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{submission.status === "graded" ? "Update grade" : "Mark graded"}</button>
                                        </div> : submission.score !== null && <p className="mt-4 text-sm font-bold text-brand-navy">Score: {submission.score} / {gradingAssessment.max_marks}</p>}
                                    </article>;
                                })}
                    </div>
                </section>
            </div>}
        </main>
    );
}
