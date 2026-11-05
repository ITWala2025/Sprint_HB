import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import RegistrationsTable, { type RegistrationListItem } from "@/app/admin/students/registrations/RegistrationsTable";

async function createAuthenticatedServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Server Components cannot write refreshed auth cookies.
                }
            },
        },
    });
}

export default async function RegistrationsPage() {
    await assertModuleAccess("student_ops");

    const supabase = await createAuthenticatedServerClient();
    const { data: registrations, error } = await supabase
        .from("registrations")
        .select("id, full_name, email, created_at, status, course_id, bundle_id")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load registrations: ${error.message}`);
    }

    const courseIds = [...new Set((registrations ?? []).map((registration) => registration.course_id).filter((value): value is string => Boolean(value)))];
    const bundleIds = [...new Set((registrations ?? []).map((registration) => registration.bundle_id).filter((value): value is string => Boolean(value)))];

    const [coursesResult, bundlesResult] = await Promise.all([
        courseIds.length > 0
            ? supabase.from("courses").select("id, title").in("id", courseIds)
            : Promise.resolve({ data: [], error: null }),
        bundleIds.length > 0
            ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesResult.error) {
        throw new Error(`Could not load course references for registrations: ${coursesResult.error.message}`);
    }
    if (bundlesResult.error) {
        throw new Error(`Could not load bundle references for registrations: ${bundlesResult.error.message}`);
    }

    const courseTitles = new Map((coursesResult.data ?? []).map((course) => [course.id, course.title]));
    const bundleTitles = new Map((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title]));

    const rows: RegistrationListItem[] = (registrations ?? []).map((registration) => {
        const references = [
            registration.course_id ? courseTitles.get(registration.course_id) : null,
            registration.bundle_id ? bundleTitles.get(registration.bundle_id) : null,
        ].filter((value): value is string => Boolean(value));

        return {
            id: registration.id,
            full_name: registration.full_name,
            email: registration.email,
            courseReference: references.join(" · ") || "Not specified",
            created_at: registration.created_at,
            status: registration.status,
        };
    });

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Registrations</h2>
                        <p className="mt-2 text-sm text-brand-text-secondary">Review new SPRINT sign-ups and track registration status.</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-brand-red-light px-3 py-1.5 text-xs font-bold text-brand-red">
                        {rows.filter((row) => row.status === "pending").length} pending review
                    </span>
                </div>
            </div>

            <RegistrationsTable registrations={rows} />
        </div>
    );
}
