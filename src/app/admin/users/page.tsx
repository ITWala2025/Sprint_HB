import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess, canAccessAdminRoute, roleHasPermission, type AdminPermissionMap } from "@/app/admin/authorization";
import { getAdminSession } from "@/app/admin/session";
import UserDirectoryTable, { type DirectoryRole, type DirectoryUser } from "@/components/admin/users/UserDirectoryTable";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

type ProfileRow = Omit<DirectoryUser, "roleName" | "roleColor"> & {
    roles: DirectoryRole | DirectoryRole[] | null;
};

export default async function AdminUsersPage() {
    await assertModuleAccess("user_management");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Components cannot write refreshed auth cookies.
                }
            },
        },
    });

    const session = await getAdminSession();
    if (!session || !session.isActive) redirect("/admin");

    if (!canAccessAdminRoute("/admin/users", session.permissions, session.role, session.roleName)) {
        return <AccessDenied />;
    }

    const canCreateUsers = session.isAdmin ||
        roleHasPermission(session.permissions, "user_management", "create") ||
        roleHasPermission(session.permissions, "access_control", "create");
    const canDeleteUsers = session.isAdmin ||
        session.roleName?.trim().toLowerCase() === "super admin" ||
        roleHasPermission(session.permissions, "user_management", "delete") ||
        roleHasPermission(session.permissions, "access_control", "delete");

    const [{ data: profiles, error: profilesError }, { data: roleRows, error: rolesError }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, full_name, email, role, role_id, is_active, must_change_password, first_login, avatar_url, roles(id, name, color)")
            .neq("role", "student")
            .order("full_name"),
        supabase
            .from("roles")
            .select("id, name, slug, description, permissions, is_active, is_system, color")
            .eq("is_active", true)
            .order("name"),
    ]);

    if (profilesError) throw new Error(`Could not load the staff directory: ${profilesError.message}`);
    if (rolesError) throw new Error(`Could not load staff roles: ${rolesError.message}`);

    const users = ((profiles ?? []) as unknown as ProfileRow[]).map((profile) => {
        const role = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
        return {
            ...profile,
            roles: undefined,
            roleName: role?.name ?? profile.role,
            roleColor: role?.color ?? "navy",
        };
    });

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-red">People & access</p>
                    <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy">Staff & User Directory</h1>
                    <p className="mt-2 text-sm text-brand-text-secondary">Manage staff accounts, assigned roles, and first-login security.</p>
                </div>
                <p className="text-sm font-semibold text-brand-text-muted">{users.length} accounts</p>
            </header>
            <UserDirectoryTable
                users={users}
                roles={roleRows ?? []}
                canInvite={canCreateUsers}
                canDelete={canDeleteUsers}
            />
        </div>
    );
}

function AccessDenied() {
    return (
        <section className="mx-auto mt-12 max-w-xl rounded-xl border border-brand-border bg-white p-8 text-center shadow-sm" aria-labelledby="directory-denied-title">
            <h1 id="directory-denied-title" className="font-display text-2xl font-bold text-brand-navy">Access Denied</h1>
            <p className="mt-2 text-sm leading-6 text-brand-text-secondary">Your assigned role cannot view staff account management.</p>
            <a href="/admin/dashboard" className="mt-5 inline-flex rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">Return to dashboard</a>
        </section>
    );
}