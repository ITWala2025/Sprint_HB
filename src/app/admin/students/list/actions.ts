"use server";

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";

export type StudentDirectoryEntry = {
    id: string;
    name: string;
    email: string;
    phone: string;
    registrationNumber: string;
    college: string;
    status: string;
};

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

export async function getStudentDirectory(): Promise<StudentDirectoryEntry[]> {
    await assertModuleAccess("student_ops");

    try {
        const supabase = await createAuthenticatedServerClient();
        const { data, error } = await supabase
            .from("students")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase students query error details:", error.message);
            return [];
        }

        return (data || []).map((student) => ({
            id: student.id,
            name: student.full_name || student.registration_number || "Enrolled Student",
            email: student.email || "student@sprint.institute",
            phone: student.phone || "N/A",
            registrationNumber: student.registration_number || "SPR-2026-0000",
            college: student.college_institution || "SPRINT Campus Institute",
            status: student.status || "active",
        }));
    } catch (error) {
        console.error("Student Directory Error:", error);
        return [];
    }
}
