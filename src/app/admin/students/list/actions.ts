"use server";

import "server-only";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";

export type StudentDirectoryRegistration = {
    id: string;
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

async function getApprovedRegistrationFallback(
    supabase: NonNullable<ReturnType<typeof createServiceClient>>,
): Promise<StudentDirectoryEntry[]> {
    const { data: registrations, error } = await supabase
        .from("registrations")
        .select("id, user_id, registration_number, full_name, email, phone, course_id, bundle_id, course_degree, college_institution, specialization_branch, year_semester, status, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    if (error) throw error;
    if (!registrations?.length) return [];

    const userIds = [...new Set(registrations.flatMap((registration) => registration.user_id ? [registration.user_id] : []))];
    const courseIds = [...new Set(registrations.flatMap((registration) => registration.course_id ? [registration.course_id] : []))];
    const bundleIds = [...new Set(registrations.flatMap((registration) => registration.bundle_id ? [registration.bundle_id] : []))];
    const [profilesResult, coursesResult, bundlesResult] = await Promise.all([
        userIds.length > 0
            ? supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds)
            : Promise.resolve({ data: [], error: null }),
        courseIds.length > 0
            ? supabase.from("courses").select("id, title").in("id", courseIds)
            : Promise.resolve({ data: [], error: null }),
        bundleIds.length > 0
            ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResult.error) console.error("Student Directory Error:", profilesResult.error);
    if (coursesResult.error) console.error("Student Directory Error:", coursesResult.error);
    if (bundlesResult.error) console.error("Student Directory Error:", bundlesResult.error);

    const profilesById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
    const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

    return registrations.map((registration) => {
        const profile = registration.user_id ? profilesById.get(registration.user_id) : null;
        const directoryRegistration: StudentDirectoryRegistration = {
            id: registration.id,
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
        };

        return {
            id: registration.user_id
                ? `${registration.user_id}:${registration.id}`
                : registration.id,
            registration_number: registration.registration_number || "N/A",
            status: "active",
            college_institution: registration.college_institution || "SPRINT Campus Institute",
            course_degree: registration.course_degree || "General Technology Track",
            specialization_branch: registration.specialization_branch,
            current_semester: registration.year_semester,
            employment_status: null,
            organization_name: null,
            city: null,
            state: null,
            profile: {
                full_name: profile?.full_name || registration.full_name || registration.registration_number || "Enrolled Student",
                email: profile?.email || registration.email || registration.phone || "N/A",
                phone: profile?.phone || registration.phone || null,
                is_active: true,
            },
            registrations: [directoryRegistration],
        };
    });
}

export async function getStudentDirectory(): Promise<StudentDirectoryEntry[]> {
    await assertModuleAccess("student_ops");
    try {
        const supabase = createServiceClient();
        if (!supabase) {
            console.error("[student-directory] Service-role Supabase client is not configured.");
            return [];
        }

        const { data: students, error: studentsError } = await supabase
            .from("students")
            .select("*")
            .order("created_at", { ascending: false });

        if (studentsError) {
            throw studentsError;
        }
        if (!students?.length) {
            console.warn("[student-directory] No student records were found; falling back to approved registrations.");
            return await getApprovedRegistrationFallback(supabase);
        }

        const studentIds = students.map((student) => student.id);
        const studentIdSet = new Set(studentIds);
        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, is_active")
            .in("id", studentIds);

        if (profilesError) {
            console.error("Student Directory Error:", profilesError);
        }

        const registrationNumbers = students
            .map((student) => student.registration_number)
            .filter((registrationNumber): registrationNumber is string => Boolean(registrationNumber));
        const registrationFields = "id, user_id, registration_number, full_name, email, phone, course_id, bundle_id, course_degree, college_institution, specialization_branch, year_semester, status, created_at";
        const [registrationsByUserResult, registrationsByNumberResult] = await Promise.all([
            studentIds.length > 0
                ? supabase
                    .from("registrations")
                    .select(registrationFields)
                    .in("user_id", studentIds)
                    .order("created_at", { ascending: false })
                : Promise.resolve({ data: [], error: null }),
            registrationNumbers.length > 0
                ? supabase
                    .from("registrations")
                    .select(registrationFields)
                    .in("registration_number", registrationNumbers)
                    .order("created_at", { ascending: false })
                : Promise.resolve({ data: [], error: null }),
        ]);

        const registrationLookupErrors = [
            registrationsByUserResult.error,
            registrationsByNumberResult.error,
        ].filter(Boolean);
        if (registrationLookupErrors.length > 0) {
            registrationLookupErrors.forEach((error) => console.error("Student Directory Error:", error));
        }

        const registrationById = new Map(
            [
                ...(registrationsByUserResult.error ? [] : registrationsByUserResult.data ?? []),
                ...(registrationsByNumberResult.error ? [] : registrationsByNumberResult.data ?? []),
            ].map((registration) => [registration.id, registration]),
        );
        const registrations = [...registrationById.values()]
            .sort((left, right) => right.created_at.localeCompare(left.created_at));

        const courseIds = [...new Set(registrations.flatMap((registration) => registration.course_id ? [registration.course_id] : []))];
        const bundleIds = [...new Set(registrations.flatMap((registration) => registration.bundle_id ? [registration.bundle_id] : []))];
        const [coursesResult, bundlesResult] = await Promise.all([
            courseIds.length > 0
                ? supabase.from("courses").select("id, title").in("id", courseIds)
                : Promise.resolve({ data: [], error: null }),
            bundleIds.length > 0
                ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
                : Promise.resolve({ data: [], error: null }),
        ]);

        if (coursesResult.error) console.error("Student Directory Error:", coursesResult.error);
        if (bundlesResult.error) console.error("Student Directory Error:", bundlesResult.error);

        const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
        const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));
        const profileById = new Map((profilesError ? [] : profiles ?? []).map((profile) => [profile.id, profile]));
        const registrationsByUserId = new Map<string, StudentDirectoryRegistration[]>();
        const studentIdByRegistrationNumber = new Map(
            students.map((student) => [student.registration_number, student.id]),
        );

        for (const registration of registrations) {
            const directoryRegistration: StudentDirectoryRegistration = {
                id: registration.id,
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
            };
            const matchingStudentIds = new Set<string>();
            if (registration.user_id && studentIdSet.has(registration.user_id)) {
                matchingStudentIds.add(registration.user_id);
            }
            const registrationNumberStudentId = registration.registration_number
                ? studentIdByRegistrationNumber.get(registration.registration_number)
                : undefined;
            if (registrationNumberStudentId) matchingStudentIds.add(registrationNumberStudentId);

            for (const studentId of matchingStudentIds) {
                const userRegistrations = registrationsByUserId.get(studentId) ?? [];
                userRegistrations.push(directoryRegistration);
                registrationsByUserId.set(studentId, userRegistrations);
            }
        }

        return students.map((student) => {
            const profile = profileById.get(student.id);
            const studentRegistrations = registrationsByUserId.get(student.id) ?? [];
            const latestRegistration = studentRegistrations[0];
            const studentPhone = student.phone || null;
            const status = student.status || (profile?.is_active === false ? "inactive" : "active");

            return {
                id: student.id,
                registration_number: student.registration_number || studentPhone || "N/A",
                status,
                college_institution: student.college_institution || "SPRINT Campus Institute",
                course_degree: student.course_degree || "General Technology Track",
                specialization_branch: student.specialization_branch || latestRegistration?.specialization_branch || null,
                current_semester: student.current_semester || student.semester_year || latestRegistration?.year_semester || null,
                employment_status: student.employment_status || null,
                organization_name: student.organization_name || null,
                city: student.city || null,
                state: student.state || null,
                profile: {
                    full_name: profile?.full_name || latestRegistration?.full_name || student.registration_number || "Enrolled Student",
                    email: profile?.email || latestRegistration?.email || studentPhone || "N/A",
                    phone: profile?.phone || latestRegistration?.phone || studentPhone,
                    is_active: status.toLowerCase() === "active",
                },
                registrations: studentRegistrations,
            };
        });
    } catch (error) {
        console.error("Student Directory Error:", error);
        return [];
    }
}
