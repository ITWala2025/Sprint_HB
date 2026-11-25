"use server";

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_MAX_AGE_SECONDS,
    createAdminSessionToken,
    verifyAdminSessionToken,
} from "@/lib/auth/admin-session";
import type { AdminPermissionMap } from "@/app/admin/auth-types";
import { createServiceClient } from "@/lib/supabase/service";

const SESSION_EXPIRED_MESSAGE =
    "Your login session expired. Please sign in again with your temporary password.";

export type CompleteFirstTimeStaffSetupResult =
    | { success: true }
    | { success: false; error: string; code?: "SESSION_EXPIRED" };

export type CompleteFirstTimeStaffSetupInput = {
    newPassword: string;
    invitationToken?: string | null;
};

function sessionExpiredResult(): CompleteFirstTimeStaffSetupResult {
    return { success: false, code: "SESSION_EXPIRED", error: SESSION_EXPIRED_MESSAGE };
}

function failureForMessage(message: string): CompleteFirstTimeStaffSetupResult {
    if (/auth\s+session\s+missing!?/i.test(message)) {
        return sessionExpiredResult();
    }
    return { success: false, error: message };
}

async function createSessionClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) return null;

    const cookieStore = await cookies();
    const client = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            },
        },
    });
    return { client, cookieStore };
}

export async function completeFirstTimeStaffSetupAction(
    { newPassword, invitationToken }: CompleteFirstTimeStaffSetupInput,
): Promise<CompleteFirstTimeStaffSetupResult> {
    try {
        if (
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/\d/.test(newPassword)
        ) {
            return {
                success: false,
                error: "Use at least 8 characters, including one uppercase letter and one number.",
            };
        }

        const session = await createSessionClient();
        if (!session) {
            return { success: false, error: "Authentication is not configured on the server." };
        }
        const { client: sessionClient, cookieStore } = session;

        let authUserId: string | null = null;
        let authUserEmail: string | null = null;
        try {
            const { data: authData } = await sessionClient.auth.getUser();
            authUserId = authData.user?.id ?? null;
            authUserEmail = authData.user?.email ?? null;
        } catch (error) {
            console.warn("[SPRINT Staff Setup] Cookie-based Auth lookup failed; checking the signed admin session:", error);
        }

        let userId = authUserId;
        if (!userId) {
            const adminSessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
            const adminSession = adminSessionToken
                ? await verifyAdminSessionToken(adminSessionToken)
                : null;
            if (adminSession?.userId) {
                userId = adminSession.userId;
            }
        }

        if (!userId) {
            try {
                cookieStore.delete(ADMIN_SESSION_COOKIE);
            } catch (cookieError) {
                console.error("[SPRINT Staff Setup] Could not clear expired admin session cookie:", cookieError);
            }
            return sessionExpiredResult();
        }

        const serviceClient = createServiceClient();
        if (!serviceClient) {
            return { success: false, error: "Server service client not configured." };
        }

        const { data: existingProfile, error: profileError } = await serviceClient
            .from("profiles")
            .select("role, role_id, is_active, must_change_password, first_login, full_name, email, roles(name, permissions, is_active)")
            .eq("id", userId)
            .maybeSingle();

        if (profileError || !existingProfile) {
            return {
                success: false,
                error: `Your staff profile could not be verified${profileError ? `: ${profileError.message}` : "."}`,
            };
        }
        if (
            (existingProfile.role !== "staff" && existingProfile.role !== "admin") ||
            existingProfile.is_active !== true
        ) {
            return { success: false, error: "Only an active staff or admin account can complete password setup." };
        }

        const email = existingProfile.email ?? authUserEmail;
        if (!email) {
            return { success: false, error: "Your account email could not be verified. Please sign in again." };
        }

        const token = typeof invitationToken === "string" ? invitationToken.trim() : "";
        if (token) {
            if (existingProfile.role !== "staff") {
                return { success: false, error: "This invitation does not belong to a staff account." };
            }
            const { data: invitation, error: invitationError } = await serviceClient
                .from("staff_invitations")
                .select("id")
                .eq("token", token)
                .eq("user_id", userId)
                .eq("status", "pending")
                .gt("expires_at", new Date().toISOString())
                .maybeSingle();

            if (invitationError || !invitation) {
                return {
                    success: false,
                    error: invitationError
                        ? `Your staff invitation could not be verified: ${invitationError.message}`
                        : "Your staff invitation is invalid or has expired. Ask your administrator for a new invitation.",
                };
            }
        }

        const { error: passwordUpdateError } = await serviceClient.auth.admin.updateUserById(
            userId,
            { password: newPassword },
        );
        if (passwordUpdateError) {
            return failureForMessage(passwordUpdateError.message);
        }

        const { data: refreshedAuth, error: refreshError } = await sessionClient.auth.signInWithPassword({
            email,
            password: newPassword,
        });
        if (refreshError) {
            return failureForMessage(
                `Your password changed, but your login session could not be refreshed: ${refreshError.message}`,
            );
        }
        if (refreshedAuth.user?.id !== userId) {
            return {
                success: false,
                error: "Your password changed, but your login session could not be refreshed. Please sign in again.",
            };
        }

        const { data: updatedProfile, error: updateError } = await serviceClient
            .from("profiles")
            .update({ must_change_password: false, first_login: false, is_active: true })
            .eq("id", userId)
            .eq("role", existingProfile.role)
            .eq("is_active", true)
            .select("id")
            .maybeSingle();

        if (updateError || !updatedProfile) {
            return {
                success: false,
                error: `Your staff profile could not be updated${updateError ? `: ${updateError.message}` : "."}`,
            };
        }

        if (existingProfile.role === "staff") {
            let invitationUpdate = serviceClient
                .from("staff_invitations")
                .update({ status: "used", used_at: new Date().toISOString() })
                .eq("user_id", userId)
                .eq("status", "pending");
            if (token) {
                invitationUpdate = invitationUpdate
                    .eq("token", token)
                    .gt("expires_at", new Date().toISOString());
            }
            const { data: usedInvitations, error: invitationError } = await invitationUpdate.select("id");

            if (invitationError || (token && !usedInvitations?.length)) {
                const { error: rollbackError } = await serviceClient
                    .from("profiles")
                    .update({
                        must_change_password: existingProfile.must_change_password,
                        first_login: existingProfile.first_login,
                    })
                    .eq("id", userId)
                    .eq("role", existingProfile.role)
                    .eq("is_active", true);

                if (rollbackError) {
                    console.error("[SPRINT Staff Setup] Could not restore first-login flags after invitation update failure:", rollbackError.message);
                }
                return {
                    success: false,
                    error: invitationError
                        ? `Your staff invitation could not be marked as used: ${invitationError.message}`
                        : "Your staff invitation was already used or is no longer pending.",
                };
            }
        }

        const assignedRole = Array.isArray(existingProfile.roles)
            ? existingProfile.roles[0]
            : existingProfile.roles;
        const permissions = (
            assignedRole?.is_active ? assignedRole.permissions : null
        ) as AdminPermissionMap | null;
        const isAdmin =
            existingProfile.role === "admin" ||
            (existingProfile.role === "staff" && permissions?.full_access === true);
        const sessionToken = await createAdminSessionToken({
            userId,
            email,
            fullName: existingProfile.full_name ?? null,
            role: existingProfile.role,
            roleName: assignedRole?.is_active ? assignedRole.name : existingProfile.role,
            isActive: true,
            isAdmin,
            mustChangePassword: false,
            firstLogin: false,
            permissions,
        });
        cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
        });

        revalidatePath("/admin/users");
        revalidatePath("/staff/dashboard");
        revalidatePath("/staff/login");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("[SPRINT Staff Setup] Unexpected setup action failure:", error);
        return failureForMessage(
            error instanceof Error ? error.message : "Unable to complete staff password setup.",
        );
    }
}
