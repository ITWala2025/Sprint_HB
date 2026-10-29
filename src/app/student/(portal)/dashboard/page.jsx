import AnnouncementsCard from "@/components/student/dashboard/AnnouncementsCard";
import LearningProgress from "@/components/student/dashboard/LearningProgress";
import QuickActions from "@/components/student/dashboard/QuickActions";
import UpcomingLiveClasses from "@/components/student/dashboard/UpcomingLiveClasses";
import WelcomeBanner from "@/components/student/dashboard/WelcomeBanner";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bell } from "lucide-react";

export const metadata = {
  title: "Student Dashboard",
  description:
    "Your SPRINT learning dashboard — current course, cohort, progress, attendance, live classes and placements.",
  alternates: { canonical: "/student/dashboard" },
};

function getInitials(fullName) {
  const parts = String(fullName || "Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getFirstName(fullName) {
  const name = String(fullName || "Student").trim();
  const first = name.split(/\s+/).find(Boolean);
  return first || "Student";
}

async function getStudentDashboardContext() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      student: { id: "", fullName: "Student", firstName: "Student", initials: "S", email: "" },
      enrollment: null,
      progress: null,
      announcements: [],
    };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write refreshed auth cookies.
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/student/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/student/login");
  }

  const student = {
    id: profile.id,
    fullName: profile.full_name || "Student",
    firstName: getFirstName(profile.full_name),
    initials: getInitials(profile.full_name),
    email: profile.email || "",
  };

  const { data: studentRecord } = await supabase
    .from("students")
    .select("id, registration_number")
    .eq("id", profile.id)
    .maybeSingle();

  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, status, registration_number, created_at, course_id, batch_id")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "id, status, progress_percentage, enrolled_at, course_id, batch_id, courses:course_id(title, category), batches:batch_id(batch_name, start_date, end_date, mode, status)"
    )
    .eq("student_id", profile.id)
    .order("enrolled_at", { ascending: false });

  const activeEnrollment =
    enrollments?.find((item) => item.status === "active") ?? enrollments?.[0] ?? null;

  const enrollment = activeEnrollment
    ? {
        courseTitle: activeEnrollment.courses?.title ?? "Course pending",
        domain: activeEnrollment.courses?.category ?? "",
        cohortName: activeEnrollment.batches?.batch_name ?? "Pending cohort",
        cohortStart: activeEnrollment.batches?.start_date ?? null,
        cohortEnd: activeEnrollment.batches?.end_date ?? null,
        progressPercent: Number(activeEnrollment.progress_percentage ?? 0),
        mode: activeEnrollment.batches?.mode ?? "",
      }
    : null;

  const progress = enrollment
    ? {
        completionPercent: Number(enrollment.progressPercent ?? 0),
        status: enrollment.progressPercent > 0 ? "On track" : "Not started",
        lastUpdated: activeEnrollment?.enrolled_at ?? null,
      }
    : {
        completionPercent: 0,
        status: registrations?.some((registration) => registration.status === "pending")
          ? "Payment pending"
          : "No active enrollment",
        lastUpdated: null,
      };

  return {
    student: {
      ...student,
      registrationNumber: studentRecord?.registration_number ?? null,
    },
    enrollment,
    progress,
    announcements: [],
  };
}

export default async function StudentDashboardPage() {
  const { student, enrollment, progress, announcements } = await getStudentDashboardContext();
  const unreadCount = announcements.filter((item) => item.unread).length;

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <WelcomeBanner student={student}>
        <LearningProgress compact enrollment={enrollment} progress={progress} />
      </WelcomeBanner>

      <Link
        href="#dashboard-announcements"
        className="sprint-focus group flex min-h-12 items-center gap-3 rounded-lg border border-brand-border bg-brand-white px-4 py-2.5 text-sm transition-colors hover:border-brand-red hover:bg-brand-red-light"
      >
        <Bell className="size-4 shrink-0 text-brand-red" aria-hidden="true" />
        <span className="font-semibold text-brand-navy">Announcements</span>
        <span className="rounded-full bg-brand-red-light px-2 py-0.5 text-[11px] font-bold text-brand-red">
          {unreadCount} new
        </span>
        <ArrowRight
          className="ml-auto size-4 shrink-0 text-brand-text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      <UpcomingLiveClasses />

      <QuickActions />

      <AnnouncementsCard items={announcements} />
    </div>
  );
}
