"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
    BookOpen, Check, CheckCircle2, Clock, Edit3, Eye, Layers, LayoutGrid, List, Plus, Search, Sparkles, Star, Tag, Trash2, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

type CoursePayload = Omit<CourseItem, "id">;
type RoadmapStage = { title: string; duration: string; subjects: string[] };
type BundleItem = {
    id: string;
    slug: string;
    title: string;
    badge_label: string;
    tagline: string;
    description: string;
    long_description: string;
    audience: "undergraduate" | "working_professional";
    duration: string;
    training_mode: "Hybrid" | "Online" | "Offline";
    eligibility: string;
    highlights: string[];
    roadmap: RoadmapStage[];
    is_published: boolean;
    is_featured: boolean;
};
type BundlePayload = Omit<BundleItem, "id">;
type Notice = { type: "success" | "error"; message: string };
type CatalogView = "grid" | "table";
type DashboardView = "courses" | "bundles";

const categories = [
    "Artificial Intelligence & ML",
    "Cloud & DevOps",
    "Full Stack Web",
    "Data Analytics",
    "Cybersecurity",
    "Software Engineering",
    "Career & Soft Skills",
];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const modes = ["Hybrid", "Online", "Offline"] as const;
const audiences = [
    { value: "undergraduate", label: "Undergraduate" },
    { value: "working_professional", label: "Working Professional" },
] as const;

const inputClass = "sprint-focus mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-text-muted";
const labelClass = "block text-xs font-bold text-brand-navy";
const iconButtonClass = "sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-brand-surface disabled:opacity-50";

export function generateSlug(title: string) {
    return title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function normalizeCourse(row: CourseItem): CourseItem {
    const curriculum = Array.isArray(row.curriculum) ? row.curriculum : [];
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
        curriculum: curriculum.map((module) => ({
            ...module,
            title: module.title ?? "",
            sessions: Number(module.sessions) || module.topics?.length || 0,
        })),
        is_featured: Boolean(row.is_featured),
        is_published: Boolean(row.is_published),
        pathway: row.pathway || null,
        target_role: row.target_role || null,
        certificate_included: Boolean(row.certificate_included),
        thumbnail_url: row.thumbnail_url || null,
    };
}

export default function CourseManagementPage() {
    const supabase = useMemo(() => createClient(), []);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [bundles, setBundles] = useState<BundleItem[]>([]);
    const [dashboardView, setDashboardView] = useState<DashboardView>("courses");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [audienceFilter, setAudienceFilter] = useState("all");
    const [catalogView, setCatalogView] = useState<CatalogView>("grid");
    const [isLoading, setIsLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [editingCourse, setEditingCourse] = useState<CourseItem | null | undefined>(undefined);
    const [editingBundle, setEditingBundle] = useState<BundleItem | null | undefined>(undefined);
    const [viewingCourse, setViewingCourse] = useState<CourseItem | null>(null);

    useEffect(() => {
        let active = true;
        async function loadCourses() {
            setIsLoading(true);
            const { data, error } = await supabase.from("courses").select("id,slug,title,category,difficulty_level,audience,audience_type,delivery_method,duration,description,long_description,badge_label,prerequisites,tools,curriculum,outcomes,target_roles,is_featured,is_published,pathway,target_role,certificate_included,thumbnail_url").order("title");
            if (!active) return;
            if (error) {
                setNotice({ type: "error", message: `Courses could not be loaded: ${error.message}` });
            } else {
                setCourses(((data ?? []) as CourseItem[]).map(normalizeCourse));
            }
            setIsLoading(false);
        }
        void loadCourses();
        return () => { active = false; };
    }, [supabase]);

    useEffect(() => {
        if (dashboardView !== "bundles") return;
        let active = true;
        async function loadBundles() {
            setIsLoading(true);
            const { data, error } = await supabase.from("course_bundles").select("id,slug,title,badge_label,tagline,description,long_description,audience,duration,training_mode,eligibility,highlights,roadmap,is_published,is_featured,created_at").order("created_at", { ascending: false });
            if (!active) return;
            if (error) setNotice({ type: "error", message: `Flagship programs could not be loaded: ${error.message}` });
            else setBundles(((data ?? []) as BundleItem[]).map((bundle) => ({
                ...bundle,
                badge_label: bundle.badge_label || "Flagship Program",
                tagline: bundle.tagline || "",
                audience: bundle.audience || "undergraduate",
                duration: bundle.duration || "",
                training_mode: bundle.training_mode || "Hybrid",
                eligibility: bundle.eligibility || "",
                highlights: Array.isArray(bundle.highlights) ? bundle.highlights : [],
                roadmap: Array.isArray(bundle.roadmap) ? bundle.roadmap : [],
            })));
            setIsLoading(false);
        }
        void loadBundles();
        return () => { active = false; };
    }, [dashboardView, supabase]);

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();
        return courses.filter((course) => {
            const matchesSearch = !query || `${course.title} ${course.slug}`.toLowerCase().includes(query);
            const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
            const matchesDifficulty = difficultyFilter === "all" || course.difficulty_level === difficultyFilter;
            const matchesAudience = audienceFilter === "all" || course.audience_type === audienceFilter;
            return matchesSearch && matchesCategory && matchesDifficulty && matchesAudience;
        });
    }, [courses, search, categoryFilter, difficultyFilter, audienceFilter]);

    const publishedCount = courses.filter((course) => course.is_published).length;
    const featuredCount = courses.filter((course) => course.is_featured).length;
    const activeCategoryCount = new Set(courses.map((course) => course.category).filter(Boolean)).size;

    async function saveCourse(payload: CoursePayload, id?: string) {
        setSavingId(id ?? "new");
        setNotice(null);
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
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Course could not be saved: ${error.message}` });
            return false;
        }
        const saved = normalizeCourse(data as CourseItem);
        setCourses((current) => id
            ? current.map((course) => course.id === id ? saved : course)
            : [...current, saved].sort((first, second) => first.title.localeCompare(second.title)));
        setEditingCourse(undefined);
        setNotice({ type: "success", message: `${saved.title} ${id ? "updated" : "created"} successfully.` });
        return true;
    }

    async function saveBundle(payload: BundlePayload, id?: string) {
        setSavingId(id ?? "new-bundle");
        setNotice(null);
        const upsertPayload = { ...payload, ...(id ? { id } : {}) };
        const { data, error } = await supabase.from("course_bundles").upsert(upsertPayload as BundlePayload).select("*").single();
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Flagship program could not be saved: ${error.message}` });
            return false;
        }
        const saved = data as BundleItem;
        setBundles((current) => id
            ? current.map((bundle) => bundle.id === id ? saved : bundle)
            : [saved, ...current]);
        setEditingBundle(undefined);
        setNotice({ type: "success", message: `${saved.title} ${id ? "updated" : "created"} successfully.` });
        return true;
    }

    async function deleteBundle(bundle: BundleItem) {
        if (!window.confirm(`Delete “${bundle.title}”? This cannot be undone.`)) return;
        setSavingId(bundle.id);
        const { error } = await supabase.from("course_bundles").delete().eq("id", bundle.id);
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Flagship program could not be deleted: ${error.message}` });
            return;
        }
        setBundles((current) => current.filter((item) => item.id !== bundle.id));
        setNotice({ type: "success", message: `${bundle.title} deleted.` });
    }

    async function toggleBundle(bundle: BundleItem, field: "is_published" | "is_featured") {
        setSavingId(bundle.id);
        const nextValue = !bundle[field];
        const { error } = await supabase.from("course_bundles").update({ [field]: nextValue }).eq("id", bundle.id);
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Program status could not be changed: ${error.message}` });
            return;
        }
        setBundles((current) => current.map((item) => item.id === bundle.id ? { ...item, [field]: nextValue } : item));
    }

    async function toggleFeatured(course: CourseItem) {
        setSavingId(course.id);
        const nextValue = !course.is_featured;
        const { error } = await supabase.from("courses").update({ is_featured: nextValue }).eq("id", course.id);
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Featured status could not be changed: ${error.message}` });
            return;
        }
        setCourses((current) => current.map((item) => item.id === course.id ? { ...item, is_featured: nextValue } : item));
        setNotice({ type: "success", message: `${course.title} ${nextValue ? "featured" : "removed from featured programs"}.` });
    }

    async function togglePublished(course: CourseItem) {
        setSavingId(course.id);
        const nextValue = !course.is_published;
        const { error } = await supabase.from("courses").update({ is_published: nextValue }).eq("id", course.id);
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Visibility could not be changed: ${error.message}` });
            return;
        }
        setCourses((current) => current.map((item) => item.id === course.id ? { ...item, is_published: nextValue } : item));
        setNotice({ type: "success", message: `${course.title} ${nextValue ? "published" : "unpublished"}.` });
    }

    async function deleteCourse(course: CourseItem) {
        if (!window.confirm(`Delete “${course.title}”? This cannot be undone.`)) return;
        setSavingId(course.id);
        const { error } = await supabase.from("courses").delete().eq("id", course.id);
        setSavingId(null);
        if (error) {
            setNotice({ type: "error", message: `Course could not be deleted: ${error.message}` });
            return;
        }
        setCourses((current) => current.filter((item) => item.id !== course.id));
        setNotice({ type: "success", message: `${course.title} deleted.` });
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-brand-card sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(11,99,182,0.45),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(248,21,41,0.2),transparent_30%)]" />
                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-100">Training &amp; Courses</p>
                        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Course Management</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Manage SPRINT technology pathways, learning outcomes, and catalogue visibility.</p>
                    </div>
                    <button type="button" onClick={() => dashboardView === "courses" ? setEditingCourse(null) : setEditingBundle(null)} className="sprint-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-brand-cta transition hover:brightness-110">
                        <Plus className="size-4" aria-hidden="true" /> {dashboardView === "courses" ? "Add Course" : "Add Flagship Program"}
                    </button>
                </div>
            </section>

            <div className="inline-flex max-w-full rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="Course management views">
                <button type="button" role="tab" aria-selected={dashboardView === "courses"} onClick={() => setDashboardView("courses")} className={`sprint-focus inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${dashboardView === "courses" ? "bg-brand-navy text-white" : "text-brand-navy hover:bg-slate-50"}`}><BookOpen className="size-4" aria-hidden="true" />Standard Courses</button>
                <button type="button" role="tab" aria-selected={dashboardView === "bundles"} onClick={() => setDashboardView("bundles")} className={`sprint-focus inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${dashboardView === "bundles" ? "bg-brand-navy text-white" : "text-brand-navy hover:bg-slate-50"}`}><Layers className="size-4" aria-hidden="true" />Flagship Programs &amp; Bundles</button>
            </div>

            {notice && <div className="fixed right-4 top-24 z-[120] w-[min(36rem,calc(100vw-2rem))]"><NoticeBanner notice={notice} onDismiss={() => setNotice(null)} /></div>}

            {dashboardView === "courses" && <section aria-label="Course summary metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Courses" value={courses.length} note="Programs in the catalogue" icon={BookOpen} />
                <MetricCard label="Published on Site" value={publishedCount} note="Visible in the public catalogue" icon={Check} />
                <MetricCard label="Featured Pathways" value={featuredCount} note="Highlighted on the homepage" icon={Star} />
                <MetricCard label="Active Categories" value={activeCategoryCount} note="Categories with courses" icon={BookOpen} />
            </section>}

            {dashboardView === "courses" && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Courses">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:px-6">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-brand-text-muted sm:max-w-md">
                        <Search className="size-4 shrink-0" aria-hidden="true" />
                        <span className="sr-only">Search courses by title or slug</span>
                        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or slug" className="min-w-0 flex-1 bg-transparent text-brand-navy outline-none placeholder:text-brand-text-muted" />
                    </label>
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        <div className="grid gap-2 sm:grid-cols-3">
                            <label className="sr-only" htmlFor="course-category-filter">Filter by category</label>
                            <select id="course-category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="sprint-focus rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy">
                                <option value="all">All</option>
                                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                            </select>
                            <label className="sr-only" htmlFor="course-level-filter">Filter by level</label>
                            <select id="course-level-filter" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="sprint-focus rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy">
                                <option value="all">All</option>
                                {difficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                            </select>
                            <label className="sr-only" htmlFor="course-audience-filter">Filter by audience</label>
                            <select id="course-audience-filter" value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value)} className="sprint-focus rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy">
                                <option value="all">All</option>
                                {audiences.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
                            </select>
                        </div>
                        <div className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Catalog view">
                            <button type="button" aria-label="Card view" aria-pressed={catalogView === "grid"} onClick={() => setCatalogView("grid")} className={`sprint-focus inline-flex size-9 items-center justify-center rounded-md ${catalogView === "grid" ? "bg-white text-brand-navy shadow-sm" : "text-brand-text-muted hover:text-brand-navy"}`}><LayoutGrid className="size-4" aria-hidden="true" /></button>
                            <button type="button" aria-label="Table view" aria-pressed={catalogView === "table"} onClick={() => setCatalogView("table")} className={`sprint-focus inline-flex size-9 items-center justify-center rounded-md ${catalogView === "table" ? "bg-white text-brand-navy shadow-sm" : "text-brand-text-muted hover:text-brand-navy"}`}><List className="size-4" aria-hidden="true" /></button>
                        </div>
                    </div>
                </div>
                {catalogView === "table" && <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted">
                            <tr>
                                <th className="px-5 py-3 font-bold sm:px-6">Course</th>
                                <th className="px-4 py-3 font-bold">Category</th>
                                <th className="px-4 py-3 font-bold">Target Audience</th>
                                <th className="px-4 py-3 font-bold">Mode &amp; Level</th>
                                <th className="px-4 py-3 font-bold">Duration</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 text-center font-bold">Featured</th>
                                <th className="px-5 py-3 text-right font-bold sm:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-brand-text-muted">Loading courses…</td></tr>
                                : filteredCourses.length === 0 ? <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-brand-text-muted">{courses.length ? "No courses match these filters." : "No courses have been added yet."}</td></tr>
                                    : filteredCourses.map((course) => <CourseRow key={course.id} course={course} isBusy={savingId === course.id} onView={() => setViewingCourse(course)} onEdit={() => setEditingCourse(course)} onDelete={() => void deleteCourse(course)} onToggleFeatured={() => void toggleFeatured(course)} />)}
                        </tbody>
                    </table>
                </div>}
                {catalogView === "grid" && <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">{isLoading ? <p className="col-span-full py-12 text-center text-sm text-brand-text-muted">Loading courses…</p> : filteredCourses.length ? filteredCourses.map((course) => <AdminCourseCard key={course.id} course={course} isBusy={savingId === course.id} onEdit={() => setEditingCourse(course)} onTogglePublished={() => void togglePublished(course)} onDelete={() => void deleteCourse(course)} />) : <p className="col-span-full py-12 text-center text-sm text-brand-text-muted">{courses.length ? "No courses match these filters." : "No courses have been added yet."}</p>}</div>}
                <div className="border-t border-slate-100 px-5 py-3 text-xs text-brand-text-muted sm:px-6">Showing {filteredCourses.length} of {courses.length} courses</div>
            </section>}

            {dashboardView === "bundles" && <section aria-label="Flagship programs and bundles" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading ? <p className="col-span-full py-16 text-center text-sm text-brand-text-muted">Loading flagship programs…</p> : bundles.length ? bundles.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} isBusy={savingId === bundle.id} onEdit={() => setEditingBundle(bundle)} onDelete={() => void deleteBundle(bundle)} onToggle={(field) => void toggleBundle(bundle, field)} />) : <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Sparkles className="mx-auto size-7 text-brand-red" aria-hidden="true" /><p className="mt-3 font-display font-bold text-brand-navy">No flagship programs yet</p><p className="mt-1 text-sm text-brand-text-muted">Add SPRINT RISE or a degree-integrated pathway to begin.</p></div>}
            </section>}

            {editingCourse !== undefined && <CourseModal course={editingCourse} isSaving={savingId === (editingCourse?.id ?? "new")} onClose={() => setEditingCourse(undefined)} onSave={(payload) => saveCourse(payload, editingCourse?.id)} />}
            {editingBundle !== undefined && <BundleModal bundle={editingBundle} isSaving={savingId === (editingBundle?.id ?? "new-bundle")} onClose={() => setEditingBundle(undefined)} onSave={(payload) => saveBundle(payload, editingBundle?.id)} />}
            {viewingCourse && <CourseDetailsModal course={viewingCourse} onClose={() => setViewingCourse(null)} onEdit={() => { setViewingCourse(null); setEditingCourse(viewingCourse); }} />}
        </div>
    );
}

function MetricCard({ label, value, note, icon: Icon }: { label: string; value: ReactNode; note: string; icon: typeof BookOpen }) {
    return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-brand-text-secondary">{label}</p><p className="mt-3 font-display text-3xl font-bold text-brand-navy">{value}</p></div><span className="flex size-11 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Icon className="size-5" aria-hidden="true" /></span></div>
        <p className="mt-3 text-xs text-brand-text-muted">{note}</p>
    </article>;
}

function NoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
    const success = notice.type === "success";
    return <div role={success ? "status" : "alert"} className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-brand-red-light text-brand-red"}`}>
        <p>{notice.message}</p><button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="sprint-focus rounded p-0.5"><X className="size-4" aria-hidden="true" /></button>
    </div>;
}

function AdminCourseCard({ course, isBusy, onEdit, onTogglePublished, onDelete }: { course: CourseItem; isBusy: boolean; onEdit: () => void; onTogglePublished: () => void; onDelete: () => void }) {
    return <article className="course-tile">
        <div className="course-tile__art" style={course.thumbnail_url ? { backgroundImage: `linear-gradient(0deg, rgba(1,31,62,.22), rgba(1,31,62,.05)), url("${course.thumbnail_url}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>
            <span className="course-tile__type">{course.badge_label || "Course"}</span>
            <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${course.is_published ? "bg-emerald-50 text-emerald-700" : "bg-white/95 text-slate-600"}`}>{course.is_published ? "Published" : "Draft"}</span>
        </div>
        <div className="course-tile__body">
            <p className="course-tile__category">{course.category}</p>
            <h2>{course.title}</h2>
            <p className="course-tile__description" style={{ WebkitLineClamp: 2 }}>{course.description}</p>
            <div className="course-tile__chips">
                <span>{course.duration || "Duration not set"}</span>
                <span>{course.delivery_method}</span>
                <span>{course.difficulty_level}</span>
            </div>
            <div className="mt-3 flex min-h-7 flex-wrap gap-1.5" aria-label={`Tools taught in ${course.title}`}>
                {course.tools.length ? course.tools.map((tool) => <span key={tool} className="rounded-full bg-brand-blue-light px-2 py-1 text-[10px] font-semibold text-brand-blue">{tool}</span>) : <span className="text-xs text-brand-text-muted">No tools listed</span>}
            </div>
            <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={onEdit} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-brand-surface"><Edit3 className="size-3.5" aria-hidden="true" />Edit</button>
                <button type="button" onClick={onTogglePublished} disabled={isBusy} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:border-brand-blue hover:bg-brand-blue-light disabled:opacity-50"><Check className="size-3.5" aria-hidden="true" />Toggle Publish</button>
                <button type="button" onClick={onDelete} disabled={isBusy} aria-label={`Delete ${course.title}`} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-brand-red hover:bg-brand-red-light disabled:opacity-50"><Trash2 className="size-3.5" aria-hidden="true" />Delete</button>
            </footer>
        </div>
    </article>;
}

function CourseRow({ course, isBusy, onView, onEdit, onDelete, onToggleFeatured }: { course: CourseItem; isBusy: boolean; onView: () => void; onEdit: () => void; onDelete: () => void; onToggleFeatured: () => void }) {
    return <tr className="hover:bg-slate-50/70">
        <td className="max-w-[280px] px-5 py-4 sm:px-6"><p className="truncate font-semibold text-brand-navy">{course.title}</p><p className="mt-1 truncate text-xs text-brand-text-muted">/{course.slug}</p></td>
        <td className="px-4 py-4"><span className="inline-flex max-w-[210px] rounded-full bg-brand-blue-light px-2.5 py-1 text-[10px] font-semibold leading-4 text-brand-blue">{course.category}</span></td>
        <td className="px-4 py-4"><span className="inline-flex rounded-full bg-brand-blue-light px-2.5 py-1 text-[10px] font-semibold text-brand-blue">{audiences.find((audience) => audience.value === course.audience_type)?.label ?? "Undergraduate"}</span></td>
        <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-brand-text-secondary">{course.delivery_method} <span className="px-1 text-brand-text-muted">•</span> {course.difficulty_level}</td>
        <td className="whitespace-nowrap px-4 py-4 text-xs text-brand-text-secondary"><span className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-brand-text-muted" aria-hidden="true" />{course.duration || "–"}</span></td>
        <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${course.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{course.is_published ? "Published" : "Draft"}</span></td>
        <td className="px-4 py-4 text-center"><button type="button" onClick={onToggleFeatured} disabled={isBusy} aria-label={`${course.is_featured ? "Unfeature" : "Feature"} ${course.title}`} aria-pressed={course.is_featured} className={`sprint-focus inline-flex size-9 items-center justify-center rounded-lg transition disabled:opacity-50 ${course.is_featured ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "text-slate-400 hover:bg-slate-100 hover:text-amber-600"}`}><Star className="size-4" fill={course.is_featured ? "currentColor" : "none"} aria-hidden="true" /></button></td>
        <td className="px-5 py-4 sm:px-6"><div className="flex justify-end gap-1.5"><button type="button" onClick={onView} className={iconButtonClass} aria-label={`View ${course.title}`} title="View"><Eye className="size-4" aria-hidden="true" /></button><button type="button" onClick={onEdit} className={iconButtonClass} aria-label={`Edit ${course.title}`} title="Edit"><Edit3 className="size-4" aria-hidden="true" /></button><button type="button" onClick={onDelete} disabled={isBusy} className={`${iconButtonClass} text-brand-red hover:border-brand-red hover:bg-brand-red-light`} aria-label={`Delete ${course.title}`} title="Delete"><Trash2 className="size-4" aria-hidden="true" /></button></div></td>
    </tr>;
}

function emptyCourse(): CoursePayload {
    return {
        slug: "", title: "", category: categories[0], difficulty_level: "Beginner", audience: "undergraduate", audience_type: "undergraduate", delivery_method: "Hybrid",
        duration: "", description: "", long_description: "", badge_label: "Course", prerequisites: "",
        tools: [], curriculum: [], outcomes: [], target_roles: [], is_featured: false, is_published: false,
        pathway: null, target_role: null, certificate_included: true, thumbnail_url: null,
    };
}

function CourseModal({ course, isSaving, onClose, onSave }: { course: CourseItem | null; isSaving: boolean; onClose: () => void; onSave: (payload: CoursePayload) => Promise<boolean> }) {
    const [form, setForm] = useState<CoursePayload>(() => course ? {
        ...course,
        audience: course.audience_type || course.audience || "undergraduate",
        audience_type: course.audience_type || course.audience || "undergraduate",
        curriculum: course.curriculum.map((module) => ({ ...module })),
        tools: [...course.tools], outcomes: [...course.outcomes], target_roles: [...course.target_roles],
    } : emptyCourse());
    const [slugEdited, setSlugEdited] = useState(Boolean(course));
    const [toolInput, setToolInput] = useState("");
    const [outcomeInput, setOutcomeInput] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const closeRef = useRef<HTMLButtonElement>(null);
    const categoryOptions = form.category && !categories.includes(form.category) ? [form.category, ...categories] : categories;

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape" && !isSaving) onClose(); }
        document.addEventListener("keydown", onKeyDown);
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
    }, [isSaving, onClose]);

    function setField<Key extends keyof CoursePayload>(key: Key, value: CoursePayload[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function addTool() {
        const value = toolInput.trim();
        if (!value || form.tools.some((tool) => tool.toLowerCase() === value.toLowerCase())) return;
        setField("tools", [...form.tools, value]);
        setToolInput("");
    }

    function addCourseTag(field: "outcomes" | "target_roles", value: string, clear: (value: string) => void) {
        const tag = value.trim();
        if (!tag || form[field].some((item) => item.toLowerCase() === tag.toLowerCase())) return;
        setField(field, [...form[field], tag]);
        clear("");
    }

    function updateModule(index: number, patch: Partial<SyllabusModule>) {
        setField("curriculum", form.curriculum.map((module, moduleIndex) => moduleIndex === index ? { ...module, ...patch } : module));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSave(form);
    }

    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="course-modal-title" className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">Training &amp; Courses</p><h2 id="course-modal-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{course ? "Edit Course" : "Add Course"}</h2></div><button ref={closeRef} type="button" onClick={onClose} disabled={isSaving} className={iconButtonClass} aria-label="Close course form"><X className="size-4" aria-hidden="true" /></button></header>
            <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-7">
                    <FormSection title="Basic Info">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className={`${labelClass} sm:col-span-2`}>Title<input required value={form.title} onChange={(event) => { const title = event.target.value; setField("title", title); if (!slugEdited) setField("slug", generateSlug(title)); }} className={inputClass} placeholder="e.g. Docker & Kubernetes" /></label>
                            <label className={labelClass}>Slug<div className="flex gap-2"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => { setSlugEdited(true); setField("slug", generateSlug(event.target.value)); }} className={`${inputClass} mt-1.5`} placeholder="docker-and-kubernetes" /><button type="button" onClick={() => { setSlugEdited(false); setField("slug", generateSlug(form.title)); }} className="sprint-focus mt-1.5 shrink-0 rounded-lg border border-slate-200 px-3 text-xs font-bold text-brand-navy hover:bg-brand-surface">Reset</button></div></label>
                            <label className={labelClass}>Category<select value={form.category} onChange={(event) => setField("category", event.target.value)} className={inputClass}>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                            <label className={labelClass}>Audience Type<select value={form.audience_type} onChange={(event) => { const audience = event.target.value as CoursePayload["audience_type"]; setField("audience", audience); setField("audience_type", audience); }} className={inputClass}>{audiences.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}</select></label>
                            <label className={labelClass}>Badge Label<input value={form.badge_label} onChange={(event) => setField("badge_label", event.target.value)} className={inputClass} placeholder="Course" /></label>
                        </div>
                    </FormSection>
                    <FormSection title="Delivery & Specs">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <label className={labelClass}>Delivery Method<select value={form.delivery_method} onChange={(event) => setField("delivery_method", event.target.value as CoursePayload["delivery_method"])} className={inputClass}>{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></label>
                            <label className={labelClass}>Difficulty Level<select value={form.difficulty_level} onChange={(event) => setField("difficulty_level", event.target.value)} className={inputClass}>{difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label>
                            <label className={labelClass}>Duration<input required value={form.duration} onChange={(event) => setField("duration", event.target.value)} className={inputClass} placeholder="e.g. 12 weeks" /></label>
                        </div>
                    </FormSection>
                    <FormSection title="Short Description">
                        <label className={labelClass}>Catalogue Card Description<textarea required rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} className={inputClass} placeholder="A concise overview for course cards" /></label>
                    </FormSection>
                    <FormSection title="Detailed Description & Overview">
                        <label className={labelClass}>Detailed Description<textarea rows={6} value={form.long_description || ""} onChange={(event) => setField("long_description", event.target.value)} className={inputClass} placeholder="Describe the course experience, scope, and practical context" /></label>
                    </FormSection>
                    <FormSection title="Curriculum & Syllabus">
                        <div className="space-y-3">{form.curriculum.map((module, index) => <div key={`module-${index}`} className="rounded-lg border border-slate-200 p-3">
                            <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
                                <label className={labelClass}>Module Title<input value={module.title} onChange={(event) => updateModule(index, { title: event.target.value })} className={inputClass} /></label>
                                <label className={labelClass}>Sessions<input type="number" min="0" value={module.sessions} onChange={(event) => updateModule(index, { sessions: Number(event.target.value) })} className={inputClass} /></label>
                                <button type="button" onClick={() => setField("curriculum", form.curriculum.filter((_, moduleIndex) => moduleIndex !== index))} className="sprint-focus mt-5 inline-flex h-10 items-center justify-center gap-1 rounded-lg px-3 text-xs font-bold text-brand-red hover:bg-brand-red-light"><Trash2 className="size-4" aria-hidden="true" />Remove</button>
                            </div>
                            <label className={labelClass}>Topics<input value={(module.topics || []).join(", ")} onChange={(event) => updateModule(index, { topics: event.target.value.split(",").map((topic) => topic.trim()).filter(Boolean) })} className={inputClass} placeholder="Foundations, guided labs, project work" /></label>
                        </div>)}
                            <button type="button" onClick={() => setField("curriculum", [...form.curriculum, { title: "", sessions: 0, topics: [] }])} className="sprint-focus inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-brand-navy hover:bg-slate-50"><Plus className="size-4" aria-hidden="true" />Add Module</button>
                        </div>
                    </FormSection>
                    <FormSection title="Prerequisites"><label className={labelClass}>Prerequisites<input value={form.prerequisites || ""} onChange={(event) => setField("prerequisites", event.target.value)} className={inputClass} placeholder="Basic Python knowledge or programming foundations" /></label></FormSection>
                    <TagSection title="Learning Outcomes" tags={form.outcomes} value={outcomeInput} onChange={setOutcomeInput} onAdd={() => addCourseTag("outcomes", outcomeInput, setOutcomeInput)} onRemove={(tag) => setField("outcomes", form.outcomes.filter((item) => item !== tag))} placeholder="Build and evaluate practical models…" />
                    <TagSection title="Target Job Roles" tags={form.target_roles} value={roleInput} onChange={setRoleInput} onAdd={() => addCourseTag("target_roles", roleInput, setRoleInput)} onRemove={(tag) => setField("target_roles", form.target_roles.filter((item) => item !== tag))} placeholder="ML Engineer, Data Scientist…" />
                    <TagSection title="Tools Taught" tags={form.tools} value={toolInput} onChange={setToolInput} onAdd={addTool} onRemove={(tag) => setField("tools", form.tools.filter((item) => item !== tag))} placeholder="Docker, Kubernetes, PyTorch…" />
                    <FormSection title="Program Status">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                            <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-brand-navy"><input type="checkbox" checked={form.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="size-4 accent-brand-red" />Visible on Website</label>
                            <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-brand-navy"><input type="checkbox" checked={form.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} className="size-4 accent-brand-red" />Homepage Featured</label>
                        </div>
                    </FormSection>
                </div>
                <footer className="flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                    <button type="button" onClick={onClose} disabled={isSaving} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-brand-surface">Cancel</button>
                    <button type="submit" disabled={isSaving} className="sprint-focus inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-70">{isSaving && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}{isSaving ? "Saving…" : "Save Course"}</button>
                </footer>
            </form>
        </section>
    </div>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
    return <section className="space-y-3"><h3 className="border-b border-slate-100 pb-2 font-display text-sm font-bold text-brand-navy">{title}</h3>{children}</section>;
}

function TagSection({ title, tags, value, onChange, onAdd, onRemove, placeholder }: { title: string; tags: string[]; value: string; onChange: (value: string) => void; onAdd: () => void; onRemove: (tag: string) => void; placeholder: string }) {
    return <FormSection title={title}>
        <div className="flex gap-2"><input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onAdd(); } }} className={`${inputClass} mt-0`} placeholder={placeholder} /><button type="button" onClick={onAdd} className="sprint-focus shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-bold text-brand-navy hover:bg-brand-surface">Add</button></div>
        <div className="flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-surface py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-navy">{tag}<button type="button" onClick={() => onRemove(tag)} aria-label={`Remove ${tag}`} className="sprint-focus rounded-full p-1 text-brand-text-muted hover:bg-white hover:text-brand-red"><X className="size-3" aria-hidden="true" /></button></span>)}</div>
    </FormSection>;
}

function CourseDetailsModal({ course, onClose, onEdit }: { course: CourseItem; onClose: () => void; onEdit: () => void }) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
        document.addEventListener("keydown", onKeyDown);
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
    }, [onClose]);
    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="course-details-title" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7"><div><p className="text-xs font-semibold text-brand-red">{course.category}</p><h2 id="course-details-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{course.title}</h2><p className="mt-1 text-xs text-brand-text-muted">/{course.slug}</p></div><button type="button" onClick={onClose} aria-label="Close course details" className={iconButtonClass}><X className="size-4" aria-hidden="true" /></button></header>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
                <div className="grid gap-3 sm:grid-cols-3"><DetailValue label="Difficulty Level" value={course.difficulty_level} /><DetailValue label="Delivery Method" value={course.delivery_method} /><DetailValue label="Duration" value={course.duration || "Not specified"} /><DetailValue label="Target Audience" value={audiences.find((item) => item.value === course.audience_type)?.label ?? "Undergraduate"} /><DetailValue label="Status" value={course.is_published ? "Published" : "Draft"} /></div>
                <DetailSection title="Short Description"><p className="text-sm leading-6 text-brand-text-secondary">{course.description || "No short description provided."}</p></DetailSection>
                <DetailSection title="Detailed Description"><p className="whitespace-pre-wrap text-sm leading-6 text-brand-text-secondary">{course.long_description || "No detailed description provided."}</p></DetailSection>
                <DetailSection title="Prerequisites"><p className="whitespace-pre-wrap text-sm leading-6 text-brand-text-secondary">{course.prerequisites || "No formal prerequisites"}</p></DetailSection>
                <DetailSection title="Target Job Roles"><TagList items={course.target_roles} empty="No target roles listed." /></DetailSection>
                <DetailSection title="Curriculum">
                    {course.curriculum.length ? <ol className="space-y-2">{course.curriculum.map((module, index) => <li key={`${module.title}-${index}`} className="rounded-lg border border-slate-200 p-3"><div className="flex justify-between gap-3"><p className="text-sm font-semibold text-brand-navy">{index + 1}. {module.title}</p><span className="whitespace-nowrap text-xs text-brand-text-muted">{module.sessions} sessions</span></div>{module.topics?.length ? <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-brand-text-secondary">{module.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}</li>)}</ol> : <p className="text-sm text-brand-text-muted">No modules added.</p>}
                </DetailSection>
                <DetailSection title="Tools Taught"><TagList items={course.tools} empty="No tools listed." /></DetailSection>
                <DetailSection title="Learning Outcomes"><TagList items={course.outcomes} empty="No learning outcomes listed." /></DetailSection>
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 sm:px-7"><button type="button" onClick={onClose} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-brand-surface">Close</button><button type="button" onClick={onEdit} className="sprint-focus inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"><Edit3 className="size-4" aria-hidden="true" /> Edit Course</button></footer>
        </section>
    </div>;
}

function DetailValue({ label, value }: { label: string; value: ReactNode }) {
    return <div className="rounded-lg border border-slate-200 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-brand-text-muted">{label}</p><p className="mt-1 text-sm font-semibold text-brand-navy">{value}</p></div>;
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return <section><h3 className="mb-2 font-display text-sm font-bold text-brand-navy">{title}</h3>{children}</section>;
}

function TagList({ items, empty }: { items: string[]; empty: string }) {
    return items.length ? <ul className="flex flex-wrap gap-2">{items.map((item) => <li key={item} className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-navy">{item}</li>)}</ul> : <p className="text-sm text-brand-text-muted">{empty}</p>;
}

function emptyBundle(): BundlePayload {
    return { slug: "", title: "", badge_label: "Flagship Program", tagline: "", description: "", long_description: "", audience: "undergraduate", duration: "", training_mode: "Hybrid", eligibility: "", highlights: [], roadmap: [], is_published: false, is_featured: false };
}

function BundleCard({ bundle, isBusy, onEdit, onDelete, onToggle }: { bundle: BundleItem; isBusy: boolean; onEdit: () => void; onDelete: () => void; onToggle: (field: "is_published" | "is_featured") => void }) {
    return <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-t-4 border-brand-red p-5">
            <div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 px-2.5 py-1 text-[10px] font-bold text-brand-red"><Tag className="size-3" aria-hidden="true" />{bundle.badge_label}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${bundle.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{bundle.is_published ? "Published" : "Draft"}</span></div>
            <h2 className="mt-4 font-display text-xl font-bold text-brand-navy">{bundle.title}</h2>
            <p className="mt-1 text-sm font-semibold text-brand-red">{bundle.tagline || "Tagline not set"}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-text-secondary">{bundle.description || "No short description provided."}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-text-secondary"><span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{bundle.duration || "Duration not set"}</span><span>{bundle.training_mode}</span></div>
            <div className="mt-4"><p className="text-[10px] font-bold uppercase text-brand-text-muted">Highlights</p><ul className="mt-2 space-y-1 text-xs text-brand-text-secondary">{bundle.highlights.slice(0, 3).map((highlight) => <li key={highlight} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-red" aria-hidden="true" />{highlight}</li>)}{bundle.highlights.length === 0 && <li>No highlights added.</li>}</ul></div>
            <footer className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={onEdit} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-50"><Edit3 className="size-3.5" aria-hidden="true" />Edit</button>
                <button type="button" disabled={isBusy} onClick={() => onToggle("is_published")} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-50"><Check className="size-3.5" aria-hidden="true" />{bundle.is_published ? "Unpublish" : "Publish"}</button>
                <button type="button" disabled={isBusy} onClick={() => onToggle("is_featured")} className="sprint-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-50"><Star className="size-3.5" aria-hidden="true" />{bundle.is_featured ? "Unfeature" : "Feature"}</button>
                <button type="button" disabled={isBusy} onClick={onDelete} className="sprint-focus ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-brand-red hover:bg-brand-red-light"><Trash2 className="size-3.5" aria-hidden="true" />Delete</button>
            </footer>
        </div>
    </article>;
}

function BundleModal({ bundle, isSaving, onClose, onSave }: { bundle: BundleItem | null; isSaving: boolean; onClose: () => void; onSave: (payload: BundlePayload) => Promise<boolean> }) {
    const [form, setForm] = useState<BundlePayload>(() => bundle ? { ...emptyBundle(), ...bundle, highlights: [...(bundle.highlights || [])], roadmap: (bundle.roadmap || []).map((stage) => ({ ...stage, subjects: [...(stage.subjects || [])] })) } : emptyBundle());
    const [slugEdited, setSlugEdited] = useState(Boolean(bundle));
    const [highlightInput, setHighlightInput] = useState("");
    const closeRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape" && !isSaving) onClose(); }
        document.addEventListener("keydown", onKeyDown);
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
    }, [isSaving, onClose]);
    function setField<Key extends keyof BundlePayload>(key: Key, value: BundlePayload[Key]) { setForm((current) => ({ ...current, [key]: value })); }
    function addHighlight() {
        const value = highlightInput.trim();
        if (!value || form.highlights.some((item) => item.toLowerCase() === value.toLowerCase())) return;
        setField("highlights", [...form.highlights, value]);
        setHighlightInput("");
    }
    function updateStage(index: number, patch: Partial<RoadmapStage>) { setField("roadmap", form.roadmap.map((stage, stageIndex) => stageIndex === index ? { ...stage, ...patch } : stage)); }
    async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await onSave(form); }
    return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="bundle-modal-title" className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red">Flagship Programs &amp; Bundles</p><h2 id="bundle-modal-title" className="mt-1 font-display text-xl font-bold text-brand-navy">{bundle ? "Edit Flagship Program" : "Add Flagship Program"}</h2></div><button ref={closeRef} type="button" onClick={onClose} disabled={isSaving} className={iconButtonClass} aria-label="Close flagship program form"><X className="size-4" aria-hidden="true" /></button></header>
            <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-7">
                    <FormSection title="Basic Information"><div className="grid gap-4 sm:grid-cols-2">
                        <label className={`${labelClass} sm:col-span-2`}>Title<input required value={form.title} onChange={(event) => { const title = event.target.value; setField("title", title); if (!slugEdited) setField("slug", generateSlug(title)); }} className={inputClass} placeholder="SPRINT RISE" /></label>
                        <label className={labelClass}>Slug<div className="flex gap-2"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => { setSlugEdited(true); setField("slug", generateSlug(event.target.value)); }} className={`${inputClass} mt-1.5`} /><button type="button" onClick={() => { setSlugEdited(false); setField("slug", generateSlug(form.title)); }} className="sprint-focus mt-1.5 shrink-0 rounded-lg border border-slate-200 px-3 text-xs font-bold text-brand-navy hover:bg-slate-50">Reset</button></div></label>
                        <label className={labelClass}>Badge Label<input value={form.badge_label} onChange={(event) => setField("badge_label", event.target.value)} className={inputClass} placeholder="Flagship Program" /></label>
                        <label className={`${labelClass} sm:col-span-2`}>Tagline<input value={form.tagline} onChange={(event) => setField("tagline", event.target.value)} className={inputClass} placeholder="Campus to Corporate in 6 Months" /></label>
                        <label className={labelClass}>Target Audience<select value={form.audience} onChange={(event) => setField("audience", event.target.value as BundlePayload["audience"])} className={inputClass}>{audiences.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}</select></label>
                        <label className={labelClass}>Duration<input value={form.duration} onChange={(event) => setField("duration", event.target.value)} className={inputClass} placeholder="6 Months Intensive" /></label>
                        <label className={labelClass}>Training Mode<select value={form.training_mode} onChange={(event) => setField("training_mode", event.target.value as BundlePayload["training_mode"])} className={inputClass}>{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></label>
                        <label className={`${labelClass} sm:col-span-2`}>Short Description<textarea rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} className={inputClass} /></label>
                        <label className={`${labelClass} sm:col-span-2`}>Detailed Description<textarea rows={6} value={form.long_description || ""} onChange={(event) => setField("long_description", event.target.value)} className={inputClass} placeholder="Full roadmap vision" /></label>
                        <label className={`${labelClass} sm:col-span-2`}>Eligibility<textarea rows={3} value={form.eligibility} onChange={(event) => setField("eligibility", event.target.value)} className={inputClass} /></label>
                    </div></FormSection>
                    <TagSection title="Program Highlights" tags={form.highlights} value={highlightInput} onChange={setHighlightInput} onAdd={addHighlight} onRemove={(tag) => setField("highlights", form.highlights.filter((item) => item !== tag))} placeholder="Industry mentorship, internship, applied projects" />
                    <FormSection title="Multi-Semester Roadmap"><div className="space-y-3">{form.roadmap.map((stage, index) => <div key={`stage-${index}`} className="rounded-lg border border-slate-200 p-3"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Stage / Semester<input value={stage.title} onChange={(event) => updateStage(index, { title: event.target.value })} className={inputClass} placeholder="Semester 1" /></label><label className={labelClass}>Duration<input value={stage.duration} onChange={(event) => updateStage(index, { duration: event.target.value })} className={inputClass} placeholder="6 months" /></label></div><label className={labelClass}>Subjects<input value={stage.subjects.join(", ")} onChange={(event) => updateStage(index, { subjects: event.target.value.split(",").map((subject) => subject.trim()).filter(Boolean) })} className={inputClass} placeholder="Foundations, AI, Cloud" /></label><button type="button" onClick={() => setField("roadmap", form.roadmap.filter((_, stageIndex) => stageIndex !== index))} className="sprint-focus mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand-red hover:bg-brand-red-light"><Trash2 className="size-3.5" aria-hidden="true" />Remove Stage</button></div>)}<button type="button" onClick={() => setField("roadmap", [...form.roadmap, { title: "", duration: "", subjects: [] }])} className="sprint-focus inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-brand-navy hover:bg-slate-50"><Plus className="size-4" aria-hidden="true" />Add Stage / Semester</button></div></FormSection>
                    <FormSection title="Program Status"><div className="flex flex-col gap-3 sm:flex-row sm:gap-8"><label className="inline-flex items-center gap-2.5 text-sm font-semibold text-brand-navy"><input type="checkbox" checked={form.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="size-4 accent-brand-red" />Visible on Website</label><label className="inline-flex items-center gap-2.5 text-sm font-semibold text-brand-navy"><input type="checkbox" checked={form.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} className="size-4 accent-brand-red" />Highlight as Featured</label></div></FormSection>
                </div>
                <footer className="flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-7"><button type="button" onClick={onClose} disabled={isSaving} className="sprint-focus rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-slate-50">Cancel</button><button type="submit" disabled={isSaving} className="sprint-focus inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-70">{isSaving ? "Saving…" : "Save Program"}</button></footer>
            </form>
        </section>
    </div>;
}