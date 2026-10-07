"use server";

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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
    | { success: true; userId: string; loginUrl: string }
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
        return { success: false, error: "Staff account provisioning is not configured on the server." };
    }

    const sessionClient = await createSessionClient();
    if (!sessionClient) {
        return { success: false, error: "Authentication is not configured on the server." };
    }

    const { data: authData, error: authError } = await sessionClient.auth.getUser();
    if (authError || !authData.user) {
        return { success: false, error: "Sign in again before creating a staff account." };
    }

    const { data: actor, error: actorError } = await serviceClient
        .from("profiles")
        .select("role, is_active, role_id")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (actorError) {
        return { success: false, error: `Your staff profile could not be read: ${actorError.message}` };
    }
    if (!actor) {
        return { success: false, error: "Your active staff profile could not be verified." };
    }

    if (actor.is_active !== true) {
        return { success: false, error: "Your account is marked inactive." };
    }

    const isLegacyAdmin = actor.role === "admin";
    if (!isLegacyAdmin) {
        if (actor.is_active !== true || !actor.role_id) {
            return { success: false, error: "Your active staff profile could not be verified." };
        }

        const { data: actorRole, error: actorRoleError } = await serviceClient
            .from("roles")
            .select("id, is_active, permissions")
            .eq("id", actor.role_id)
            .maybeSingle();

        if (actorRoleError) {
            return { success: false, error: `Your assigned staff role could not be verified: ${actorRoleError.message}` };
        }
        if (!actorRole || actorRole.is_active !== true) {
            return { success: false, error: "Your assigned staff role is inactive or unavailable." };
        }

        if (
            !roleHasPermission(actorRole.permissions, "user_management", "create") &&
            !roleHasPermission(actorRole.permissions, "access_control", "create")
        ) {
            return { success: false, error: "You do not have permission to create staff accounts." };
        }
    }

    const { data: role, error: roleError } = await serviceClient
        .from("roles")
        .select("id, name, is_active")
        .eq("id", roleId)
        .maybeSingle();

    if (roleError || !role || !role.is_active || role.name !== roleName) {
        return { success: false, error: "The selected role is no longer active. Refresh the page and try again." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        return { success: false, error: "The public site URL is not configured on the server." };
    }
    const redirectTo = `${siteUrl.replace(/\/$/, "")}/admin/dashboard`;

    const { data: authDataCreated, error: createError } = await serviceClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    });

    if (createError || !authDataCreated.user) {
        return { success: false, error: createError?.message ?? "The staff account could not be created." };
    }

    const { error: profileError } = await serviceClient.from("profiles").upsert({
        id: authDataCreated.user.id,
        full_name: fullName,
        email,
        role_id: roleId,
        must_change_password: true,
        is_active: true,
    });

    if (profileError) {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(authDataCreated.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${profileError.message} The newly created auth user could not be removed; contact a system administrator.`
                : profileError.message,
        };
    }

    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
            redirectTo,
        },
    });

    const loginUrl = linkData.properties?.action_link;
    if (linkError || !loginUrl) {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(authDataCreated.user.id);
        return {
            success: false,
            error: cleanupError
                ? `${linkError?.message ?? "A direct login link could not be generated."} The newly created auth user could not be removed; contact a system administrator.`
                : linkError?.message ?? "A direct login link could not be generated.",
        };
    }

    revalidatePath("/admin/users");
    return { success: true, userId: authDataCreated.user.id, loginUrl };
}
