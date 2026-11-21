"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import { getStudentOpsServiceClient } from "@/app/admin/students/action-auth";

export type RegistrationListItem = {
    id: string;
    application_number: string | null;
    registration_number: string | null;
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
    admin_notes: string | null;
    created_at: string;
    status: "active" | "pending" | "deactivated";
};

export type RegistrationUpdateInput = {
    full_name: string;
    email: string;
    phone: string;
    college_institution: string;
    admin_notes: string;
};

export type RegistrationActionResult =
    | { success: true; message: string }
    | { success: false; error: string };

function isRegistrationId(id: unknown): id is string {
    return typeof id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function requireServiceClient() {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return serviceClient;
}

function escapeIlike(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
}

async function findLinkedRecordIds(
    supabase: NonNullable<ReturnType<typeof createServiceClient>>,
    table: "students" | "profiles",
    userId: string | null,
    email: string,
): Promise<{ success: true; ids: string[] } | { success: false; error: string }> {
    const ids = new Set<string>();

    if (userId) {
        const { data, error } = await supabase.from(table).select("id").eq("id", userId);
        if (error) return { success: false, error: `Could not find linked ${table}: ${error.message}` };
        (data ?? []).forEach((row) => ids.add(row.id));
    }

    if (email && table === "profiles") {
        const { data, error } = await supabase.from(table).select("id").ilike("email", escapeIlike(email));
        if (error) return { success: false, error: `Could not find linked ${table}: ${error.message}` };
        (data ?? []).forEach((row) => ids.add(row.id));
    }

    return { success: true, ids: [...ids] };
}

async function getLinkedStudentAndProfileIds(
    supabase: NonNullable<ReturnType<typeof createServiceClient>>,
    userId: string | null,
    email: string,
): Promise<{ success: true; studentIds: string[]; profileIds: string[] } | { success: false; error: string }> {
    const [students, profiles] = await Promise.all([
        findLinkedRecordIds(supabase, "students", userId, email),
        findLinkedRecordIds(supabase, "profiles", userId, email),
    ]);

    if ("error" in students) return students;
    if ("error" in profiles) return profiles;

    const [profilesByStudentId, studentsByProfileId] = await Promise.all([
        students.ids.length
            ? supabase.from("profiles").select("id").in("id", students.ids)
            : Promise.resolve({ data: [], error: null }),
        profiles.ids.length
            ? supabase.from("students").select("id").in("id", profiles.ids)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesByStudentId.error) {
        return { success: false, error: `Could not find linked profiles: ${profilesByStudentId.error.message}` };
    }
    if (studentsByProfileId.error) {
        return { success: false, error: `Could not find linked students: ${studentsByProfileId.error.message}` };
    }

    return {
        success: true,
        studentIds: [...new Set([...students.ids, ...(studentsByProfileId.data ?? []).map((row) => row.id)])],
        profileIds: [...new Set([...profiles.ids, ...(profilesByStudentId.data ?? []).map((row) => row.id)])],
    };
}

export async function getStudentRegistrations(): Promise<RegistrationListItem[]> {
    await assertModuleAccess("student_ops");
    try {
        const supabase = requireServiceClient();
        const [registrationsResult, activeStudentsResult] = await Promise.all([
            supabase
                .from("registrations")
                .select("id, user_id, registration_number, application_number, full_name, email, phone, college_institution, course_degree, specialization_branch, year_semester, city, state, employment_status, organization_name, admin_notes, created_at, status")
                .is("course_id", null)
                .is("bundle_id", null)
                .order("created_at", { ascending: false }),
            supabase
                .from("students")
                .select("id, profiles(email)")
                .eq("status", "active"),
        ]);

        if (registrationsResult.error) {
            console.warn("[SPRINT Admin Registrations] Could not load student registrations:", {
                code: registrationsResult.error.code,
                message: registrationsResult.error.message,
                details: registrationsResult.error.details,
            });
            return [];
        }
        if (activeStudentsResult.error) {
            console.warn("[SPRINT Admin Registrations] Could not load active students:", {
                code: activeStudentsResult.error.code,
                message: activeStudentsResult.error.message,
                details: activeStudentsResult.error.details,
            });
            return [];
        }

        const activeStudentIds = new Set((activeStudentsResult.data ?? []).map((student) => student.id));
        const activeStudentEmails = new Set(
            (activeStudentsResult.data ?? []).flatMap((student) => {
                const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
                const email = profile?.email?.trim().toLowerCase();
                return email ? [email] : [];
            }),
        );

        return (registrationsResult.data ?? []).map((row) => ({
            id: row.id,
            application_number: row.application_number,
            registration_number: row.registration_number,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            college_institution: row.college_institution,
            course_degree: row.course_degree,
            specialization_branch: row.specialization_branch,
            year_semester: row.year_semester,
            city: row.city,
            state: row.state,
            employment_status: row.employment_status,
            organization_name: row.organization_name,
            admin_notes: row.admin_notes,
            created_at: row.created_at,
            status: row.status?.toLowerCase() === "deactivated"
                ? "deactivated"
                : row.status?.toLowerCase() === "active" ||
                    (row.user_id !== null && activeStudentIds.has(row.user_id)) ||
                    (typeof row.email === "string" && activeStudentEmails.has(row.email.trim().toLowerCase()))
                    ? "active"
                    : "pending",
        }));
    } catch (error) {
        console.warn("[SPRINT Admin Registrations] Could not load student registrations:", error);
        return [];
    }
}

export async function updateRegistration(
    id: string,
    input: RegistrationUpdateInput,
): Promise<RegistrationActionResult> {
    if (!isRegistrationId(id)) {
        return { success: false, error: "Select a valid registration." };
    }
    if (
        !input ||
        typeof input.full_name !== "string" ||
        typeof input.email !== "string" ||
        typeof input.phone !== "string" ||
        typeof input.college_institution !== "string" ||
        typeof input.admin_notes !== "string"
    ) {
        return { success: false, error: "Enter valid registration details." };
    }

    const fullName = input.full_name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    if (!fullName || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Name, a valid email address, and phone number are required." };
    }

    await assertModuleAccess("student_ops", "edit");
    const { data, error } = await requireServiceClient()
        .from("registrations")
        .update({
            full_name: fullName,
            email,
            phone,
            college_institution: input.college_institution.trim() || null,
            admin_notes: input.admin_notes.trim() || null,
        })
        .eq("id", id)
        .is("course_id", null)
        .is("bundle_id", null)
        .select("id")
        .maybeSingle();

    if (error) {
        return { success: false, error: `Could not update the registration: ${error.message}` };
    }
    if (!data) {
        return { success: false, error: "This student registration no longer exists." };
    }

    revalidatePath("/admin/students/registrations");
    return { success: true, message: "Registration details updated." };
}

export async function deleteRegistration(id: string): Promise<RegistrationActionResult> {
    if (!isRegistrationId(id)) {
        return { success: false, error: "Select a valid registration." };
    }

    await assertModuleAccess("student_ops", "delete");
    const { data, error } = await requireServiceClient()
        .from("registrations")
        .delete()
        .eq("id", id)
        .is("course_id", null)
        .is("bundle_id", null)
        .select("id")
        .maybeSingle();

    if (error) {
        return { success: false, error: `Could not delete the registration: ${error.message}` };
    }
    if (!data) {
        return { success: false, error: "This student registration no longer exists." };
    }

    revalidatePath("/admin/students/registrations");
    return { success: true, message: "Student registration deleted." };
}

async function setRegistrationStatus(
    id: string,
    status: "active" | "deactivated",
): Promise<RegistrationActionResult> {
    if (!isRegistrationId(id)) {
        return { success: false, error: "Select a valid registration." };
    }

    const authorization = await getStudentOpsServiceClient();
    if ("error" in authorization) return authorization;
    const supabase = authorization.client;
    const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("user_id, email")
        .eq("id", id)
        .is("course_id", null)
        .is("bundle_id", null)
        .maybeSingle();

    if (registrationError) {
        return { success: false, error: `Could not load the registration: ${registrationError.message}` };
    }
    if (!registration) {
        return { success: false, error: "This student registration no longer exists." };
    }

    const linked = await getLinkedStudentAndProfileIds(
        supabase,
        registration.user_id,
        registration.email?.trim() ?? "",
    );
    if ("error" in linked) return linked;

    const registrationStatus = status === "deactivated"
        ? "deactivated"
        : linked.studentIds.length > 0 ? "active" : "pending";
    const updates = await Promise.all([
        supabase.from("registrations").update({ status: registrationStatus }).eq("id", id),
        ...(linked.studentIds.length
            ? [supabase.from("students").update({ status }).in("id", linked.studentIds)]
            : []),
        ...(linked.profileIds.length
            ? [supabase.from("profiles").update({ is_active: status === "active" }).in("id", linked.profileIds)]
            : []),
    ]);
    const updateError = updates.find((result) => result.error)?.error;
    if (updateError) {
        return {
            success: false,
            error: `Could not ${status === "active" ? "activate" : "deactivate"} the registration: ${updateError.message}`,
        };
    }

    revalidatePath("/admin/students/registrations");
    revalidatePath("/admin/students/list");
    return {
        success: true,
        message: status === "active"
            ? registrationStatus === "pending" ? "Registration restored to pending." : "Student registration activated."
            : "Student registration deactivated.",
    };
}

export async function deactivateRegistration(id: string): Promise<RegistrationActionResult> {
    return setRegistrationStatus(id, "deactivated");
}

export async function activateRegistration(id: string): Promise<RegistrationActionResult> {
    return setRegistrationStatus(id, "active");
}
