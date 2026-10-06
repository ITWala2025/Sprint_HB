import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { bundles, getBundle } from "@/data/courses";
import { getProgram } from "@/data/programs";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return [...bundles, ...getStaticPrograms()].map(({ slug }) => ({ slug })); }

function getStaticPrograms() {
  return ["sprint-rise", "sprint-3-year-program"].map((slug) => getProgram(slug)).filter(Boolean);
}

function toFlagshipItem(bundle) {
  return {
    kind: "flagship",
    slug: bundle.slug,
    title: bundle.title,
    badgeLabel: bundle.badge_label || bundle.badgeLabel || bundle.category || "Flagship Program",
    tagline: bundle.tagline || bundle.headline || "",
    description: bundle.description || "",
    longDescription: bundle.long_description || bundle.longDescription || bundle.description || "",
    duration: bundle.duration || "",
    trainingMode: bundle.training_mode || bundle.delivery || "",
    eligibility: bundle.eligibility || "",
    audienceLabel: bundle.audience === "working_professional" ? "Working Professional" : "Undergraduate",
    highlights: Array.isArray(bundle.highlights) ? bundle.highlights : Array.isArray(bundle.outcomes) ? bundle.outcomes : [],
    roadmap: Array.isArray(bundle.roadmap) ? bundle.roadmap : [],
    curriculum: Array.isArray(bundle.roadmap)
      ? bundle.roadmap.map((stage) => ({ title: stage.title, label: stage.duration, topics: stage.subjects || [] }))
      : Array.isArray(bundle.curriculum)
        ? bundle.curriculum.map((stage) => ({ ...stage, topics: stage.topics || [] }))
        : [],
    image: bundle.image_url || bundle.image || "/images/courses/abstract-code.svg",
  };
}

async function findBundle(slug) {
  const supabase = createPublicServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("course_bundles")
      .select("slug,title,badge_label,tagline,description,long_description,audience,duration,training_mode,eligibility,highlights,roadmap,image_url,is_published")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return data.is_published ? toFlagshipItem(data) : null;
  }

  const fallback = getBundle(slug) || getProgram(slug);
  return fallback ? toFlagshipItem(fallback) : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await findBundle(slug);
  return item ? { title: item.title, description: item.description, alternates: { canonical: `/bundles/${item.slug}` } } : {};
}
export default async function BundlePage({ params }) {
  const { slug } = await params;
  const item = await findBundle(slug);
  if (!item) notFound();
  return <DetailPage item={item} />;
}
