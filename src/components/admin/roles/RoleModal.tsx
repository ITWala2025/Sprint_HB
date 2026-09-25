"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, Save, Shield, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { capabilityNames, colors, countPermissions, emptyPermissions, moduleCategories, PermissionMap, Role } from "./types";

type RoleModalProps = { role: Role | null; onClose: () => void; onSaved: (role: Role) => void };

const presets: Record<string, PermissionMap> = {
    "Super Admin (Full Access)": Object.fromEntries(moduleCategories.flatMap((category) => category.modules.map((module) => [module[0], Object.fromEntries(capabilityNames.map((capability) => [capability, true]))]))) as PermissionMap,
    "Content Editor": Object.fromEntries(moduleCategories[0].modules.map((module) => [module[0], { view: true, create: true, edit: true, export: true }])) as PermissionMap,
    "Admissions Officer": { admissions: { view: true, create: true, edit: true, export: true } },
    "Academic Mentor": { academics: { view: true, edit: true }, student_ops: { view: true } },
    "Read Only": Object.fromEntries(moduleCategories.flatMap((category) => category.modules.map((module) => [module[0], { view: true }]))) as PermissionMap,
};

export default function RoleModal({ role, onClose, onSaved }: RoleModalProps) {
    const [name, setName] = useState(role?.name ?? "");
    const [slug, setSlug] = useState(role?.slug ?? "");
    const [description, setDescription] = useState(role?.description ?? "");
    const [color, setColor] = useState(role?.color ?? "navy");
    const [permissions, setPermissions] = useState<PermissionMap>(role?.permissions ?? emptyPermissions());
    const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(moduleCategories.map((category) => [category.title, true])));
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const coverage = useMemo(() => countPermissions(permissions), [permissions]);
    const supabase = createClient();

    function updateName(value: string) {
        setName(value);
        if (!role) setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
    }

    function applyPreset(label: string) { setPermissions(label === "Clear All" ? emptyPermissions() : { ...emptyPermissions(), ...presets[label] }); }

    function togglePermission(module: string, capability: (typeof capabilityNames)[number]) {
        setPermissions((current) => ({ ...current, [module]: { ...current[module], [capability]: !current[module]?.[capability] } }));
    }

    function toggleCategory(category: typeof moduleCategories[number]) {
        const allEnabled = category.modules.every(([key]) => capabilityNames.every((capability) => permissions[key]?.[capability]));
        setPermissions((current) => ({ ...current, ...Object.fromEntries(category.modules.map((module) => [module[0], allEnabled ? {} : Object.fromEntries(capabilityNames.map((capability) => [capability, true]))])) }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true); setError("");
        const payload = { name: name.trim(), slug: slug.trim(), description: description.trim(), color, permissions, is_active: role?.is_active ?? true, is_system: role?.is_system ?? false };
        const query = role ? supabase.from("roles").update(payload).eq("id", role.id).select().single() : supabase.from("roles").insert(payload).select().single();
        const { data, error: saveError } = await query;
        if (saveError || !data) { setError(saveError?.message ?? "Unable to save this role."); setIsSaving(false); return; }
        onSaved({ ...role, ...data, assigned_count: role?.assigned_count ?? 0 } as Role);
    }

    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
        <form onSubmit={handleSubmit} className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-navy text-white"><Shield className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">Role configuration</p><h2 id="role-modal-title" className="font-display text-lg font-bold text-brand-navy">{role ? `Edit Role: ${role.name}` : "Create New Role"}</h2></div></div><button type="button" onClick={onClose} className="sprint-focus flex size-9 items-center justify-center rounded-lg text-brand-text-muted hover:bg-slate-100" aria-label="Close role dialog"><X className="size-5" /></button></header>
            <div className="space-y-7 overflow-y-auto p-5 sm:p-7"><section><h3 className="font-display text-sm font-bold text-brand-navy">Role Details & Identification</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-brand-text-secondary">Role Title *<input required value={name} onChange={(event) => updateName(event.target.value)} className="sprint-input mt-2 w-full" placeholder="e.g. Content Editor" /></label><label className="text-xs font-bold text-brand-text-secondary">System Identifier Slug *<input required value={slug} onChange={(event) => setSlug(event.target.value)} className="sprint-input mt-2 w-full" /></label><label className="text-xs font-bold text-brand-text-secondary sm:col-span-2">Description & Responsibilities<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="sprint-input mt-2 min-h-20 w-full" placeholder="Describe what this role is responsible for." /></label></div><div className="mt-4"><p className="text-xs font-bold text-brand-text-secondary">Color Theme</p><div className="mt-2 flex flex-wrap gap-2">{colors.map((item) => <button type="button" key={item.value} onClick={() => setColor(item.value)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${color === item.value ? "border-brand-navy bg-brand-surface text-brand-navy" : "border-slate-200 text-brand-text-secondary"}`}><span className={`size-3 rounded-full ${item.className}`} />{item.name}{color === item.value && <Check className="size-3" />}</button>)}</div></div></section>
                <section><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-sm font-bold text-brand-navy">Quick Preset Templates</h3><p className="mt-1 text-xs text-brand-text-muted">Start with a policy and fine-tune individual capabilities below.</p></div><span className="rounded-full bg-brand-blue-light px-3 py-1.5 text-xs font-bold text-brand-blue">Active Permissions: {coverage.active} / {coverage.total}</span></div><div className="mt-4 flex flex-wrap gap-2">{Object.keys(presets).map((label) => <button type="button" key={label} onClick={() => applyPreset(label)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:border-brand-blue hover:bg-brand-blue-light">{label}</button>)}<button type="button" onClick={() => applyPreset("Clear All")} className="rounded-lg border border-brand-red/20 px-3 py-2 text-xs font-bold text-brand-red hover:bg-brand-red-light">Clear All</button></div></section>
                <section><div className="mb-3"><h3 className="font-display text-sm font-bold text-brand-navy">Granular Functionality Permissions</h3><p className="mt-1 text-xs text-brand-text-muted">Choose exactly which actions this role can perform.</p></div><div className="space-y-3">{moduleCategories.map((category) => { const isOpen = open[category.title]; const allEnabled = category.modules.every(([key]) => capabilityNames.every((capability) => permissions[key]?.[capability])); return <div key={category.title} className="overflow-hidden rounded-xl border border-slate-200"><div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3"><button type="button" onClick={() => setOpen((current) => ({ ...current, [category.title]: !isOpen }))} className="flex min-w-0 items-center gap-2 text-left text-sm font-bold text-brand-navy">{isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}<span className="truncate">{category.title}</span></button><button type="button" onClick={() => toggleCategory(category)} className="shrink-0 text-[11px] font-bold text-brand-blue">{allEnabled ? "Deselect All" : "Toggle All"}</button></div>{isOpen && <div className="divide-y divide-slate-100">{category.modules.map(([key, title, detail]) => <div key={key} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><p className="text-sm font-semibold text-brand-navy">{title}</p><p className="mt-0.5 text-xs text-brand-text-muted">{detail}</p></div><div className="flex flex-wrap gap-1.5">{capabilityNames.map((capability) => <button type="button" key={capability} onClick={() => togglePermission(key, capability)} className={`rounded-md px-2 py-1.5 text-[10px] font-bold capitalize ${permissions[key]?.[capability] ? "bg-brand-navy text-white" : "border border-slate-200 text-brand-text-muted hover:border-brand-navy"}`}>{capability}</button>)}</div></div>)}</div>}</div>; })}</div></section>{error && <p className="rounded-lg bg-brand-red-light px-3 py-2 text-xs font-semibold text-brand-red">{error}</p>}</div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="text-xs text-brand-text-muted">Permissions apply to newly signed-in sessions and protected actions.</p><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy">Cancel</button><button disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save Changes</button></div></footer>
        </form>
    </div>;
}