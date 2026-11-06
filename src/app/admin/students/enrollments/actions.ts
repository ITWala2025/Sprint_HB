"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";

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

async function getCurrentReviewerId(): Promise<string> {
    const supabase = await createAuthenticatedServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        throw new Error(`Could not verify the reviewing administrator${error ? `: ${error.message}` : "."}`);
    }
    return data.user.id;
}

export type EnrollmentRegistration = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    courseReference: string;
    created_at: string;
    status: string;
};

export type EnrollmentRegistrationDetails = {
    registration: {
        id: string;
        application_number: string | null;
        student_id: string | null;
        full_name: string;
        email: string;
        phone: string;
        college_institution: string | null;
        course_degree: string | null;
        specialization_branch: string | null;
        year_semester: string | null;
        city: string | null;
        state: string | null;
        employment_status: string | null;
        organization_name: string | null;
        source_of_info: string | null;
        terms_accepted: boolean;
        communication_consent: boolean;
        admin_notes: string | null;
        created_at: string;
        updated_at: string;
        status: string;
    };
    course: { title: string; category: string; difficulty_level: string; duration: string; delivery_method: string } | null;
    bundle: { title: string; category: string; description: string; pathway: string | null } | null;
    batch: { batch_code: string; batch_name: string; start_date: string; end_date: string | null; mode: string; status: string } | null;
    enrollments: Array<{
        status: string;
        progress_percentage: number;
        certificate_issued: boolean;
        enrolled_at: string;
        completed_at: string | null;
        courseTitle: string | null;
        batchName: string | null;
    }>;
};

type RegistrationStatus = "approved" | "rejected";

export type VerifyRegistrationResult =
    | { success: true; message: string }
    | { success: false; error: string };

function requireServiceClient() {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return serviceClient;
}

export async function getEnrollmentRegistrations(): Promise<EnrollmentRegistration[]> {
    await assertModuleAccess("student_ops");
    const supabase = await createAuthenticatedServerClient();
    const { data, error } = await supabase
        .from("enrollments")
        .select("id, legacy_registration_id, full_name, email, phone, college_institution, course_id, bundle_id, status, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load enrollment applications: ${error.message}`);
    }

    const enrollmentRows = data ?? [];
    const legacyRegistrationIds = [...new Set(
        enrollmentRows.flatMap((enrollment) => enrollment.legacy_registration_id ? [enrollment.legacy_registration_id] : []),
    )];
    const registrationsResult = legacyRegistrationIds.length > 0
        ? await supabase
            .from("registrations")
            .select("id, full_name, email, phone, college_institution, course_id, bundle_id")
            .in("id", legacyRegistrationIds)
        : { data: [], error: null };

    if (registrationsResult.error) {
        throw new Error(`Could not load linked registration details: ${registrationsResult.error.message}`);
    }

    const allCourseIds = [...new Set([
        ...enrollmentRows.flatMap((enrollment) => enrollment.course_id ? [enrollment.course_id] : []),
        ...(registrationsResult.data ?? []).flatMap((registration) => registration.course_id ? [registration.course_id] : []),
    ])];
    const allBundleIds = [...new Set([
        ...enrollmentRows.flatMap((enrollment) => enrollment.bundle_id ? [enrollment.bundle_id] : []),
        ...(registrationsResult.data ?? []).flatMap((registration) => registration.bundle_id ? [registration.bundle_id] : []),
    ])];
    const [coursesResult, bundlesResult] = await Promise.all([
        allCourseIds.length > 0
            ? supabase.from("courses").select("id, title").in("id", allCourseIds)
            : Promise.resolve({ data: [], error: null }),
        allBundleIds.length > 0
            ? supabase.from("course_bundles").select("id, title").in("id", allBundleIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesResult.error) {
        throw new Error(`Could not load course references for enrollment applications: ${coursesResult.error.message}`);
    }
    if (bundlesResult.error) {
        throw new Error(`Could not load bundle references for enrollment applications: ${bundlesResult.error.message}`);
    }

    const registrationById = new Map((registrationsResult.data ?? []).map((registration) => [registration.id, registration]));
    const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

    return enrollmentRows.map((enrollment) => {
        const linkedRegistration = enrollment.legacy_registration_id
            ? registrationById.get(enrollment.legacy_registration_id)
            : null;
        const courseId = enrollment.course_id ?? linkedRegistration?.course_id;
        const bundleId = enrollment.bundle_id ?? linkedRegistration?.bundle_id;
        const references = [
            courseId && courseTitles.get(courseId)
                ? `Course: ${courseTitles.get(courseId)}`
                : null,
            bundleId && bundleTitles.get(bundleId)
                ? `Bundle: ${bundleTitles.get(bundleId)}`
                : null,
        ].filter((reference): reference is string => Boolean(reference));

        return {
            id: enrollment.id,
            full_name: enrollment.full_name || linkedRegistration?.full_name || "",
            email: enrollment.email || linkedRegistration?.email || "",
            phone: enrollment.phone || linkedRegistration?.phone || "",
            courseReference: references.join(" · ") || "Not specified",
            created_at: enrollment.created_at,
            status: enrollment.status,
        };
    });
}

export async function getRegistrations(): Promise<EnrollmentRegistration[]> {
    return getEnrollmentRegistrations();
}

function isRegistrationId(id: unknown): id is string {
    return typeof id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function getEnrollmentRegistrationDetails(
    id: string,
): Promise<EnrollmentRegistrationDetails | null> {
    if (!isRegistrationId(id)) {
        throw new Error("Select a valid enrollment application.");
    }

    await assertModuleAccess("student_ops");
    const supabase = await createAuthenticatedServerClient();
    const { data: registration, error: registrationError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (registrationError) {
        throw new Error(`Could not load enrollment details: ${registrationError.message}`);
    }
    if (!registration) return null;

    const [courseResult, bundleResult, batchResult, enrollmentsResult] = await Promise.all([
        registration.course_id
            ? supabase.from("courses").select("title, category, difficulty_level, duration, delivery_method").eq("id", registration.course_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        registration.bundle_id
            ? supabase.from("course_bundles").select("title, category, description, pathway").eq("id", registration.bundle_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        registration.batch_id
            ? supabase.from("batches").select("batch_code, batch_name, start_date, end_date, mode, status").eq("id", registration.batch_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        registration.student_id
            ? supabase.from("student_course_enrollments").select("status, progress_percentage, certificate_issued, enrolled_at, completed_at, course_id, batch_id").eq("student_id", registration.student_id)
            : Promise.resolve({ data: [], error: null }),
    ]);

    const relatedRecordErrors = [
        courseResult.error && `course: ${courseResult.error.message}`,
        bundleResult.error && `bundle: ${bundleResult.error.message}`,
        batchResult.error && `batch: ${batchResult.error.message}`,
        enrollmentsResult.error && `enrollments: ${enrollmentsResult.error.message}`,
    ].filter(Boolean);
    if (relatedRecordErrors.length > 0) {
        throw new Error(`Could not load related enrollment details (${relatedRecordErrors.join("; ")}).`);
    }

    const enrollmentRecords = enrollmentsResult.data ?? [];
    const enrollmentCourseIds = [...new Set(enrollmentRecords.map((item) => item.course_id))];
    const enrollmentBatchIds = [...new Set(enrollmentRecords.map((item) => item.batch_id))];
    const [enrollmentCoursesResult, enrollmentBatchesResult] = await Promise.all([
        enrollmentCourseIds.length > 0
            ? supabase.from("courses").select("id, title").in("id", enrollmentCourseIds)
            : Promise.resolve({ data: [], error: null }),
        enrollmentBatchIds.length > 0
            ? supabase.from("batches").select("id, batch_name").in("id", enrollmentBatchIds)
            : Promise.resolve({ data: [], error: null }),
    ]);
    if (enrollmentCoursesResult.error || enrollmentBatchesResult.error) {
        throw new Error(
            `Could not load linked course or batch names: ${[
                enrollmentCoursesResult.error?.message,
                enrollmentBatchesResult.error?.message,
            ].filter(Boolean).join("; ")}`,
        );
    }

    const courseNames = new Map((enrollmentCoursesResult.data ?? []).map((item) => [item.id, item.title]));
    const batchNames = new Map((enrollmentBatchesResult.data ?? []).map((item) => [item.id, item.batch_name]));

    return {
        registration: {
            id: registration.id,
            application_number: registration.application_number,
            student_id: registration.student_id,
            full_name: registration.full_name,
            email: registration.email,
            phone: registration.phone,
            college_institution: registration.college_institution,
            course_degree: registration.course_degree,
            specialization_branch: registration.specialization_branch,
            year_semester: registration.year_semester,
            city: registration.city,
            state: registration.state,
            employment_status: registration.employment_status,
            organization_name: registration.organization_name,
            source_of_info: registration.source_of_info,
            terms_accepted: registration.terms_accepted,
            communication_consent: registration.communication_consent,
            admin_notes: registration.admin_notes,
            created_at: registration.created_at,
            updated_at: registration.updated_at,
            status: registration.status,
        },
        course: courseResult.data,
        bundle: bundleResult.data,
        batch: batchResult.data,
        enrollments: enrollmentRecords.map((enrollment) => ({
            status: enrollment.status,
            progress_percentage: enrollment.progress_percentage,
            certificate_issued: enrollment.certificate_issued,
            enrolled_at: enrollment.enrolled_at,
            completed_at: enrollment.completed_at,
            courseTitle: courseNames.get(enrollment.course_id) ?? null,
            batchName: batchNames.get(enrollment.batch_id) ?? null,
        })),
    };
}

export async function getPendingRegistrationCount(): Promise<number> {
    await assertModuleAccess("student_ops");
    const supabase = await createAuthenticatedServerClient();
    const { count, error } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

    if (error) {
        throw new Error(`Could not load the pending enrollment count: ${error.message}`);
    }
    if (count === null) {
        throw new Error("Supabase did not return the pending enrollment count.");
    }
    return count;
}

export async function verifyRegistration(
    id: string,
    newStatus: RegistrationStatus,
): Promise<VerifyRegistrationResult> {
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return { success: false, error: "Select a valid enrollment application." };
    }
    if (newStatus !== "approved" && newStatus !== "rejected") {
        return { success: false, error: "Select a valid review status." };
    }

    await assertModuleAccess("student_ops", "edit");
    const supabase = requireServiceClient();
    const { data: registration, error: registrationError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (registrationError) {
        return { success: false, error: `Could not load the enrollment application: ${registrationError.message}` };
    }
    if (!registration) {
        return { success: false, error: "This enrollment application no longer exists." };
    }
    if (registration.status !== "pending") {
        return { success: false, error: "This enrollment application has already been reviewed." };
    }

    if (newStatus === "rejected") {
        const { data: updatedRegistration, error: updateError } = await supabase
            .from("enrollments")
            .update({ status: "rejected", reviewed_by: await getCurrentReviewerId(), reviewed_at: new Date().toISOString() })
            .eq("id", id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (updateError) {
            return { success: false, error: `Could not reject the enrollment application: ${updateError.message}` };
        }
        if (!updatedRegistration) {
            return { success: false, error: "This enrollment application was reviewed by someone else. Refresh the page and try again." };
        }

        revalidatePath("/admin/students/enrollments");
        revalidatePath("/admin/students/list");
        revalidatePath("/student/dashboard");
        return { success: true, message: "Application rejected." };
    }

    const { error: approvalError } = await supabase.rpc("verify_and_approve_enrollment", {
        p_enrollment_id: id,
        p_admin_user_id: await getCurrentReviewerId(),
    });
    if (approvalError) {
        return { success: false, error: `Could not approve the enrollment application: ${approvalError.message}` };
    }

    revalidatePath("/admin/students/enrollments");
    revalidatePath("/admin/students/list");
    revalidatePath("/student/dashboard");
    return { success: true, message: "Enrollment approved and student course access updated." };
}

export async function approveRegistration(id: string): Promise<VerifyRegistrationResult> {
    return verifyRegistration(id, "approved");
}

export async function rejectRegistration(id: string): Promise<VerifyRegistrationResult> {
    return verifyRegistration(id, "rejected");
}

export async function deleteRegistration(id: string): Promise<VerifyRegistrationResult> {
    if (!isRegistrationId(id)) {
        return { success: false, error: "Select a valid enrollment application." };
    }

    await assertModuleAccess("student_ops", "delete");
    const supabase = requireServiceClient();
    const { data, error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
        return { success: false, error: `Could not delete the enrollment application: ${error.message}` };
    }
    if (!data) {
        return { success: false, error: "This enrollment application no longer exists." };
    }

    revalidatePath("/admin/students/enrollments");
    revalidatePath("/admin/students/list");
    revalidatePath("/student/dashboard");
    return { success: true, message: "Enrollment application deleted." };
}
