"use server";

import { revalidatePath } from "next/cache";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import {
    enquiryAudiences,
    type Enquiry,
    type EnquiryAudience,
    type EnquiryStatus,
} from "@/components/admin/enquiries-types";

const enquiryStatuses: EnquiryStatus[] = ["new", "contacted", "resolved"];

function requireServiceClient() {
    const client = createServiceClient();
    if (!client) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return client;
}

function isEnquiryId(id: unknown): id is string {
    return typeof id === "string"
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function revalidateEnquiryViews() {
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/enquiries/students");
    revalidatePath("/admin/enquiries/professionals");
    revalidatePath("/admin/enquiries/institutes");
    revalidatePath("/admin/enquiries/companies");
}

export async function getEnquiries(audienceType?: EnquiryAudience): Promise<Enquiry[]> {
    await assertModuleAccess(["admissions", "marketing", "support"], "view");
    if (audienceType && !enquiryAudiences.includes(audienceType)) {
        throw new Error("Select a valid enquiry category.");
    }

    let query = requireServiceClient()
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
    if (audienceType) query = query.eq("audience_type", audienceType);

    const { data, error } = await query;
    if (error) {
        console.error("[admin-enquiries] Could not load enquiries:", error.message);
        throw new Error(`Could not load enquiries: ${error.message}`);
    }
    return (data ?? []) as Enquiry[];
}

export async function updateEnquiryStatus(
    id: string,
    status: EnquiryStatus,
): Promise<{ success: true } | { success: false; error: string }> {
    await assertModuleAccess(["admissions", "marketing", "support"], "edit");
    if (!isEnquiryId(id) || !enquiryStatuses.includes(status)) {
        return { success: false, error: "Select a valid enquiry and status." };
    }

    const { data, error } = await requireServiceClient()
        .from("enquiries")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("[admin-enquiries] Could not update enquiry status:", error.message);
        return { success: false, error: `Could not update enquiry status: ${error.message}` };
    }
    if (!data) return { success: false, error: "This enquiry no longer exists." };

    revalidateEnquiryViews();
    return { success: true };
}

export async function deleteEnquiry(
    id: string,
): Promise<{ success: true } | { success: false; error: string }> {
    await assertModuleAccess(["admissions", "marketing", "support"], "delete");
    if (!isEnquiryId(id)) {
        return { success: false, error: "Select a valid enquiry." };
    }

    const { data, error } = await requireServiceClient()
        .from("enquiries")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("[admin-enquiries] Could not delete enquiry:", error.message);
        return { success: false, error: `Could not delete enquiry: ${error.message}` };
    }
    if (!data) return { success: false, error: "This enquiry no longer exists." };

    revalidateEnquiryViews();
    return { success: true };
}
