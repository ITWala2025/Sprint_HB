"use server";

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";

export type StudentDirectoryRegistration = {
    id: string;
    user_id?: string | null;
    registration_number: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    course_degree: string | null;
    college_institution: string | null;
    specialization_branch: string | null;
    year_semester: string | null;
    status: string;
    created_at: string;
    course: string | null;
    bundle: string | null;
};

export type StudentDirectoryEntry = {
    id: string;
    registration_number: string;
    status: string;
    college_institution: string | null;
    course_degree: string | null;
    specialization_branch: string | null;
    current_semester: string | null;
    employment_status: string | null;
    organization_name: string | null;
    city: string | null;
    state: string | null;
    profile: {
        full_name: string;
        email: string;
        phone: string | null;
        is_active: boolean;
    };
    registrations: StudentDirectoryRegistration[];
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

    const { data: students, error: studentError } = await supabase
        .from("students")
        .select("id, registration_number, college_institution, course_degree, specialization_branch, current_semester, employment_status, organization_name, city, state, created_at, status")
        .order("created_at", { ascending: false });

    if (studentError) {
        throw new Error(`Could not load the student directory: ${studentError.message}`);
    }

    const studentIds = (students ?? []).map((student) => student.id);
    let profileMap = new Map<string, { full_name: string; email: string; phone: string | null; is_active: boolean }>();
    let registrationRows: StudentDirectoryRegistration[] = [];

    if (studentIds.length > 0) {
        const [{ data: profilesData, error: profilesError }, { data: registrationsData, error: registrationsError }] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, full_name, email, phone, is_active")
                .in("id", studentIds),
            supabase
                .from("registrations")
                .select("id, registration_number, full_name, email, phone, course_degree, college_institution, specialization_branch, year_semester, status, created_at, user_id, course_id, bundle_id")
                .in("user_id", studentIds)
                .order("created_at", { ascending: false }),
        ]);

        if (profilesError) {
            throw new Error(`Could not load student profile details: ${profilesError.message}`);
        }
        if (registrationsError) {
            throw new Error(`Could not load registration history for students: ${registrationsError.message}`);
        }

        profileMap = new Map((profilesData ?? []).map((profile) => [profile.id, {
            full_name: profile.full_name ?? "Student",
            email: profile.email ?? "",
            phone: profile.phone ?? null,
            is_active: profile.is_active ?? true,
        }]));

        const courseIds = [...new Set((registrationsData ?? []).map((registration) => registration.course_id).filter((value): value is string => Boolean(value)))];
        const bundleIds = [...new Set((registrationsData ?? []).map((registration) => registration.bundle_id).filter((value): value is string => Boolean(value)))];
        const [coursesResult, bundlesResult] = await Promise.all([
            courseIds.length > 0
                ? supabase.from("courses").select("id, title").in("id", courseIds)
                : Promise.resolve({ data: [], error: null }),
            bundleIds.length > 0
                ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
                : Promise.resolve({ data: [], error: null }),
        ]);

        if (coursesResult.error) {
            throw new Error(`Could not load student course details: ${coursesResult.error.message}`);
        }
        if (bundlesResult.error) {
            throw new Error(`Could not load student bundle details: ${bundlesResult.error.message}`);
        }

        const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
        const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

        registrationRows = (registrationsData ?? []).map((registration) => ({
            id: registration.id,
            user_id: registration.user_id,
            registration_number: registration.registration_number,
            full_name: registration.full_name,
            email: registration.email,
            phone: registration.phone,
            course_degree: registration.course_degree,
            college_institution: registration.college_institution,
            specialization_branch: registration.specialization_branch,
            year_semester: registration.year_semester,
            status: registration.status,
            created_at: registration.created_at,
            course: registration.course_id ? courseTitles.get(registration.course_id) ?? null : null,
            bundle: registration.bundle_id ? bundleTitles.get(registration.bundle_id) ?? null : null,
        }));
    }

    return (students ?? []).map((student) => {
        const profile = profileMap.get(student.id) ?? {
            full_name: String(student.registration_number ?? "Student"),
            email: "",
            phone: null,
            is_active: true,
        };
        const studentRegistrations = registrationRows
            .filter((registration) => registration.user_id === student.id)
            .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

        return {
            id: student.id,
            registration_number: student.registration_number ?? "SPR-0000",
            status: student.status ?? "active",
            college_institution: student.college_institution ?? null,
            course_degree: student.course_degree ?? null,
            specialization_branch: student.specialization_branch ?? null,
            current_semester: student.current_semester ?? null,
            employment_status: student.employment_status ?? null,
            organization_name: student.organization_name ?? null,
            city: student.city ?? null,
            state: student.state ?? null,
            profile: {
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
                is_active: profile.is_active,
            },
            registrations: studentRegistrations,
        };
    });
}
