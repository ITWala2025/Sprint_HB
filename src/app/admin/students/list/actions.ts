"use server";

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";

export type StudentCourseBadge = {
    kind: "course" | "bundle";
    title: string;
};

export type StudentDirectoryEntry = {
    id: string;
    name: string;
    email: string;
    phone: string;
    registrationNumber: string;
    college: string;
    status: string;
    activeCourses: StudentCourseBadge[];
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

export async function getStudentDirectory(): Promise<StudentDirectoryEntry[]> {
    await assertModuleAccess("student_ops");
    const supabase = await createAuthenticatedServerClient();
    const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, registration_number, college_institution, status, phone")
        .order("created_at", { ascending: false });

    if (studentsError) {
        throw new Error(`Could not load student directory records: ${studentsError.message}`);
    }
    if (!students?.length) return [];

    const studentIds = students.map((student) => student.id);
    const [profilesResult, studentCoursesResult] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, full_name, email, phone")
            .in("id", studentIds),
        supabase
            .from("student_courses")
            .select("student_id, course_id, bundle_id")
            .in("student_id", studentIds)
            .eq("status", "active"),
    ]);

    if (profilesResult.error) {
        throw new Error(`Could not load student profile details: ${profilesResult.error.message}`);
    }
    if (studentCoursesResult.error) {
        throw new Error(`Could not load active student course mappings: ${studentCoursesResult.error.message}`);
    }

    const courseIds = [...new Set(
        (studentCoursesResult.data ?? []).flatMap((record) => record.course_id ? [record.course_id] : []),
    )];
    const bundleIds = [...new Set(
        (studentCoursesResult.data ?? []).flatMap((record) => record.bundle_id ? [record.bundle_id] : []),
    )];
    const [coursesResult, bundlesResult] = await Promise.all([
        courseIds.length > 0
            ? supabase.from("courses").select("id, title").in("id", courseIds)
            : Promise.resolve({ data: [], error: null }),
        bundleIds.length > 0
            ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesResult.error) {
        throw new Error(`Could not load student course names: ${coursesResult.error.message}`);
    }
    if (bundlesResult.error) {
        throw new Error(`Could not load student career bundle names: ${bundlesResult.error.message}`);
    }

    const profilesById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
    const courseNames = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleNames = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));
    const coursesByStudentId = new Map<string, StudentCourseBadge[]>();

    for (const mapping of studentCoursesResult.data ?? []) {
        const badges = coursesByStudentId.get(mapping.student_id) ?? [];
        if (mapping.course_id) {
            badges.push({ kind: "course", title: courseNames.get(mapping.course_id) ?? "Course" });
        }
        if (mapping.bundle_id) {
            badges.push({ kind: "bundle", title: bundleNames.get(mapping.bundle_id) ?? "Career bundle" });
        }
        coursesByStudentId.set(mapping.student_id, badges);
    }

    return students.map((student) => {
        const profile = profilesById.get(student.id);
        return {
            id: student.id,
            name: profile?.full_name || student.registration_number || "Enrolled Student",
            email: profile?.email || "Not provided",
            phone: student.phone || profile?.phone || "Not provided",
            registrationNumber: student.registration_number || "Not provided",
            college: student.college_institution || "Not provided",
            status: student.status || "active",
            activeCourses: coursesByStudentId.get(student.id) ?? [],
        };
    });
}
