import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

export type StaffServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

export type StaffRoleRecord = {
    id?: string;
    name: string | null;
    color?: string | null;
    permissions: Record<string, unknown> | null;
    is_active: boolean | null;
};

export type StaffDirectoryRecord = {
    id: string;
    full_name: string | null;
    email: string;
    account_type: string;
    role_id: string | null;
    role_name: string | null;
    is_active: boolean;
    status: string | null;
    first_login: boolean;
    must_change_password: boolean;
    created_at: string;
    updated_at: string;
    roles: StaffRoleRecord | StaffRoleRecord[] | null;
};

const STAFF_DIRECTORY_SELECT =
    "id, full_name, email, account_type, role_id, role_name, is_active, status, first_login, must_change_password, created_at, updated_at, roles(id, name, color, permissions, is_active)";

export async function getStaffDirectoryRecords(
    client?: StaffServiceClient,
): Promise<StaffDirectoryRecord[]> {
    const serviceClient = client ?? createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }

    const { data, error } = await serviceClient
        .from("staff")
        .select(STAFF_DIRECTORY_SELECT)
        .neq("account_type", "student")
        .order("full_name");

    if (error) {
        throw new Error(`Could not load staff records: ${error.message}`);
    }

    return (data ?? []) as unknown as StaffDirectoryRecord[];
}

export async function getUserAccountRecord(
    userId: string,
    client?: StaffServiceClient,
): Promise<{ record: StaffDirectoryRecord | null; error: string | null }> {
    const serviceClient = client ?? createServiceClient();
    if (!serviceClient) {
        return { record: null, error: "Server-side Supabase service role is not configured." };
    }

    const { data: staffRecord, error: staffError } = await serviceClient
        .from("staff")
        .select(STAFF_DIRECTORY_SELECT)
        .eq("id", userId)
        .maybeSingle();

    if (staffError) {
        console.error("[SPRINT Staff Auth] Could not load the staff mirror:", staffError.message);
    }
    if (staffRecord) {
        return { record: staffRecord as unknown as StaffDirectoryRecord, error: null };
    }

    const { data: profile, error: profileError } = await serviceClient
        .from("profiles")
        .select("id, full_name, email, role, role_id, is_active, status, first_login, must_change_password, roles(name, permissions, is_active)")
        .eq("id", userId)
        .maybeSingle();

    if (profileError) {
        return {
            record: null,
            error: staffError
                ? `${staffError.message}; profile fallback failed: ${profileError.message}`
                : profileError.message,
        };
    }
    if (!profile) {
        return { record: null, error: staffError?.message ?? null };
    }

    if (profile.role !== "student") {
        console.warn("[SPRINT Staff Auth] The staff mirror row is missing; using the service-role profile record.", {
            userId,
            staffQueryError: staffError?.message,
        });
    }

    return {
        record: {
            ...profile,
            account_type: profile.role,
            role_name: null,
            created_at: "",
            updated_at: "",
        } as unknown as StaffDirectoryRecord,
        error: null,
    };
}
