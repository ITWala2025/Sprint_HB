import { notFound } from "next/navigation";
import BundleDetailPage from "@/components/courses/BundleDetailPage";
import DetailPage from "@/components/courses/DetailPage";
import { bundles, getBundle, getCourse } from "@/data/courses";
import { getProgram } from "@/data/programs";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { normalizeBundle } from "@/lib/course-utils";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return [...bundles, ...getStaticPrograms()].map(({ slug }) => ({ slug })); }

function getStaticPrograms() {
  return ["sprint-rise", "sprint-3-year-program"].map((slug) => getProgram(slug)).filter(Boolean);
}

function toFlagshipItem(bundle) {
  const normalized = normalizeBundle(bundle);
  return {
    kind: "flagship",
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await findBundle(slug);
  return item
    ? {
        title: item.title,
        description: item.description,
        alternates: { canonical: `/bundles/${item.slug}` },
      }
    : {};
}
export default async function BundlePage({ params }) {
  const { slug } = await params;
  const item = await findBundle(slug);
  if (!item) notFound();
  if (item.kind === "bundle") {
    const includedCourses = item.courses.map((courseSlug) => {
      const course = getCourse(courseSlug);
      if (!course) {
        throw new Error(
          `Bundle "${item.slug}" references unknown course "${courseSlug}".`,
        );
      }
      return course;
    });

    return (
      <BundleDetailPage item={item} includedCourses={includedCourses} />
    );
  }
  return <DetailPage item={item} />;
}
