"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
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

type RegistrationRecord = {
    id: string;
    student_id: string | null;
    application_number: string | null;
    course_id: string | null;
    bundle_id: string | null;
    full_name: string;
    email: string;
    phone: string;
    created_at: string;
    status: string;
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
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load enrollment applications: ${error.message}`);
    }

    const registrations = (data ?? []) as RegistrationRecord[];
    const qualifyingRegistrations = registrations.filter(
        (registration) => registration.course_id !== null || registration.bundle_id !== null,
    );
    const courseIds = [...new Set(qualifyingRegistrations.flatMap((registration) => registration.course_id ? [registration.course_id] : []))];
    const bundleIds = [...new Set(qualifyingRegistrations.flatMap((registration) => registration.bundle_id ? [registration.bundle_id] : []))];

    const [coursesResult, bundlesResult] = await Promise.all([
        courseIds.length > 0
            ? supabase.from("courses").select("id, title").in("id", courseIds)
            : Promise.resolve({ data: [], error: null }),
        bundleIds.length > 0
            ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesResult.error) {
        throw new Error(`Could not load course references for enrollment applications: ${coursesResult.error.message}`);
    }
    if (bundlesResult.error) {
        throw new Error(`Could not load bundle references for enrollment applications: ${bundlesResult.error.message}`);
    }

    const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

    return qualifyingRegistrations.map((registration) => {
        const references = [
            registration.course_id && courseTitles.get(registration.course_id)
                ? `Course: ${courseTitles.get(registration.course_id)}`
                : null,
            registration.bundle_id && bundleTitles.get(registration.bundle_id)
                ? `Bundle: ${bundleTitles.get(registration.bundle_id)}`
                : null,
        ].filter((reference): reference is string => Boolean(reference));

        return {
            id: registration.id,
            full_name: registration.full_name,
            email: registration.email,
            phone: registration.phone,
            courseReference: references.join(" · ") || "Not specified",
            created_at: registration.created_at,
            status: registration.status,
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

async function findAuthUserByEmail(
    supabase: ReturnType<typeof requireServiceClient>,
    email: string,
) {
    for (let page = 1; ; page += 1) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
            throw new Error(`Could not check for an existing student account: ${error.message}`);
        }

        const users: User[] = data.users;
        const user = users.find((candidate) => candidate.email?.toLowerCase() === email);
        if (user) return user;
        if (data.users.length < 1000) return null;
    }
}

async function deactivateInvitedProfile(
    supabase: ReturnType<typeof requireServiceClient>,
    userId: string,
) {
    const { data, error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", userId)
        .select("id")
        .maybeSingle();

    if (error) return error.message;
    return data ? null : "The invited profile could not be found.";
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

    const record = registration as RegistrationRecord;
    let userId: string | null = null;
    let profile: {
        id: string;
        email: string;
        full_name: string;
        phone: string | null;
        role: string;
        role_id: string | null;
    } | null = null;
    let invitedUser = false;

    if (newStatus === "approved") {
        const profileQuery = record.student_id
            ? supabase.from("profiles").select("id, email, full_name, phone, role, role_id").eq("id", record.student_id).maybeSingle()
            : supabase.from("profiles").select("id, email, full_name, phone, role, role_id").eq("email", record.email).maybeSingle();
        const { data: foundProfile, error: profileLookupError } = await profileQuery;
        if (profileLookupError) {
            return { success: false, error: `Could not verify the applicant's profile: ${profileLookupError.message}` };
        }
        profile = foundProfile;

        if (record.student_id) {
            userId = record.student_id;
            if (!profile) {
                const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(record.student_id);
                if (authUserError || !authUserData.user) {
                    return { success: false, error: `The linked applicant account could not be verified${authUserError ? `: ${authUserError.message}` : "."}` };
                }
            }
        } else if (profile) {
            userId = profile.id;
        } else {
            const existingAuthUser = await findAuthUserByEmail(supabase, record.email.toLowerCase());
            if (existingAuthUser) {
                userId = existingAuthUser.id;
            } else {
                const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(record.email, {
                    data: { full_name: record.full_name },
                });
                if (inviteError || !inviteData.user) {
                    return { success: false, error: `Could not invite the applicant to create a student account${inviteError ? `: ${inviteError.message}` : "."}` };
                }
                userId = inviteData.user.id;
                invitedUser = true;
            }
        }

        if (!userId) {
            return { success: false, error: "The applicant's student account could not be provisioned." };
        }

        if (invitedUser) {
            const { error: deactivateError } = await supabase.from("profiles").upsert({
                id: userId,
                email: record.email,
                full_name: record.full_name,
                phone: record.phone,
                role: "student",
                role_id: null,
                is_active: false,
            });
            if (deactivateError) {
                const cleanupError = await deactivateInvitedProfile(supabase, userId);
                return {
                    success: false,
                    error: [
                        `The invitation was sent, but the new profile could not be secured pending approval: ${deactivateError.message}`,
                        cleanupError ? `The invited profile could not be deactivated: ${cleanupError}` : null,
                    ].filter(Boolean).join(" "),
                };
            }
        }
    }

    if (!userId) {
        return { success: false, error: "The applicant's student account could not be provisioned." };
    }

    const { data: approvalResult, error: approvalError } = await supabase.rpc("approve_enrollment_application", {
        p_application_id: id,
        p_user_id: userId,
        p_reviewer_id: await getCurrentReviewerId(),
        p_notes: null,
    });
    const approvalOutcome = Array.isArray(approvalResult) ? approvalResult[0] : approvalResult;
    if (approvalError || !approvalOutcome || approvalOutcome.outcome !== "approved") {
        const cleanupError = invitedUser ? await deactivateInvitedProfile(supabase, userId) : null;
        return {
            success: false,
            error: [
                approvalError
                    ? `Could not approve the enrollment application: ${approvalError.message}`
                    : "The enrollment application could not be approved.",
                invitedUser ? "The student invitation was already sent." : null,
                cleanupError ? `The invited profile could not be deactivated: ${cleanupError}` : null,
            ].filter(Boolean).join(" "),
        };
    }

    revalidatePath("/admin/students/enrollments");
    revalidatePath("/admin/students/list");
    revalidatePath("/student/dashboard");
    return {
        success: true,
        message: invitedUser
            ? `Application approved. A student account invitation was sent to ${record.email}.`
            : "Application approved and student access enabled.",
    };
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
