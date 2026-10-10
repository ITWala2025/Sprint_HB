"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, LoaderCircle, Mail, Plus, Search, Trash2, Users, X } from "lucide-react";
import { deleteStaffUserAction, resendStaffInvitationAction } from "@/app/admin/users/actions";
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
    first_login: boolean;
    avatar_url: string | null;
    roleName: string;
    roleColor: string;
};

type UserDirectoryTableProps = {
    users: DirectoryUser[];
    roles: DirectoryRole[];
    canInvite: boolean;
    canDelete: boolean;
};

function initials(fullName: string | null, email: string) {
    const source = fullName?.trim() || email;
    return source.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function UserDirectoryTable({ users, roles, canInvite, canDelete }: UserDirectoryTableProps) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [resendResult, setResendResult] = useState<{
        email: string;
        tempPassword: string;
        inviteUrl: string;
    } | null>(null);
    const [copyError, setCopyError] = useState("");
    const [copiedValue, setCopiedValue] = useState<"password" | "link" | null>(null);
    const [isPending, startTransition] = useTransition();
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

    function handleDelete(user: DirectoryUser) {
        if (!window.confirm(`Permanently delete ${user.full_name || user.email}? This cannot be undone.`)) {
            return;
        }

        setDeleteError("");
        startTransition(async () => {
            try {
                const result = await deleteStaffUserAction(user.id);
                if (result.success === false) {
                    setDeleteError(result.error);
                    return;
                }
                router.refresh();
            } catch {
                setDeleteError("The staff account could not be deleted. Check your connection and try again.");
            }
        });
    }

    function handleResend(user: DirectoryUser) {
        setDeleteError("");
        setResendResult(null);
        setCopiedValue(null);
        setCopyError("");
        startTransition(async () => {
            try {
                const result = await resendStaffInvitationAction(user.id);
                if (result.success === false) {
                    setDeleteError(result.error);
                    return;
                }
                setResendResult(result);
                router.refresh();
            } catch {
                setDeleteError("The staff invitation could not be resent. Check your connection and try again.");
            }
        });
    }

    async function copyInvitationValue(value: string, copied: "password" | "link") {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedValue(copied);
            setCopyError("");
        } catch {
            setCopyError("Clipboard access was blocked. Select and copy the value manually.");
        }
    }

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

            {deleteError && (
                <p className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-brand-red" role="alert">
                    {deleteError}
                </p>
            )}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-brand-off-white text-[11px] uppercase tracking-wider text-brand-text-muted">
                        <tr>
                            <th scope="col" className="px-5 py-3">Staff member</th>
                            <th scope="col" className="px-5 py-3">Assigned role</th>
                            <th scope="col" className="px-5 py-3">Status</th>
                            <th scope="col" className="px-5 py-3">Password</th>
                            {(canInvite || canDelete) && <th scope="col" className="px-5 py-3 text-right">Actions</th>}
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
                                {(canInvite || canDelete) && (
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {canInvite && user.is_active && (user.first_login || user.must_change_password) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleResend(user)}
                                                    disabled={isPending}
                                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    aria-label={`Resend invitation to ${user.email}`}
                                                >
                                                    {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}
                                                    {isPending ? "Sending..." : "Resend invite"}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={isPending}
                                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-brand-red transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    aria-label={`Delete ${user.full_name || user.email}`}
                                                >
                                                    {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                                                    {isPending ? "Working..." : "Delete"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {!filteredUsers.length && (
                            <tr>
                                <td colSpan={canInvite || canDelete ? 5 : 4} className="px-5 py-14 text-center">
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
                    onClose={() => {
                        setIsInviteOpen(false);
                        router.refresh();
                    }}
                    onCreated={() => router.refresh()}
                />
            )}
            {resendResult && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm">
                    <section className="w-full max-w-md rounded-xl border border-white/60 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="resend-invitation-title">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="resend-invitation-title" className="font-display text-xl font-bold text-brand-navy">Invitation resent</h2>
                                <p className="mt-1 text-sm leading-6 text-brand-text-secondary">A new Supabase invitation email has been sent. The invitation link is valid for 1 hour.</p>
                            </div>
                            <button type="button" onClick={() => setResendResult(null)} aria-label="Close resend confirmation" className="rounded-md p-1 text-brand-text-muted hover:bg-slate-100"><X className="size-5" aria-hidden="true" /></button>
                        </div>
                        <div className="mt-5 space-y-4 rounded-lg border border-brand-border bg-brand-off-white p-4 text-sm">
                            <p><span className="text-xs font-bold text-brand-text-muted">EMAIL</span><br />{resendResult.email}</p>
                            <div>
                                <span className="text-xs font-bold text-brand-text-muted">TEMPORARY PASSWORD</span>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                    <span className="break-all font-mono">{resendResult.tempPassword}</span>
                                    <button type="button" onClick={() => void copyInvitationValue(resendResult.tempPassword, "password")} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-brand-border bg-white px-2 py-1 text-xs font-bold text-brand-navy">
                                        {copiedValue === "password" ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                                        {copiedValue === "password" ? "Copied" : "Copy Password"}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-brand-text-muted">STAFF INVITATION LINK</span>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                    <a className="break-all text-brand-blue underline" href={resendResult.inviteUrl} target="_blank" rel="noreferrer">{resendResult.inviteUrl}</a>
                                    <button type="button" onClick={() => void copyInvitationValue(resendResult.inviteUrl, "link")} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-brand-border bg-white px-2 py-1 text-xs font-bold text-brand-navy">
                                        {copiedValue === "link" ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                                        {copiedValue === "link" ? "Copied" : "Copy Link"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {copyError && <p className="mt-3 text-sm text-brand-red" role="alert">{copyError}</p>}
                        <button type="button" onClick={() => setResendResult(null)} className="mt-5 w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm font-bold text-brand-navy">Done</button>
                    </section>
                </div>
            )}
        </section>
    );
}