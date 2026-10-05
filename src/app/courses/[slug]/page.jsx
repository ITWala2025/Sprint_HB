import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { courses, getCourse } from "@/data/courses";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return courses.map(({ slug }) => ({ slug })); }

async function findCourse(slug) {
  const supabase = createPublicServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("courses")
      .select("slug,title,category,description,long_description,difficulty_level,duration,delivery_method,pathway,prerequisites,tools,outcomes,target_roles,target_role,curriculum,thumbnail_url,audience,audience_type,badge_label,certificate_included,is_published")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      if (!data.is_published) return null;
      const audience = data.audience_type || data.audience || "undergraduate";
      return {
        kind: "course",
        slug: data.slug,
        title: data.title,
        category: data.category,
        description: data.description || "",
        badgeLabel: data.badge_label || "Course",
        longDescription: data.long_description || data.description,
        level: data.difficulty_level || "",
        duration: data.duration || "",
        delivery: data.delivery_method || "",
        pathway: data.pathway || data.category || "",
        prerequisites: data.prerequisites || "No formal prerequisites",
        tools: Array.isArray(data.tools) ? data.tools : [],
        outcomes: Array.isArray(data.outcomes) ? data.outcomes : [],
        targetRoles: Array.isArray(data.target_roles) ? data.target_roles : data.target_role ? [data.target_role] : [],
        curriculum: Array.isArray(data.curriculum) ? data.curriculum : [],
        image: data.thumbnail_url || "/images/courses/abstract-code.svg",
        audience,
        certificate: Boolean(data.certificate_included),
      };
    }
  }

  const fallback = getCourse(slug);
  if (!fallback) return null;
  return {
    kind: "course",
    slug: fallback.slug,
    title: fallback.title,
    category: fallback.category,
    description: fallback.description,
    badgeLabel: "Course",
    longDescription: fallback.longDescription,
    level: fallback.level,
    duration: fallback.duration,
    delivery: fallback.delivery,
    pathway: fallback.pathway,
    prerequisites: fallback.prerequisites,
    tools: fallback.tools,
    outcomes: fallback.outcomes,
    targetRoles: fallback.role ? [fallback.role] : [],
    curriculum: fallback.curriculum,
    image: fallback.image,
    certificate: fallback.certificate,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await findCourse(slug);
  return item ? { title: item.title, description: item.description, alternates: { canonical: `/courses/${item.slug}` } } : {};
}
export default async function CoursePage({ params, searchParams }) {
  const { slug } = await params;
  const item = await findCourse(slug);
  if (!item) notFound();
  return <DetailPage item={item} searchParams={searchParams} />;
}
