import "server-only";

import { roleHasPermission } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

type StudentOpsServiceResult =
    | { success: true; client: NonNullable<ReturnType<typeof createServiceClient>> }
    | { success: false; error: string };

export async function getStudentOpsServiceClient(): Promise<StudentOpsServiceResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return { success: false, error: "Admin session expired. Please sign in again." };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active, roles(permissions, is_active)")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError) {
        return { success: false, error: `Could not verify student operations permissions: ${profileError.message}` };
    }

    const assignedRole = Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles;
    const canManageStudents = profile?.is_active === true && (
        profile.role === "admin" ||
        (
            profile.role === "staff" &&
            assignedRole?.is_active === true &&
            roleHasPermission(assignedRole.permissions, "student_ops", "edit")
        )
    );

    if (!canManageStudents) {
        return { success: false, error: "You do not have permission to manage student accounts." };
    }

    const client = createServiceClient();
    if (!client) {
        return { success: false, error: "Server-side Supabase service role is not configured." };
    }

    return { success: true, client };
}
