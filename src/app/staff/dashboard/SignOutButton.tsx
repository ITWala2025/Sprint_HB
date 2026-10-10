"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
    const [isSigningOut, setIsSigningOut] = useState(false);
    const supabase = createClient();

    async function handleSignOut() {
        setIsSigningOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setIsSigningOut(false);
            return;
        }
        window.location.assign("/staff/login");
    }

    return (
        <button type="button" onClick={() => void handleSignOut()} disabled={isSigningOut} className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-bold text-brand-navy transition hover:bg-slate-50 disabled:opacity-60">
            {isSigningOut ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
            {isSigningOut ? "Signing out..." : "Sign Out"}
        </button>
    );
}
