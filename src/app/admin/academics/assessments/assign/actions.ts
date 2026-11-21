"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { assertModuleAccess } from "@/app/admin/authorization";
import { getAdminSession } from "@/app/admin/session";
import { createServiceClient } from "@/lib/supabase/service";
import type {
    Assessment,
    AssessmentCourseOption,
    AssessmentInput,
    AssessmentSubmission,
    AssessmentStatus,
} from "./types";

const route = "/admin/academics/assessments/assign";
const access = ["academic_ops", "academics"] as const;

function requireServiceClient() {
    const client = createServiceClient();
    if (!client) throw new Error("Server-side Supabase service role is not configured.");
    return client;
}

function isMissingCourseIdColumn(error: { code?: string; message?: string }) {
    const message = error.message?.toLowerCase() ?? "";
    return message.includes("course_id") && (
        error.code === "42703"
        || error.code === "PGRST204"
        || message.includes("does not exist")
        || message.includes("schema cache")
    );
}

function isId(value: unknown): value is string {
    return typeof value === "string"
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isAssessmentInput(value: unknown): value is AssessmentInput {
    if (!value || typeof value !== "object") return false;
    const input = value as Record<string, unknown>;
    return typeof input.title === "string"
        && typeof input.description === "string"
        && typeof input.course_name === "string"
        && typeof input.batch_name === "string"
        && typeof input.week_label === "string"
        && typeof input.mentor_name === "string"
        && typeof input.type === "string"
        && typeof input.max_marks === "number"
        && (input.course_id === undefined || input.course_id === null || isId(input.course_id))
        && (typeof input.due_date === "string" || input.due_date === null)
        && typeof input.submission_type === "string"
        && (typeof input.attachment_url === "string" || input.attachment_url === null)
        && ["draft", "active", "closed"].includes(String(input.status));
}

function validateAssessment(input: AssessmentInput): string | null {
    if (!input.title.trim() || !input.course_name.trim() || !input.batch_name.trim()) {
        return "Add an assessment title, course, and batch.";
    }
    if (!input.type.trim() || !Number.isFinite(input.max_marks) || input.max_marks <= 0) {
        return "Choose an assessment type and enter maximum marks greater than zero.";
    }
    if (input.due_date && Number.isNaN(new Date(input.due_date).getTime())) {
        return "Enter a valid due date.";
    }
    if (input.attachment_url && !isSafeWebUrl(input.attachment_url)) {
        return "Attachment URL must be a valid HTTP(S) link.";
    }
    return null;
}

function isSafeWebUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

export async function getAssessmentsAction(): Promise<{ assessments: Assessment[]; error?: string }> {
    await assertModuleAccess(access, "view");
    try {
        const client = requireServiceClient();
        const [{ data: rows, error }, { data: submissions, error: submissionError }] = await Promise.all([
            client.from("assessments").select("*").order("created_at", { ascending: false }),
            client.from("assessment_submissions").select("assessment_id, status"),
        ]);
        if (error) return { assessments: [], error: `Assessments could not be loaded: ${error.message}` };
        if (submissionError) return { assessments: [], error: `Submission progress could not be loaded: ${submissionError.message}` };

        const submissionStats = new Map<string, { total: number; review: number; graded: number }>();
        for (const submission of submissions ?? []) {
            const current = submissionStats.get(submission.assessment_id) ?? { total: 0, review: 0, graded: 0 };
            current.total += 1;
            if (submission.status === "under_review") current.review += 1;
            if (submission.status === "graded") current.graded += 1;
            submissionStats.set(submission.assessment_id, current);
        }

        const { data: batches, error: batchError } = await client.from("batches").select("id, batch_name");
        const batchIds = (batches ?? []).map((batch) => batch.id);
        let enrollments: { batch_id: string; student_id: string; status: string }[] = [];
        let progressError = batchError
            ? `Batch totals could not be loaded: ${batchError.message}`
            : undefined;
        if (!batchError && batchIds.length > 0) {
            const enrollmentResult = await client
                .from("student_course_enrollments")
                .select("batch_id, student_id, status")
                .in("batch_id", batchIds)
                .eq("status", "active");
            if (enrollmentResult.error) {
                progressError = `Batch enrollment totals could not be loaded: ${enrollmentResult.error.message}`;
            } else {
                enrollments = enrollmentResult.data ?? [];
            }
        }
        const enrollmentCounts = new Map<string, Set<string>>();
        const batchNames = new Map((batches ?? []).map((batch) => [batch.id, batch.batch_name]));
        for (const enrollment of enrollments ?? []) {
            const batchName = batchNames.get(enrollment.batch_id);
            if (!batchName) continue;
            const students = enrollmentCounts.get(batchName) ?? new Set<string>();
            students.add(enrollment.student_id);
            enrollmentCounts.set(batchName, students);
        }

        return {
            assessments: (rows ?? []).map((row): Assessment => {
                const stats = submissionStats.get(row.id) ?? { total: 0, review: 0, graded: 0 };
                const expected = enrollmentCounts.get(row.batch_name)?.size ?? 0;
                return {
                    ...row,
                    description: row.description ?? null,
                    week_label: row.week_label ?? null,
                    mentor_name: row.mentor_name ?? null,
                    due_date: row.due_date ?? null,
                    submission_type: row.submission_type ?? null,
                    attachment_url: row.attachment_url ?? null,
                    submission_count: stats.total,
                    review_count: stats.review,
                    graded_count: stats.graded,
                    expected_students: Math.max(expected, stats.total),
                };
            }),
            ...(progressError ? { error: progressError } : {}),
        };
    } catch (error) {
        console.error("[SPRINT Admin Assessments] Load failed:", error);
        return { assessments: [], error: error instanceof Error ? error.message : "Assessments could not be loaded." };
    }
}

export async function getAssessmentCourseCatalogAction(): Promise<{
    courses: AssessmentCourseOption[];
    courseBundles: AssessmentCourseOption[];
    flagshipPrograms: AssessmentCourseOption[];
    error?: string;
}> {
    await assertModuleAccess(access, "view");
    try {
        const client = requireServiceClient();
        const [{ data: courses, error: coursesError }, { data: bundles, error: bundlesError }] = await Promise.all([
            client.from("courses").select("id, title").order("title"),
            client.from("course_bundles").select("*").order("title"),
        ]);
        if (coursesError) return { courses: [], courseBundles: [], flagshipPrograms: [], error: `Courses could not be loaded: ${coursesError.message}` };
        if (bundlesError) return { courses: [], courseBundles: [], flagshipPrograms: [], error: `Programs and bundles could not be loaded: ${bundlesError.message}` };

        const toOption = (row: { id: string; title: string }): AssessmentCourseOption => ({
            id: row.id,
            title: row.title,
        });
        const bundleRows = bundles ?? [];
        return {
            courses: (courses ?? []).map(toOption),
            flagshipPrograms: bundleRows.filter((row) => row.program_type === "signature").map(toOption),
            courseBundles: bundleRows.filter((row) => row.program_type !== "signature").map(toOption),
        };
    } catch (error) {
        console.error("[SPRINT Admin Assessments] Course catalog load failed:", error);
        return {
            courses: [],
            courseBundles: [],
            flagshipPrograms: [],
            error: error instanceof Error ? error.message : "Course catalog could not be loaded.",
        };
    }
}

export async function getAssessmentSubmissionsAction(
    assessmentId: string,
): Promise<{ submissions: AssessmentSubmission[]; error?: string }> {
    await assertModuleAccess(access, "view");
    if (!isId(assessmentId)) return { submissions: [], error: "Select a valid assessment." };
    try {
        const client = requireServiceClient();
        const { data, error } = await client
            .from("assessment_submissions")
            .select("*")
            .eq("assessment_id", assessmentId)
            .order("submitted_at", { ascending: false });
        if (error) return { submissions: [], error: `Submissions could not be loaded: ${error.message}` };

        const studentIds = [...new Set((data ?? []).map((row) => row.student_id))];
        const { data: profiles, error: profileError } = studentIds.length > 0
            ? await client.from("profiles").select("id, full_name, email").in("id", studentIds)
            : { data: [], error: null };
        if (profileError) return { submissions: [], error: `Student details could not be loaded: ${profileError.message}` };
        const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
        const storageErrors = new Set<string>();
        const resolvedSubmissions = await Promise.all((data ?? []).map(async (row) => {
            let fileSignedUrl: string | null = null;
            if (row.file_url) {
                if (/^https?:\/\//i.test(row.file_url)) {
                    fileSignedUrl = row.file_url;
                } else {
                    try {
                        const { data: signedFile, error: signingError } = await client.storage
                            .from("assessment-uploads")
                            .createSignedUrl(row.file_url, 15 * 60);
                        if (signingError || !signedFile?.signedUrl) {
                            storageErrors.add(signingError?.message ?? "Storage did not return a signed URL.");
                        } else {
                            fileSignedUrl = signedFile.signedUrl;
                        }
                    } catch (signingError) {
                        storageErrors.add(signingError instanceof Error ? signingError.message : "The file URL could not be signed.");
                    }
                }
            }
            const profile = profileMap.get(row.student_id);
            return {
                ...row,
                file_signed_url: fileSignedUrl,
                student_name: profile?.full_name || "Student",
                student_email: profile?.email || "",
            } as AssessmentSubmission;
        }));
        return {
            submissions: resolvedSubmissions,
            ...(storageErrors.size > 0
                ? { error: `Some uploaded files could not be opened: ${[...storageErrors].join("; ")}` }
                : {}),
        };
    } catch (error) {
        console.error("[SPRINT Admin Assessments] Submission load failed:", error);
        return { submissions: [], error: error instanceof Error ? error.message : "Submissions could not be loaded." };
    }
}

export async function saveAssessmentAction(
    input: AssessmentInput,
    id?: string,
): Promise<{ success: boolean; assessment?: Assessment; error?: string }> {
    await assertModuleAccess(access, id ? "edit" : "create");
    if (id && !isId(id)) return { success: false, error: "Select a valid assessment." };
    if (!isAssessmentInput(input)) return { success: false, error: "Enter valid assessment details." };
    const validationError = validateAssessment(input);
    if (validationError) return { success: false, error: validationError };

    try {
        const client = requireServiceClient();
        const session = await getAdminSession();
        const payload = {
            ...input,
            course_id: input.course_id ?? null,
            title: input.title.trim(),
            description: input.description.trim() || null,
            course_name: input.course_name.trim(),
            batch_name: input.batch_name.trim(),
            week_label: input.week_label.trim() || null,
            mentor_name: input.mentor_name.trim() || null,
            type: input.type.trim(),
            submission_type: input.submission_type.trim() || null,
            attachment_url: input.attachment_url?.trim() || null,
        };
        const saveAssessment = (
            assessmentPayload: Omit<typeof payload, "course_id"> & { course_id?: string | null },
        ) => id
            ? client.from("assessments").update({ ...assessmentPayload, updated_at: new Date().toISOString() }).eq("id", id).select("*").single()
            : client.from("assessments").insert({ ...assessmentPayload, created_by: session?.userId ?? null }).select("*").single();
        let { data, error } = await saveAssessment(payload);
        if (error && isMissingCourseIdColumn(error)) {
            const { course_id: _courseId, ...legacyPayload } = payload;
            ({ data, error } = await saveAssessment(legacyPayload));
        }
        if (error || !data) return { success: false, error: `Assessment could not be saved: ${error?.message ?? "No record returned."}` };
        revalidatePath(route);
        return { success: true, assessment: data as Assessment };
    } catch (error) {
        console.error("[SPRINT Admin Assessments] Save failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Assessment could not be saved." };
    }
}

export async function gradeAssessmentSubmissionAction(
    submissionId: string,
    score: number,
    feedback: string,
): Promise<{ success: boolean; error?: string }> {
    await assertModuleAccess(access, "edit");
    if (!isId(submissionId)) return { success: false, error: "Select a valid submission." };
    if (!Number.isFinite(score) || score < 0 || typeof feedback !== "string" || feedback.length > 3000) {
        return { success: false, error: "Enter a valid score and feedback (up to 3,000 characters)." };
    }
    try {
        const client = requireServiceClient();
        const { data: submission, error: lookupError } = await client
            .from("assessment_submissions")
            .select("id, assessment_id")
            .eq("id", submissionId)
            .maybeSingle();
        if (lookupError || !submission) return { success: false, error: `Submission could not be found${lookupError ? `: ${lookupError.message}` : "."}` };
        const { data: assessment, error: assessmentError } = await client
            .from("assessments")
            .select("max_marks")
            .eq("id", submission.assessment_id)
            .maybeSingle();
        if (assessmentError || !assessment) return { success: false, error: "The linked assessment could not be found." };
        if (score > Number(assessment.max_marks)) return { success: false, error: `Score cannot exceed ${assessment.max_marks} marks.` };

        const session = await getAdminSession();
        const { error } = await client.from("assessment_submissions").update({
            score,
            mentor_feedback: feedback.trim() || null,
            status: "graded",
            graded_at: new Date().toISOString(),
            graded_by: session?.userId ?? null,
        }).eq("id", submissionId);
        if (error) return { success: false, error: `Grade could not be saved: ${error.message}` };
        revalidatePath(route);
        return { success: true };
    } catch (error) {
        console.error("[SPRINT Admin Assessments] Grading failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Grade could not be saved." };
    }
}
