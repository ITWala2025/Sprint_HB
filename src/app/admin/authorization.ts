import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export { adminRoutePermissions, canAccessAdminRoute } from "./auth-types";
export type { AdminPermissionMap } from "./auth-types";

export async function assertModuleAccess(
    moduleSlug: string,
    capability = "view",
): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, publishableKey, {
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

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Admin session verification failed: ${authError.message}`);
    if (!authData.user) redirect("/admin");

    const { data: permitted, error } = await supabase.rpc("current_user_has_permission", {
        module_key: moduleSlug,
        capability,
    });
    if (error) throw new Error(`Could not verify ${capability} access for ${moduleSlug}: ${error.message}`);
    if (permitted !== true) redirect("/admin/dashboard");
}