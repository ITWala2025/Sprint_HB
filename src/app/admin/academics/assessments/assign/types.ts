export type AssessmentStatus = "draft" | "active" | "closed";
export type SubmissionStatus = "submitted" | "under_review" | "graded";

export type Assessment = {
    id: string;
    title: string;
    description: string | null;
    course_id?: string | null;
    course_name: string;
    batch_name: string;
    week_label: string | null;
    mentor_name: string | null;
    type: string;
    max_marks: number;
    due_date: string | null;
    submission_type: string | null;
    attachment_url: string | null;
    status: AssessmentStatus;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    submission_count: number;
    review_count: number;
    graded_count: number;
    expected_students: number;
};

export type AssessmentInput = {
    title: string;
    description: string;
    course_id?: string | null;
    course_name: string;
    batch_name: string;
    week_label: string;
    mentor_name: string;
    type: string;
    max_marks: number;
    due_date: string | null;
    submission_type: string;
    attachment_url: string | null;
    status: AssessmentStatus;
};

export type AssessmentCourseOption = {
    id: string;
    title: string;
};

export type AssessmentSubmission = {
    id: string;
    assessment_id: string;
    student_id: string;
    submission_url: string | null;
    file_url: string | null;
    file_signed_url: string | null;
    student_notes: string | null;
    status: SubmissionStatus;
    score: number | null;
    mentor_feedback: string | null;
    is_late: boolean;
    submitted_at: string;
    graded_at: string | null;
    graded_by: string | null;
    student_name: string;
    student_email: string;
};
