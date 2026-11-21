import DashboardBento from "@/components/student/dashboard/DashboardBento";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatApplicationId } from "@/lib/id-utils";
import { createServiceClient } from "@/lib/supabase/service";
import {
  filterAssessmentsByCourseAccess,
  filterLiveClassesByCourseAccess,
  getStudentCourseAccess,
} from "@/lib/student-assessment-access";
import { unstable_cache } from "next/cache";

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

function escapeIlike(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

async function fetchDashboardData(userId) {
  const db = createServiceClient();
  if (!db) {
    return {
      student: { id: "", fullName: "Student", firstName: "Student", initials: "S", email: "" },
      enrollment: null,
      applications: [],
      progress: null,
      announcements: [],
      activeCourseCount: 0,
      pendingAssignments: [],
      pendingAssignmentCount: 0,
      liveClasses: [],
      certificateCount: 0,
    };
  }

  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return {
      student: { id: "", fullName: "Student", firstName: "Student", initials: "S", email: "" },
      enrollment: null,
      applications: [],
      progress: null,
      announcements: [],
      activeCourseCount: 0,
      pendingAssignments: [],
      pendingAssignmentCount: 0,
      liveClasses: [],
      certificateCount: 0,
    };
  }

  const student = {
    id: profile.id,
    fullName: profile.full_name || "Student",
    firstName: getFirstName(profile.full_name),
    initials: getInitials(profile.full_name),
    email: profile.email || "",
  };

  let studentCourseAccess = { courseIds: new Set(), courseNames: new Set() };
  try {
    studentCourseAccess = await getStudentCourseAccess(db, userId);
  } catch (error) {
    console.warn("[StudentDashboard] Could not resolve approved student courses:", error);
  }
  const hasStudentCourseAccess =
    studentCourseAccess.courseIds.size > 0 || studentCourseAccess.courseNames.size > 0;

  const [
    { data: studentRecord, error: studentRecordError },
    { data: applicationRecords, error: applicationsError },
    { data: enrollmentsData, error: enrollmentsError },
    { data: studentCoursesData, error: studentCoursesError },
  ] = await Promise.all([
    db.from("students").select("id, registration_number").eq("id", profile.id).maybeSingle(),
    db.from("enrollments").select("id, application_number, status, created_at, course_id, bundle_id").or(`applicant_user_id.eq.${userId},student_id.eq.${userId}`).order("created_at", { ascending: false }),
    db.from("student_course_enrollments").select("id, status, progress_percentage, enrolled_at, course_id, batch_id, courses:course_id(title, category), batches:batch_id(batch_name, start_date, end_date, mode, status)").eq("student_id", profile.id).order("enrolled_at", { ascending: false }),
    db.from("student_courses").select("id, status, enrolled_at, course_id, bundle_id, courses:course_id(title, category), course_bundles:bundle_id(title, category)").eq("student_id", profile.id).eq("status", "active"),
  ]);

  const [
    { data: assessmentRows, error: assessmentsError },
    { data: submissionRows, error: submissionsError },
    { data: liveClassRows, error: liveClassesError },
    { data: announcementRows, error: announcementsError },
  ] = await Promise.all([
    hasStudentCourseAccess
      ? db.from("assessments")
          .select("*")
          .in("status", ["active", "closed"])
          .order("due_date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    db.from("assessment_submissions")
      .select("assessment_id, status")
      .eq("student_id", userId),
    db.from("live_classes")
      .select("id, title, course_name, batch_name, mentor_name, scheduled_at, duration_mins, platform, meeting_url")
      .or(`status.eq.live,and(status.eq.scheduled,scheduled_at.gte.${new Date().toISOString()})`)
      .order("scheduled_at", { ascending: true }),
    db.from("announcements")
      .select("id, type, message, created_at")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(5),
  ]);
  if (assessmentsError) console.warn("[StudentDashboard] Could not load assessments:", assessmentsError.message);
  if (submissionsError) console.warn("[StudentDashboard] Could not load assessment submissions:", submissionsError.message);
  if (liveClassesError) console.warn("[StudentDashboard] Could not load live classes:", liveClassesError.message);
  if (announcementsError) console.warn("[StudentDashboard] Could not load announcements:", announcementsError.message);

  if (studentRecordError) {
    console.warn("[StudentDashboard] Could not load student record:", studentRecordError.message);
  }

  let applications = [];
  if (applicationsError) {
    console.warn("[StudentDashboard] Could not load course applications:", applicationsError.message);
  } else {
    const courseIds = [...new Set((applicationRecords ?? []).flatMap((item) => item.course_id ? [item.course_id] : []))];
    const bundleIds = [...new Set((applicationRecords ?? []).flatMap((item) => item.bundle_id ? [item.bundle_id] : []))];
    const [coursesResult, bundlesResult] = await Promise.all([
      courseIds.length > 0
        ? db.from("courses").select("id, title").in("id", courseIds)
        : Promise.resolve({ data: [], error: null }),
      bundleIds.length > 0
        ? db.from("course_bundles").select("id, title").in("id", bundleIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesResult.error || bundlesResult.error) {
      console.warn(
        "[StudentDashboard] Could not load application course names:",
        [coursesResult.error?.message, bundlesResult.error?.message].filter(Boolean).join("; "),
      );
    }

    const courseTitles = new Map((coursesResult.data ?? []).map((item) => [item.id, item.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((item) => [item.id, item.title]));
    applications = (applicationRecords ?? []).map((application) => ({
      id: application.id,
      applicationId: formatApplicationId(application.application_number, application.id, application.created_at),
      status: application.status,
      createdAt: application.created_at,
      courseTitle:
        (application.course_id && courseTitles.get(application.course_id)) ||
        (application.bundle_id && bundleTitles.get(application.bundle_id)) ||
        "Course not selected",
    }));
  }

  let enrollments = [];
  let studentCourses = [];

  if (enrollmentsError) {
    console.warn("[StudentDashboard] Could not load active course enrollments:", enrollmentsError.message);
  } else {
    enrollments = enrollmentsData ?? [];
  }

  if (studentCoursesError) {
    console.warn("[StudentDashboard] Could not load student courses:", studentCoursesError.message);
  } else {
    studentCourses = studentCoursesData ?? [];
  }

  const activeEnrollment =
    enrollments?.find((item) => item.status === "active") ?? enrollments?.[0] ?? null;

  let fallbackEnrollmentCourse = null;
  if (!activeEnrollment && studentCourses && studentCourses.length > 0) {
    const sc = studentCourses[0];
    const courseTitle = sc.courses?.title || sc.course_bundles?.title || "Enrolled Course";
    const domain = sc.courses?.category || sc.course_bundles?.category || "";
    fallbackEnrollmentCourse = {
      courseTitle,
      domain,
      cohortName: "Enrolled Cohort",
      cohortStart: sc.enrolled_at,
      cohortEnd: null,
      progressPercent: 0,
      mode: "Hybrid",
    };
  }

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
    : fallbackEnrollmentCourse;

  const progress = enrollment
    ? {
        completionPercent: Number(enrollment.progressPercent ?? 0),
        status: enrollment.progressPercent > 0 ? "On track" : "Not started",
        lastUpdated: activeEnrollment?.enrolled_at ?? null,
      }
    : {
        completionPercent: 0,
        status: applications.some((application) => application.status === "pending")
          ? "Application under review"
          : "No active enrollment",
        lastUpdated: null,
      };

  const completedAssessmentIds = new Set((submissionRows ?? []).map((submission) => submission.assessment_id));
  const pendingAssignments = filterAssessmentsByCourseAccess(
    assessmentsError ? [] : assessmentRows ?? [],
    studentCourseAccess,
  )
    .filter((assessment) => assessment.status === "active" && !completedAssessmentIds.has(assessment.id))
    .map((assessment) => ({
      id: assessment.id,
      title: assessment.title,
      course_name: assessment.course_name,
      week_label: assessment.week_label,
      due_date: assessment.due_date,
    }));
  const liveClasses = filterLiveClassesByCourseAccess(
    liveClassesError ? [] : liveClassRows ?? [],
    studentCourseAccess,
  ).slice(0, 5);
  const activeCourseIds = new Set([
    ...(enrollments ?? [])
      .filter((item) => item.status === "active")
      .map((item) => item.course_id || item.bundle_id || item.id),
    ...(studentCourses ?? []).map((item) => item.course_id || item.bundle_id || item.id),
  ]);
  const announcements = (announcementsError ? [] : announcementRows ?? []).map((item) => ({
    id: item.id,
    title: item.message,
    body: "",
    tag: item.type || "Announcement",
    date: item.created_at,
    unread: false,
  }));

  return {
    student: {
      ...student,
      registrationNumber: studentRecord?.registration_number ?? null,
    },
    enrollment,
    applications,
    progress,
    announcements,
    activeCourseCount: activeCourseIds.size,
    pendingAssignments,
    pendingAssignmentCount: pendingAssignments.length,
    liveClasses,
    certificateCount: 0,
  };
}

const getCachedDashboardData = unstable_cache(
  async (userId) => fetchDashboardData(userId),
  ["student-dashboard"],
  {
    revalidate: 30,
    tags: ["student-dashboard"],
  }
);

export default async function StudentDashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/student/login");
  }

  const accountDb = createServiceClient() ?? supabase;
  const [{ data: profile, error: profileError }, { data: studentStatusRecord, error: studentError }] = await Promise.all([
    accountDb.from("profiles").select("is_active, email").eq("id", user.id).maybeSingle(),
    accountDb.from("students").select("status").eq("id", user.id).maybeSingle(),
  ]);

  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    redirect("/student/login?deactivated=1");
  }

  if (profileError || studentError || !profile) {
    await supabase.auth.signOut();
    redirect("/student/login");
  }

  let hasDeactivatedRegistration = false;
  if (!studentStatusRecord) {
    const registrations = accountDb.from("registrations").select("id").eq("status", "deactivated");
    const { data: byUserId, error: userIdError } = await registrations
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (userIdError) {
      await supabase.auth.signOut();
      redirect("/student/login");
    }

    if (byUserId) {
      hasDeactivatedRegistration = true;
    } else if (profile.email || user.email) {
      const { data: byEmail, error: emailError } = await accountDb
        .from("registrations")
        .select("id")
        .eq("status", "deactivated")
        .ilike("email", escapeIlike(profile.email || user.email))
        .limit(1)
        .maybeSingle();
      if (emailError) {
        await supabase.auth.signOut();
        redirect("/student/login");
      }
      hasDeactivatedRegistration = Boolean(byEmail);
    }
  }

  if (profile.is_active === false || studentStatusRecord?.status === "deactivated" || hasDeactivatedRegistration) {
    await supabase.auth.signOut();
    redirect("/student/login?deactivated=1");
  }

  const {
    student,
    enrollment,
    applications,
    progress,
    announcements,
    activeCourseCount,
    pendingAssignments,
    pendingAssignmentCount,
    liveClasses,
    certificateCount,
  } = await getCachedDashboardData(user.id);

  return (
    <DashboardBento
      student={student}
      enrollment={enrollment}
      progress={progress}
      activeCourseCount={activeCourseCount}
      pendingAssignments={pendingAssignments}
      pendingAssignmentCount={pendingAssignmentCount}
      certificateCount={certificateCount}
      applications={applications}
      liveClasses={liveClasses}
      announcements={announcements}
    />
  );
}