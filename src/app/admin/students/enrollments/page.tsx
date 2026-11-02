import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";

type RegistrationRecord = {
    id: string;
    full_name: string | null;
    email: string | null;
    course_id: string | null;
    bundle_id: string | null;
    status: string | null;
    created_at: string | null;
};

type ProgramLookup = {
    id: string;
    title: string | null;
};

const statusStyles: Record<string, string> = {
    pending: "bg-brand-red-light text-brand-red",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-slate-200 text-slate-700",
    enrolled: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-amber-50 text-amber-700",
    default: "bg-slate-100 text-slate-700",
};

function formatStatusLabel(status: string | null | undefined) {
    if (!status) return "Pending";
    return status
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function formatSubmittedDate(rawDate: string | null | undefined) {
    if (!rawDate) return "—";

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(parsed);
}

export default async function EnrollmentApplicationsPage() {
    await assertModuleAccess("student_ops");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase public environment variables are not configured.");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) redirect("/admin");

    const [registrationsResult, coursesResult, bundlesResult] = await Promise.all([
        supabase
            .from("registrations")
            .select("id, full_name, email, course_id, bundle_id, status, created_at")
            .order("created_at", { ascending: false }),
        supabase
            .from("courses")
            .select("id, title")
            .order("title"),
        supabase
            .from("course_bundles")
            .select("id, title")
            .order("title"),
    ]);

    const queryError = registrationsResult.error ?? coursesResult.error ?? bundlesResult.error;
    if (queryError) {
        return (
            <div className="mx-auto max-w-[1500px] space-y-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                    <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Enrollment Applications</h2>
                            <p className="mt-2 text-sm text-brand-text-secondary">Review and process new student applications for upcoming programs.</p>
                        </div>
                    </div>
                </div>

                <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
                    We couldn&apos;t load the registration list right now. {queryError.message}
                </section>
            </div>
        );
    }

    const registrations = (registrationsResult.data ?? []) as RegistrationRecord[];
    const coursesById = new Map<string, string>((coursesResult.data ?? []).map((course) => [course.id, course.title || "Untitled course"]));
    const bundlesById = new Map<string, string>((bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle.title || "Untitled bundle"]));

    const rows = registrations.map((registration) => {
      const courseTitle = registration.course_id ? coursesById.get(registration.course_id) ?? null : null;
      const bundleTitle = registration.bundle_id ? bundlesById.get(registration.bundle_id) ?? null : null;
      const program = [bundleTitle, courseTitle].filter(Boolean).join(" • ") || "Program not specified";
      const status = (registration.status ?? "pending").toLowerCase();

      return {
        id: registration.id,
        name: registration.full_name?.trim() || "Unnamed applicant",
        email: registration.email || "No email provided",
        program,
        submitted: formatSubmittedDate(registration.created_at),
        status,
        statusLabel: formatStatusLabel(registration.status),
      };
    });

    const pendingCount = rows.filter((row) => row.status === "pending").length;

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Enrollment Applications</h2>
                        <p className="mt-2 text-sm text-brand-text-secondary">Review and process new student applications for upcoming programs.</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-brand-red-light px-3 py-1.5 text-xs font-bold text-brand-red">
                        {pendingCount} pending review
                    </span>
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Enrollment applications">
                <div className="overflow-x-auto">
                    {rows.length === 0 ? (
                        <div className="px-6 py-10 text-sm text-brand-text-secondary">
                            There are no registration records to display.
                        </div>
                    ) : (
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted">
                                <tr>
                                    <th className="px-5 py-3 font-bold sm:px-6">Applicant</th>
                                    <th className="px-5 py-3 font-bold">Program</th>
                                    <th className="px-5 py-3 font-bold">Submitted</th>
                                    <th className="px-5 py-3 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((application) => (
                                    <tr key={application.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 sm:px-6">
                                            <p className="font-semibold text-brand-navy">{application.name}</p>
                                            <p className="mt-1 text-xs text-brand-text-muted">{application.email}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{application.program}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-xs text-brand-text-muted">{application.submitted}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[application.status] ?? statusStyles.default}`}>
                                                {application.statusLabel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
}
