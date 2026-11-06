"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";

export type RegistrationListItem = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    college_institution: string | null;
    admin_notes: string | null;
    created_at: string;
    status: string;
};

export type RegistrationUpdateInput = {
    full_name: string;
    email: string;
    phone: string;
    college_institution: string;
    admin_notes: string;
};

export type RegistrationActionResult =
    | { success: true; message: string }
    | { success: false; error: string };

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

function isRegistrationId(id: unknown): id is string {
    return typeof id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function requireServiceClient() {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return serviceClient;
}

export async function getStudentRegistrations(): Promise<RegistrationListItem[]> {
    await assertModuleAccess("student_ops");
    const supabase = await createAuthenticatedServerClient();
    const { data, error } = await supabase
        .from("registrations")
        .select("id, full_name, email, phone, college_institution, admin_notes, created_at, status")
        .is("course_id", null)
        .is("bundle_id", null)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load student registrations: ${error.message}`);
    }
    return data ?? [];
}

export async function updateRegistration(
    id: string,
    input: RegistrationUpdateInput,
): Promise<RegistrationActionResult> {
    if (!isRegistrationId(id)) {
        return { success: false, error: "Select a valid registration." };
    }
    if (
        !input ||
        typeof input.full_name !== "string" ||
        typeof input.email !== "string" ||
        typeof input.phone !== "string" ||
        typeof input.college_institution !== "string" ||
        typeof input.admin_notes !== "string"
    ) {
        return { success: false, error: "Enter valid registration details." };
    }

    const fullName = input.full_name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    if (!fullName || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Name, a valid email address, and phone number are required." };
    }

    await assertModuleAccess("student_ops", "edit");
    const { data, error } = await requireServiceClient()
        .from("registrations")
        .update({
            full_name: fullName,
            email,
            phone,
            college_institution: input.college_institution.trim() || null,
            admin_notes: input.admin_notes.trim() || null,
        })
        .eq("id", id)
        .is("course_id", null)
        .is("bundle_id", null)
        .select("id")
        .maybeSingle();

    if (error) {
        return { success: false, error: `Could not update the registration: ${error.message}` };
    }
    if (!data) {
        return { success: false, error: "This student registration no longer exists." };
    }

    revalidatePath("/admin/students/registrations");
    return { success: true, message: "Registration details updated." };
}

export async function deleteRegistration(id: string): Promise<RegistrationActionResult> {
    if (!isRegistrationId(id)) {
        return { success: false, error: "Select a valid registration." };
    }

    await assertModuleAccess("student_ops", "delete");
    const { data, error } = await requireServiceClient()
        .from("registrations")
        .delete()
        .eq("id", id)
        .is("course_id", null)
        .is("bundle_id", null)
        .select("id")
        .maybeSingle();

    if (error) {
        return { success: false, error: `Could not delete the registration: ${error.message}` };
    }
    if (!data) {
        return { success: false, error: "This student registration no longer exists." };
    }

    revalidatePath("/admin/students/registrations");
    return { success: true, message: "Student registration deleted." };
}
