"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";

export type EnrollmentRegistration = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    courseReference: string;
    created_at: string;
    status: string;
};

type RegistrationRecord = {
    id: string;
    user_id: string | null;
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
    const supabase = requireServiceClient();
    const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load enrollment applications: ${error.message}`);
    }

    const registrations = (data ?? []) as RegistrationRecord[];
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

    if (coursesResult.error) {
        throw new Error(`Could not load course references for enrollment applications: ${coursesResult.error.message}`);
    }
    if (bundlesResult.error) {
        throw new Error(`Could not load bundle references for enrollment applications: ${bundlesResult.error.message}`);
    }

    const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

    return registrations.map((registration) => {
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

export async function getPendingRegistrationCount(): Promise<number> {
    await assertModuleAccess("student_ops");
    const supabase = requireServiceClient();
    const { count, error } = await supabase
        .from("registrations")
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
        .from("registrations")
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
        const profileQuery = record.user_id
            ? supabase.from("profiles").select("id, email, full_name, phone, role, role_id").eq("id", record.user_id).maybeSingle()
            : supabase.from("profiles").select("id, email, full_name, phone, role, role_id").eq("email", record.email).maybeSingle();
        const { data: foundProfile, error: profileLookupError } = await profileQuery;
        if (profileLookupError) {
            return { success: false, error: `Could not verify the applicant's profile: ${profileLookupError.message}` };
        }
        profile = foundProfile;

        if (record.user_id) {
            userId = record.user_id;
            if (!profile) {
                const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(record.user_id);
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

    const { data: updatedRegistration, error: updateError } = await supabase
        .from("registrations")
        .update(newStatus === "approved" ? { status: newStatus, user_id: userId } : { status: newStatus })
        .eq("id", id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

    if (updateError) {
        const cleanupError = invitedUser && userId
            ? await deactivateInvitedProfile(supabase, userId)
            : null;
        return {
            success: false,
            error: [
                `Could not update the enrollment status: ${updateError.message}`,
                invitedUser ? "The student invitation was already sent." : null,
                cleanupError ? `The invited profile could not be deactivated: ${cleanupError}` : null,
            ].filter(Boolean).join(" "),
        };
    }
    if (!updatedRegistration) {
        if (invitedUser && userId) {
            const deactivateError = await deactivateInvitedProfile(supabase, userId);
            if (deactivateError) {
                return {
                    success: false,
                    error: `This application was reviewed by someone else, and the invited profile could not be deactivated: ${deactivateError}`,
                };
            }
        }
        return { success: false, error: "This enrollment application was reviewed by someone else. Refresh the page and try again." };
    }

    if (newStatus === "approved" && userId) {
        const isAdminProfile = profile?.role === "admin";
        const { error: profileUpdateError } = await supabase.from("profiles").upsert({
            id: userId,
            email: profile?.email ?? record.email,
            full_name: profile?.full_name || record.full_name,
            phone: profile?.phone || record.phone,
            role: isAdminProfile ? "admin" : "student",
            role_id: isAdminProfile ? profile?.role_id ?? null : null,
            is_active: true,
        });

        if (profileUpdateError) {
            const { error: rollbackError } = await supabase
                .from("registrations")
                .update({ status: "pending", user_id: record.user_id })
                .eq("id", id)
                .eq("status", "approved");
            let cleanupError: string | null = null;
            if (invitedUser) {
                cleanupError = await deactivateInvitedProfile(supabase, userId);
            }

            const details = [
                `The application could not be finalized for student access: ${profileUpdateError.message}`,
                rollbackError ? `The registration status could not be restored: ${rollbackError.message}` : null,
                cleanupError ? `The invited profile could not be deactivated: ${cleanupError}` : null,
            ].filter(Boolean).join(" ");
            return { success: false, error: details };
        }
    }

    revalidatePath("/admin/students/enrollments");
    const message = newStatus === "approved"
        ? invitedUser
            ? `Application approved. A student account invitation was sent to ${record.email}.`
            : "Application approved and student access enabled."
        : "Application rejected.";
    return { success: true, message };
}
