"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers3,
  Play,
  Sparkles,
  Video,
} from "lucide-react";

const WORKSPACE_TABS = ["Pending Assignments", "My Course Applications"];

function formatDate(value, options = { dateStyle: "medium" }) {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : new Intl.DateTimeFormat("en-IN", options).format(date);
}

function ProgressRing({ value }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative grid size-14 shrink-0 place-items-center">
      <svg viewBox="0 0 56 56" className="-rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#fb7185"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
        />
      </svg>
      <span className="absolute text-xs font-bold text-white">{progress}%</span>
    </div>
  );
}

function DashboardWorkspace({ assignments, applications, liveClasses, announcements }) {
  const [activeTab, setActiveTab] = useState(WORKSPACE_TABS[0]);
  const pendingAssignments = assignments ?? [];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dashboard workspace">
              {WORKSPACE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === tab ? "bg-brand-navy text-white" : "bg-brand-off-white text-brand-text-secondary hover:bg-brand-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link
              href={activeTab === WORKSPACE_TABS[0] ? "/student/assignments" : "/student/apply-course"}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
            >
              View All <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </header>

          {activeTab === WORKSPACE_TABS[0] ? (
            pendingAssignments.length ? (
              <ul className="mt-4 divide-y divide-brand-border">
                {pendingAssignments.slice(0, 4).map((assignment) => (
                  <li key={assignment.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-red">
                        <ClipboardList className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-brand-navy">{assignment.title}</p>
                        <p className="mt-0.5 truncate text-xs text-brand-text-muted">
                          {assignment.course_name || "Course"}{assignment.week_label ? ` · ${assignment.week_label}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 pl-12 sm:pl-0">
                      <span className="text-xs text-brand-text-secondary">Due {formatDate(assignment.due_date)}</span>
                      <Link href="/student/assignments" className="shrink-0 rounded-lg bg-brand-red-light px-3 py-2 text-xs font-bold text-brand-red hover:bg-rose-100">
                        Open
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-brand-border bg-brand-off-white px-5 py-8 text-center">
                <CheckCircle2 className="mx-auto size-7 text-emerald-600" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-brand-navy">You’re all caught up</p>
                <p className="mt-1 text-xs text-brand-text-secondary">New assignments will appear here.</p>
              </div>
            )
          ) : applications.length ? (
            <ul className="mt-4 divide-y divide-brand-border">
              {applications.slice(0, 4).map((application) => (
                <li key={application.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                      <GraduationCap className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand-navy">{application.courseTitle}</p>
                      <p className="mt-0.5 text-xs text-brand-text-muted">Submitted {formatDate(application.createdAt)}</p>
                    </div>
                  </div>
                  <span className="ml-12 w-fit rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-navy sm:ml-0">
                    {application.status === "pending" ? "Under review" : application.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-brand-border bg-brand-off-white px-5 py-8 text-center">
              <GraduationCap className="mx-auto size-7 text-brand-red" aria-hidden="true" />
              <p className="mt-2 text-sm font-bold text-brand-navy">No course applications yet</p>
              <Link href="/student/apply-course" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline">
                Browse courses <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="student-quick-actions" className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
          <h2 id="student-quick-actions" className="flex items-center gap-2 text-sm font-bold text-brand-navy">
            <Sparkles className="size-4 text-brand-red" aria-hidden="true" /> Quick Actions
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
              { label: "Resources", href: "/student/resources", icon: BookOpen },
              { label: "Results", href: "/student/result", icon: FileText },
              { label: "Certificates", href: "/student/certificates", icon: Award },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="group flex min-h-20 flex-col justify-between rounded-2xl border border-brand-border bg-brand-off-white p-3 transition hover:border-brand-red/40 hover:bg-rose-50">
                <Icon className="size-5 text-brand-red" aria-hidden="true" />
                <span className="mt-3 flex items-center justify-between text-xs font-bold text-brand-navy">
                  {label}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-5 lg:col-span-4">
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-brand-navy"><Video className="size-4 text-brand-red" aria-hidden="true" /> Upcoming Live Classes</h2>
              <p className="mt-1 text-xs text-brand-text-muted">Join your scheduled mentor sessions.</p>
            </div>
            <Link href="/student/my-course" aria-label="View course schedule" className="rounded-lg p-2 text-brand-text-muted hover:bg-brand-surface hover:text-brand-navy">
              <CalendarDays className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {liveClasses.length ? (
            <ul className="mt-4 space-y-3">
              {liveClasses.map((session) => (
                <li key={session.id} className="rounded-2xl border border-brand-border bg-brand-off-white p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      session.platform === "Zoom" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                    }`}>{session.platform}</span>
                    <span className="text-[11px] font-semibold text-brand-text-muted">
                      {formatDate(session.scheduled_at, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-brand-navy">{session.title}</h3>
                  <p className="mt-1 text-xs text-brand-text-secondary">{session.course_name} · {session.mentor_name || "Mentor"}</p>
                  {session.meeting_url && (
                    <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-3 py-2 text-xs font-bold text-white hover:bg-brand-navy-light">
                      <Play className="size-3.5" aria-hidden="true" /> Join Class <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-brand-border px-4 py-8 text-center">
              <Clock3 className="mx-auto size-6 text-brand-text-muted" aria-hidden="true" />
              <p className="mt-2 text-xs text-brand-text-secondary">No upcoming live classes scheduled.</p>
            </div>
          )}
        </section>

        <section id="dashboard-announcements" className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-brand-navy">
            <Layers3 className="size-4 text-brand-red" aria-hidden="true" /> Announcements
          </h2>
          {announcements.length ? (
            <ul className="mt-3 divide-y divide-brand-border">
              {announcements.slice(0, 4).map((announcement) => (
                <li key={announcement.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-brand-navy">{announcement.title}</p>
                  {announcement.body && announcement.body !== announcement.title && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-text-secondary">{announcement.body}</p>
                  )}
                  <p className="mt-1.5 text-[10px] text-brand-text-muted">
                    {announcement.tag}{announcement.date ? ` · ${formatDate(announcement.date)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-brand-off-white p-4 text-center text-xs text-brand-text-secondary">No announcements at this time.</p>
          )}
        </section>
      </aside>
    </div>
  );
}

export default function DashboardBento({
  student,
  enrollment,
  progress,
  activeCourseCount,
  pendingAssignments,
  pendingAssignmentCount,
  certificateCount,
  applications,
  liveClasses,
  announcements,
  profileCompletion = 0,
  hasApplicationsOrEnrollments = false,
  showWelcome = false,
}) {
  const isNewStudent = showWelcome || !hasApplicationsOrEnrollments;
  const completedProfile = Math.max(
    0,
    Math.min(100, Number(profileCompletion) || 0),
  );
  const stats = [
    { label: "Active Courses", value: activeCourseCount, icon: BookOpen, note: "Current enrollments" },
    { label: "Pending Assignments", value: pendingAssignmentCount, icon: ClipboardList, note: "Awaiting submission" },
    { label: "Overall Progress", value: `${Math.round(Number(progress?.completionPercent ?? 0))}%`, icon: CheckCircle2, note: enrollment?.courseTitle || "Learning journey" },
    { label: "Certificates", value: certificateCount, icon: Award, note: "Earned credentials" },
  ];

  return (
    <main className="space-y-5 lg:space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl bg-brand-navy p-5 text-white shadow-brand-card sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-200">Student workspace</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {isNewStudent
              ? `Welcome to SPRINT, ${student.firstName}!`
              : `Welcome back, ${student.firstName}`}
          </h1>
          <p className="mt-1 text-sm text-white/75">{enrollment?.courseTitle || "Your learning journey continues here."}</p>
          <Link href="/student/apply-course" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-red-dark">
            Browse Courses <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15">
          <ProgressRing value={progress?.completionPercent} />
          <div>
            <p className="text-sm font-bold">Learning progress</p>
            <p className="mt-0.5 text-xs text-white/70">{progress?.status || "Getting started"}</p>
          </div>
        </div>
      </section>

      {completedProfile < 100 ? (
        <section
          aria-labelledby="profile-completion-title"
          className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="profile-completion-title"
                className="text-sm font-bold text-brand-navy"
              >
                Complete Your Profile
              </h2>
              <span className="text-sm font-bold text-brand-red">
                {completedProfile}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completedProfile}
              className="mt-3 h-2 overflow-hidden rounded-full bg-brand-surface"
            >
              <div
                className="h-full rounded-full bg-brand-red transition-[width]"
                style={{ width: `${completedProfile}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-brand-text-secondary">
              Add your education, career details, and links to finish your profile.
            </p>
          </div>
          <Link
            href="/student/profile"
            className="mt-4 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-navy-dark sm:mt-0"
          >
            Complete Profile <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      <section aria-label="Student overview" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <article key={label} className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-brand-text-muted">{label}</p>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-red"><Icon className="size-4" aria-hidden="true" /></span>
            </div>
            <p className="mt-3 truncate font-display text-xl font-bold text-brand-navy">{value}</p>
            <p className="mt-1 truncate text-[11px] text-brand-text-muted">{note}</p>
          </article>
        ))}
      </section>

      <DashboardWorkspace
        assignments={pendingAssignments}
        applications={applications}
        liveClasses={liveClasses}
        announcements={announcements}
      />
    </main>
  );
}
