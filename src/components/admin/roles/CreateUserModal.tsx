"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, LoaderCircle, RefreshCw, UserPlus, X } from "lucide-react";
import { provisionStaffUserAction } from "@/app/admin/users/actions";

type ProvisionableRole = { id: string; name: string; is_active?: boolean };
type CreateUserModalProps = {
    roles: ProvisionableRole[];
    onClose: () => void;
    onCreated: () => void;
};

function generateTemporaryPassword() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export default function CreateUserModal({ roles, onClose, onCreated }: CreateUserModalProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
    const [showPassword, setShowPassword] = useState(false);
    const [createdAccount, setCreatedAccount] = useState<{
        email: string;
        tempPassword: string;
        inviteUrl: string;
    } | null>(null);
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!roles.some((role) => role.id === roleId)) setRoleId(roles[0]?.id ?? "");
    }, [roleId, roles]);

    useEffect(() => {
        setTempPassword(generateTemporaryPassword());
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError("");

        const selectedRole = roles.find((role) => role.id === roleId);
        if (!selectedRole) {
            setError("Choose an active role before creating the user.");
            setIsSaving(false);
            return;
        }

        try {
            const result = await provisionStaffUserAction({
                fullName,
                email,
                roleId,
                roleName: selectedRole.name,
                tempPassword,
            });

            if (result.success === false) {
                setError(result.error);
                return;
            }

            setCreatedAccount({
                email: result.email,
                tempPassword: result.tempPassword,
                inviteUrl: result.inviteUrl,
            });
            onCreated();
        } catch {
            setError("The staff account could not be created. Check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function copyValue(value: string, setCopied: (copied: boolean) => void, label: string) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch {
            setError(`Clipboard access was blocked. Select and copy the ${label} manually.`);
        }
    }

    if (createdAccount) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm" role="presentation">
                <section className="w-full max-w-md rounded-xl border border-white/60 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="created-user-title">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Check className="size-5" aria-hidden="true" /></div>
                    <h2 id="created-user-title" className="mt-4 font-display text-xl font-bold text-brand-navy">Staff account created</h2>
                    <p className="mt-1 text-sm leading-6 text-brand-text-secondary">An invitation email has been sent via Supabase. The invitation link is valid for 1 hour.</p>
                    <div className="mt-5 space-y-3 rounded-lg border border-brand-border bg-brand-off-white p-4 font-body text-sm">
                        <p><span className="text-xs font-bold text-brand-text-muted">EMAIL</span><br />{createdAccount.email}</p>
                        <div>
                            <span className="text-xs font-bold text-brand-text-muted">TEMPORARY PASSWORD</span>
                            <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="break-all font-mono">{createdAccount.tempPassword}</span>
                                <button type="button" onClick={() => void copyValue(createdAccount.tempPassword, setCopiedPassword, "temporary password")} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-brand-border bg-white px-2 py-1 text-xs font-bold text-brand-navy">
                                    <Copy className="size-3.5" aria-hidden="true" />{copiedPassword ? "Copied" : "Copy Password"}
                                </button>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-brand-text-muted">STAFF INVITATION LINK</span>
                            <div className="mt-1 flex items-center justify-between gap-2">
                                <a className="break-all text-brand-blue underline" href={createdAccount.inviteUrl} target="_blank" rel="noreferrer">{createdAccount.inviteUrl}</a>
                                <button type="button" onClick={() => void copyValue(createdAccount.inviteUrl, setCopiedLink, "invitation link")} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-brand-border bg-white px-2 py-1 text-xs font-bold text-brand-navy">
                                    <Copy className="size-3.5" aria-hidden="true" />{copiedLink ? "Copied" : "Copy Link"}
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && <p className="mt-3 text-sm text-brand-red" role="alert">{error}</p>}
                    <button type="button" onClick={onClose} className="mt-5 w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm font-bold text-brand-navy">Done</button>
                </section>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-t-xl bg-white p-5 shadow-2xl sm:rounded-xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
                <header className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue"><UserPlus className="size-5" aria-hidden="true" /></span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-red">Staff management</p>
                            <h2 id="create-user-title" className="font-display text-lg font-bold text-brand-navy">Invite / Create User</h2>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} disabled={isSaving} className="flex size-9 items-center justify-center rounded-lg text-brand-text-muted hover:bg-slate-100 disabled:opacity-50" aria-label="Close create user dialog"><X className="size-5" aria-hidden="true" /></button>
                </header>

                <div className="mt-6 space-y-4">
                    <label className="block text-xs font-bold text-brand-text-secondary">Full Name *
                        <input required maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} className="sprint-input mt-2 w-full" placeholder="Staff member name" disabled={isSaving} />
                    </label>
                    <label className="block text-xs font-bold text-brand-text-secondary">Email *
                        <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="sprint-input mt-2 w-full" placeholder="name@sprint.institute" disabled={isSaving} />
                    </label>
                    <label className="block text-xs font-bold text-brand-text-secondary">Assigned Role *
                        <select required value={roleId} onChange={(event) => setRoleId(event.target.value)} className="sprint-input mt-2 w-full" disabled={isSaving || !roles.length}>
                            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </label>
                    <label className="block text-xs font-bold text-brand-text-secondary">Temporary Password *
                        <span className="mt-2 flex gap-2">
                            <span className="relative min-w-0 flex-1">
                                <input required minLength={12} autoComplete="new-password" type={showPassword ? "text" : "password"} value={tempPassword} onChange={(event) => setTempPassword(event.target.value)} className="sprint-input w-full pr-11" placeholder="Set temporary password" disabled={isSaving} />
                                <button type="button" onClick={() => setShowPassword((visible) => !visible)} disabled={isSaving} aria-label={showPassword ? "Hide temporary password" : "Show temporary password"} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-brand-text-muted hover:text-brand-navy disabled:opacity-50">
                                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                                </button>
                            </span>
                            <button type="button" onClick={() => setTempPassword(generateTemporaryPassword())} disabled={isSaving} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-brand-border px-3 text-xs font-bold text-brand-navy hover:bg-slate-50 disabled:opacity-50">
                                <RefreshCw className="size-3.5" aria-hidden="true" />
                                Generate
                            </button>
                        </span>
                    </label>
                </div>

                {error && <p className="fixed right-4 top-4 z-[120] max-w-sm rounded-lg border border-brand-red/20 bg-white px-4 py-3 text-sm font-medium text-brand-red shadow-lg" role="alert" aria-live="assertive">{error}</p>}

                <button type="submit" disabled={isSaving || !roles.length} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60">
                    {isSaving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
                    {isSaving ? "Creating account..." : "Create user"}
                </button>
            </form>
        </div>
    );
}
