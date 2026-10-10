import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminPermissionMap = Record<string, { view?: boolean }> & {
    full_access?: boolean;
};

export const adminRoutePermissions: Record<string, string[]> = {
    "/admin/dashboard": [],
    "/admin/users": ["user_management", "access_control"],
    "/admin/roles": ["access_control"],
    "/admin/courses": ["courses", "instructors", "academic_ops", "academics", "trainers"],
    "/admin/enquiries": ["admissions", "marketing", "support"],
    "/admin/admissions": ["admissions", "marketing", "support"],
    "/admin/cms/home": ["cms_home", "marketing"],
    "/admin/cms/about": ["cms_about"],
    "/admin/cms/courses": ["cms_courses", "courses"],
    "/admin/cms/contact": ["cms_contact", "support"],
    "/admin/cms/careers": ["cms_careers", "marketing"],
    "/admin/cms/announcements": ["cms_announcements", "marketing"],
    "/admin/cms/legal": ["cms_legal"],
    "/admin/students": ["student_ops"],
    "/admin/academics": ["academic_ops", "academics"],
    "/admin/scholarships": ["academic_ops", "academics"],
    "/admin/partners": ["partners"],
    "/admin/trainers": ["instructors", "trainers"],
    "/admin/updates": ["cms_announcements", "marketing"],
};

export function canAccessAdminRoute(
    pathname: string,
    permissions: AdminPermissionMap | null,
    profileRole: string | null,
    roleName: string | null,
): boolean {
    if (
        profileRole?.toLowerCase() === "admin" ||
        roleName?.toLowerCase() === "super admin" ||
        permissions?.full_access === true
    ) {
        return true;
    }

    const matchingRoute = Object.keys(adminRoutePermissions)
        .sort((left, right) => right.length - left.length)
        .find((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (!matchingRoute) return false;

    const requiredPermissions = adminRoutePermissions[matchingRoute];
    return requiredPermissions.length === 0 || requiredPermissions.some(
        (permission) => permissions?.[permission]?.view === true,
    );
}

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