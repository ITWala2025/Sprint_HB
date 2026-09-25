"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "./types";

type CreateUserModalProps = { roles: Role[]; onClose: () => void; onCreated: () => void };

function generatePassword() { return `${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}!aA9`; }

export default function CreateUserModal({ roles, onClose, onCreated }: CreateUserModalProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(generatePassword);
    const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => { if (!roleId && roles[0]) setRoleId(roles[0].id); }, [roleId, roles]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setIsSaving(true); setError("");
        const { error: createError } = await supabase.rpc("admin_create_staff_user", { new_email: email.trim(), new_password: password, full_name: fullName.trim(), target_role_id: roleId });
        if (createError) { setError(createError.message); setIsSaving(false); return; }
        setCredentials({ email: email.trim(), password }); setIsSaving(false); onCreated();
    }

    async function copyCredentials() { if (!credentials) return; await navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`); setCopied(true); }

    if (credentials) return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check className="size-5" /></div><h2 className="mt-4 font-display text-xl font-bold text-brand-navy">Staff user created</h2><p className="mt-1 text-sm text-brand-text-secondary">Share these credentials securely. The password will not be shown again.</p><div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm"><p><span className="text-xs text-brand-text-muted">EMAIL</span><br />{credentials.email}</p><p><span className="text-xs text-brand-text-muted">TEMPORARY PASSWORD</span><br />{credentials.password}</p></div><div className="mt-5 flex gap-2"><button type="button" onClick={copyCredentials} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy Credentials"}</button><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy">Done</button></div></div></div>;

    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true"><form onSubmit={handleSubmit} className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"><header className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><UserPlus className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">User provisioning</p><h2 className="font-display text-lg font-bold text-brand-navy">Invite / Create User</h2></div></div><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-lg text-brand-text-muted hover:bg-slate-100" aria-label="Close create user dialog"><X className="size-5" /></button></header><div className="mt-6 space-y-4"><label className="block text-xs font-bold text-brand-text-secondary">Full Name *<input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="sprint-input mt-2 w-full" placeholder="Staff member name" /></label><label className="block text-xs font-bold text-brand-text-secondary">Email *<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="sprint-input mt-2 w-full" placeholder="name@sprint.institute" /></label><label className="block text-xs font-bold text-brand-text-secondary">Assigned Role *<select required value={roleId} onChange={(event) => setRoleId(event.target.value)} className="sprint-input mt-2 w-full">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><label className="block text-xs font-bold text-brand-text-secondary">Temporary Password *<div className="mt-2 flex gap-2"><input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="sprint-input w-full font-mono" /><button type="button" onClick={() => setPassword(generatePassword())} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-brand-navy"><KeyRound className="size-3.5" />Generate</button></div></label></div>{error && <p className="mt-4 rounded-lg bg-brand-red-light px-3 py-2 text-xs font-semibold text-brand-red">{error}</p>}<footer className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy">Cancel</button><button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Create User</button></footer></form></div>;
}