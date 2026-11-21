"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { assertModuleAccess } from "@/app/admin/authorization";
import { getAdminSession } from "@/app/admin/session";
import { createServiceClient } from "@/lib/supabase/service";
import type { LiveClass, LiveClassInput, LiveClassPlatform, LiveClassStatus } from "./types";

const route = "/admin/academics/live-classes";
const access = ["academic_ops", "academics"] as const;
const platforms: LiveClassPlatform[] = ["Google Meet", "Zoom", "Other"];
const statuses: LiveClassStatus[] = ["scheduled", "live", "completed", "cancelled"];

function requireServiceClient() {
    const client = createServiceClient();
    if (!client) throw new Error("Server-side Supabase service role is not configured.");
    return client;
}

function isId(value: unknown): value is string {
    return typeof value === "string"
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isSafeWebUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function isLiveClassInput(value: unknown): value is LiveClassInput {
    if (!value || typeof value !== "object") return false;
    const input = value as Record<string, unknown>;
    return typeof input.title === "string"
        && typeof input.course_name === "string"
        && typeof input.batch_name === "string"
        && typeof input.mentor_name === "string"
        && typeof input.scheduled_at === "string"
        && typeof input.duration_mins === "number"
        && platforms.includes(input.platform as LiveClassPlatform)
        && (typeof input.meeting_url === "string" || input.meeting_url === null)
        && statuses.includes(input.status as LiveClassStatus);
}

export async function getLiveClassesAction(): Promise<{ classes: LiveClass[]; error?: string }> {
    await assertModuleAccess(access, "view");
    try {
        const { data, error } = await requireServiceClient()
            .from("live_classes")
            .select("*")
            .order("scheduled_at", { ascending: true });
        if (error) return { classes: [], error: `Live classes could not be loaded: ${error.message}` };
        return { classes: (data ?? []) as LiveClass[] };
    } catch (error) {
        console.error("[SPRINT Admin Live Classes] Load failed:", error);
        return { classes: [], error: error instanceof Error ? error.message : "Live classes could not be loaded." };
    }
}

export async function saveLiveClassAction(
    input: LiveClassInput,
    id?: string,
): Promise<{ success: boolean; liveClass?: LiveClass; error?: string }> {
    await assertModuleAccess(access, id ? "edit" : "create");
    if (id && !isId(id)) return { success: false, error: "Select a valid live class." };
    if (!isLiveClassInput(input)) return { success: false, error: "Enter valid live class details." };
    if (!input.title.trim() || !input.course_name.trim() || !input.batch_name.trim() || !input.mentor_name.trim()) {
        return { success: false, error: "Add a title, course, batch, and mentor." };
    }
    if (!Number.isInteger(input.duration_mins) || input.duration_mins < 1 || input.duration_mins > 1440) {
        return { success: false, error: "Session duration must be between 1 and 1,440 minutes." };
    }
    if (Number.isNaN(new Date(input.scheduled_at).getTime())) return { success: false, error: "Enter a valid session date and time." };
    if (input.meeting_url && !isSafeWebUrl(input.meeting_url)) return { success: false, error: "Meeting URL must be a valid HTTP(S) link." };

    try {
        const client = requireServiceClient();
        const session = await getAdminSession();
        const payload = {
            ...input,
            title: input.title.trim(),
            course_name: input.course_name.trim(),
            batch_name: input.batch_name.trim(),
            mentor_name: input.mentor_name.trim(),
            scheduled_at: new Date(input.scheduled_at).toISOString(),
            meeting_url: input.meeting_url?.trim() || null,
            ...(id ? {} : { created_by: session?.userId ?? null }),
        };
        const query = id
            ? client.from("live_classes").update(payload).eq("id", id).select("*").single()
            : client.from("live_classes").insert(payload).select("*").single();
        const { data, error } = await query;
        if (error || !data) return { success: false, error: `Live class could not be saved: ${error?.message ?? "No record returned."}` };
        revalidatePath(route);
        return { success: true, liveClass: data as LiveClass };
    } catch (error) {
        console.error("[SPRINT Admin Live Classes] Save failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Live class could not be saved." };
    }
}

export async function updateLiveClassStatusAction(
    id: string,
    status: LiveClassStatus,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(access, "edit");
    if (!isId(id) || !statuses.includes(status)) return { success: false, error: "Select a valid live class status." };
    try {
        const { error } = await requireServiceClient().from("live_classes").update({ status }).eq("id", id);
        if (error) return { success: false, error: `Session status could not be updated: ${error.message}` };
        revalidatePath(route);
        return { success: true };
    } catch (error) {
        console.error("[SPRINT Admin Live Classes] Status update failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Session status could not be updated." };
    }
}
