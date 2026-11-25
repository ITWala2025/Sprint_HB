import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/lib/auth/student-session";
import type { StudentSessionPayload } from "./auth-types";

export type { StudentSessionPayload };

/**
 * Cached per-request session reader.
 * 1. Checks and verifies the HMAC-signed student session cookie (0ms).
 * 2. Falls back to Supabase auth & students table if no valid session cookie exists.
 * 3. React `cache()` ensures this executes at most ONCE per server render request.
 */
export const getStudentSession = cache(async (): Promise<StudentSessionPayload | null> => {
    const cookieStore = await cookies();

    // 1. Fast Path: Read from cryptographically verified session cookie
    const sessionToken = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
    if (sessionToken) {
        const verifiedSession = await verifyStudentSessionToken(sessionToken);
        if (
            verifiedSession &&
            verifiedSession.isActive &&
            verifiedSession.onboardingCompleted === true
        ) {
            return verifiedSession;
        }
    }

    // 2. Slow Path: Fallback to Supabase Auth & DB
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !publishableKey) {
        return null;
    }

    const supabase = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Server Components cannot write cookies
                }
            },
        },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
        return null;
    }

    const [{ data: profile }, { data: student }] = await Promise.all([
        supabase
            .from("profiles")
            .select("role, is_active, onboarding_completed, full_name, email")
            .eq("id", authData.user.id)
            .maybeSingle(),
        supabase
            .from("students")
            .select("registration_number, status")
            .eq("id", authData.user.id)
            .maybeSingle(),
    ]);

    if (!profile || !student || profile.is_active !== true || student.status !== "active") {
        return null;
    }

    const sessionPayload: StudentSessionPayload = {
        userId: authData.user.id,
        email: profile.email ?? authData.user.email ?? null,
        fullName: profile.full_name ?? null,
        registrationNumber: student.registration_number ?? null,
        isActive: true,
        onboardingCompleted: profile.onboarding_completed === true,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    return sessionPayload;
});