"use server";

import "server-only";
import { randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isSmtpConfigured, sendStaffInviteEmail } from "@/lib/email/mailer";
import { createServiceClient } from "@/lib/supabase/service";
import { getUserAccountRecord } from "@/lib/supabase/staff";

export type ProvisionStaffUserInput = {
    fullName: string;
    email: string;
    roleId: string;
    roleName: string;
    tempPassword: string;
};

export type ProvisionStaffUserResult =
    | { success: true; userId: string; email: string; tempPassword: string; inviteUrl: string; emailSent: boolean; emailWarning?: string }
    | { success: false; error: string };

export type ResendStaffInvitationResult =
    | { success: true; email: string; tempPassword: string; inviteUrl: string; emailSent: boolean; emailWarning?: string }
    | { success: false; error: string };

export type DeleteStaffUserResult =
    | { success: true }
    | { success: false; error: string };

function roleHasPermission(permissions: unknown, moduleKey: string, capability: string) {
    if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
        return false;
    }

    const permissionMap = permissions as Record<string, unknown>;
    if (permissionMap.full_access === true) {
        return true;
    }

    const modulePermissions = permissionMap[moduleKey];
    return Boolean(
        modulePermissions &&
        typeof modulePermissions === "object" &&
        !Array.isArray(modulePermissions) &&
        (modulePermissions as Record<string, unknown>)[capability] === true,
    );
}

async function createSessionClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) return null;

    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Components cannot write cookies; Server Actions can.
                }
            },
        },
    });
}

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

async function rollbackProvisionedStaffAccount(serviceClient: ServiceClient, userId: string) {
    const cleanupErrors: string[] = [];
    const operations = [
        serviceClient.from("staff_invitations").delete().eq("user_id", userId),
        serviceClient.from("staff").delete().eq("id", userId),
        serviceClient.from("profiles").delete().eq("id", userId),
    ];

    for (const operation of operations) {
        const { error } = await operation;
        if (error) cleanupErrors.push(error.message);
    }

    const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId);
    if (authDeleteError) cleanupErrors.push(authDeleteError.message);
    return cleanupErrors.length ? cleanupErrors.join("; ") : null;
}

async function upsertStaffMirror(
    serviceClient: ServiceClient,
    staff: {
        id: string;
        fullName: string;
        email: string;
        roleId: string | null;
        roleName: string | null;
        isActive: boolean;
        firstLogin: boolean;
        mustChangePassword: boolean;
        status?: string | null;
    },
) {
    const { error } = await serviceClient.from("staff").upsert({
        id: staff.id,
        full_name: staff.fullName,
        email: staff.email,
        account_type: "staff",
        role_id: staff.roleId,
        role_name: staff.roleName,
        is_active: staff.isActive,
        status: staff.status ?? "active",
        first_login: staff.firstLogin,
        must_change_password: staff.mustChangePassword,
    }, { onConflict: "id" });
    return error;
}

async function authorizeStaffManagement(
    sessionClient: Awaited<ReturnType<typeof createSessionClient>>,
    serviceClient: ServiceClient,
) {
    if (!sessionClient) {
        return { authorized: false as const, error: "Authentication is not configured on the server." };
    }

    const { data: authData, error: authError } = await sessionClient.auth.getUser();
    if (authError || !authData.user) {
        return { authorized: false as const, error: "Sign in again before managing staff accounts." };
    }

    const { data: actor, error: actorError } = await serviceClient
        .from("profiles")
        .select("role, is_active, role_id")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (actorError || !actor || actor.is_active !== true) {
        return { authorized: false as const, error: "Your active staff profile could not be verified." };
    }

    if (actor.role === "admin") {
        return { authorized: true as const, userId: authData.user.id };
    }
    if (!actor.role_id) {
        return { authorized: false as const, error: "You do not have permission to manage staff accounts." };
    }

    const { data: actorRole, error: actorRoleError } = await serviceClient
        .from("roles")
        .select("is_active, permissions")
        .eq("id", actor.role_id)
        .maybeSingle();

    if (actorRoleError) {
        return { authorized: false as const, error: `Your assigned staff role could not be verified: ${actorRoleError.message}` };
    }
    if (!actorRole || actorRole.is_active !== true) {
        return { authorized: false as const, error: "Your assigned staff role is inactive or unavailable." };
    }
    if (
        !roleHasPermission(actorRole.permissions, "user_management", "create") &&
        !roleHasPermission(actorRole.permissions, "access_control", "create")
    ) {
        return { authorized: false as const, error: "You do not have permission to manage staff accounts." };
    }

    return { authorized: true as const, userId: authData.user.id };
}

function isMissingEmailLookupRpc(error: { code?: string; message?: string }) {
    return error.code === "PGRST202" ||
        error.code === "42883" ||
        /could not find the function|function .*check_auth_email_exists.*does not exist/i.test(error.message ?? "");
}

async function checkAuthEmailExists(serviceClient: ServiceClient, email: string) {
    const findProfileMatch = async () => {
        const { data: profile, error: profileError } = await serviceClient
            .from("profiles")
            .select("id")
            .ilike("email", email)
            .limit(1)
            .maybeSingle();

        if (profileError) return { exists: false, error: profileError.message };
        return { exists: Boolean(profile), error: null };
    };

    if (typeof serviceClient.rpc !== "function") {
        return findProfileMatch();
    }

    const { data, error } = await serviceClient.rpc("check_auth_email_exists", {
        p_email: email,
    });

    if (!error) {
        if (typeof data !== "boolean") {
            return { exists: false, error: "The email existence check returned an unexpected response." };
        }
        return { exists: data, error: null };
    }

    if (!isMissingEmailLookupRpc(error)) {
        return { exists: false, error: error.message };
    }

    return findProfileMatch();
}

function createInvitationToken() {
    return randomBytes(32).toString("hex");
}

function getInvitationUrl(token: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    return `${siteUrl}/staff/invitation/${token}`;
}

function createTemporaryPassword() {
    return randomBytes(24).toString("base64url");
}

async function deliverStaffInvitationEmail({
    email,
    fullName,
    roleName,
    tempPassword,
    inviteUrl,
}: {
    email: string;
    fullName: string;
    roleName: string;
    tempPassword: string;
    inviteUrl: string;
}) {
    if (!isSmtpConfigured()) {
        return {
            emailSent: false,
            emailWarning: "SMTP is not configured, so the invitation email was not sent. Share the temporary password and invitation link with the staff member.",
        };
    }

    try {
        const result = await sendStaffInviteEmail(
            { email, name: fullName },
            {
                actionUrl: inviteUrl,
                roleName,
                tempPassword,
                expiresInMinutes: 60,
            },
        );

        if (result.success) return { emailSent: true };

        const reason = result.error ?? "The SMTP provider did not accept the email.";
        console.error("[SPRINT Staff Invite] Invitation email delivery failed:", reason);
        return {
            emailSent: false,
            emailWarning: `The account was created, but the invitation email could not be sent: ${reason} Share the temporary password and invitation link with the staff member.`,
        };
    } catch (error) {
        const reason = error instanceof Error ? error.message : "Unexpected SMTP delivery error.";
        console.error("[SPRINT Staff Invite] Invitation email delivery failed:", reason);
        return {
            emailSent: false,
            emailWarning: `The account was created, but the invitation email could not be sent: ${reason} Share the temporary password and invitation link with the staff member.`,
        };
    }
}

export async function provisionStaffUserAction(
    input: ProvisionStaffUserInput,
): Promise<ProvisionStaffUserResult> {
    const fullName = typeof input?.fullName === "string" ? input.fullName.trim() : "";
    const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
    const roleId = typeof input?.roleId === "string" ? input.roleId.trim() : "";
    const roleName = typeof input?.roleName === "string" ? input.roleName.trim() : "";
    const tempPassword = typeof input?.tempPassword === "string" ? input.tempPassword : "";

    if (
        !fullName ||
        fullName.length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254 ||
        !roleId ||
        !roleName ||
        tempPassword.length < 12
    ) {
        return { success: false, error: "Enter a valid name, email, active role, and temporary password of at least 12 characters." };
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
        return { success: false, error: "Server service client not configured." };
    }

    const sessionClient = await createSessionClient();
    const authorization = await authorizeStaffManagement(sessionClient, serviceClient);
    if (!authorization.authorized) {
        return { success: false, error: authorization.error };
    }

    const { data: role, error: roleError } = await serviceClient
        .from("roles")
        .select("id, name, is_active")
        .eq("id", roleId)
        .maybeSingle();

    if (roleError || !role || !role.is_active || role.name !== roleName) {
        return { success: false, error: "The selected role is no longer active. Refresh the page and try again." };
    }

    const existingEmail = await checkAuthEmailExists(serviceClient, email);
    if (existingEmail.error) {
        return { success: false, error: `Could not verify whether this email is already registered: ${existingEmail.error}` };
    }
    if (existingEmail.exists) {
        return { success: false, error: "A user with this email already exists." };
    }

    const inviteToken = createInvitationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const inviteUrl = getInvitationUrl(inviteToken);
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: "staff" },
    });

    if (authError || !authData.user) {
        if (
            authError?.code === "email_exists" ||
            /already registered|already exists|email.*taken/i.test(authError?.message ?? "")
        ) {
            return { success: false, error: "A user with this email already exists." };
        }
        return { success: false, error: authError?.message ?? "The staff Auth account could not be created." };
    }

    const { error: profileError } = await serviceClient.from("profiles").upsert({
        id: authData.user.id,
        full_name: fullName,
        email,
        role: "staff",
        role_id: roleId,
        must_change_password: true,
        first_login: true,
        is_active: true,
    });

    if (profileError) {
        const cleanupError = await rollbackProvisionedStaffAccount(serviceClient, authData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${profileError.message} Provisioning rollback also failed: ${cleanupError}`
                : profileError.message,
        };
    }

    const staffError = await upsertStaffMirror(serviceClient, {
        id: authData.user.id,
        fullName,
        email,
        roleId,
        roleName: role.name,
        isActive: true,
        firstLogin: true,
        mustChangePassword: true,
    });
    if (staffError) {
        const cleanupError = await rollbackProvisionedStaffAccount(serviceClient, authData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${staffError.message} Provisioning rollback also failed: ${cleanupError}`
                : staffError.message,
        };
    }

    const { error: expireError } = await serviceClient
        .from("staff_invitations")
        .update({ status: "expired" })
        .eq("email", email)
        .eq("status", "pending");

    if (expireError) {
        const cleanupError = await rollbackProvisionedStaffAccount(serviceClient, authData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${expireError.message} Provisioning rollback also failed: ${cleanupError}`
                : expireError.message,
        };
    }

    const { error: invitationError } = await serviceClient.from("staff_invitations").insert({
        user_id: authData.user.id,
        email,
        token: inviteToken,
        status: "pending",
        expires_at: expiresAt,
    });
    if (invitationError) {
        const cleanupError = await rollbackProvisionedStaffAccount(serviceClient, authData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${invitationError.message} Provisioning rollback also failed: ${cleanupError}`
                : invitationError.message,
        };
    }

    const emailDelivery = await deliverStaffInvitationEmail({
        email,
        fullName,
        roleName,
        tempPassword,
        inviteUrl,
    });

    revalidatePath("/admin/users");
    return {
        success: true,
        userId: authData.user.id,
        email,
        tempPassword,
        inviteUrl,
        ...emailDelivery,
    };
}

export async function resendStaffInvitationAction(
    userId: string,
): Promise<ResendStaffInvitationResult> {
    const targetId = typeof userId === "string" ? userId.trim() : "";
    if (!targetId) {
        return { success: false, error: "A valid staff account is required." };
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
        return { success: false, error: "Server service client not configured." };
    }

    const sessionClient = await createSessionClient();
    const authorization = await authorizeStaffManagement(sessionClient, serviceClient);
    if (!authorization.authorized) {
        return { success: false, error: authorization.error };
    }

    const { record: profile, error: profileError } = await getUserAccountRecord(targetId, serviceClient);
    if (profileError || !profile) {
        return { success: false, error: `The staff profile could not be verified${profileError ? `: ${profileError}` : "."}` };
    }
    if (profile.is_active !== true) {
        return { success: false, error: "Invitations cannot be resent to an inactive account." };
    }
    if (profile.account_type !== "staff") {
        return { success: false, error: "Invitations can only be resent to staff accounts." };
    }
    if (profile.first_login !== true && profile.must_change_password !== true) {
        return { success: false, error: "This staff member has already completed first login." };
    }

    const { data: authData, error: authError } = await serviceClient.auth.admin.getUserById(targetId);
    if (authError || !authData.user?.email) {
        return { success: false, error: `The Auth account could not be verified${authError ? `: ${authError.message}` : "."}` };
    }
    const email = authData.user.email.trim().toLowerCase();
    const fullName = profile.full_name?.trim() || email;
    let roleName = profile.role_name || "Staff";
    if (profile.role_id) {
        const { data: role, error: roleError } = await serviceClient
            .from("roles")
            .select("name")
            .eq("id", profile.role_id)
            .maybeSingle();
        if (roleError) {
            return { success: false, error: `The assigned staff role could not be verified: ${roleError.message}` };
        }
        if (role?.name) roleName = role.name;
    }
    const tempPassword = createTemporaryPassword();
    const inviteToken = createInvitationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const inviteUrl = getInvitationUrl(inviteToken);

    const { error: expireError } = await serviceClient
        .from("staff_invitations")
        .update({ status: "expired" })
        .eq("user_id", targetId)
        .eq("status", "pending");
    if (expireError) {
        return { success: false, error: `The previous invitation could not be invalidated: ${expireError.message}` };
    }

    const { error: invitationError } = await serviceClient.from("staff_invitations").insert({
        user_id: targetId,
        email,
        token: inviteToken,
        status: "pending",
        expires_at: expiresAt,
    });
    if (invitationError) {
        return { success: false, error: `The new invitation could not be tracked: ${invitationError.message}` };
    }

    const { error: profileUpdateError } = await serviceClient
        .from("profiles")
        .update({ must_change_password: true, first_login: true })
        .eq("id", targetId);
    if (profileUpdateError) {
        const { error: cleanupError } = await serviceClient
            .from("staff_invitations")
            .update({ status: "expired" })
            .eq("token", inviteToken)
            .eq("status", "pending");
        return {
            success: false,
            error: cleanupError
                ? `First-login security could not be reset: ${profileUpdateError.message}. The new invitation could not be invalidated; contact an administrator.`
                : `First-login security could not be reset: ${profileUpdateError.message}`,
        };
    }

    const staffError = await upsertStaffMirror(serviceClient, {
        id: targetId,
        fullName,
        email,
        roleId: profile.role_id,
        roleName,
        isActive: profile.is_active,
        firstLogin: true,
        mustChangePassword: true,
        status: profile.status,
    });
    if (staffError) {
        const { error: cleanupError } = await serviceClient
            .from("staff_invitations")
            .update({ status: "expired" })
            .eq("token", inviteToken)
            .eq("status", "pending");
        return {
            success: false,
            error: cleanupError
                ? `The staff mirror could not be updated: ${staffError.message}. The new invitation could not be invalidated; contact an administrator.`
                : `The staff mirror could not be updated: ${staffError.message}`,
        };
    }

    const { error: passwordError } = await serviceClient.auth.admin.updateUserById(targetId, {
        password: tempPassword,
        email_confirm: true,
    });
    if (passwordError) {
        const { error: cleanupError } = await serviceClient
            .from("staff_invitations")
            .update({ status: "expired" })
            .eq("token", inviteToken)
            .eq("status", "pending");
        return {
            success: false,
            error: cleanupError
                ? `The temporary password could not be updated: ${passwordError.message}. The new invitation could not be invalidated; contact an administrator.`
                : `The temporary password could not be updated: ${passwordError.message}`,
        };
    }

    const emailDelivery = await deliverStaffInvitationEmail({
        email,
        fullName,
        roleName,
        tempPassword,
        inviteUrl,
    });

    revalidatePath("/admin/users");
    return { success: true, email, tempPassword, inviteUrl, ...emailDelivery };
}

export async function deleteStaffUserAction(targetUserId: string): Promise<DeleteStaffUserResult> {
    const sessionClient = await createSessionClient();
    if (!sessionClient) {
        return { success: false, error: "Unauthorized" };
    }

    const sessionUser = (await sessionClient.auth.getUser()).data.user;
    if (!sessionUser) {
        return { success: false, error: "Unauthorized" };
    }

    const targetId = typeof targetUserId === "string" ? targetUserId.trim() : "";
    if (!targetId) {
        return { success: false, error: "A valid staff account is required." };
    }

    if (sessionUser.id === targetId) {
        return { success: false, error: "You cannot delete your own admin account." };
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
        return { success: false, error: "Server service client not configured." };
    }

    const { data: actor, error: actorError } = await serviceClient
        .from("profiles")
        .select("role, is_active, role_id")
        .eq("id", sessionUser.id)
        .maybeSingle();

    if (actorError || !actor || actor.is_active !== true) {
        return { success: false, error: "Your active staff profile could not be verified." };
    }

    let roleName = "";
    let permissions: unknown = null;
    if (actor.role_id) {
        const { data: actorRole, error: actorRoleError } = await serviceClient
            .from("roles")
            .select("name, is_active, permissions")
            .eq("id", actor.role_id)
            .maybeSingle();

        if (actorRoleError) {
            return { success: false, error: `Your assigned staff role could not be verified: ${actorRoleError.message}` };
        }
        if (!actorRole || actorRole.is_active !== true) {
            return { success: false, error: "Your assigned staff role is inactive or unavailable." };
        }
        roleName = actorRole.name;
        permissions = actorRole.permissions;
    }

    const isSuperAdmin = actor.role?.toLowerCase() === "admin" ||
        roleName.trim().toLowerCase() === "super admin";
    const canDeleteUsers = isSuperAdmin ||
        roleHasPermission(permissions, "user_management", "delete") ||
        roleHasPermission(permissions, "access_control", "delete");

    if (!canDeleteUsers) {
        return { success: false, error: "You do not have permission to delete staff accounts." };
    }

    const { data: targetProfile, error: targetProfileError } = await serviceClient
        .from("profiles")
        .select("role")
        .eq("id", targetId)
        .maybeSingle();

    if (targetProfileError) {
        return { success: false, error: `The target account could not be verified: ${targetProfileError.message}` };
    }

    // Prevent deleting super admin accounts unless caller is authorized
    if (targetProfile?.role?.toLowerCase() === "admin" && !isSuperAdmin) {
        return { success: false, error: "You cannot delete an administrator account." };
    }

    const { error: invitationsError } = await serviceClient
        .from("staff_invitations")
        .delete()
        .eq("user_id", targetId);

    if (
        invitationsError &&
        invitationsError.code !== "PGRST205" &&
        invitationsError.code !== "42P01"
    ) {
        return { success: false, error: `Invitation cleanup failed: ${invitationsError.message}` };
    }

    const { error: staffDeleteError } = await serviceClient
        .from("staff")
        .delete()
        .eq("id", targetId);

    if (staffDeleteError) {
        return { success: false, error: `Staff mirror deletion failed: ${staffDeleteError.message}` };
    }

    const { error: profileDeleteError } = await serviceClient
        .from("profiles")
        .delete()
        .eq("id", targetId);

    if (profileDeleteError) {
        return { success: false, error: `Profile deletion failed: ${profileDeleteError.message}` };
    }

    const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(targetId);
    if (authDeleteError) {
        return { success: false, error: `Auth deletion failed: ${authDeleteError.message}` };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
