"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users } from "lucide-react";
import CreateUserModal from "@/components/admin/roles/CreateUserModal";

export type DirectoryRole = {
    id: string;
    name: string;
    color?: string;
};

export type DirectoryUser = {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    role_id: string | null;
    is_active: boolean;
    must_change_password: boolean;
    avatar_url: string | null;
    roleName: string;
    roleColor: string;
};

type UserDirectoryTableProps = {
    users: DirectoryUser[];
    roles: DirectoryRole[];
    canInvite: boolean;
};

function initials(fullName: string | null, email: string) {
    const source = fullName?.trim() || email;
    return source.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function UserDirectoryTable({ users, roles, canInvite }: UserDirectoryTableProps) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const router = useRouter();

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesSearch = !normalizedSearch ||
                `${user.full_name ?? ""} ${user.email}`.toLowerCase().includes(normalizedSearch);
            const matchesRole = roleFilter === "all" || user.role_id === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [roleFilter, search, users]);

    return (
        <section className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm" aria-label="Staff directory">
            <div className="flex flex-col gap-3 border-b border-brand-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <label className="flex min-w-0 items-center gap-2 rounded-lg border border-brand-border bg-brand-off-white px-3 py-2.5 sm:max-w-sm sm:flex-1">
                        <Search className="size-4 shrink-0 text-brand-text-muted" aria-hidden="true" />
                        <span className="sr-only">Search by name or email</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or email"
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-brand-text-muted"
                        />
                    </label>
                    <label className="sr-only" htmlFor="directory-role-filter">Filter by assigned role</label>
                    <select
                        id="directory-role-filter"
                        value={roleFilter}
                        onChange={(event) => setRoleFilter(event.target.value)}
                        className="rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-navy"
                    >
                        <option value="all">All roles</option>
                        {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                </div>
                {canInvite && (
                    <button
                        type="button"
                        onClick={() => setIsInviteOpen(true)}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Invite / Create User
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-brand-off-white text-[11px] uppercase tracking-wider text-brand-text-muted">
                        <tr>
                            <th scope="col" className="px-5 py-3">Staff member</th>
                            <th scope="col" className="px-5 py-3">Assigned role</th>
                            <th scope="col" className="px-5 py-3">Status</th>
                            <th scope="col" className="px-5 py-3">Password</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-5 py-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="size-10 shrink-0 rounded-full object-cover" />
                                        ) : (
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white" aria-hidden="true">
                                                {initials(user.full_name, user.email)}
                                            </span>
                                        )}
                                        <span className="min-w-0">
                                            <span className="block truncate font-semibold text-brand-navy">{user.full_name || "Unnamed user"}</span>
                                            <span className="block truncate text-xs text-brand-text-muted">{user.email}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="inline-flex rounded-full bg-brand-blue-light px-2.5 py-1 text-xs font-semibold text-brand-navy">{user.roleName}</span>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.is_active ? "text-emerald-700" : "text-brand-text-muted"}`}>
                                        <span className={`size-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
                                        {user.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    {user.must_change_password ? (
                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Reset required</span>
                                    ) : (
                                        <span className="text-xs text-brand-text-muted">Updated</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!filteredUsers.length && (
                            <tr>
                                <td colSpan={4} className="px-5 py-14 text-center">
                                    <Users className="mx-auto size-8 text-brand-text-muted" aria-hidden="true" />
                                    <p className="mt-3 text-sm font-semibold text-brand-navy">No staff accounts found</p>
                                    <p className="mt-1 text-xs text-brand-text-muted">Try another search or role filter.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isInviteOpen && canInvite && (
                <CreateUserModal
                    roles={roles}
                    onClose={() => setIsInviteOpen(false)}
                    onCreated={() => router.refresh()}
                />
            )}
        </section>
    );
}