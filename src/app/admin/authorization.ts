import "server-only";

import { redirect } from "next/navigation";
import { getAdminSession } from "./session";
import { roleHasPermission } from "./auth-types";

export { adminRoutePermissions, canAccessAdminRoute, roleHasPermission } from "./auth-types";
export type { AdminPermissionMap } from "./auth-types";

/**
 * Validates module access for admin/staff routes using cached session management.
 * Avoids redundant remote Supabase Auth and RPC round-trips on every navigation.
 */
export async function assertModuleAccess(
    moduleSlugs: string | readonly string[],
    capability = "view",
): Promise<void> {
    const session = await getAdminSession();
    if (!session || !session.isActive) {
        redirect("/admin");
    }

    // Admins or roles with full_access pass immediately without DB queries
    if (session.isAdmin) {
        return;
    }

    // In-memory verification against the verified session permission map
    const modules = typeof moduleSlugs === "string" ? [moduleSlugs] : moduleSlugs;
    for (const moduleSlug of modules) {
        if (roleHasPermission(session.permissions, moduleSlug, capability)) {
            return;
        }
    }

    redirect("/staff/dashboard");
}
