import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import {
  courses,
  createDefaultProgramStages,
  getCourse,
} from "@/data/courses";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import siteConfig from "@/config/site.config.json";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return courses.map(({ slug }) => ({ slug })); }

async function findCourse(slug) {
  const supabase = createPublicServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("courses")
      .select("id,slug,title,category,description,difficulty_level,duration,delivery_method,pathway,prerequisites,tools,outcomes,target_roles,target_role,thumbnail_url,audience,audience_type,badge_label,certificate_included,is_published")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      if (!data.is_published) return null;
      const audience = data.audience_type || data.audience || "undergraduate";
      const cleanImage = typeof data.thumbnail_url === "string" ? data.thumbnail_url.trim() : null;
      return {
        kind: "course",
        id: data.id,
        slug: data.slug,
        title: data.title,
        category: data.category,
        description: data.description || "",
        badgeLabel: data.badge_label || "Course",
        level: data.difficulty_level || "",
        duration: data.duration || "",
        delivery: data.delivery_method || "",
        pathway: data.pathway || data.category || "",
        prerequisites: data.prerequisites || "No formal prerequisites",
        tools: Array.isArray(data.tools) ? data.tools : [],
        outcomes: Array.isArray(data.outcomes) ? data.outcomes : [],
        targetRoles: Array.isArray(data.target_roles) ? data.target_roles : data.target_role ? [data.target_role] : [],
        programStages:
          getCourse(slug)?.programStages ??
          createDefaultProgramStages({
            title: data.title,
            tools: Array.isArray(data.tools) ? data.tools : [],
            description: data.description || "",
            duration: data.duration || "",
          }),
        image: cleanImage || "/images/courses/abstract-code.svg",
        thumbnail_url: cleanImage || null,
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
    level: fallback.level,
    duration: fallback.duration,
    delivery: fallback.delivery,
    pathway: fallback.pathway,
    prerequisites: fallback.prerequisites,
    tools: fallback.tools,
    outcomes: fallback.outcomes,
    targetRoles: fallback.role ? [fallback.role] : [],
    programStages:
      fallback.programStages ??
      createDefaultProgramStages({
        title: fallback.title,
        tools: fallback.tools,
        description: fallback.description,
        duration: fallback.duration,
      }),
    image: fallback.image,
    certificate: fallback.certificate,
  };
}

/* Helper to build Course JSON-LD */
function buildCourseJsonLd(item) {
  const imageUrl = item.image?.startsWith("http")
    ? item.image
    : item.image?.startsWith("/")
      ? `${siteConfig.url}${item.image}`
      : `${siteConfig.url}/images/courses/abstract-code.svg`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: item.title,
    description: item.description,
    provider: {
      "@type": "EducationalOrganization",
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
    category: item.category,
    educationalLevel: item.level || "Beginner",
    timeRequired: item.duration ? `PT${item.duration.replace(/\s+/g, "").toUpperCase()}` : undefined,
    teaches: item.outcomes,
    coursePrerequisites: item.prerequisites,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: item.delivery || "Hybrid",
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Hazaribagh",
          addressRegion: "Jharkhand",
          addressCountry: "IN",
        },
      },
    },
    image: imageUrl,
    url: `${siteConfig.url}/courses/${item.slug}`,
  };
}

/* Helper to safely serialize JSON-LD for dangerouslySetInnerHTML */
function ldJson(obj) {
  return {
    __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await findCourse(slug);
  if (!item) return { title: "Course Not Found", robots: { index: false } };

  const imageUrl = item.image?.startsWith("http")
    ? item.image
    : item.image?.startsWith("/")
      ? `${siteConfig.url}${item.image}`
      : `${siteConfig.url}/images/courses/abstract-code.svg`;

  return {
    title: item.title,
    description: item.description.slice(0, 155),
    alternates: { canonical: `/courses/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description.slice(0, 155),
      url: `/courses/${item.slug}`,
      type: "website",
      siteName: "SPRINT Institutional Training Hub",
      locale: "en_IN",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description.slice(0, 155),
      images: [imageUrl],
    },
  };
}

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const item = await findCourse(slug);
  if (!item) notFound();

  return (
    <>
      {/* Structured data: Course schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldJson(buildCourseJsonLd(item))}
      />
      <DetailPage item={item} />
    </>
  );
}
