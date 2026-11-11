"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertModuleAccess } from "@/app/admin/authorization";
import { roleHasPermission } from "@/app/admin/auth-types";
import { getAdminSession } from "@/app/admin/session";
import { createServiceClient } from "@/lib/supabase/service";

const announcementTypes = ["ANNOUNCEMENT", "UPDATES", "HIRING", "MAINTENANCE"] as const;
type AnnouncementType = typeof announcementTypes[number];

export type AnnouncementInput = {
    type: AnnouncementType;
    message: string;
    link_url: string | null;
    priority: number;
    is_active: boolean;
};

export type AnnouncementActionResult =
    | { success: true; message: string; publicUrl?: string }
    | { success: false; error: string };

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
        return { success: false, error: "Choose an image to upload." };
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        return { success: false, error: "Choose a PNG, JPEG, or WebP image." };
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

    if (error) return { success: false, error: `Poster could not be uploaded: ${error.message}` };

    const { data } = supabase.storage.from("announcement-assets").getPublicUrl(filePath);
    return { success: true, message: "Poster uploaded.", publicUrl: data.publicUrl };
}
