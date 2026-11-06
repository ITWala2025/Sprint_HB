import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
    type AdminSessionPayload,
} from "@/lib/auth/admin-session";
import type { AdminPermissionMap } from "./auth-types";

export type { AdminSessionPayload };

/**
 * Cached per-request session reader.
 * 1. Checks and verifies the HMAC-signed admin session cookie (0ms).
 * 2. Falls back to Supabase auth & profiles table if no valid session cookie exists.
 * 3. React `cache()` ensures this executes at most ONCE per server render request.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionPayload | null> => {
    const cookieStore = await cookies();

    // 1. Fast Path: Read from cryptographically verified session cookie
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (sessionToken) {
        const verifiedSession = await verifyAdminSessionToken(sessionToken);
        if (verifiedSession && verifiedSession.isActive) {
            return verifiedSession;
        }
    }

    // 2. Slow Path: Fallback to Supabase Auth & DB
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

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active, must_change_password, full_name, email, role_id, roles(name, permissions, is_active)")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (profileError || !profile || profile.is_active !== true) {
        return null;
    }

    const assignedRole = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
    const assignedPermissions = (
        assignedRole?.is_active ? assignedRole.permissions : null
    ) as AdminPermissionMap | null;
    const isSuperAdmin =
        profile.role === "admin" || assignedPermissions?.full_access === true;
    const validAssignedRole = Boolean(assignedRole?.name && assignedRole.is_active !== false);

    if (!isSuperAdmin && !validAssignedRole) {
        return null;
    }

    const sessionPayload: AdminSessionPayload = {
        userId: authData.user.id,
        email: profile.email ?? authData.user.email ?? null,
        fullName: profile.full_name ?? null,
        role: profile.role,
        roleName: assignedRole?.is_active ? assignedRole.name : profile.role,
        isActive: profile.is_active,
        isAdmin: isSuperAdmin,
        mustChangePassword: profile.must_change_password === true && !isSuperAdmin,
        permissions: assignedPermissions,
        exp: Date.now() + 1000 * 60 * 60 * 8, // 8 hours
    };

    return sessionPayload;
});

