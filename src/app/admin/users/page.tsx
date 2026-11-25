import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { assertModuleAccess, canAccessAdminRoute, roleHasPermission, type AdminPermissionMap } from "@/app/admin/authorization";
import { getAdminSession } from "@/app/admin/session";
import { createServiceClient } from "@/lib/supabase/service";
import { getStaffDirectoryRecords } from "@/lib/supabase/staff";
import UserDirectoryTable, { type DirectoryRole, type DirectoryUser } from "@/components/admin/users/UserDirectoryTable";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
    await assertModuleAccess("user_management");

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

    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }

    const [staffRecords, { data: roleRows, error: rolesError }] = await Promise.all([
        getStaffDirectoryRecords(serviceClient),
        serviceClient
            .from("roles")
            .select("id, name, slug, description, permissions, is_active, is_system, color")
            .eq("is_active", true)
            .order("name"),
    ]);

    if (rolesError) throw new Error(`Could not load staff roles: ${rolesError.message}`);

    const users: DirectoryUser[] = staffRecords.map((record) => {
        const role = Array.isArray(record.roles) ? record.roles[0] : record.roles;
        return {
            id: record.id,
            full_name: record.full_name,
            email: record.email,
            role: record.account_type,
            role_id: record.role_id,
            is_active: record.is_active,
            must_change_password: record.must_change_password,
            first_login: record.first_login,
            avatar_url: null,
            roleName: role?.name ?? record.role_name ?? record.account_type,
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
                roles={(roleRows ?? []) as DirectoryRole[]}
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