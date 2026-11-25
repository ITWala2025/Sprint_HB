import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessAdminRoute, type AdminPermissionMap } from "@/app/admin/auth-types";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
} from "@/lib/auth/admin-session";
import {
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_MAX_AGE_SECONDS,
  createStudentSessionToken,
  verifyStudentSessionToken,
} from "@/lib/auth/student-session";
import { createServiceClient } from "@/lib/supabase/service";
import { getUserAccountRecord, type StaffDirectoryRecord } from "@/lib/supabase/staff";

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
  const isAdminSignOut = pathname === "/admin" && request.nextUrl.searchParams.get("signout") === "1";
  const isStaffSignOut = pathname === "/staff/login" && request.nextUrl.searchParams.get("signout") === "1";
  if (isAdminSignOut || isStaffSignOut) {
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
  const isServerAction = request.headers.has("next-action");
  const isLoginSubmission =
    (isLoginPage || isStaffLogin) &&
    (request.method !== "GET" || isServerAction);
  const isStaffInvitation = pathname === "/staff/invitation" || pathname.startsWith("/staff/invitation/");
  const isStaffWorkspaceRoute = pathname.startsWith("/staff/") && !isStaffLogin && !isStaffInvitation;

  const isStudentLogin = pathname === "/student/login";
  const isStudentPortalRoute = PORTAL_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const redirectTo = (targetPath: string, clearAdminSession = false) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    const response = NextResponse.redirect(url);
    if (clearAdminSession) response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  };

  // Fast Path: Check cryptographically verified student session token (0ms network calls)
  const existingStudentSession = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
  if (existingStudentSession && isStudentPortalRoute) {
    const verifiedSession = await verifyStudentSessionToken(existingStudentSession);
    if (verifiedSession && verifiedSession.isActive) {
      // If user is accessing protected student portal routes and has verified session, pass through immediately!
      return supabaseResponse;
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
  const serviceClient = user ? createServiceClient() : null;

  // 1. If an unauthenticated visitor tries to reach /admin/dashboard or subroutes, bounce to /admin
  if (!user && request.cookies.has(ADMIN_SESSION_COOKIE) && !isServerAction) {
    supabaseResponse.cookies.delete(ADMIN_SESSION_COOKIE);
  }

  // Server Actions run as POSTs to the current page. Let the action return its
  // own authorization result instead of replacing it with a page redirect.
  if (isLoginSubmission || isServerAction) {
    return supabaseResponse;
  }

  if (!user && isAdminSubRoute) {
    return redirectTo("/admin", request.cookies.has(ADMIN_SESSION_COOKIE));
  }

  if (!user && isStaffWorkspaceRoute) {
    return redirectTo("/staff/login", request.cookies.has(ADMIN_SESSION_COOKIE));
  }

  // 2. If an unauthenticated visitor tries to open a student portal page, send them to Sign In.
  if (!user && isStudentPortalRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/student/login";
    return NextResponse.redirect(url);
  }

  // 3. If already logged in, check role/status for authorization
  if (user) {
    let profile: (StaffDirectoryRecord & { role: string }) | null = null;
    if (!serviceClient) {
      console.error("[SPRINT Middleware] Server-side Supabase service role is not configured.");
    } else {
      const { record, error } = await getUserAccountRecord(user.id, serviceClient);
      if (error) {
        console.error("[SPRINT Middleware] Could not revalidate the authenticated account and role:", error);
      }
      profile = record ? { ...record, role: record.account_type } : null;
    }

    const assignedRole = Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles;
    const isAdmin = profile?.is_active === true && (
      profile.role === "admin" ||
      (profile.role === "staff" && assignedRole?.is_active === true && assignedRole.permissions?.full_access === true)
    );
    const isActiveStaff = profile?.role === "staff" &&
      profile?.is_active === true &&
      !isAdmin;
    const mustCompleteStaffSetup = profile?.role === "staff" &&
      profile?.is_active === true &&
      (profile.first_login === true || profile.must_change_password === true);
    const studentClient = serviceClient ?? supabase;
    const { data: studentRecord, error: studentError } = profile?.role === "student"
      ? await studentClient
        .from("students")
        .select("registration_number, status")
        .eq("id", user.id)
        .maybeSingle()
      : { data: null, error: null };
    if (studentError) {
      console.error("[SPRINT Middleware] Could not revalidate the student record:", studentError.message);
    }
    const isActiveStudent =
      profile?.role === "student" &&
      profile?.status === "active" &&
      profile?.is_active !== false &&
      studentRecord?.status !== "deactivated";

    // Keep the client session snapshot current; protected server checks re-read the database.
    if ((isAdmin || isActiveStaff) && profile?.is_active === true) {
      try {
        const sessionToken = await createAdminSessionToken({
          userId: user.id,
          email: profile.email ?? user.email ?? null,
          fullName: profile.full_name ?? null,
          role: profile.role,
          roleName: assignedRole?.is_active ? assignedRole.name : profile.role_name ?? profile.role,
          isActive: profile.is_active === true,
          isAdmin,
          mustChangePassword: (
            profile.first_login === true || profile.must_change_password === true
          ) && !isAdmin,
          permissions: (assignedRole?.is_active ? assignedRole.permissions : null) as AdminPermissionMap | null,
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

    // Issue/refresh verified student session cookie for fast subsequent navigations
    if (isActiveStudent) {
      try {
        const sessionToken = await createStudentSessionToken({
          userId: user.id,
          email: profile.email ?? user.email ?? null,
          fullName: profile.full_name ?? null,
          registrationNumber: studentRecord?.registration_number ?? null,
          isActive: true,
        });

        supabaseResponse.cookies.set(STUDENT_SESSION_COOKIE, sessionToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: STUDENT_SESSION_MAX_AGE_SECONDS,
        });
      } catch (err) {
        console.warn("[SPRINT Middleware] Could not issue student session cookie:", err);
      }
    } else if (request.cookies.has(STUDENT_SESSION_COOKIE)) {
      supabaseResponse.cookies.delete(STUDENT_SESSION_COOKIE);
    }

    // Staff and admins share the workspace; other roles cannot access it.
    if (!isAdmin && !isActiveStaff && !isPasswordResetCallback && (isLoginPage || isAdminSubRoute || isStaffWorkspaceRoute)) {
      return redirectTo("/home", request.cookies.has(ADMIN_SESSION_COOKIE));
    }

    if (mustCompleteStaffSetup && (isStaffWorkspaceRoute || isAdminSubRoute)) {
      return redirectTo("/staff/login");
    }
    if (mustCompleteStaffSetup && isLoginPage && !isPasswordResetCallback) {
      return redirectTo("/staff/login");
    }
    if (isAdmin && (isLoginPage || isStaffLogin) && !mustCompleteStaffSetup && !isPasswordResetCallback) {
      return redirectTo("/admin/dashboard");
    }
    if (isActiveStaff && !mustCompleteStaffSetup && (isLoginPage || isStaffLogin) && !isPasswordResetCallback) {
      return redirectTo("/staff/dashboard");
    }
    if (isAdmin && isStaffWorkspaceRoute) {
      return redirectTo(`/admin${pathname.slice("/staff".length)}`);
    }
    if (isActiveStaff && !mustCompleteStaffSetup && isStaffWorkspaceRoute && pathname !== "/staff/dashboard") {
      const adminPath = `/admin${pathname.slice("/staff".length)}`;
      if (!canAccessAdminRoute(adminPath, (assignedRole?.is_active ? assignedRole.permissions : null) as AdminPermissionMap | null, "staff")) {
        return redirectTo("/staff/dashboard");
      }

      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = adminPath;
      const rewriteResponse = NextResponse.rewrite(rewriteUrl, { request });
      supabaseResponse.cookies.getAll().forEach((cookie) => rewriteResponse.cookies.set(cookie));
      return rewriteResponse;
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