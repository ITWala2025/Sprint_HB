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
    try {
        const sessionClient = await createSessionClient();
        if (!sessionClient) {
            return { success: false, error: "Authentication is not configured on the server." };
        }

        const { data: authData, error: authError } = await sessionClient.auth.getUser();
        if (authError || !authData.user) {
            return { success: false, error: "Your session could not be verified. Please sign in again." };
        }

        const serviceClient = createServiceClient();
        if (!serviceClient) {
            return { success: false, error: "Server service client not configured." };
        }

        const { data: profile, error: profileError } = await serviceClient
            .from("profiles")
            .update({
                must_change_password: false,
                first_login: false,
                is_active: true,
            })
            .eq("id", authData.user.id)
            .select("id")
            .maybeSingle();

        if (profileError || !profile) {
            return {
                success: false,
                error: `Your staff profile could not be updated${profileError ? `: ${profileError.message}` : "."}`,
            };
        }

        const token = typeof invitationToken === "string" ? invitationToken.trim() : "";
        if (token) {
            try {
                const { error: invitationError } = await serviceClient
                    .from("staff_invitations")
                    .update({ status: "used", used_at: new Date().toISOString() })
                    .eq("token", token)
                    .eq("user_id", authData.user.id)
                    .eq("status", "pending");

                if (invitationError) {
                    console.error("[SPRINT Staff Setup] Invitation could not be marked as used:", invitationError);
                }
            } catch (error) {
                console.error("[SPRINT Staff Setup] Invitation could not be marked as used:", error);
            }
        }

        revalidatePath("/staff/dashboard");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unable to complete staff password setup.",
        };
    }
}
