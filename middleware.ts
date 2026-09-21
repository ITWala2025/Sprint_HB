import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sprint_admin_session";

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.get(SESSION_COOKIE)?.value === "active";
    const isAdminRoot = request.nextUrl.pathname === "/admin";
    const isAdminNestedRoute = request.nextUrl.pathname.startsWith("/admin/");

    if (isAdminRoot && isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (isAdminNestedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
};