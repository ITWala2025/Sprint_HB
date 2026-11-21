"use server";

import "server-only";

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
    filterAssessmentsByCourseAccess,
    getStudentCourseAccess,
} from "@/lib/student-assessment-access";

type StudentAssessment = {
    id: string;
    course_id: string | null;
    course_name: string | null;
    status: "active" | "closed";
    title: string;
    description: string | null;
    week_label: string | null;
    mentor_name: string | null;
    batch_name: string | null;
    max_marks: number | null;
    submission_type: string | null;
    due_date: string | null;
    attachment_url: string | null;
};

type StudentSubmission = {
    id: string;
    assessment_id: string;
    submission_url: string | null;
    file_url: string | null;
    student_notes: string | null;
    status: string;
    score: number | null;
    mentor_feedback: string | null;
    is_late: boolean | null;
    submitted_at: string | null;
    graded_at: string | null;
};

export type StudentAssignmentsResult =
    | { success: true; assessments: StudentAssessment[]; submissions: StudentSubmission[] }
    | { success: false; error: string };

export async function getStudentAssignmentsAction(): Promise<StudentAssignmentsResult> {
    try {
        const authClient = await createServerSupabaseClient();
        const { data: authData, error: authError } = await authClient.auth.getUser();
        if (authError) {
            console.error("[StudentAssignments] Could not verify student session:", authError.message);
            return { success: false, error: "Your session could not be verified. Please sign in again." };
        }
        if (!authData.user) {
            return { success: false, error: "Sign in to view your assignments." };
        }

        const db = createServiceClient();
        if (!db) {
            return { success: false, error: "Assignments are temporarily unavailable." };
        }
        const { data: profile, error: profileError } = await db
            .from("profiles")
            .select("role, is_active")
            .eq("id", authData.user.id)
            .maybeSingle();
        if (profileError) {
            console.error("[StudentAssignments] Could not verify student account:", profileError.message);
            return { success: false, error: "Your student account could not be verified." };
        }
        if (profile?.role !== "student" || profile.is_active === false) {
            return { success: false, error: "An active Student Portal account is required." };
        }

        const courseAccess = await getStudentCourseAccess(db, authData.user.id);
        if (courseAccess.courseIds.size === 0 && courseAccess.courseNames.size === 0) {
            return { success: true, assessments: [], submissions: [] };
        }

        const [{ data: assessmentRows, error: assessmentError }, { data: submissionRows, error: submissionError }] = await Promise.all([
            db.from("assessments")
                .select("id, course_id, course_name, status, title, description, week_label, mentor_name, batch_name, max_marks, submission_type, due_date, attachment_url")
                .in("status", ["active", "closed"])
                .order("due_date", { ascending: true }),
            db.from("assessment_submissions")
                .select("id, assessment_id, submission_url, file_url, student_notes, status, score, mentor_feedback, is_late, submitted_at, graded_at")
                .eq("student_id", authData.user.id),
        ]);
        if (assessmentError || submissionError) {
            const error = assessmentError ?? submissionError;
            console.error("[StudentAssignments] Could not load assignments:", error.message);
            return { success: false, error: "Assignments could not be loaded. Please try again." };
        }

        const assessments = filterAssessmentsByCourseAccess(assessmentRows ?? [], courseAccess);
        const assessmentIds = new Set(assessments.map((assessment) => assessment.id));
        const submissions = (submissionRows ?? []).filter((submission) =>
            assessmentIds.has(submission.assessment_id),
        );
        return { success: true, assessments, submissions };
    } catch (error) {
        console.error("[StudentAssignments] Loading failed:", error);
        return {
            success: false,
            error: "Assignments could not be loaded. Please try again.",
        };
    }
}
