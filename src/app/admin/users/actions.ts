"use server";

import "server-only";
import { randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type ProvisionStaffUserInput = {
    fullName: string;
    email: string;
    roleId: string;
    roleName: string;
    tempPassword: string;
};

export type ProvisionStaffUserResult =
    | { success: true; userId: string; email: string; tempPassword: string; inviteUrl: string }
    | { success: false; error: string };

export type ResendStaffInvitationResult =
    | { success: true; email: string; tempPassword: string; inviteUrl: string }
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

function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return null;

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
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

async function findAuthUserByEmail(serviceClient: ServiceClient, email: string) {
    for (let page = 1; ; page += 1) {
        const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) return { user: null, error };
        const users: User[] = data.users;
        const user = users.find((candidate) => candidate.email?.toLowerCase() === email);
        if (user) return { user, error: null };
        if (data.users.length < 1000) return { user: null, error: null };
    }
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

    const { user: existingUser, error: existingUserError } = await findAuthUserByEmail(serviceClient, email);
    if (existingUserError) {
        return { success: false, error: `Could not verify whether this email is already registered: ${existingUserError.message}` };
    }
    if (existingUser) {
        const { data: existingProfile, error: existingProfileError } = await serviceClient
            .from("profiles")
            .select("is_active")
            .eq("id", existingUser.id)
            .maybeSingle();

        if (existingProfileError) {
            return { success: false, error: `Could not verify the existing account: ${existingProfileError.message}` };
        }
        if (existingProfile?.is_active === true) {
            return { success: false, error: "A user with this email address has already been registered." };
        }
        return { success: false, error: "An account already exists for this email address and must be reviewed before it can be invited." };
    }

    const inviteToken = createInvitationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const inviteUrl = getInvitationUrl(inviteToken);
    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: inviteUrl,
    });

    if (inviteError || !inviteData.user) {
        return { success: false, error: inviteError?.message ?? "The staff invitation could not be sent." };
    }

    const { error: passwordError } = await serviceClient.auth.admin.updateUserById(inviteData.user.id, {
        password: tempPassword,
    });
    if (passwordError) {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(inviteData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${passwordError.message} The newly invited account could not be removed; contact a system administrator.`
                : passwordError.message,
        };
    }

    const { error: profileError } = await serviceClient.from("profiles").upsert({
        id: inviteData.user.id,
        full_name: fullName,
        email,
        role: "staff",
        role_id: roleId,
        must_change_password: true,
        first_login: true,
        is_active: true,
    });

    if (profileError) {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(inviteData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${profileError.message} The newly created auth user could not be removed; contact a system administrator.`
                : profileError.message,
        };
    }

    const { error: expireError } = await serviceClient
        .from("staff_invitations")
        .update({ status: "expired" })
        .eq("email", email)
        .eq("status", "pending");

    if (expireError) {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(inviteData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${expireError.message} The newly invited account could not be removed; contact a system administrator.`
                : expireError.message,
        };
    }

    const { error: invitationError } = await serviceClient.from("staff_invitations").insert({
        user_id: inviteData.user.id,
        email,
        token: inviteToken,
        status: "pending",
        expires_at: expiresAt,
    });
    if (invitationError) {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(inviteData.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${invitationError.message} The newly invited account could not be removed; contact a system administrator.`
                : invitationError.message,
        };
    }

    revalidatePath("/admin/users");
    return {
        success: true,
        userId: inviteData.user.id,
        email,
        tempPassword,
        inviteUrl,
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

    const { data: profile, error: profileError } = await serviceClient
        .from("profiles")
        .select("email, full_name, is_active, first_login, must_change_password")
        .eq("id", targetId)
        .maybeSingle();

    if (profileError || !profile) {
        return { success: false, error: `The staff profile could not be verified${profileError ? `: ${profileError.message}` : "."}` };
    }
    if (profile.is_active !== true) {
        return { success: false, error: "Invitations cannot be resent to an inactive account." };
    }
    if (profile.first_login !== true && profile.must_change_password !== true) {
        return { success: false, error: "This staff member has already completed first login." };
    }

    const { data: authData, error: authError } = await serviceClient.auth.admin.getUserById(targetId);
    if (authError || !authData.user?.email) {
        return { success: false, error: `The Auth account could not be verified${authError ? `: ${authError.message}` : "."}` };
    }
    if (authData.user.email_confirmed_at) {
        return {
            success: false,
            error: "Supabase Auth cannot resend an invitation after the email address has been confirmed.",
        };
    }

    const email = authData.user.email.trim().toLowerCase();
    const fullName = profile.full_name?.trim() || email;
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

    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: inviteUrl,
    });
    if (inviteError || !inviteData.user) {
        return { success: false, error: inviteError?.message ?? "The staff invitation could not be resent." };
    }

    const { error: passwordError } = await serviceClient.auth.admin.updateUserById(targetId, {
        password: tempPassword,
    });
    if (passwordError) {
        return { success: false, error: `The invitation was sent, but the temporary password could not be updated: ${passwordError.message}` };
    }

    const { error: invitationError } = await serviceClient.from("staff_invitations").insert({
        user_id: targetId,
        email,
        token: inviteToken,
        status: "pending",
        expires_at: expiresAt,
    });
    if (invitationError) {
        return { success: false, error: `The invitation email was sent, but it could not be tracked: ${invitationError.message}` };
    }

    revalidatePath("/admin/users");
    return { success: true, email, tempPassword, inviteUrl };
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
