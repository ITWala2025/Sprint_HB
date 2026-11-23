import { notFound } from "next/navigation";
import BundleDetailPage from "@/components/courses/BundleDetailPage";
import DetailPage from "@/components/courses/DetailPage";
import { bundles, getBundle, getCourse } from "@/data/courses";
import { getProgram } from "@/data/programs";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { normalizeBundle } from "@/lib/course-utils";
import siteConfig from "@/config/site.config.json";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return [...bundles, ...getStaticPrograms()].map(({ slug }) => ({ slug })); }

function getStaticPrograms() {
  return ["sprint-rise", "sprint-3-year-program"].map((slug) => getProgram(slug)).filter(Boolean);
}

function toFlagshipItem(bundle) {
  const normalized = normalizeBundle(bundle);
  return {
    kind: "flagship",
    id: bundle.id,
    slug: normalized.slug,
    title: normalized.title,
    badgeLabel: normalized.badge_label || bundle.category || "Flagship Program",
    tagline: normalized.tagline,
    description: normalized.description,
    longDescription: normalized.long_description || normalized.description,
    duration: normalized.duration,
    trainingMode: normalized.delivery_method,
    eligibility: normalized.designed_for,
    audienceLabel: normalized.audience === "working_professional" ? "Working Professional" : "Undergraduate",
    highlights: normalized.highlights,
    roadmap: normalized.roadmap,
    curriculum: normalized.roadmap.length
      ? normalized.roadmap.map((stage) => ({ title: stage.title, label: stage.hours, topics: stage.topics }))
      : Array.isArray(bundle.curriculum)
        ? bundle.curriculum.map((stage) => ({ ...stage, topics: stage.topics || [] }))
        : [],
    image: normalized.image_url || bundle.image || "/images/courses/abstract-code.svg",
  };
}

async function findBundle(slug) {
  const supabase = createPublicServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("course_bundles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) console.error(`[SPRINT Programs] Could not load "${slug}" from Supabase:`, error.message);
    if (data) return data.is_published ? toFlagshipItem(data) : null;
  }

  const localBundle = getBundle(slug);
  if (localBundle) return localBundle;
  const fallback = getProgram(slug);
  return fallback ? toFlagshipItem(fallback) : null;
}

/* Helper to build Course JSON-LD for bundles (using Course type for the bundle as a whole) */
function buildBundleJsonLd(item) {
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
    category: item.category || "Career Package",
    educationalLevel: item.level || "Curated pathway",
    timeRequired: item.duration ? `PT${item.duration.replace(/\s+/g, "").toUpperCase()}` : undefined,
    teaches: item.outcomes || item.highlights || [],
    coursePrerequisites: item.prerequisites,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: item.trainingMode || item.delivery || "Hybrid",
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
    url: `${siteConfig.url}/bundles/${item.slug}`,
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
  const item = await findBundle(slug);
  if (!item) return { title: "Program Not Found", robots: { index: false } };

  const imageUrl = item.image?.startsWith("http")
    ? item.image
    : item.image?.startsWith("/")
      ? `${siteConfig.url}${item.image}`
      : `${siteConfig.url}/images/courses/abstract-code.svg`;

  return {
    title: item.title,
    description: item.description.slice(0, 155),
    alternates: { canonical: `/bundles/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description.slice(0, 155),
      url: `/bundles/${item.slug}`,
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

export default async function BundlePage({ params }) {
  const { slug } = await params;
  const item = await findBundle(slug);
  if (!item) notFound();

  return (
    <>
      {/* Structured data: Course schema for bundle */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldJson(buildBundleJsonLd(item))}
      />
      {item.kind === "bundle" ? (
        (() => {
          const includedCourses = item.courses.map((courseSlug) => {
            const course = getCourse(courseSlug);
            if (!course) {
              throw new Error(
                `Bundle "${item.slug}" references unknown course "${courseSlug}".`,
              );
            }
            return course;
          });

          return <BundleDetailPage item={item} includedCourses={includedCourses} />;
        })()
      ) : (
        <DetailPage item={item} />
      )}
    </>
  );
}
