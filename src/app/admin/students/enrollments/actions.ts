"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { assertModuleAccess, roleHasPermission } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { formatApplicationId, sanitizeStudentId } from "@/lib/id-utils";

type ReviewerResult =
    | { success: true; reviewerId: string }
    | { success: false; error: string };

async function getCurrentReviewerId(): Promise<ReviewerResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (!data.user) {
        return { success: false, error: "Admin session expired. Please sign in again." };
    }
    if (error) {
        return { success: false, error: `Could not verify the administrator session: ${error.message}` };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active, roles(permissions, is_active)")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError) {
        return { success: false, error: `Could not verify reviewer permissions: ${profileError.message}` };
    }

    const assignedRole = Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles;
    const hasPermission = profile?.is_active === true && (
        profile.role === "admin" ||
        (
            profile.role === "staff" &&
            assignedRole?.is_active === true &&
            roleHasPermission(assignedRole.permissions, "student_ops", "edit")
        )
    );

    if (!hasPermission) {
        return { success: false, error: "You do not have permission to review enrollment applications." };
    }

    return { success: true, reviewerId: data.user.id };
}

export type EnrollmentRegistration = {
    id: string;
    application_number: string;
    full_name: string;
    email: string;
    phone: string;
    courseReference: string;
    programs: string[];
    created_at: string;
    status: string;
};

export type EnrollmentRegistrationDetails = {
    registration: {
        id: string;
        application_id: string;
        application_number: string;
        registration_number: string;
        student_id: string;
        linked_student_id: string;
        full_name: string;
        email: string;
        phone: string;
        profiles: {
            phone: string | null;
            mobile_number: string | null;
            full_name: string | null;
        } | null;
        registrations: {
            phone: string | null;
            college_institution: string | null;
            course_degree: string | null;
        } | null;
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

function isMissingColumnError(error: { code?: string; message?: string }): boolean {
    return error.code === "42703" ||
        error.code === "PGRST204" ||
        /column .* does not exist|could not find .* column/i.test(error.message ?? "");
}

function firstText(...values: unknown[]): string {
    return values.find((value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )?.trim() ?? "";
}

export async function getEnrollmentRegistrations(): Promise<EnrollmentRegistration[]> {
    await assertModuleAccess("student_ops");
    const supabase = requireServiceClient();
    const enrollmentColumns = "id, application_number, full_name, email, phone, college_institution, course_id, bundle_id, status, created_at, profiles(phone, mobile_number, full_name), registrations(phone, college_institution, course_degree)";
    const enrollmentCoreColumns = "id, full_name, email, phone, status, created_at";
    const enrollmentResult = await supabase
        .from("enrollments")
        .select("*, profiles(phone, mobile_number, full_name), registrations(phone, college_institution, course_degree)")
        .order("created_at", { ascending: false });

    type EnrollmentLookupRow = {
        id: string;
        application_number: string | null;
        full_name: string | null;
        email: string | null;
        phone: string | null;
        college_institution: string | null;
        course_id: string | null;
        bundle_id: string | null;
        status: string;
        created_at: string;
        legacy_registration_id: string | null;
        profiles: {
            phone: string | null;
            mobile_number: string | null;
            full_name: string | null;
        } | null;
        registrations: {
            phone: string | null;
            college_institution: string | null;
            course_degree: string | null;
        } | null;
    };

    let enrollmentRows: EnrollmentLookupRow[];
    if (enrollmentResult.error) {
        if (!isMissingColumnError(enrollmentResult.error)) {
            throw new Error(`Could not load enrollment applications: ${enrollmentResult.error.message}`);
        }

        console.warn(
            "Enrollment applications lookup is missing an optional column; loading applications without legacy registration links:",
            enrollmentResult.error.message,
        );
        const fallbackResult = await supabase
            .from("enrollments")
            .select(enrollmentColumns)
            .order("created_at", { ascending: false });
        if (fallbackResult.error) {
            if (!isMissingColumnError(fallbackResult.error)) {
                throw new Error(`Could not load enrollment applications: ${fallbackResult.error.message}`);
            }

            console.warn(
                "Enrollment applications lookup is missing optional detail columns; loading core application fields:",
                fallbackResult.error.message,
            );
            const coreResult = await supabase
                .from("enrollments")
                .select(enrollmentCoreColumns)
                .order("created_at", { ascending: false });
            if (coreResult.error) {
                throw new Error(`Could not load enrollment applications: ${coreResult.error.message}`);
            }
            enrollmentRows = (coreResult.data ?? []).map((enrollment) => ({
                ...enrollment,
                application_number: null,
                college_institution: null,
                course_id: null,
                bundle_id: null,
                legacy_registration_id: null,
                profiles: null,
                registrations: null,
            }));
        } else {
            enrollmentRows = (fallbackResult.data ?? []).map((enrollment) => ({
                ...enrollment,
                legacy_registration_id: null,
                profiles: null,
                registrations: null,
            }));
        }
    } else {
        enrollmentRows = (enrollmentResult.data ?? []).map((enrollment) => ({
            ...enrollment,
            legacy_registration_id: enrollment.legacy_registration_id ?? null,
            profiles: enrollment.profiles ?? null,
            registrations: enrollment.registrations ?? null,
        }));
    }

    const legacyRegistrationIds = [...new Set(
        enrollmentRows.flatMap((enrollment) => enrollment.legacy_registration_id ? [enrollment.legacy_registration_id] : []),
    )];
    let registrationRows: Array<{
        id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
        college_institution: string | null;
        course_id: string | null;
        bundle_id: string | null;
    }> = [];
    if (legacyRegistrationIds.length > 0) {
        const registrationsResult = await supabase
            .from("registrations")
            .select("id, full_name, email, phone, college_institution, course_id, bundle_id")
            .in("id", legacyRegistrationIds);

        if (registrationsResult.error) {
            if (!isMissingColumnError(registrationsResult.error)) {
                throw new Error(`Could not load linked registration details: ${registrationsResult.error.message}`);
            }
            console.warn(
                "Linked registration lookup is missing optional detail columns; retrying with core registration fields:",
                registrationsResult.error.message,
            );

            const fallbackResult = await supabase
                .from("registrations")
                .select("id, full_name, email, phone")
                .in("id", legacyRegistrationIds);
            if (fallbackResult.error) {
                if (!isMissingColumnError(fallbackResult.error)) {
                    throw new Error(`Could not load linked registration details: ${fallbackResult.error.message}`);
                }
                console.warn(
                    "Linked registration lookup is missing core contact columns; enrollment applications will be shown without linked registration details:",
                    fallbackResult.error.message,
                );
            } else {
                registrationRows = (fallbackResult.data ?? []).map((registration) => ({
                    ...registration,
                    college_institution: null,
                    course_id: null,
                    bundle_id: null,
                }));
            }
        } else {
            registrationRows = registrationsResult.data ?? [];
        }
    }

    const allCourseIds = [...new Set([
        ...enrollmentRows.flatMap((enrollment) => enrollment.course_id ? [enrollment.course_id] : []),
        ...registrationRows.flatMap((registration) => registration.course_id ? [registration.course_id] : []),
    ])];
    const allBundleIds = [...new Set([
        ...enrollmentRows.flatMap((enrollment) => enrollment.bundle_id ? [enrollment.bundle_id] : []),
        ...registrationRows.flatMap((registration) => registration.bundle_id ? [registration.bundle_id] : []),
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

    const registrationById = new Map(registrationRows.map((registration) => [registration.id, registration]));
    const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

    return enrollmentRows.map((enrollment) => {
        const linkedRegistration = enrollment.legacy_registration_id
            ? registrationById.get(enrollment.legacy_registration_id)
            : null;
        const courseId = enrollment.course_id ?? linkedRegistration?.course_id;
        const bundleId = enrollment.bundle_id ?? linkedRegistration?.bundle_id;
        const programs = [
            courseId ? courseTitles.get(courseId) : null,
            bundleId ? bundleTitles.get(bundleId) : null,
        ].filter((title): title is string => Boolean(title));
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
            application_number: formatApplicationId(
                enrollment.application_number,
                linkedRegistration?.id ?? enrollment.id,
                enrollment.created_at,
            ),
            full_name: enrollment.full_name || enrollment.profiles?.full_name || linkedRegistration?.full_name || "",
            email: enrollment.email || linkedRegistration?.email || "",
            phone: enrollment.phone || enrollment.profiles?.phone || enrollment.profiles?.mobile_number || linkedRegistration?.phone || enrollment.registrations?.phone || "",
            courseReference: references.join(" · ") || "Not specified",
            programs,
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
    const supabase = requireServiceClient();
    const enrollmentResult = await supabase
        .from("enrollments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (enrollmentResult.error) {
        throw new Error(`Could not load enrollment details: ${enrollmentResult.error.message}`);
    }
    const enrollment = enrollmentResult.data;
    if (!enrollment) return null;

    let linkedRegistration: Record<string, any> | null = null;
    if (enrollment.legacy_registration_id) {
        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .eq("id", enrollment.legacy_registration_id)
            .maybeSingle();
        if (error) throw new Error(`Could not load linked registration details: ${error.message}`);
        linkedRegistration = data;
    }

    const applicantUserId = enrollment.student_id || enrollment.applicant_user_id;
    if (!linkedRegistration && applicantUserId) {
        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .eq("user_id", applicantUserId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw new Error(`Could not load linked registration details: ${error.message}`);
        linkedRegistration = data;
    }
    if (!linkedRegistration && enrollment.email) {
        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .ilike("email", enrollment.email)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw new Error(`Could not load linked registration details: ${error.message}`);
        linkedRegistration = data;
    }

    const linkedUserId = applicantUserId || linkedRegistration?.user_id || null;
    const [studentResult, profileResult] = await Promise.all([
        linkedUserId
            ? supabase.from("students").select("*").eq("id", linkedUserId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        linkedUserId
            ? supabase.from("profiles").select("*").eq("id", linkedUserId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
    ]);
    if (studentResult.error || profileResult.error) {
        throw new Error(
            `Could not load applicant profile details: ${[
                studentResult.error?.message,
                profileResult.error?.message,
            ].filter(Boolean).join("; ")}`,
        );
    }
    const student = studentResult.data;
    let profile = profileResult.data;
    if (!profile && enrollment.email) {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .ilike("email", enrollment.email)
            .limit(1)
            .maybeSingle();
        if (error) throw new Error(`Could not load applicant profile details: ${error.message}`);
        profile = data;
    }

    const courseId = enrollment.course_id || linkedRegistration?.course_id || null;
    const bundleId = enrollment.bundle_id || linkedRegistration?.bundle_id || null;
    const batchId = enrollment.batch_id || linkedRegistration?.batch_id || null;
    const studentId = student?.id || linkedUserId;
    const [courseResult, bundleResult, batchResult, enrollmentsResult] = await Promise.all([
        courseId
            ? supabase.from("courses").select("title, category, difficulty_level, duration, delivery_method").eq("id", courseId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        bundleId
            ? supabase.from("course_bundles").select("title, category, description, pathway").eq("id", bundleId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        batchId
            ? supabase.from("batches").select("batch_code, batch_name, start_date, end_date, mode, status").eq("id", batchId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        studentId
            ? supabase.from("student_course_enrollments").select("status, progress_percentage, certificate_issued, enrolled_at, completed_at, course_id, batch_id").eq("student_id", studentId)
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

    const registrationNumber = sanitizeStudentId(
        firstText(
            enrollment.registration_number,
            linkedRegistration?.registration_number,
            student?.registration_number,
            profile?.registration_number,
        ) || null,
        linkedUserId ? "Pending ID generation" : "Not linked",
    );

    const applicationId = formatApplicationId(
        firstText(enrollment.application_number, linkedRegistration?.application_number, student?.application_number, profile?.application_number) || null,
        enrollment.id,
        enrollment.created_at,
    );

    return {
        registration: {
            id: enrollment.id,
            application_id: applicationId,
            application_number: applicationId,
            registration_number: registrationNumber,
            student_id: registrationNumber,
            linked_student_id: registrationNumber,
            full_name: firstText(enrollment.full_name, linkedRegistration?.full_name, student?.full_name, profile?.full_name),
            email: firstText(enrollment.email, linkedRegistration?.email, student?.email, profile?.email),
            phone: firstText(enrollment.phone, linkedRegistration?.phone, student?.phone, profile?.phone, profile?.mobile_number),
            profiles: profile ? {
                phone: profile.phone ?? null,
                mobile_number: profile.mobile_number ?? null,
                full_name: profile.full_name ?? null,
            } : null,
            registrations: linkedRegistration ? {
                phone: linkedRegistration.phone ?? null,
                college_institution: linkedRegistration.college_institution ?? null,
                course_degree: linkedRegistration.course_degree ?? null,
            } : null,
            college_institution: firstText(enrollment.college_institution, linkedRegistration?.college_institution, student?.college_institution, profile?.college_institution) || null,
            course_degree: firstText(enrollment.course_degree, linkedRegistration?.course_degree, student?.course_degree, profile?.course_degree) || null,
            specialization_branch: firstText(enrollment.specialization_branch, linkedRegistration?.specialization_branch, student?.specialization_branch, profile?.specialization_branch) || null,
            year_semester: firstText(enrollment.year_semester, linkedRegistration?.year_semester, student?.current_semester, profile?.year_semester) || null,
            city: firstText(enrollment.city, linkedRegistration?.city, student?.city, profile?.city) || null,
            state: firstText(enrollment.state, linkedRegistration?.state, student?.state, profile?.state) || null,
            employment_status: firstText(enrollment.employment_status, linkedRegistration?.employment_status, student?.employment_status, profile?.employment_status) || null,
            organization_name: firstText(enrollment.organization_name, linkedRegistration?.organization_name, student?.organization_name, profile?.organization_name) || null,
            source_of_info: firstText(enrollment.source_of_info, linkedRegistration?.source_of_info, profile?.source_of_info) || null,
            terms_accepted: enrollment.terms_accepted ?? linkedRegistration?.terms_accepted ?? false,
            communication_consent: enrollment.communication_consent ?? linkedRegistration?.communication_consent ?? false,
            admin_notes: enrollment.admin_notes ?? linkedRegistration?.admin_notes ?? null,
            created_at: enrollment.created_at,
            updated_at: enrollment.updated_at ?? enrollment.created_at,
            status: enrollment.status,
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
    const supabase = createServiceClient() ?? await createSupabaseServerClient();
    try {
        const { count, error } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending");

        if (error) {
            console.warn("[SPRINT Admin Enrollments] Could not load the pending enrollment count; using 0:", error);
            return 0;
        }
        if (count === null) {
            console.warn("[SPRINT Admin Enrollments] Supabase returned no pending enrollment count; using 0.");
            return 0;
        }
        return count;
    } catch (error) {
        console.warn("[SPRINT Admin Enrollments] Failed to load the pending enrollment count; using 0:", error);
        return 0;
    }
}

export async function verifyRegistration(
    id: string,
    newStatus: RegistrationStatus,
    adminNotes: string | null = null,
): Promise<VerifyRegistrationResult> {
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return { success: false, error: "Select a valid enrollment application." };
    }
    if (newStatus !== "approved" && newStatus !== "rejected") {
        return { success: false, error: "Select a valid review status." };
    }

    const reviewerResult = await getCurrentReviewerId();
    if ("error" in reviewerResult) {
        return { success: false, error: reviewerResult.error };
    }
    const reviewerId = reviewerResult.reviewerId;

    await assertModuleAccess("student_ops", "edit");
    const supabaseAdmin = requireServiceClient();
    const { data: registration, error: registrationError } = await supabaseAdmin
        .from("enrollments")
        .select("id, status, applicant_user_id, email, full_name, phone")
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
        const { data: updatedRegistration, error: updateError } = await supabaseAdmin
            .from("enrollments")
            .update({ status: "rejected", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
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
        revalidatePath("/admin/dashboard");
        revalidatePath("/student/dashboard");
        revalidatePath("/student/my-course");
        return { success: true, message: "Application rejected." };
    }

    const applicantEmail = registration.email?.trim();
    if (!applicantEmail) {
        return { success: false, error: "The applicant email is missing from this enrollment." };
    }

    let applicantUserId: string | null = registration.applicant_user_id;
    try {
        if (applicantUserId) {
            const { data: authUser, error: authLookupError } =
                await supabaseAdmin.auth.admin.getUserById(applicantUserId);
            if (authLookupError && authLookupError.status !== 404) {
                return {
                    success: false,
                    error: `Could not verify the applicant account: ${authLookupError.message}`,
                };
            }
            applicantUserId = authUser.user?.id ?? null;
        }

        if (!applicantUserId) {
            const perPage = 1000;
            for (let page = 1; ; page += 1) {
                const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
                    page,
                    perPage,
                });
                if (usersError) {
                    return {
                        success: false,
                        error: `Could not check for an existing applicant account: ${usersError.message}`,
                    };
                }

                const matchingUser = (data.users as User[]).find(
                    (user) => user.email?.toLowerCase() === applicantEmail.toLowerCase(),
                );
                if (matchingUser) {
                    applicantUserId = matchingUser.id;
                    break;
                }
                if (data.users.length < perPage) break;
            }
        }

        if (!applicantUserId) {
            const { data, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
                email: applicantEmail,
                email_confirm: true,
                user_metadata: {
                    full_name: registration.full_name,
                    mobile_number: registration.phone,
                    role: "student",
                },
            });
            if (createUserError || !data.user) {
                return {
                    success: false,
                    error: `Could not create the applicant account: ${createUserError?.message ?? "No user was returned."}`,
                };
            }
            applicantUserId = data.user.id;
        }

        const { error: applicantLinkError } = await supabaseAdmin
            .from("enrollments")
            .update({ applicant_user_id: applicantUserId })
            .eq("id", id);
        if (applicantLinkError) {
            return {
                success: false,
                error: `Could not link the applicant account to this enrollment: ${applicantLinkError.message}`,
            };
        }

        const { error: rpcError } = await supabaseAdmin.rpc("verify_and_approve_enrollment", {
            p_enrollment_id: id,
            p_admin_user_id: reviewerId,
        });
        if (rpcError) {
            console.error("Supabase RPC verification failure:", {
                message: rpcError.message,
                details: rpcError.details,
                hint: rpcError.hint,
                code: rpcError.code,
            });
            return {
                success: false,
                error: `Approval failed [${rpcError.code || "SQL"}]: ${rpcError.message}`,
            };
        }

        if (adminNotes !== null) {
            const { error: notesError } = await supabaseAdmin
                .from("enrollments")
                .update({ admin_notes: adminNotes })
                .eq("id", id);
            if (notesError) {
                revalidatePath("/admin/students/enrollments");
                revalidatePath("/admin/students/registrations");
                revalidatePath("/admin/students/list");
                revalidatePath("/admin/dashboard");
                return {
                    success: true,
                    message: `Enrollment approved, but admin notes could not be saved: ${notesError.message}`,
                };
            }
        }
    } catch (error) {
        console.error("[SPRINT Admin Enrollments] Enrollment approval RPC threw an error:", error);
        return {
            success: false,
            error: error instanceof Error
                ? `Could not approve the enrollment application: ${error.message}`
                : "Could not approve the enrollment application. Please try again.",
        };
    }

    revalidatePath("/admin/students/enrollments");
    revalidatePath("/admin/students/registrations");
    revalidatePath("/admin/students/list");
    revalidatePath("/admin/dashboard");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/my-course");
    return { success: true, message: "Enrollment approved and student course access updated." };
}

export async function approveRegistration(id: string, adminNotes?: string | null): Promise<VerifyRegistrationResult> {
    return verifyRegistration(id, "approved", adminNotes);
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
