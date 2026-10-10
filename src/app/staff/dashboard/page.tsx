import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import SignOutButton from "@/app/staff/dashboard/SignOutButton";

export default async function StaffDashboardPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            },
        },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) redirect("/staff/login");

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, is_active, first_login, must_change_password")
        .eq("id", authData.user.id)
        .single();

    if (profileError || !profile || profile.is_active !== true) redirect("/staff/login");
    if (profile.first_login || profile.must_change_password) redirect("/staff/login");

    const email = profile.email || authData.user.email || "";
    const name = profile.full_name?.trim() || email;

    return (
        <main className="min-h-screen bg-brand-off-white px-4 py-12">
            <section className="mx-auto max-w-4xl rounded-2xl border border-brand-border bg-white p-8 shadow-sm">
                <header className="flex flex-col justify-between gap-5 border-b border-brand-border pb-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-red">SPRINT Staff Portal</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy">Welcome, {name}</h1>
                        <p className="mt-2 text-sm text-brand-text-secondary">{email}</p>
                    </div>
                    <SignOutButton />
                </header>
                <div className="mt-8 rounded-xl bg-brand-off-white p-6">
                    <h2 className="font-display text-xl font-bold text-brand-navy">Staff Dashboard</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-text-secondary">Your staff workspace is ready. Dashboard tools will be added in a future phase.</p>
                </div>
            </section>
        </main>
    );
}
