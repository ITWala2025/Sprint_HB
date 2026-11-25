import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { AdminSessionPayload } from "@/lib/auth/admin-session";
import { createServiceClient } from "@/lib/supabase/service";
import { getUserAccountRecord } from "@/lib/supabase/staff";
import type { AdminPermissionMap } from "./auth-types";

export type { AdminSessionPayload };

/**
 * Cached per-request session reader.
 * Revalidates Supabase Auth and service-role staff/role records for each
 * request. React `cache()` avoids duplicate reads during a server render.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionPayload | null> => {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !publishableKey) {
        return null;
    }

    const supabase = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Server Components cannot write cookies
                }
            },
        },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
        return null;
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
        console.error("[SPRINT Admin Session] Server-side Supabase service role is not configured.");
        return null;
    }

    const { record: profile, error: profileError } = await getUserAccountRecord(authData.user.id, serviceClient);
    if (profileError) {
        console.error("[SPRINT Admin Session] Failed to load staff/profile and role records:", profileError);
    }

    if (
        !profile ||
        profile.is_active !== true ||
        (profile.account_type !== "admin" && profile.account_type !== "staff")
    ) {
        return null;
    }

    const assignedRole = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
    const assignedPermissions = (
        assignedRole?.is_active ? assignedRole.permissions : null
    ) as AdminPermissionMap | null;
    const isSuperAdmin =
        profile.account_type === "admin" || assignedPermissions?.full_access === true;

    const sessionPayload: AdminSessionPayload = {
        userId: authData.user.id,
        email: profile.email ?? authData.user.email ?? null,
        fullName: profile.full_name ?? null,
        role: profile.account_type,
        roleName: assignedRole?.is_active ? assignedRole.name : profile.role_name ?? profile.account_type,
        isActive: profile.is_active,
        isAdmin: isSuperAdmin,
        mustChangePassword: (
            profile.must_change_password === true || profile.first_login === true
        ) && !isSuperAdmin,
        firstLogin: profile.first_login === true,
        permissions: assignedPermissions,
        exp: Date.now() + 1000 * 60 * 60 * 8, // 8 hours
    };

    return sessionPayload;
});
