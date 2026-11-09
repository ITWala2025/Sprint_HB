import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

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

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin" || pathname === "/admin/login";
  if (pathname === "/admin" && request.nextUrl.searchParams.get("signout") === "1") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("signout");
    const response = NextResponse.redirect(url);
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    for (const cookie of request.cookies.getAll()) {
      if (/^sb-.+-auth-token(?:[-.]\d+)?$/.test(cookie.name) || /^sb-.+-auth-token-code-verifier$/.test(cookie.name)) {
        response.cookies.delete(cookie.name);
      }
    }
    return response;
  }

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

  // Fast Path: Check cryptographically verified admin session token (0ms network calls)
  const existingAdminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (existingAdminSession) {
    const verifiedSession = await verifyAdminSessionToken(existingAdminSession);
    if (verifiedSession && verifiedSession.isActive) {
      const isAdmin = verifiedSession.isAdmin;
      const isActiveStaff = verifiedSession.role === "staff" && !isAdmin;

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

      // If user is accessing protected admin/staff routes and has verified session, pass through immediately!
      if (isAdminSubRoute || isStaffWorkspaceRoute) {
        return supabaseResponse;
      }
    }
  }

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

  // 1. If an unauthenticated visitor tries to reach /admin/dashboard or subroutes, bounce to /admin
  if (!user && isAdminSubRoute) {
    if (request.cookies.has(ADMIN_SESSION_COOKIE)) {
      supabaseResponse.cookies.delete(ADMIN_SESSION_COOKIE);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (!user && isStaffWorkspaceRoute) {
    if (request.cookies.has(ADMIN_SESSION_COOKIE)) {
      supabaseResponse.cookies.delete(ADMIN_SESSION_COOKIE);
    }
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
      .select("role, status, is_active, must_change_password, full_name, email, roles(name, permissions, is_active)")
      .eq("id", user.id)
      .maybeSingle();

    const assignedRole = Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles;
    const isAdmin = profile?.role === "admin" ||
      (assignedRole?.is_active === true && assignedRole.permissions?.full_access === true);
    const isActiveStaff = profile?.role === "staff" && profile?.is_active === true && !isAdmin;
    const isActiveStudent =
      profile?.role === "student" && profile?.status === "active";

    // Issue/refresh verified admin session cookie for fast subsequent navigations
    if ((isAdmin || isActiveStaff) && profile?.is_active === true) {
      try {
        const sessionToken = await createAdminSessionToken({
          userId: user.id,
          email: profile.email ?? user.email ?? null,
          fullName: profile.full_name ?? null,
          role: profile.role,
          roleName: assignedRole?.is_active ? assignedRole.name : profile.role,
          isActive: profile.is_active === true,
          isAdmin,
          mustChangePassword: profile.must_change_password === true && !isAdmin,
          permissions: (assignedRole?.is_active ? assignedRole.permissions : null) as any,
        });

        supabaseResponse.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
        });
      } catch (err) {
        console.warn("[SPRINT Middleware] Could not issue session cookie:", err);
      }
    } else if (request.cookies.has(ADMIN_SESSION_COOKIE)) {
      supabaseResponse.cookies.delete(ADMIN_SESSION_COOKIE);
    }

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