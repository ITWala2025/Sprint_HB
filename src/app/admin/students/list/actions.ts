"use server";

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import { sanitizeStudentId } from "@/lib/id-utils";

export type StudentCourseBadge = {
    kind: "course" | "bundle";
    title: string;
};

export type StudentDirectoryEntry = {
    id: string;
    studentId: string;
    registrationNumber: string;
    name: string;
    email: string;
    phone: string;
    courseEnrolled: string;
    activeCourses?: StudentCourseBadge[];
    status: string;
    dateOfEnrollment: string;
    college: string;
};

async function createAuthenticatedServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, publishableKey, {
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
}

function formatEnrollmentDate(value?: string | null): string {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export async function getStudentDirectory(): Promise<StudentDirectoryEntry[]> {
    await assertModuleAccess("student_ops");

    try {
        const supabase = await createAuthenticatedServerClient();
        const { data: students, error: studentError } = await supabase
            .from("students")
            .select("id, registration_number, college_institution, status, phone, created_at")
            .order("created_at", { ascending: false });

        if (studentError) {
            console.error("Supabase students query error details:", studentError.message);
            return [];
        }

        if (!students || students.length === 0) {
            return [];
        }

        const studentIds = students.map((student) => student.id);

        // 1. Fetch profiles for student identities
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, status, is_active")
            .in("id", studentIds);

        const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));
        const studentEmails = (profilesData ?? [])
            .map((p) => p.email?.trim().toLowerCase())
            .filter((e): e is string => Boolean(e));

        // 2. Query all database enrollment and registration sources
        // We match enrollments across student_id, applicant_user_id, and applicant email
        const enrollmentQueries = [
            supabase
                .from("enrollments")
                .select("id, student_id, applicant_user_id, email, course_id, bundle_id, status, created_at, reviewed_at")
                .in("student_id", studentIds),
            supabase
                .from("enrollments")
                .select("id, student_id, applicant_user_id, email, course_id, bundle_id, status, created_at, reviewed_at")
                .in("applicant_user_id", studentIds),
        ];

        if (studentEmails.length > 0) {
            enrollmentQueries.push(
                supabase
                    .from("enrollments")
                    .select("id, student_id, applicant_user_id, email, course_id, bundle_id, status, created_at, reviewed_at")
                    .in("email", studentEmails),
            );
        }

        const registrationQueries = [
            supabase
                .from("registrations")
                .select("id, user_id, email, course_id, bundle_id, status, created_at")
                .in("user_id", studentIds),
        ];

        if (studentEmails.length > 0) {
            registrationQueries.push(
                supabase
                    .from("registrations")
                    .select("id, user_id, email, course_id, bundle_id, status, created_at")
                    .in("email", studentEmails),
            );
        }

        const [
            studentCoursesResult,
            courseEnrollmentsResult,
            enrollmentResponses,
            registrationResponses,
        ] = await Promise.all([
            // Active junction table from Student Enrollment Approval migration
            supabase
                .from("student_courses")
                .select("student_id, course_id, bundle_id, status, enrolled_at")
                .in("student_id", studentIds)
                .eq("status", "active"),
            // Course participation table
            supabase
                .from("student_course_enrollments")
                .select("student_id, course_id, batch_id, status, enrolled_at, created_at")
                .in("student_id", studentIds),
            Promise.all(enrollmentQueries),
            Promise.all(registrationQueries),
        ]);

        const studentCoursesData = studentCoursesResult.data ?? [];
        const courseEnrollmentsData = courseEnrollmentsResult.data ?? [];

        // Deduplicate enrollments by id
        const enrollmentMap = new Map<string, any>();
        enrollmentResponses.forEach((res) => {
            (res.data ?? []).forEach((row) => {
                if (row?.id) enrollmentMap.set(row.id, row);
            });
        });
        const allEnrollments = [...enrollmentMap.values()];

        // Deduplicate registrations by id
        const registrationMap = new Map<string, any>();
        registrationResponses.forEach((res) => {
            (res.data ?? []).forEach((row) => {
                if (row?.id) registrationMap.set(row.id, row);
            });
        });
        const allRegistrations = [...registrationMap.values()];

        // Gather all course and bundle IDs across all tables
        const courseIds = new Set<string>();
        const bundleIds = new Set<string>();

        studentCoursesData.forEach((item) => {
            if (item.course_id) courseIds.add(item.course_id);
            if (item.bundle_id) bundleIds.add(item.bundle_id);
        });
        courseEnrollmentsData.forEach((item) => {
            if (item.course_id) courseIds.add(item.course_id);
        });
        allEnrollments.forEach((item) => {
            if (item.course_id) courseIds.add(item.course_id);
            if (item.bundle_id) bundleIds.add(item.bundle_id);
        });
        allRegistrations.forEach((item) => {
            if (item.course_id) courseIds.add(item.course_id);
            if (item.bundle_id) bundleIds.add(item.bundle_id);
        });

        const [
            { data: coursesData },
            { data: bundlesData },
        ] = await Promise.all([
            courseIds.size > 0
                ? supabase.from("courses").select("id, title").in("id", [...courseIds])
                : Promise.resolve({ data: [] }),
            bundleIds.size > 0
                ? supabase.from("course_bundles").select("id, title").in("id", [...bundleIds])
                : Promise.resolve({ data: [] }),
        ]);

        const courseTitleMap = new Map((coursesData ?? []).map((c) => [c.id, c.title]));
        const bundleTitleMap = new Map((bundlesData ?? []).map((b) => [b.id, b.title]));

        return students.map((student) => {
            const profile = profileMap.get(student.id);
            const studentEmail = profile?.email?.trim().toLowerCase();

            // Collect courses from all database enrollment sources
            const studentBadges: StudentCourseBadge[] = [];
            const courseTitlesList: string[] = [];

            // A) Check student_courses table
            studentCoursesData
                .filter((sc) => sc.student_id === student.id)
                .forEach((sc) => {
                    if (sc.course_id && courseTitleMap.has(sc.course_id)) {
                        const title = courseTitleMap.get(sc.course_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "course", title });
                    }
                    if (sc.bundle_id && bundleTitleMap.has(sc.bundle_id)) {
                        const title = bundleTitleMap.get(sc.bundle_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "bundle", title });
                    }
                });

            // B) Check student_course_enrollments table
            courseEnrollmentsData
                .filter((ce) => ce.student_id === student.id)
                .forEach((ce) => {
                    if (ce.course_id && courseTitleMap.has(ce.course_id)) {
                        const title = courseTitleMap.get(ce.course_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "course", title });
                    }
                });

            // C) Check enrollments table (matching student_id, applicant_user_id, or email)
            allEnrollments
                .filter((e) =>
                    e.student_id === student.id ||
                    e.applicant_user_id === student.id ||
                    (studentEmail && e.email?.trim().toLowerCase() === studentEmail),
                )
                .forEach((e) => {
                    if (e.course_id && courseTitleMap.has(e.course_id)) {
                        const title = courseTitleMap.get(e.course_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "course", title });
                    }
                    if (e.bundle_id && bundleTitleMap.has(e.bundle_id)) {
                        const title = bundleTitleMap.get(e.bundle_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "bundle", title });
                    }
                });

            // D) Check legacy registrations table (matching user_id or email)
            allRegistrations
                .filter((r) =>
                    r.user_id === student.id ||
                    (studentEmail && r.email?.trim().toLowerCase() === studentEmail),
                )
                .forEach((r) => {
                    if (r.course_id && courseTitleMap.has(r.course_id)) {
                        const title = courseTitleMap.get(r.course_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "course", title });
                    }
                    if (r.bundle_id && bundleTitleMap.has(r.bundle_id)) {
                        const title = bundleTitleMap.get(r.bundle_id)!;
                        courseTitlesList.push(title);
                        studentBadges.push({ kind: "bundle", title });
                    }
                });

            // Deduplicate badges and titles
            const uniqueTitles = [...new Set(courseTitlesList.filter(Boolean))];
            const seenBadgeKeys = new Set<string>();
            const uniqueBadges = studentBadges.filter((b) => {
                const key = `${b.kind}:${b.title}`;
                if (seenBadgeKeys.has(key)) return false;
                seenBadgeKeys.add(key);
                return true;
            });

            // STRICT REQUIREMENT: No mock data fallbacks. If no database enrollment is found, show "Not enrolled".
            const courseEnrolled = uniqueTitles.length > 0
                ? uniqueTitles.join(", ")
                : "Not enrolled";

            // Determine date of enrollment from authentic database timestamps
            const dates: string[] = [];
            studentCoursesData
                .filter((sc) => sc.student_id === student.id)
                .forEach((sc) => {
                    if (sc.enrolled_at) dates.push(sc.enrolled_at);
                });
            courseEnrollmentsData
                .filter((ce) => ce.student_id === student.id)
                .forEach((ce) => {
                    if (ce.enrolled_at) dates.push(ce.enrolled_at);
                    else if (ce.created_at) dates.push(ce.created_at);
                });
            allEnrollments
                .filter((e) =>
                    e.student_id === student.id ||
                    e.applicant_user_id === student.id ||
                    (studentEmail && e.email?.trim().toLowerCase() === studentEmail),
                )
                .forEach((e) => {
                    if (e.reviewed_at) dates.push(e.reviewed_at);
                    else if (e.created_at) dates.push(e.created_at);
                });
            allRegistrations
                .filter((r) =>
                    r.user_id === student.id ||
                    (studentEmail && r.email?.trim().toLowerCase() === studentEmail),
                )
                .forEach((r) => {
                    if (r.created_at) dates.push(r.created_at);
                });
            if (student.created_at) {
                dates.push(student.created_at);
            }

            // Pick the earliest valid timestamp
            const sortedDates = dates
                .filter((d) => !isNaN(new Date(d).getTime()))
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            const dateOfEnrollment = formatEnrollmentDate(sortedDates[0] || student.created_at);

            const studentId = sanitizeStudentId(
                student.registration_number,
                "SPR-2026-0000",
            );

            return {
                id: student.id,
                studentId,
                registrationNumber: studentId,
                name: profile?.full_name || studentId,
                email: profile?.email || "student@sprint.institute",
                phone: student.phone || profile?.phone || "N/A",
                courseEnrolled,
                activeCourses: uniqueBadges,
                college: student.college_institution || "SPRINT Campus Institute",
                status: student.status || profile?.status || "active",
                dateOfEnrollment,
            };
        });
    } catch (error) {
        console.error("Student Directory Error:", error);
        return [];
    }
}
