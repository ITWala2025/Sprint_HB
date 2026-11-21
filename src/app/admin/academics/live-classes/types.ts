export type LiveClassStatus = "scheduled" | "live" | "completed" | "cancelled";
export type LiveClassPlatform = "Google Meet" | "Zoom" | "Other";

export type LiveClass = {
    id: string;
    title: string;
    course_name: string;
    batch_name: string;
    mentor_name: string;
    scheduled_at: string;
    duration_mins: number;
    platform: LiveClassPlatform;
    meeting_url: string | null;
    status: LiveClassStatus;
    created_by: string | null;
    created_at: string;
};

export type LiveClassInput = Omit<LiveClass, "id" | "created_by" | "created_at">;
