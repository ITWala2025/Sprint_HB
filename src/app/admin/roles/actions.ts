"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import type { Role, StaffProfile } from "@/components/admin/roles/types";

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

function requireServiceClient() {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return serviceClient;
}

export type RolesDataResult = {
    roles: Role[];
    users: StaffProfile[];
    error?: string;
};

export async function getRolesAndStaffProfiles(): Promise<RolesDataResult> {
    await assertModuleAccess("access_control");
    try {
        const serviceClient = createServiceClient();
        const supabase = serviceClient ?? await createAuthenticatedServerClient();

        const [{ data: roleData, error: roleError }, { data: profileData, error: profileError }] = await Promise.all([
            supabase.from("roles").select("*").order("name"),
            supabase
                .from("profiles")
                .select("id, full_name, email, role_id, is_active, role, roles(id, name, color)")
                .neq("role", "student")
                .order("full_name"),
        ]);

        if (roleError) {
            console.error("[SPRINT Admin Roles] Failed to load roles:", roleError);
            return { roles: [], users: [], error: roleError.message };
        }
        if (profileError) {
            console.error("[SPRINT Admin Roles] Failed to load staff profiles:", profileError);
            return { roles: [], users: [], error: profileError.message };
        }

        const profiles = profileData ?? [];
        const roles: Role[] = (roleData ?? []).map((role: any) => ({
            ...role,
            permissions: role.permissions ?? {},
            assigned_count: profiles.filter((profile: any) => profile.role_id === role.id).length,
        }));

        const users: StaffProfile[] = profiles.map((profile: any) => ({
            id: profile.id,
            full_name: profile.full_name || "Unnamed staff",
            email: profile.email,
            role_id: profile.role_id ?? null,
            is_active: profile.is_active,
            roles: Array.isArray(profile.roles) ? profile.roles[0] ?? null : profile.roles ?? null,
        }));

        return { roles, users };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load roles and access control data.";
        return { roles: [], users: [], error: message };
    }
}

export type RoleSavePayload = {
    name: string;
    slug: string;
    description: string;
    color: string;
    permissions: Record<string, any>;
    is_active: boolean;
    is_system: boolean;
};

export async function saveRoleAction(
    payload: RoleSavePayload,
    id?: string,
): Promise<{ success: boolean; data?: Role; error?: string }> {
    const capability = id ? "edit" : "create";
    await assertModuleAccess("access_control", capability);

    try {
        const supabase = requireServiceClient();
        const query = id
            ? supabase.from("roles").update(payload).eq("id", id).select().single()
            : supabase.from("roles").insert(payload).select().single();

        const { data, error } = await query;
        if (error || !data) {
            return { success: false, error: error?.message ?? "Unable to save this role." };
        }

        revalidatePath("/admin/roles");
        revalidatePath("/admin/users");
        return { success: true, data: data as Role };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unable to save this role." };
    }
}

export async function updateUserRoleAction(
    userId: string,
    roleId: string | null,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess("access_control", "edit");
    try {
        const supabase = requireServiceClient();
        const targetRoleId = roleId === "" || roleId === "unassigned" ? null : roleId;
        const { error } = await supabase
            .from("profiles")
            .update({ role_id: targetRoleId })
            .eq("id", userId);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/admin/roles");
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unable to update user role." };
    }
}

export async function deleteRoleAction(
    roleId: string,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess("access_control", "delete");
    try {
        const supabase = requireServiceClient();

        // 1. Check if role is a system role
        const { data: role, error: fetchErr } = await supabase
            .from("roles")
            .select("is_system, name")
            .eq("id", roleId)
            .maybeSingle();

        if (fetchErr) return { success: false, error: fetchErr.message };
        if (role?.is_system) {
            return { success: false, error: "System roles cannot be deleted." };
        }

        // 2. Unassign users
        await supabase
            .from("profiles")
            .update({ role_id: null })
            .eq("role_id", roleId);

        // 3. Delete the role
        const { error: deleteErr } = await supabase
            .from("roles")
            .delete()
            .eq("id", roleId);

        if (deleteErr) return { success: false, error: deleteErr.message };

        revalidatePath("/admin/roles");
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unable to delete role." };
    }
}

export async function deleteStaffProfileAction(
    userId: string,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess("access_control", "delete");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/roles");
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unable to delete staff profile." };
    }
}
