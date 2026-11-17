import type { Metadata } from "next";
import { assertModuleAccess } from "@/app/admin/authorization";
import { getAnnouncements } from "./actions";
import type { AnnouncementItem } from "./types";
import AnnouncementManagementClient from "./AnnouncementManagementClient";

export const metadata: Metadata = {
    title: "Announcements & Updates | Admin",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
    await assertModuleAccess(["cms_announcements", "marketing"], "view");

    let initialAnnouncements: AnnouncementItem[] = [];
    try {
        initialAnnouncements = await getAnnouncements();
    } catch (err) {
        console.error("[SPRINT Admin Updates] Server load error:", err);
    }

    return <AnnouncementManagementClient initialAnnouncements={initialAnnouncements} />;
}
