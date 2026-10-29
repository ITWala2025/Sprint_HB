import StudentLayout from "@/components/student/StudentLayout";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getInitials(fullName) {
  const parts = String(fullName || "Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

async function getStudentSummary() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/student/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/student/login");
  }

  return {
    id: profile.id,
    fullName: profile.full_name || "Student",
    firstName: (profile.full_name || "Student").split(/\s+/).find(Boolean) || "Student",
    initials: getInitials(profile.full_name),
    email: profile.email || "",
  };
}

/**
 * Shared layout for every portal page under /student/(portal).
 *
 * The `(portal)` route group keeps this shell off /student/login (auth is a
 * separate, later task). The public SPRINT header/ticker/footer still come from
 * the root layout — this only adds the sidebar + content area.
 */
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function StudentPortalLayout({ children }) {
  const student = await getStudentSummary();
  return <StudentLayout student={student}>{children}</StudentLayout>;
}
