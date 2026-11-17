export const announcementTypes = ["ANNOUNCEMENT", "UPDATES", "HIRING", "MAINTENANCE"] as const;
export type AnnouncementType = typeof announcementTypes[number];

export function normalizeAnnouncementType(rawType: unknown): AnnouncementType {
    const val = String(rawType || "").trim().toUpperCase();
    if (val === "MAINTAINENCE" || val === "MAINTENANCE") return "MAINTENANCE";
    if (val === "HIRING") return "HIRING";
    if (val === "UPDATES" || val === "UPDATE") return "UPDATES";
    return "ANNOUNCEMENT";
}

export type AnnouncementItem = {
    id: string;
    type: AnnouncementType;
    message: string;
    link_url: string | null;
    priority: number;
    is_active: boolean;
    created_at: string;
};

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
