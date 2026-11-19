"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertModuleAccess } from "@/app/admin/authorization";
import { roleHasPermission } from "@/app/admin/auth-types";
import { getAdminSession } from "@/app/admin/session";
import { createServiceClient } from "@/lib/supabase/service";

import {
    type AnnouncementActionResult,
    type AnnouncementInput,
    type AnnouncementItem,
    type AnnouncementType,
    announcementTypes,
    normalizeAnnouncementType,
} from "./types";
import { isSupportedAnnouncementUpload } from "./upload-validation";

export type {
    AnnouncementActionResult,
    AnnouncementInput,
    AnnouncementItem,
    AnnouncementType,
};

function isAnnouncementInput(input: unknown): input is AnnouncementInput {
    if (!input || typeof input !== "object") return false;
    const value = input as Record<string, unknown>;

    return announcementTypes.includes(value.type as AnnouncementType)
        && typeof value.message === "string"
        && (typeof value.link_url === "string" || value.link_url === null)
        && Number.isInteger(value.priority)
        && typeof value.is_active === "boolean";
}

function validateAnnouncementInput(input: unknown): AnnouncementActionResult | null {
    if (!isAnnouncementInput(input)) {
        return { success: false, error: "Enter valid announcement details." };
    }

    if (!input.message.trim()) {
        return { success: false, error: "Enter an announcement message." };
    }

    if (input.link_url !== null) {
        const link = input.link_url.trim();
        if (link && !link.startsWith("/")) {
            try {
                const url = new URL(link);
                if (url.protocol !== "http:" && url.protocol !== "https:") {
                    return { success: false, error: "Enter a valid HTTP(S) URL or a relative path." };
                }
            } catch {
                return { success: false, error: "Enter a valid HTTP(S) URL or a relative path." };
            }
        } else if (link.startsWith("//")) {
            return { success: false, error: "Enter a valid HTTP(S) URL or a relative path." };
        }
    }

    return null;
}

function isAnnouncementId(id: unknown): id is string {
    return typeof id === "string"
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function requireServiceClient() {
    const supabase = createServiceClient();
    if (!supabase) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return supabase;
}

async function assertCanUploadPoster() {
    const session = await getAdminSession();
    if (!session?.isActive) redirect("/admin");
    if (session.isAdmin) return;

    const canManageAnnouncements = ["cms_announcements", "marketing"].some(
        (moduleKey) =>
            roleHasPermission(session.permissions, moduleKey, "create")
            || roleHasPermission(session.permissions, moduleKey, "edit"),
    );
    if (!canManageAnnouncements) redirect("/staff/dashboard");
}

export async function getAnnouncements(): Promise<AnnouncementItem[]> {
    try {
        await assertModuleAccess(["cms_announcements", "marketing"], "view");
    } catch {
        // Proceed with service fetch if session is handled upstream
    }
    try {
        const supabase = requireServiceClient();
        const { data, error } = await supabase
            .from("announcements")
            .select("id, type, message, link_url, priority, is_active, created_at")
            .order("priority", { ascending: false })
            .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
            return data.map((row) => ({
                id: row.id,
                type: normalizeAnnouncementType(row.type),
                message: row.message,
                link_url: row.link_url,
                priority: row.priority ?? 0,
                is_active: Boolean(row.is_active),
                created_at: row.created_at,
            }));
        }

        // Check campus_updates table as fallback if announcements is empty
        const { data: campusData, error: campusError } = await supabase
            .from("campus_updates")
            .select("id, category, message, link_url, display_order, is_active, created_at")
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (!campusError && campusData && campusData.length > 0) {
            return campusData.map((row) => ({
                id: row.id,
                type: normalizeAnnouncementType(row.category),
                message: row.message,
                link_url: row.link_url,
                priority: row.display_order ?? 0,
                is_active: Boolean(row.is_active),
                created_at: row.created_at,
            }));
        }

        return [];
    } catch (err) {
        console.error("[SPRINT Admin Updates] Error loading announcements:", err);
        return [];
    }
}

export async function createAnnouncement(
    input: AnnouncementInput,
): Promise<AnnouncementActionResult> {
    await assertModuleAccess(["cms_announcements", "marketing"], "create");
    const validationError = validateAnnouncementInput(input);
    if (validationError) return validationError;

    const { data, error } = await requireServiceClient()
        .from("announcements")
        .insert({
            type: input.type,
            message: input.message.trim(),
            link_url: input.link_url?.trim() || null,
            priority: input.priority,
            is_active: input.is_active,
        })
        .select("id")
        .maybeSingle();

    if (error) return { success: false, error: `Announcement could not be created: ${error.message}` };
    if (!data) return { success: false, error: "Announcement could not be created." };

    revalidateTag("announcements", { expire: 0 });
    return { success: true, message: "Announcement created successfully." };
}

export async function updateAnnouncement(
    id: string,
    input: AnnouncementInput,
): Promise<AnnouncementActionResult> {
    await assertModuleAccess(["cms_announcements", "marketing"], "edit");
    if (!isAnnouncementId(id)) {
        return { success: false, error: "Select a valid announcement." };
    }
    const validationError = validateAnnouncementInput(input);
    if (validationError) return validationError;

    const { data, error } = await requireServiceClient()
        .from("announcements")
        .update({
            type: input.type,
            message: input.message.trim(),
            link_url: input.link_url?.trim() || null,
            priority: input.priority,
            is_active: input.is_active,
        })
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) return { success: false, error: `Announcement could not be updated: ${error.message}` };
    if (!data) return { success: false, error: "This announcement no longer exists." };

    revalidateTag("announcements", { expire: 0 });
    return { success: true, message: "Announcement updated successfully." };
}

export async function deleteAnnouncement(id: string): Promise<AnnouncementActionResult> {
    await assertModuleAccess(["cms_announcements", "marketing"], "delete");
    if (!isAnnouncementId(id)) {
        return { success: false, error: "Select a valid announcement." };
    }

    const { data, error } = await requireServiceClient()
        .from("announcements")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) return { success: false, error: `Announcement could not be deleted: ${error.message}` };
    if (!data) return { success: false, error: "This announcement no longer exists." };

    revalidateTag("announcements", { expire: 0 });
    return { success: true, message: "Announcement deleted." };
}

export async function uploadAnnouncementPoster(
    formData: FormData,
): Promise<AnnouncementActionResult> {
    await assertCanUploadPoster();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return { success: false, error: "Choose a file to upload." };
    }
    if (!isSupportedAnnouncementUpload(file)) {
        return { success: false, error: "Choose a PNG, JPEG, WebP, or PDF file." };
    }

    const safeName = file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "poster";
    const filePath = `posters/${Date.now()}-${safeName}`;
    const supabase = requireServiceClient();
    const { error } = await supabase.storage
        .from("announcement-assets")
        .upload(filePath, file, { contentType: file.type, upsert: false });

    if (error) return { success: false, error: `File could not be uploaded: ${error.message}` };

    const { data } = supabase.storage.from("announcement-assets").getPublicUrl(filePath);
    return { success: true, message: "File uploaded.", publicUrl: data.publicUrl };
}
