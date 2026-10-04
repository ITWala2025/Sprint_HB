"use server";

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type ProvisionStaffUserInput = {
    fullName: string;
    email: string;
    roleId: string;
    roleName: string;
    tempPassword: string;
};

export type ProvisionStaffUserResult =
    | { success: true; userId: string }
    | { success: false; error: string };

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character] ?? character);
}

function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;

    return createSupabaseClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
}

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
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Components cannot write cookies; Server Actions can.
                }
            },
        },
    });
}

export async function provisionStaffUserAction(
    input: ProvisionStaffUserInput,
): Promise<ProvisionStaffUserResult> {
    const fullName = typeof input?.fullName === "string" ? input.fullName.trim() : "";
    const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
    const roleId = typeof input?.roleId === "string" ? input.roleId : "";
    const roleName = typeof input?.roleName === "string" ? input.roleName.trim() : "";
    const tempPassword = typeof input?.tempPassword === "string" ? input.tempPassword : "";

    if (!fullName || !email || !roleId || !roleName || tempPassword.length < 8) {
        return { success: false, error: "Enter a valid name, email, active role, and temporary password." };
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const serviceClient = createServiceClient();
    if (!serviceClient || !resendApiKey || !fromEmail) {
        return { success: false, error: "Staff provisioning email is not configured on the server." };
    }

    const sessionClient = await createSessionClient();
    if (!sessionClient) {
        return { success: false, error: "Authentication is not configured on the server." };
    }

    const { data: authData, error: authError } = await sessionClient.auth.getUser();
    if (authError || !authData.user) {
        return { success: false, error: "Sign in again before creating a staff account." };
    }

    const { data: actor, error: actorError } = await sessionClient
        .from("profiles")
        .select("role, is_active, roles(is_active)")
        .eq("id", authData.user.id)
        .maybeSingle();

    const actorRole = Array.isArray(actor?.roles) ? actor.roles[0] : actor?.roles;
    if (
        actorError ||
        !actor ||
        actor.is_active !== true ||
        (actor.role !== "admin" && actorRole?.is_active !== true)
    ) {
        return { success: false, error: "Your active staff profile could not be verified." };
    }

    const [userManagementPermission, accessControlPermission] = await Promise.all([
        sessionClient.rpc("current_user_has_permission", {
            module_key: "user_management",
            capability: "create",
        }),
        sessionClient.rpc("current_user_has_permission", {
            module_key: "access_control",
            capability: "create",
        }),
    ]);
    const isLegacyAdmin = actor.role === "admin";
    if (
        !isLegacyAdmin &&
        userManagementPermission.data !== true &&
        accessControlPermission.data !== true
    ) {
        return { success: false, error: "You do not have permission to create staff accounts." };
    }

    const { data: role, error: roleError } = await serviceClient
        .from("roles")
        .select("id, name, is_active")
        .eq("id", roleId)
        .maybeSingle();

    if (roleError || !role || !role.is_active || role.name !== roleName) {
        return { success: false, error: "The selected role is no longer active. Refresh the page and try again." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        return { success: false, error: "The public site URL is not configured on the server." };
    }

    const { data: created, error: createError } = await serviceClient.rpc(
        "admin_create_staff_user",
        {
            p_email: email,
            p_temp_password: tempPassword,
            p_role_id: roleId,
            p_full_name: fullName,
        },
    );
    const createdRecord = Array.isArray(created) ? created[0] : created;
    const userId = createdRecord?.user_id as string | undefined;

    if (createError || !userId) {
        return { success: false, error: createError?.message ?? "The staff account could not be created." };
    }

    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safeRoleName = escapeHtml(role.name);
    const safePassword = escapeHtml(tempPassword);
    const signInUrl = `${siteUrl.replace(/\/$/, "")}/admin`;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: "Welcome to SPRINT — Your Account Credentials",
                html: `
                    <div style="margin:0;background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
                      <div style="max-width:560px;margin:0 auto;overflow:hidden;border-radius:16px;background:#ffffff;border:1px solid #e2e8f0">
                        <div style="background:#011f3e;padding:28px 32px;color:#ffffff">
                          <p style="margin:0;color:#f81529;font-size:12px;font-weight:700;letter-spacing:2px">SPRINT ADMIN HUB</p>
                          <h1 style="margin:12px 0 0;font-size:24px">Welcome, ${safeName}</h1>
                        </div>
                        <div style="padding:28px 32px">
                          <p style="margin:0 0 18px;line-height:1.6">Your staff account has been created with the following role:</p>
                          <p style="margin:0 0 20px;padding:12px 14px;border-left:3px solid #f81529;background:#f8fafc;font-weight:700">${safeRoleName}</p>
                          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b">EMAIL</p>
                          <p style="margin:0 0 16px">${safeEmail}</p>
                          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b">TEMPORARY PASSWORD</p>
                          <p style="margin:0 0 20px;padding:12px 14px;border-radius:8px;background:#f1f5f9;font-family:monospace;word-break:break-all">${safePassword}</p>
                          <p style="margin:0 0 24px;line-height:1.6">This temporary credential expires after your first sign-in. You must set a permanent password before continuing.</p>
                          <a href="${escapeHtml(signInUrl)}" style="display:inline-block;border-radius:8px;background:#f81529;padding:13px 20px;color:#ffffff;text-decoration:none;font-weight:700">Sign in to SPRINT</a>
                        </div>
                      </div>
                    </div>`,
            }),
        });

        if (!response.ok) throw new Error("Email provider rejected the message");
    } catch {
        const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(userId);
        return {
            success: false,
            error: cleanupError
                ? "Email delivery failed and the new account could not be rolled back. Contact a system administrator."
                : "Email delivery failed. The new account was rolled back; verify the mail configuration and try again.",
        };
    }

    return { success: true, userId };
}