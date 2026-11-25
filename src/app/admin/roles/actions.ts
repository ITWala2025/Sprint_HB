"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { assertModuleAccess } from "@/app/admin/authorization";
import { deleteStaffUserAction } from "@/app/admin/users/actions";
import { createServiceClient } from "@/lib/supabase/service";
import { getStaffDirectoryRecords } from "@/lib/supabase/staff";
import type { Role, StaffProfile } from "@/components/admin/roles/types";

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
        const serviceClient = requireServiceClient();
        const [staffRecords, { data: roleData, error: roleError }] = await Promise.all([
            getStaffDirectoryRecords(serviceClient),
            serviceClient.from("roles").select("*").order("name"),
        ]);

        if (roleError) {
            console.error("[SPRINT Admin Roles] Failed to load roles:", roleError);
            return { roles: [], users: [], error: roleError.message };
        }

        const roles: Role[] = (roleData ?? []).map((role: any) => ({
            ...role,
            permissions: role.permissions ?? {},
            assigned_count: staffRecords.filter((staff) => staff.role_id === role.id).length,
        }));

        const users: StaffProfile[] = staffRecords.map((record) => {
            const role = Array.isArray(record.roles) ? record.roles[0] : record.roles;
            return {
                id: record.id,
                full_name: record.full_name || "Unnamed staff",
                email: record.email,
                role_id: record.role_id ?? null,
                is_active: record.is_active,
                roles: role?.id && role.name
                    ? { id: role.id, name: role.name, color: role.color ?? "navy" }
                    : null,
            };
        });

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

        const { error: staffSyncError } = await supabase
            .from("staff")
            .update({ role_name: data.name })
            .eq("role_id", data.id);
        if (staffSyncError) {
            return { success: false, error: `The role was saved, but staff records could not be synchronized: ${staffSyncError.message}` };
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
        let roleName: string | null = null;
        if (targetRoleId) {
            const { data: role, error: roleError } = await supabase
                .from("roles")
                .select("name, is_active")
                .eq("id", targetRoleId)
                .maybeSingle();
            if (roleError) return { success: false, error: roleError.message };
            if (!role || role.is_active !== true) {
                return { success: false, error: "The selected role is inactive or unavailable." };
            }
            roleName = role.name;
        }

        const { data: targetProfile, error: targetProfileError } = await supabase
            .from("profiles")
            .select("id, full_name, email, role, is_active, status, first_login, must_change_password")
            .eq("id", userId)
            .maybeSingle();
        if (targetProfileError) return { success: false, error: targetProfileError.message };
        if (!targetProfile || targetProfile.role === "student") {
            return { success: false, error: "The staff profile could not be found." };
        }

        const { data: updatedProfile, error } = await supabase
            .from("profiles")
            .update({ role_id: targetRoleId })
            .eq("id", userId)
            .select("id")
            .maybeSingle();

        if (error) {
            return { success: false, error: error.message };
        }
        if (!updatedProfile) {
            return { success: false, error: "The staff profile could not be found." };
        }

        const { error: staffSyncError } = await supabase.from("staff").upsert({
            id: userId,
            full_name: targetProfile.full_name,
            email: targetProfile.email,
            account_type: targetProfile.role,
            role_id: targetRoleId,
            role_name: roleName,
            is_active: targetProfile.is_active,
            status: targetProfile.status,
            first_login: targetProfile.first_login,
            must_change_password: targetProfile.must_change_password,
        }, { onConflict: "id" });
        if (staffSyncError) {
            return { success: false, error: `The profile role was updated, but the staff mirror could not be synchronized: ${staffSyncError.message}` };
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

        // 2. Unassign users and keep the staff mirror in sync
        const { error: unassignProfileError } = await supabase
            .from("profiles")
            .update({ role_id: null })
            .eq("role_id", roleId);
        if (unassignProfileError) return { success: false, error: unassignProfileError.message };

        const { error: unassignStaffError } = await supabase
            .from("staff")
            .update({ role_id: null, role_name: null })
            .eq("role_id", roleId);
        if (unassignStaffError) return { success: false, error: unassignStaffError.message };

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
    const result = await deleteStaffUserAction(userId);
    if (!result.success) return result;

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
    return { success: true };
}
