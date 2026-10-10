import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Every portal page that requires a signed-in student. These are the URL
 * segments under the `(portal)` route group — keep in sync with
 * `src/config/student-navigation.json` and `src/data/student.js`.
 */
const PORTAL_ROUTE_PREFIXES = [
  "/student/dashboard",
  "/student/my-course",
  "/student/apply-course",
  "/student/assignments",
  "/student/certificates",
  "/student/profile",
  "/student/resources",
  "/student/result",
  "/student/settings",
  "/student/help-support",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT use getSession() in middleware — getUser() validates with Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin";
  const isPasswordResetCallback =
    isLoginPage && request.nextUrl.searchParams.get("reset") === "true";
  const isAdminSubRoute = pathname.startsWith("/admin/") && !isLoginPage;

  const isStudentLogin = pathname === "/student/login";
  const isStudentPortalRoute = PORTAL_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. If an unauthenticated visitor tries to reach /admin/dashboard or subroutes, bounce to /admin
  if (!user && isAdminSubRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // 2. If an unauthenticated visitor tries to open a student portal page, send them to Sign In.
  if (!user && isStudentPortalRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/student/login";
    return NextResponse.redirect(url);
  }

  // 3. If already logged in, check role/status for authorization
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    const isActiveStudent =
      profile?.role === "student" && profile?.status === "active";

    // Non-admin logged-in users cannot access any /admin routes
    if (!isAdmin && !isPasswordResetCallback && (isLoginPage || isAdminSubRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    // Authenticated admin visiting the login page should be directed to dashboard
    if (isAdmin && isLoginPage && !isPasswordResetCallback) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    /*
     * Student portal protection:
     * - An authenticated user without an active student profile cannot stay on
     *   any portal page (the Sign In screen clears the stale session).
     * - An already-signed-in active student who opens /student/login is sent
     *   straight to the dashboard — a seamless "Student Portal" entry.
     */
    if (isStudentPortalRoute && !isActiveStudent) {
      const url = request.nextUrl.clone();
      url.pathname = "/student/login";
      return NextResponse.redirect(url);
    }

    if (isStudentLogin && isActiveStudent) {
      const url = request.nextUrl.clone();
      url.pathname = "/student/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}