export interface SyllabusModule {
    title: string;
    sessions: number;
    topics?: string[];
}

export interface CourseItem {
    id: string;
    slug: string;
    title: string;
    category: string;
    difficulty_level: string;
    audience: "undergraduate" | "working_professional";
    audience_type: "undergraduate" | "working_professional";
    delivery_method: "Hybrid" | "Online" | "Offline";
    duration: string;
    description: string;
    long_description: string | null;
    badge_label: string;
    prerequisites: string | null;
    tools: string[];
    curriculum: SyllabusModule[];
    outcomes: string[];
    target_roles: string[];
    is_featured: boolean;
    is_published: boolean;
    pathway: string | null;
    target_role: string | null;
    certificate_included: boolean;
    thumbnail_url: string | null;
}

export function generateSlug(title: string) {
    return title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
