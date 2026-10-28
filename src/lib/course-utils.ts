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

export type CourseAudience = "undergraduate" | "working_professional";

export interface LearningPathStage {
    number: string;
    title: string;
    hours: string;
    learn: string;
}

export interface LearningPathItem {
    id: string;
    slug: string;
    title: string;
    eyebrow: string;
    target_audience: CourseAudience;
    total_hours: number;
    stages: LearningPathStage[];
    certifications: string[];
    is_published: boolean;
    is_featured: boolean;
}

export type ProgramType = "signature" | "bundle";

export interface ProgramRoadmapStage {
    stage: string;
    title: string;
    hours: string;
    topics: string[];
}

export interface BundleItem {
    id: string;
    slug: string;
    title: string;
    program_type: ProgramType;
    badge_label: string;
    tagline: string;
    description: string;
    long_description: string;
    audience: CourseAudience;
    audience_type: CourseAudience;
    target_audience: CourseAudience;
    duration: string;
    level: string;
    delivery_method: string;
    credential: string;
    designed_for: string;
    training_mode: string;
    eligibility: string;
    highlights: string[];
    roadmap: ProgramRoadmapStage[];
    is_published: boolean;
    is_featured: boolean;
    image_url?: string | null;
}

type LearningPathSource = Partial<LearningPathItem> & Record<string, unknown>;

const readHours = (value: string | number | null | undefined) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
};

export function normalizeLearningPath(row: LearningPathSource): LearningPathItem {
    const sourceStages = Array.isArray(row.stages)
        ? row.stages
        : Array.isArray(row.courses)
            ? row.courses.map((course, index) => {
                const stage = course as Record<string, unknown>;
                return {
                    number: String(index + 1).padStart(2, "0"),
                    title: stage.title,
                    hours: stage.hours ?? stage.duration,
                    learn: stage.learn,
                };
            })
            : [];
    const stages = sourceStages.map((stage, index) => {
        const source = stage as Record<string, unknown>;
        return {
            number: String(source.number || String(index + 1).padStart(2, "0")),
            title: String(source.title || ""),
            hours: String(source.hours || ""),
            learn: String(source.learn || ""),
        };
    });
    const certifications = Array.isArray(row.certifications)
        ? row.certifications.map(String)
        : Array.isArray(row.courses)
            ? (row.courses as Record<string, unknown>[]).map((course) => String(course.certification || ""))
                .filter(Boolean)
            : [];
    const totalHours = Number(row.total_hours) || stages.reduce((total, stage) => total + readHours(stage.hours), 0);

    return {
        id: String(row.id || row.slug || ""),
        slug: String(row.slug || ""),
        title: String(row.title || row.role || ""),
        eyebrow: String(row.eyebrow || "CAREER PATHWAY"),
        target_audience: normalizeCourseAudience(row.target_audience || row.audience_type || row.audience),
        total_hours: totalHours,
        stages,
        certifications,
        is_published: row.is_published !== false,
        is_featured: Boolean(row.is_featured),
    };
}

export function normalizeCourseAudience(value: unknown): CourseAudience {
    return value === "working_professional" || value === "working professional"
        ? "working_professional"
        : "undergraduate";
}

export function normalizeBundle(row: Partial<BundleItem> & Record<string, unknown>): BundleItem {
    const audience = normalizeCourseAudience(
        row.audience || row.audience_type || row.target_audience || "undergraduate",
    );
    const roadmap = Array.isArray(row.roadmap) ? row.roadmap.map((stage, index) => {
        const source = stage as ProgramRoadmapStage & { duration?: unknown; subjects?: unknown };
        return {
            stage: String(source.stage || "PROGRAM STAGE"),
            title: String(source.title || ""),
            hours: String(source.hours || source.duration || ""),
            topics: Array.isArray(source.topics)
                ? source.topics.map(String)
                : Array.isArray(source.subjects) ? source.subjects.map(String) : [],
        };
    }) : [];

    return {
        ...row,
        id: String(row.id || row.slug || ""),
        slug: String(row.slug || ""),
        title: String(row.title || ""),
        program_type: row.program_type === "signature" ? "signature" : "bundle",
        badge_label: String(row.badge_label || "Program"),
        tagline: String(row.tagline || row.headline || ""),
        description: String(row.description || ""),
        long_description: String(row.long_description || row.longDescription || ""),
        audience,
        audience_type: audience,
        target_audience: audience,
        duration: String(row.duration || ""),
        level: String(row.level || ""),
        delivery_method: String(row.delivery_method || row.training_mode || row.delivery || ""),
        credential: String(row.credential || row.certification || ""),
        designed_for: String(row.designed_for || row.eligibility || row.audienceLabel || ""),
        training_mode: String(row.training_mode || row.delivery_method || row.delivery || "Hybrid"),
        eligibility: String(row.eligibility || row.designed_for || ""),
        highlights: Array.isArray(row.highlights)
            ? row.highlights.map(String)
            : Array.isArray(row.outcomes) ? row.outcomes.map(String) : [],
        roadmap,
        is_published: row.is_published !== false,
        is_featured: Boolean(row.is_featured),
        image_url: typeof row.image_url === "string" ? row.image_url : null,
    };
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
