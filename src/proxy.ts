import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function proxy(request: NextRequest) {
  // Keep the original method and headers so login Server Actions can pass through.
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/student/login",
    "/student/dashboard",
    "/student/:path*",
    "/staff/:path*",
  ],
};