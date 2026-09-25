"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CheckSquare, Edit3, Filter, Plus, RefreshCw, Search, Shield, SlidersHorizontal, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CreateUserModal from "@/components/admin/roles/CreateUserModal";
import RoleModal from "@/components/admin/roles/RoleModal";
import { countPermissions, Role, StaffProfile } from "@/components/admin/roles/types";

type Tab = "roles" | "users" | "matrix" | "audit";

const tabItems: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: "roles", label: "Roles Catalog", icon: Shield },
    { id: "users", label: "User Role Assignments", icon: Users },
    { id: "matrix", label: "Access Matrix Grid", icon: CheckSquare },
    { id: "audit", label: "Audit Activity Log", icon: Activity },
];

const metricItems = [
    { label: "Configured Roles", note: "System and custom policies", icon: Shield, accent: "bg-brand-blue-light text-brand-blue" },
    { label: "Assigned Members", note: "Active staff accounts", icon: Users, accent: "bg-emerald-50 text-emerald-600" },
    { label: "Custom Organization Roles", note: "Built for your organization", icon: SlidersHorizontal, accent: "bg-orange-50 text-orange-600" },
    { label: "Protected System Modules", note: "Permission-aware modules", icon: CheckSquare, accent: "bg-brand-red-light text-brand-red" },
];

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<StaffProfile[]>([]);
    const [tab, setTab] = useState<Tab>("roles");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [userRole, setUserRole] = useState("all");
    const [userStatus, setUserStatus] = useState("all");
    const [roleModal, setRoleModal] = useState<Role | null | undefined>(undefined);
    const [userModal, setUserModal] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    const loadData = useCallback(async () => {
        setIsLoading(true); setError("");
        const [{ data: roleData, error: roleError }, { data: profileData, error: profileError }] = await Promise.all([
            supabase.from("roles").select("*").order("name"),
            supabase.from("profiles").select("id, full_name, email, role_id, is_active, roles(id, name, color)").order("full_name"),
        ]);
        if (roleError || profileError) setError(roleError?.message ?? profileError?.message ?? "Unable to load access control data.");
        setRoles((roleData ?? []).map((role) => ({ ...role, permissions: role.permissions ?? {}, assigned_count: (profileData ?? []).filter((profile) => profile.role_id === role.id).length })) as Role[]);
        setUsers((profileData ?? []).map((profile) => ({ ...profile, roles: Array.isArray(profile.roles) ? profile.roles[0] ?? null : profile.roles })) as unknown as StaffProfile[]);
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => { void loadData(); }, [loadData]);

    const filteredRoles = useMemo(() => roles.filter((role) => (status === "all" || (status === "active" ? role.is_active : !role.is_active)) && `${role.name} ${role.slug}`.toLowerCase().includes(search.toLowerCase())), [roles, search, status]);
    const filteredUsers = useMemo(() => users.filter((user) => (userRole === "all" || user.roles?.id === userRole) && (userStatus === "all" || (userStatus === "active" ? user.is_active !== false : user.is_active === false)) && `${user.full_name} ${user.email}`.toLowerCase().includes(search.toLowerCase())), [users, search, userRole, userStatus]);
    const activeUsers = users.filter((user) => user.is_active !== false).length;
    const customRoles = roles.filter((role) => !role.is_system).length;
    const moduleCount = 13;

    async function updateUserRole(userId: string, roleId: string) {
        const { error: updateError } = await supabase.from("profiles").update({ role_id: roleId }).eq("id", userId);
        if (updateError) { setError(updateError.message); return; }
        await loadData();
    }

    async function deleteUser(userId: string) {
        if (!window.confirm("Remove this staff profile?")) return;
        const { error: deleteError } = await supabase.from("profiles").delete().eq("id", userId);
        if (deleteError) setError(deleteError.message); else await loadData();
    }

    async function deleteRole(role: Role) {
        if (role.is_system) {
            setError("System roles cannot be deleted.");
            return;
        }

        const assignedCount = role.assigned_count ?? 0;
        const confirmation = assignedCount > 0
            ? `${role.name} is currently assigned to ${assignedCount} user(s). Deleting it will unassign those users. Are you sure you want to proceed?`
            : `Are you sure you want to delete role '${role.name}'?`;
        if (!window.confirm(confirmation)) return;

        setError("");
        if (assignedCount > 0) {
            const { error: unassignError } = await supabase
                .from("profiles")
                .update({ role_id: null })
                .eq("role_id", role.id);
            if (unassignError) {
                setError(unassignError.message);
                return;
            }
        }

        const { error: deleteError } = await supabase.from("roles").delete().eq("id", role.id);
        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        await loadData();
        setRoles((current) => current.filter((currentRole) => currentRole.id !== role.id));
    }

    return <div className="mx-auto max-w-[1500px] space-y-6"><section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div><span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-100">Roles & Access Control (RBAC)</span><h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Manage access with confidence.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Define staff roles, assign permissions, and keep every SPRINT admin workflow protected by policy.</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"><RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />Refresh</button><button type="button" onClick={() => setRoleModal(null)} className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-brand-cta hover:brightness-110"><Plus className="size-4" />New Role</button></div></div></section>
        <section aria-label="RBAC summary metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricItems.map(({ label, note, icon: Icon, accent }, index) => { const value = [roles.length, activeUsers, customRoles, moduleCount][index]; return <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-brand-text-secondary">{label}</p><p className="mt-3 font-display text-3xl font-bold text-brand-navy">{value}</p></div><span className={`flex size-11 items-center justify-center rounded-xl ${accent}`}><Icon className="size-5" /></span></div><p className="mt-3 text-xs text-brand-text-muted">{note}</p></article>; })}</section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex overflow-x-auto border-b border-slate-200">{tabItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => { setTab(item.id); setSearch(""); }} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold sm:px-6 ${tab === item.id ? "border-brand-red text-brand-navy" : "border-transparent text-brand-text-muted hover:text-brand-navy"}`}><Icon className="size-4" />{item.label}{item.id === "roles" && <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[10px] text-brand-blue">{roles.length}</span>}{item.id === "users" && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{users.length}</span>}</button>; })}</div>{error && <p className="m-5 rounded-lg bg-brand-red-light px-3 py-2 text-xs font-semibold text-brand-red">{error}</p>}{tab === "roles" && <RolesCatalog roles={filteredRoles} search={search} setSearch={setSearch} status={status} setStatus={setStatus} onEdit={(role) => setRoleModal(role)} onDelete={deleteRole} />}{tab === "users" && <UsersView users={filteredUsers} roles={roles} search={search} setSearch={setSearch} role={userRole} setRole={setUserRole} status={userStatus} setStatus={setUserStatus} onAssign={() => setUserModal(true)} onRoleChange={updateUserRole} onDelete={deleteUser} />}{tab === "matrix" && <MatrixView roles={roles} />}{tab === "audit" && <AuditView />}</section>{roleModal !== undefined && <RoleModal role={roleModal} onClose={() => setRoleModal(undefined)} onSaved={(savedRole) => { setRoleModal(undefined); setRoles((current) => current.some((role) => role.id === savedRole.id) ? current.map((role) => role.id === savedRole.id ? savedRole : role) : [...current, savedRole]); }} />}{userModal && <CreateUserModal roles={roles} onClose={() => setUserModal(false)} onCreated={() => void loadData()} />}</div>;
}

function Toolbar({ search, setSearch, children }: { search: string; setSearch: (value: string) => void; children?: React.ReactNode }) { return <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-brand-text-muted sm:w-80"><Search className="size-4 shrink-0" /><span className="sr-only">Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or slug" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-brand-text-muted" /></label><div className="flex flex-wrap items-center gap-2">{children}</div></div>; }

function RolesCatalog({ roles, search, setSearch, status, setStatus, onEdit, onDelete }: { roles: Role[]; search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void; onEdit: (role: Role) => void; onDelete: (role: Role) => void }) { return <><Toolbar search={search} setSearch={setSearch}><Filter className="size-4 text-brand-text-muted" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy"><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></Toolbar><div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2 xl:grid-cols-3">{roles.map((role) => { const coverage = countPermissions(role.permissions); return <article key={role.id} className="flex flex-col rounded-xl border border-slate-200 p-5 transition hover:border-brand-blue hover:shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white"><Shield className="size-5" /></span><div className="min-w-0"><h3 className="truncate font-display font-bold text-brand-navy">{role.name}</h3><p className="truncate text-xs text-brand-text-muted">{role.slug}</p></div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${role.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-brand-text-muted"}`}>{role.is_active ? "Active" : "Inactive"}</span></div><p className="mt-4 min-h-10 text-sm leading-5 text-brand-text-secondary">{role.description || "No description provided for this access policy."}</p><div className="mt-4 flex items-center justify-between gap-2 text-xs"><span className="rounded-full bg-brand-surface px-2.5 py-1 font-semibold text-brand-navy">SPRINT Global</span><span className="font-semibold text-brand-text-muted">{role.assigned_count ?? 0} {(role.assigned_count ?? 0) === 1 ? "user" : "users"}</span></div><div className="mt-5"><div className="flex justify-between text-[11px] font-bold"><span className="text-brand-text-secondary">Permissions Coverage</span><span className="text-brand-navy">{coverage.active} / {coverage.total} ({coverage.percentage}%)</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-red" style={{ width: `${coverage.percentage}%` }} /></div></div><footer className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-brand-text-muted">{role.is_system ? "System Seed" : "Custom Role"}</span><div className="flex items-center gap-3"><button type="button" onClick={() => onEdit(role)} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue"><Edit3 className="size-3.5" />Edit</button>{!role.is_system && <button type="button" onClick={() => onDelete(role)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 transition hover:text-brand-red" title="Delete Role" aria-label={`Delete ${role.name}`}><Trash2 className="size-3.5" />Delete</button>}</div></footer></article>; })}{roles.length === 0 && <p className="py-10 text-center text-sm text-brand-text-muted lg:col-span-3">No roles match the current filters.</p>}</div></>; }

function UsersView({ users, roles, search, setSearch, role, setRole, status, setStatus, onAssign, onRoleChange, onDelete }: { users: StaffProfile[]; roles: Role[]; search: string; setSearch: (value: string) => void; role: string; setRole: (value: string) => void; status: string; setStatus: (value: string) => void; onAssign: () => void; onRoleChange: (userId: string, roleId: string) => void; onDelete: (userId: string) => void }) { return <><Toolbar search={search} setSearch={setSearch}><select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy"><option value="all">All Roles</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy"><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><button type="button" onClick={onAssign} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy"><CheckSquare className="size-4" />Assign Role</button><button type="button" onClick={onAssign} className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-3 py-2 text-xs font-bold text-white"><Plus className="size-4" />Invite / Create User</button></Toolbar><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted"><tr><th className="px-6 py-3">User / Member</th><th className="px-6 py-3">Assigned Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">{user.full_name?.slice(0, 2).toUpperCase() || "ST"}</span><div><p className="font-semibold text-brand-navy">{user.full_name || "Unnamed staff"}</p><p className="text-xs text-brand-text-muted">{user.email}</p></div></div></td><td className="px-6 py-4"><select value={user.role_id ?? ""} onChange={(event) => onRoleChange(user.id, event.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold text-brand-navy"><option value="">Unassigned</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${user.is_active !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-brand-text-muted"}`}>{user.is_active !== false ? "Active" : "Inactive"}</span></td><td className="px-6 py-4 text-right"><button type="button" onClick={() => onDelete(user.id)} className="inline-flex size-8 items-center justify-center rounded-lg text-brand-text-muted hover:bg-brand-red-light hover:text-brand-red" aria-label={`Delete ${user.full_name}`}><Trash2 className="size-4" /></button></td></tr>)}</tbody></table>{users.length === 0 && <p className="p-10 text-center text-sm text-brand-text-muted">No staff members match the current filters.</p>}</div></>; }

function MatrixView({ roles }: { roles: Role[] }) { return <div className="overflow-x-auto p-5 sm:p-6"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-brand-text-muted"><th className="px-3 py-3">Module</th>{roles.map((role) => <th key={role.id} className="px-3 py-3 text-center">{role.name}</th>)}</tr></thead><tbody>{["cms_home", "cms_about", "cms_courses", "admissions", "student_ops", "academics", "trainers", "partners", "access_control"].map((module) => <tr key={module} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold text-brand-navy">{module.replaceAll("_", " ")}</td>{roles.map((role) => <td key={role.id} className="px-3 py-3 text-center">{role.permissions[module]?.view ? <CheckSquare className="mx-auto size-4 text-emerald-600" /> : <span className="text-slate-300">-</span>}</td>)}</tr>)}</tbody></table></div>; }

function AuditView() { return <div className="p-10 text-center"><Activity className="mx-auto size-8 text-brand-text-muted" /><h3 className="mt-3 font-display font-bold text-brand-navy">Audit activity is ready for your event stream</h3><p className="mt-1 text-sm text-brand-text-muted">Role changes and provisioning events will appear here once audit logging is enabled.</p></div>; }