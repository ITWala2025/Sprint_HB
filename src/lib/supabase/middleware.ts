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
  const isLoginPage = pathname === "/admin" || pathname === "/admin/login";
  const isPasswordResetCallback =
    pathname === "/admin" && request.nextUrl.searchParams.get("reset") === "true";
  const isAdminSubRoute = pathname.startsWith("/admin/") && !isLoginPage;
  const isStaffLogin = pathname === "/staff/login";
  const isStaffInvitation = pathname === "/staff/invitation" || pathname.startsWith("/staff/invitation/");
  const isStaffWorkspaceRoute = pathname.startsWith("/staff/") && !isStaffLogin && !isStaffInvitation;

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

  if (!user && isStaffWorkspaceRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/login";
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
      .select("role, status, is_active, roles(permissions, is_active)")
      .eq("id", user.id)
      .maybeSingle();

    const assignedRole = Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles;
    const isAdmin = profile?.role === "admin" ||
      (assignedRole?.is_active === true && assignedRole.permissions?.full_access === true);
    const isActiveStaff = profile?.role === "staff" && profile?.is_active === true && !isAdmin;
    const isActiveStudent =
      profile?.role === "student" && profile?.status === "active";

    // Staff and admins share the workspace; other roles cannot access it.
    if (!isAdmin && !isActiveStaff && !isPasswordResetCallback && (isLoginPage || isAdminSubRoute || isStaffWorkspaceRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    if (isAdmin && (isLoginPage || isStaffLogin) && !isPasswordResetCallback) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    if (isActiveStaff && (isLoginPage || isStaffLogin) && !isPasswordResetCallback) {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/dashboard";
      return NextResponse.redirect(url);
    }
    if (isAdmin && isStaffWorkspaceRoute) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname.slice("/staff".length)}`;
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