"use server";

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

export type CompleteFirstTimeStaffSetupResult =
    | { success: true }
    | { success: false; error: string };

async function createSessionClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) return null;

    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, publishableKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            },
        },
    });
}

export async function completeFirstTimeStaffSetupAction(
    invitationToken?: string,
): Promise<CompleteFirstTimeStaffSetupResult> {
    const token = typeof invitationToken === "string" ? invitationToken.trim() : "";
    if (invitationToken !== undefined && (!token || !/^[a-f0-9]{64}$/i.test(token))) {
        return { success: false, error: "The invitation token is invalid. Please request a new invitation." };
    }

    const [sessionClient, serviceClient] = await Promise.all([
        createSessionClient(),
        Promise.resolve(createServiceClient()),
    ]);
    if (!sessionClient) {
        return { success: false, error: "Authentication is not configured on the server." };
    }
    if (!serviceClient) {
        return { success: false, error: "Server service client not configured." };
    }

    const { data: authData, error: authError } = await sessionClient.auth.getUser();
    if (authError || !authData.user) {
        return { success: false, error: "Your session could not be verified. Please sign in again." };
    }

    if (token) {
        const { data: invitation, error: invitationError } = await serviceClient
            .from("staff_invitations")
            .select("id")
            .eq("token", token)
            .eq("user_id", authData.user.id)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();

        if (invitationError) {
            return { success: false, error: `The invitation could not be verified: ${invitationError.message}` };
        }
        if (!invitation) {
            return { success: false, error: "This invitation is invalid, expired, or has already been used." };
        }
    }

    const { data: currentProfile, error: currentProfileError } = await serviceClient
        .from("profiles")
        .select("is_active, first_login, must_change_password")
        .eq("id", authData.user.id)
        .maybeSingle();
    if (currentProfileError || !currentProfile) {
        return { success: false, error: `Your staff profile could not be verified${currentProfileError ? `: ${currentProfileError.message}` : "."}` };
    }
    if (currentProfile.is_active !== true) {
        return { success: false, error: "This staff account is inactive." };
    }
    if (!currentProfile.first_login && !currentProfile.must_change_password) {
        return { success: false, error: "First-time password setup has already been completed." };
    }

    const { data: profile, error: profileError } = await serviceClient
        .from("profiles")
        .update({
            must_change_password: false,
            first_login: false,
            password_changed: true,
        })
        .eq("id", authData.user.id)
        .select("id")
        .maybeSingle();

    if (profileError || !profile) {
        return { success: false, error: `Your staff profile could not be updated${profileError ? `: ${profileError.message}` : "."}` };
    }

    if (token) {
        const { data: invitation, error: invitationError } = await serviceClient
            .from("staff_invitations")
            .update({ status: "used", used_at: new Date().toISOString() })
            .eq("token", token)
            .eq("user_id", authData.user.id)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString())
            .select("id")
            .maybeSingle();

        if (invitationError || !invitation) {
            return { success: false, error: `Your profile was updated, but the invitation could not be marked as used${invitationError ? `: ${invitationError.message}` : "."}` };
        }
    }

    revalidatePath("/staff/dashboard");
    return { success: true };
}
