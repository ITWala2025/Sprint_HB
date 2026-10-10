import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { AdminPermissionMap } from "@/app/admin/authorization";
import AdminLayoutClient from "@/app/admin/AdminLayoutClient";

type InitialProfile = {
    role: string | null;
    is_active: boolean;
    must_change_password: boolean;
    role_name: string | null;
    permissions: AdminPermissionMap | null;
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let initialProfile: InitialProfile | null = null;
    if (supabaseUrl && publishableKey) {
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
        if (authData.user) {
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role, is_active, must_change_password, role_id, roles(name, permissions, is_active)")
                .eq("id", authData.user.id)
                .maybeSingle();

            if (profileError) throw new Error(`Admin profile could not be loaded: ${profileError.message}`);

            if (profile) {
                const assignedRole = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
                initialProfile = {
                    role: profile.role,
                    is_active: profile.is_active,
                    must_change_password: profile.must_change_password,
                    role_name: assignedRole?.is_active ? assignedRole.name : null,
                    permissions: (assignedRole?.is_active
                        ? assignedRole.permissions
                        : null) as AdminPermissionMap | null,
                };
            }
        }
    }

    return <AdminLayoutClient initialProfile={initialProfile}>{children}</AdminLayoutClient>;
}
