"use server";

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import { sanitizeStudentId } from "@/lib/id-utils";

export type StudentDirectoryEntry = {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    courseEnrolled: string;
    status: string;
    dateOfEnrollment: string;
    college: string;
    registrationNumber: string;
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
            .select("*")
            .order("created_at", { ascending: false });

        if (studentError) {
            console.error("Supabase students query error details:", studentError.message);
            return [];
        }

        if (!students || students.length === 0) {
            return [];
        }

        const studentIds = students.map((student) => student.id);

        const [
            { data: profilesData },
            { data: courseEnrollmentsData },
            { data: enrollmentsData },
            { data: registrationsData },
        ] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, full_name, email, phone, status, is_active")
                .in("id", studentIds),
            supabase
                .from("student_course_enrollments")
                .select("student_id, course_id, batch_id, status, enrolled_at, created_at")
                .in("student_id", studentIds),
            supabase
                .from("enrollments")
                .select("student_id, applicant_user_id, course_id, bundle_id, status, created_at, reviewed_at")
                .in("student_id", studentIds),
            supabase
                .from("registrations")
                .select("user_id, course_id, bundle_id, status, created_at")
                .in("user_id", studentIds),
        ]);

        const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));

        // Gather all course and bundle IDs to resolve titles
        const courseIds = new Set<string>();
        const bundleIds = new Set<string>();

        (courseEnrollmentsData ?? []).forEach((item) => {
            if (item.course_id) courseIds.add(item.course_id);
        });
        (enrollmentsData ?? []).forEach((item) => {
            if (item.course_id) courseIds.add(item.course_id);
            if (item.bundle_id) bundleIds.add(item.bundle_id);
        });
        (registrationsData ?? []).forEach((item) => {
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

            // Collect courses for this student
            const studentCourses: string[] = [];

            (courseEnrollmentsData ?? [])
                .filter((ce) => ce.student_id === student.id)
                .forEach((ce) => {
                    if (ce.course_id && courseTitleMap.has(ce.course_id)) {
                        studentCourses.push(courseTitleMap.get(ce.course_id)!);
                    }
                });

            (enrollmentsData ?? [])
                .filter((e) => e.student_id === student.id || e.applicant_user_id === student.id)
                .forEach((e) => {
                    if (e.course_id && courseTitleMap.has(e.course_id)) {
                        studentCourses.push(courseTitleMap.get(e.course_id)!);
                    }
                    if (e.bundle_id && bundleTitleMap.has(e.bundle_id)) {
                        studentCourses.push(bundleTitleMap.get(e.bundle_id)!);
                    }
                });

            (registrationsData ?? [])
                .filter((r) => r.user_id === student.id)
                .forEach((r) => {
                    if (r.course_id && courseTitleMap.has(r.course_id)) {
                        studentCourses.push(courseTitleMap.get(r.course_id)!);
                    }
                    if (r.bundle_id && bundleTitleMap.has(r.bundle_id)) {
                        studentCourses.push(bundleTitleMap.get(r.bundle_id)!);
                    }
                });

            const uniqueCourses = [...new Set(studentCourses)];
            const courseEnrolled = uniqueCourses.length > 0
                ? uniqueCourses.join(", ")
                : student.course_degree || "General Technology Track";

            // Determine date of enrollment
            const dates: string[] = [];
            (courseEnrollmentsData ?? [])
                .filter((ce) => ce.student_id === student.id)
                .forEach((ce) => {
                    if (ce.enrolled_at) dates.push(ce.enrolled_at);
                    else if (ce.created_at) dates.push(ce.created_at);
                });
            (enrollmentsData ?? [])
                .filter((e) => e.student_id === student.id)
                .forEach((e) => {
                    if (e.reviewed_at) dates.push(e.reviewed_at);
                    else if (e.created_at) dates.push(e.created_at);
                });
            (registrationsData ?? [])
                .filter((r) => r.user_id === student.id)
                .forEach((r) => {
                    if (r.created_at) dates.push(r.created_at);
                });
            if (student.created_at) {
                dates.push(student.created_at);
            }

            // Pick the earliest valid date
            const sortedDates = dates
                .filter((d) => !isNaN(new Date(d).getTime()))
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            const dateOfEnrollment = formatEnrollmentDate(sortedDates[0] || student.created_at);

            const studentId = sanitizeStudentId(
                student.registration_number,
                "SPR-2026-0000"
            );

            return {
                id: student.id,
                studentId,
                registrationNumber: studentId,
                name: profile?.full_name || student.full_name || studentId || "Enrolled Student",
                email: profile?.email || student.email || "student@sprint.institute",
                phone: profile?.phone || student.phone || "N/A",
                courseEnrolled,
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
