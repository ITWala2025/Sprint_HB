"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Search,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStudentData } from "./StudentDataProvider";

const FILE_LIMIT = 10 * 1024 * 1024;
const FILE_TYPES = {
  pdf: ["application/pdf"],
  zip: ["application/zip", "application/x-zip-compressed"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
};
const TABS = ["All", "Pending", "Submitted", "Graded"];

function getFileExtension(name) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedSubmissionFile(file) {
  const extension = getFileExtension(file.name);
  return Boolean(FILE_TYPES[extension]?.includes(file.type));
}

function formatDate(value) {
  if (!value) return "No date set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "No date set"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function getSubmissionLabel(submission, assessment) {
  if (submission?.status === "graded") return "Graded";
  if (submission?.status === "under_review") return "Under Review";
  if (submission) return "Submitted";
  return assessment.status === "closed" ? "Closed" : "Pending";
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    Submitted: "bg-blue-50 text-blue-700 ring-blue-200",
    "Under Review": "bg-violet-50 text-violet-700 ring-violet-200",
    Graded: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Closed: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}

function AssignmentDrawer({ assessment, submission, onClose, onSaved }) {
  const { refreshPendingAssignmentCount } = useStudentData();
  const [url, setUrl] = useState(submission?.submission_url ?? "");
  const [notes, setNotes] = useState(submission?.student_notes ?? "");
  const [file, setFile] = useState(null);
  const [signedFileUrl, setSignedFileUrl] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClient(), []);
  const isGraded = submission?.status === "graded";
  const canSubmit = assessment.status === "active" && !isGraded;

  useEffect(() => {
    if (!submission?.file_url) return;
    let active = true;
    setLoadingFile(true);
    const resolveFileUrl = async () => {
      if (/^https?:\/\//i.test(submission.file_url)) {
        if (active) setSignedFileUrl(submission.file_url);
        return;
      }
      const { data, error: signedUrlError } = await supabase.storage
        .from("assessment-uploads")
        .createSignedUrl(submission.file_url, 60 * 60);
      if (signedUrlError) throw signedUrlError;
      if (active) setSignedFileUrl(data.signedUrl);
    };

    resolveFileUrl()
      .catch((fileError) => {
        if (active) setError(`Submission file could not be opened: ${fileError.message}`);
      })
      .finally(() => {
        if (active) setLoadingFile(false);
      });

    return () => {
      active = false;
    };
  }, [submission?.file_url, supabase]);

  async function submit(event) {
    event.preventDefault();
    if (!url.trim() && !file) {
      setError("Add a GitHub/Live URL or choose a file to submit.");
      return;
    }
    if (file && !isAllowedSubmissionFile(file)) {
      setError("Choose a PDF, ZIP, PNG, JPG, or JPEG file.");
      return;
    }
    if (file && file.size > FILE_LIMIT) {
      setError("Files must be 10 MB or smaller.");
      return;
    }
    if (url.trim()) {
      try {
        const parsed = new URL(url.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      } catch {
        setError("Enter a valid GitHub or live project URL starting with https://.");
        return;
      }
    }

    setSaving(true);
    setError("");
    let uploadedPath = null;
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Please sign in again to submit your assignment.");

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
        uploadedPath = `submissions/${assessment.id}/${user.id}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("assessment-uploads")
          .upload(uploadedPath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
      }

      const payload = {
        assessment_id: assessment.id,
        student_id: user.id,
        submission_url: url.trim() || null,
        file_url: uploadedPath || submission?.file_url || null,
        student_notes: notes.trim() || null,
        status: "submitted",
        is_late: Boolean(assessment.due_date && new Date() > new Date(assessment.due_date)),
        submitted_at: new Date().toISOString(),
      };
      const writeResult = submission
        ? await supabase
            .from("assessment_submissions")
            .update(payload)
            .eq("id", submission.id)
            .select("id, assessment_id, student_id, submission_url, file_url, student_notes, status, score, mentor_feedback, is_late, submitted_at, graded_at")
            .single()
        : await supabase
            .from("assessment_submissions")
            .insert(payload)
            .select("id, assessment_id, student_id, submission_url, file_url, student_notes, status, score, mentor_feedback, is_late, submitted_at, graded_at")
            .single();
      if (writeResult.error) throw writeResult.error;

      onSaved(writeResult.data);
      await refreshPendingAssignmentCount?.();
      onClose();
    } catch (submitError) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("assessment-uploads")
          .remove([uploadedPath]);
        if (cleanupError) {
          console.error("[Assignments] Could not remove an unlinked upload:", cleanupError.message);
        }
      }
      setError(`Assignment could not be submitted: ${submitError.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-brand-navy/55 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-drawer-title"
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-brand-border bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-red">
              {assessment.course_name || "Course"} · {assessment.week_label || "Assignment"}
            </p>
            <h2 id="assignment-drawer-title" className="mt-1 font-display text-xl font-bold text-brand-navy">
              {assessment.title}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close assignment drawer" className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-border text-brand-navy hover:bg-brand-surface disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-6 p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-brand-off-white p-3">
              <p className="text-[11px] font-semibold text-brand-text-muted">Due date</p>
              <p className="mt-1 text-sm font-bold text-brand-navy">{formatDate(assessment.due_date)}</p>
            </div>
            <div className="rounded-2xl bg-brand-off-white p-3">
              <p className="text-[11px] font-semibold text-brand-text-muted">Maximum marks</p>
              <p className="mt-1 text-sm font-bold text-brand-navy">{assessment.max_marks ?? "—"}</p>
            </div>
          </div>

          <section>
            <h3 className="text-sm font-bold text-brand-navy">Instructions</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-text-secondary">
              {assessment.description || "No additional instructions provided."}
            </p>
            {assessment.attachment_url && (
              <a href={assessment.attachment_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline">
                <ExternalLink className="size-4" aria-hidden="true" /> Open assignment materials
              </a>
            )}
          </section>

          {submission && (
            <section className="rounded-2xl border border-brand-border p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-navy">
                {isGraded ? <Award className="size-4 text-brand-red" /> : <FileText className="size-4 text-brand-red" />}
                Your submission
              </h3>
              {submission.submission_url && (
                <a href={submission.submission_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 break-all text-sm font-semibold text-brand-red hover:underline">
                  Open submitted URL <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              )}
              {submission.file_url && (
                <p className="mt-2 text-sm">
                  {loadingFile ? "Preparing your file…" : signedFileUrl ? (
                    <a href={signedFileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-red hover:underline">Open submitted file</a>
                  ) : "Your file is attached."}
                </p>
              )}
              {submission.student_notes && <p className="mt-3 whitespace-pre-wrap text-sm text-brand-text-secondary">{submission.student_notes}</p>}
              {isGraded && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-900">
                    Score: {submission.score ?? "—"} / {assessment.max_marks ?? "—"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">
                    {submission.mentor_feedback || "No mentor feedback provided."}
                  </p>
                  {submission.graded_at && <p className="mt-2 text-xs text-emerald-800">Graded {formatDate(submission.graded_at)}</p>}
                </div>
              )}
            </section>
          )}

          {canSubmit && (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="text-sm font-bold text-brand-navy">Submit your work</h3>
              <label className="block text-sm font-semibold text-brand-navy">
                GitHub or live project URL
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-2 w-full rounded-xl border border-brand-border px-3.5 py-3 text-sm outline-none focus:border-brand-red"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-navy">
                Upload a file <span className="font-normal text-brand-text-muted">(PDF, ZIP, PNG, JPG · up to 10 MB)</span>
                <input
                  type="file"
                  accept=".pdf,.zip,.png,.jpg,.jpeg,application/pdf,application/zip,image/png,image/jpeg"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-red-light file:px-3 file:py-2 file:text-xs file:font-bold file:text-brand-red"
                />
                {file && <span className="mt-1 block text-xs text-brand-text-muted">{file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB</span>}
              </label>
              <label className="block text-sm font-semibold text-brand-navy">
                Notes <span className="font-normal text-brand-text-muted">(optional)</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-y rounded-xl border border-brand-border px-3.5 py-3 text-sm outline-none focus:border-brand-red"
                />
              </label>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60">
                <Upload className="size-4" aria-hidden="true" />
                {saving ? "Submitting…" : submission ? "Update Submission" : "Submit Assignment"}
              </button>
            </form>
          )}
          {error && !canSubmit && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
        </div>
      </aside>
    </div>
  );
}

export default function AssignmentsClient({
  initialAssessments = [],
  initialSubmissions = [],
  initialError = "",
}) {
  const assessments = initialAssessments;
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All courses");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const loading = false;
  const [error, setError] = useState(initialError);

  const submissionByAssessment = useMemo(
    () => new Map(submissions.map((submission) => [submission.assessment_id, submission])),
    [submissions],
  );
  const pendingCount = assessments.filter((assessment) =>
    assessment.status === "active" && !submissionByAssessment.has(assessment.id),
  ).length;
  const reviewCount = submissions.filter((submission) =>
    ["submitted", "under_review"].includes(submission.status),
  ).length;
  const gradedSubmissions = submissions.filter((submission) => submission.status === "graded");
  const average = gradedSubmissions.length
    ? Math.round(gradedSubmissions.reduce((sum, submission) => {
        const assessment = assessments.find((item) => item.id === submission.assessment_id);
        return sum + (Number(assessment?.max_marks) > 0
          ? Number(submission.score ?? 0) / Number(assessment.max_marks) * 100
          : 0);
      }, 0) / gradedSubmissions.length)
    : 0;
  const courses = useMemo(
    () => [...new Set(assessments.map((assessment) => assessment.course_name).filter(Boolean))].sort(),
    [assessments],
  );
  const filteredAssessments = assessments.filter((assessment) => {
    const submission = submissionByAssessment.get(assessment.id);
    const status = getSubmissionLabel(submission, assessment);
    if (activeTab === "Pending" && status !== "Pending") return false;
    if (activeTab === "Submitted" && !["Submitted", "Under Review"].includes(status)) return false;
    if (activeTab === "Graded" && status !== "Graded") return false;
    if (course !== "All courses" && assessment.course_name !== course) return false;
    const query = search.trim().toLowerCase();
    if (query && ![assessment.title, assessment.course_name, assessment.mentor_name]
      .some((value) => String(value ?? "").toLowerCase().includes(query))) return false;
    return true;
  });

  const stats = [
    { label: "Total Assignments", value: assessments.length, icon: BookOpen, tone: "text-brand-navy", iconTone: "bg-brand-surface text-brand-navy" },
    { label: "Pending", value: pendingCount, icon: Clock3, tone: "text-amber-700", iconTone: "bg-amber-50 text-amber-700" },
    { label: "Under Review", value: reviewCount, icon: FileText, tone: "text-violet-700", iconTone: "bg-violet-50 text-violet-700" },
    { label: "Graded", value: `${gradedSubmissions.length} · ${average}% avg`, icon: CheckCircle2, tone: "text-emerald-700", iconTone: "bg-emerald-50 text-emerald-700" },
  ];

  function saveSubmission(updatedSubmission) {
    setSubmissions((current) => [
      ...current.filter((item) => item.assessment_id !== updatedSubmission.assessment_id),
      updatedSubmission,
    ]);
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Learning</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-brand-navy sm:text-3xl">My Assignments</h1>
          <p className="mt-1 text-sm text-brand-text-secondary">Track your work, submit projects, and review mentor feedback.</p>
        </div>
        <Link href="/student/resources" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline">
          Learning resources <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <section aria-label="Assignment statistics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone, iconTone }) => (
          <article key={label} className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-brand-text-muted">{label}</span>
              <span className={`grid size-9 place-items-center rounded-xl ${iconTone}`}><Icon className="size-4" aria-hidden="true" /></span>
            </div>
            <p className={`mt-3 font-display text-xl font-bold ${tone}`}>{loading ? "—" : value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Filter assignments" className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-brand-navy text-white" : "bg-brand-off-white text-brand-text-secondary hover:bg-brand-surface"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_190px]">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-text-muted" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assignments" aria-label="Search assignments" className="w-full rounded-xl border border-brand-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-red" />
            </label>
            <select value={course} onChange={(event) => setCourse(event.target.value)} aria-label="Filter by course" className="rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-navy outline-none focus:border-brand-red">
              <option>All courses</option>
              {courses.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
        </div>
      </section>

      {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="rounded-2xl border border-brand-border bg-white p-8 text-center text-sm text-brand-text-secondary">Loading assignments…</div>
      ) : filteredAssessments.length ? (
        <section aria-label="Assignments" className="grid gap-4 xl:grid-cols-2">
          {filteredAssessments.map((assessment) => {
            const submission = submissionByAssessment.get(assessment.id);
            const status = getSubmissionLabel(submission, assessment);
            const cta = status === "Graded" ? "View Feedback"
              : submission ? "View Submission"
                : assessment.status === "closed" ? "Assignment Closed" : "Submit Assignment";
            return (
              <article key={assessment.id} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-red-light px-3 py-1 text-[11px] font-bold text-brand-red">
                    {assessment.course_name || "Course"}{assessment.week_label ? ` · ${assessment.week_label}` : ""}
                  </span>
                  <StatusBadge status={status} />
                </div>
                <div className="mt-4">
                  <h2 className="font-display text-lg font-bold text-brand-navy">{assessment.title}</h2>
                  {assessment.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-brand-text-secondary">{assessment.description}</p>}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div><dt className="text-brand-text-muted">Mentor</dt><dd className="mt-0.5 font-semibold text-brand-navy">{assessment.mentor_name || "Not assigned"}</dd></div>
                  <div><dt className="text-brand-text-muted">Maximum marks</dt><dd className="mt-0.5 font-semibold text-brand-navy">{assessment.max_marks ?? "—"}</dd></div>
                  <div><dt className="text-brand-text-muted">Submission</dt><dd className="mt-0.5 font-semibold capitalize text-brand-navy">{assessment.submission_type || "Link or file"}</dd></div>
                  <div><dt className="text-brand-text-muted">{submission ? "Submitted" : "Due"}</dt><dd className="mt-0.5 font-semibold text-brand-navy">{formatDate(submission?.submitted_at || assessment.due_date)}</dd></div>
                </dl>
                {submission?.status === "graded" && (
                  <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                    Score: {submission.score ?? "—"} / {assessment.max_marks ?? "—"}
                  </p>
                )}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border pt-4">
                  {submission?.is_late && <span className="text-xs font-semibold text-amber-700">Submitted late</span>}
                  {!submission?.is_late && <span className="text-xs text-brand-text-muted">Batch: {assessment.batch_name || "—"}</span>}
                  <button
                    type="button"
                    disabled={cta === "Assignment Closed"}
                    onClick={() => setSelectedAssessment(assessment)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {cta} <ArrowUpRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-border bg-white px-6 py-12 text-center">
          <CalendarDays className="mx-auto size-8 text-brand-red" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-bold text-brand-navy">{assessments.length ? "No matching assignments" : "No assignments yet"}</h2>
          <p className="mt-1 text-sm text-brand-text-secondary">{assessments.length ? "Adjust your filters to see other assignments." : "New assessments from your mentors will appear here."}</p>
        </div>
      )}

      {selectedAssessment && (
        <AssignmentDrawer
          assessment={selectedAssessment}
          submission={submissionByAssessment.get(selectedAssessment.id)}
          onClose={() => setSelectedAssessment(null)}
          onSaved={saveSubmission}
        />
      )}
    </main>
  );
}
