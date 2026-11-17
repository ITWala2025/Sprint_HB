"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import {
    type BundleItem,
    type CourseItem,
    type LearningPathItem,
    generateSlug,
    normalizeBundle,
    normalizeLearningPath,
} from "@/lib/course-utils";

type CoursePayload = Omit<CourseItem, "id">;
type BundlePayload = Omit<BundleItem, "id">;
type LearningPathPayload = Omit<LearningPathItem, "id">;

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

function requireServiceClient() {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return serviceClient;
}

function normalizeRawCourse(row: any): CourseItem {
    let curriculum = row.curriculum;
    if (typeof curriculum === "string") {
        try { curriculum = JSON.parse(curriculum); } catch { curriculum = []; }
    }
    if (!Array.isArray(curriculum)) curriculum = [];

    const audience = row.audience_type || row.audience || "undergraduate";
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        difficulty_level: row.difficulty_level || "Beginner",
        audience,
        audience_type: audience,
        delivery_method: row.delivery_method || "Hybrid",
        duration: row.duration || "",
        description: row.description || "",
        long_description: row.long_description || "",
        badge_label: row.badge_label || "Course",
        prerequisites: row.prerequisites || "",
        tools: Array.isArray(row.tools) ? row.tools : [],
        outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
        target_roles: Array.isArray(row.target_roles) ? row.target_roles : row.target_role ? [row.target_role] : [],
        curriculum: curriculum.map((module: any) => ({
            ...module,
            title: module.title ?? "",
            sessions: Number(module.sessions) || module.topics?.length || 0,
        })),
        is_featured: Boolean(row.is_featured),
        is_published: Boolean(row.is_published),
        pathway: row.pathway || null,
        target_role: row.target_role || null,
        certificate_included: Boolean(row.certificate_included),
        thumbnail_url: typeof row.thumbnail_url === "string" ? row.thumbnail_url.trim() : null,
    };
}

export async function getCoursesAction(): Promise<{ courses: CourseItem[]; error?: string }> {
    await assertModuleAccess(["courses", "cms_courses"], "view");
    try {
        const serviceClient = createServiceClient();
        const supabase = serviceClient ?? await createAuthenticatedServerClient();

        const { data, error } = await supabase.from("courses").select("*").order("title");
        if (error) {
            console.error("[SPRINT Admin Courses] Could not load courses:", error);
            return { courses: [], error: error.message };
        }
        return { courses: (data ?? []).map(normalizeRawCourse) };
    } catch (err) {
        return { courses: [], error: err instanceof Error ? err.message : "Unable to load courses." };
    }
}

export async function getBundlesAction(): Promise<{ bundles: BundleItem[]; error?: string }> {
    await assertModuleAccess(["course_bundle_cms", "cms_courses"], "view");
    try {
        const serviceClient = createServiceClient();
        const supabase = serviceClient ?? await createAuthenticatedServerClient();

        const { data, error } = await supabase.from("course_bundles").select("*").order("created_at", { ascending: false });
        if (error) {
            console.error("[SPRINT Admin Courses] Could not load course bundles:", error);
            return { bundles: [], error: error.message };
        }
        return { bundles: (data ?? []).map((row: any) => normalizeBundle(row)) };
    } catch (err) {
        return { bundles: [], error: err instanceof Error ? err.message : "Unable to load flagship programs." };
    }
}

export async function getLearningPathsAction(): Promise<{ paths: LearningPathItem[]; error?: string }> {
    await assertModuleAccess(["courses", "course_bundle_cms", "cms_courses"], "view");
    try {
        const serviceClient = createServiceClient();
        const supabase = serviceClient ?? await createAuthenticatedServerClient();

        const { data, error } = await supabase.from("learning_paths").select("*").order("title");
        if (error) {
            console.error("[SPRINT Admin Courses] Could not load learning paths:", error);
            return { paths: [], error: error.message };
        }
        return { paths: (data ?? []).map((row: any) => normalizeLearningPath(row)) };
    } catch (err) {
        return { paths: [], error: err instanceof Error ? err.message : "Unable to load learning paths." };
    }
}

export async function saveCourseAction(
    payload: CoursePayload,
    id?: string,
): Promise<{ success: boolean; data?: CourseItem; error?: string }> {
    const capability = id ? "edit" : "create";
    await assertModuleAccess(["courses", "cms_courses"], capability);

    try {
        const supabase = requireServiceClient();
        const audience = payload.audience_type || payload.audience || "undergraduate";
        const normalizedPayload: CoursePayload = {
            ...payload,
            audience,
            audience_type: audience,
            difficulty_level: payload.difficulty_level || "Beginner",
        };

        const query = id
            ? supabase.from("courses").update(normalizedPayload).eq("id", id).select("*").single()
            : supabase.from("courses").insert(normalizedPayload).select("*").single();

        const { data, error } = await query;
        if (error || !data) {
            return { success: false, error: error?.message ?? "Unable to save course." };
        }

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true, data: normalizeRawCourse(data) };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to save course." };
    }
}

export async function toggleCourseFieldAction(
    id: string,
    field: "is_featured" | "is_published",
    value: boolean,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(["courses", "cms_courses"], "edit");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase.from("courses").update({ [field]: value }).eq("id", id);
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to update course." };
    }
}

export async function deleteCourseAction(
    id: string,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(["courses", "cms_courses"], "delete");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase.from("courses").delete().eq("id", id);
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to delete course." };
    }
}

export async function saveBundleAction(
    payload: BundlePayload,
    id?: string,
): Promise<{ success: boolean; data?: BundleItem; error?: string }> {
    const capability = id ? "edit" : "create";
    await assertModuleAccess(["course_bundle_cms", "cms_courses"], capability);

    try {
        const supabase = requireServiceClient();
        const audience = payload.audience || payload.audience_type || payload.target_audience || "undergraduate";
        const upsertPayload = {
            ...payload,
            audience,
            audience_type: audience,
            target_audience: audience,
            program_type: payload.program_type === "signature" ? "signature" : "bundle",
            delivery_method: payload.delivery_method || payload.training_mode || "Hybrid",
            training_mode: payload.training_mode || payload.delivery_method || "Hybrid",
            designed_for: payload.designed_for || payload.eligibility || "",
            eligibility: payload.eligibility || payload.designed_for || "",
            ...(id ? { id } : {}),
        };

        const { data, error } = await supabase.from("course_bundles").upsert(upsertPayload).select("*").single();
        if (error || !data) {
            return { success: false, error: error?.message ?? "Unable to save flagship program." };
        }

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true, data: normalizeBundle(data) };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to save flagship program." };
    }
}

export async function toggleBundleFieldAction(
    id: string,
    field: "is_published" | "is_featured",
    value: boolean,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(["course_bundle_cms", "cms_courses"], "edit");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase.from("course_bundles").update({ [field]: value }).eq("id", id);
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to update program." };
    }
}

export async function deleteBundleAction(
    id: string,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(["course_bundle_cms", "cms_courses"], "delete");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase.from("course_bundles").delete().eq("id", id);
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to delete program." };
    }
}

export async function saveLearningPathAction(
    payload: LearningPathPayload,
    id?: string,
): Promise<{ success: boolean; data?: LearningPathItem; error?: string }> {
    const capability = id ? "edit" : "create";
    await assertModuleAccess(["courses", "course_bundle_cms", "cms_courses"], capability);

    try {
        const supabase = requireServiceClient();
        const normalizedPayload = {
            ...payload,
            slug: payload.slug || generateSlug(payload.title),
            eyebrow: payload.eyebrow.trim() || "CAREER PATHWAY",
            target_audience: payload.target_audience || "undergraduate",
            total_hours: payload.stages.reduce((total, stage) => total + (Number.parseInt(stage.hours, 10) || 0), 0),
        };

        const query = id
            ? supabase.from("learning_paths").update(normalizedPayload).eq("id", id).select("*").single()
            : supabase.from("learning_paths").insert(normalizedPayload).select("*").single();

        const { data, error } = await query;
        if (error || !data) {
            return { success: false, error: error?.message ?? "Unable to save learning path." };
        }

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true, data: normalizeLearningPath(data) };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to save learning path." };
    }
}

export async function toggleLearningPathPublishedAction(
    id: string,
    isPublished: boolean,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(["courses", "course_bundle_cms", "cms_courses"], "edit");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase.from("learning_paths").update({ is_published: isPublished }).eq("id", id);
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to update learning path." };
    }
}

export async function deleteLearningPathAction(
    id: string,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(["courses", "course_bundle_cms", "cms_courses"], "delete");
    try {
        const supabase = requireServiceClient();
        const { error } = await supabase.from("learning_paths").delete().eq("id", id);
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unable to delete learning path." };
    }
}
