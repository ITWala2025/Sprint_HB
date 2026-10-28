import "server-only";
import { getProgram } from "@/data/programs";
import { createPublicServerClient } from "@/lib/supabase/public-server";

function toProgramDetailItem(row) {
  const roadmap = Array.isArray(row.roadmap) ? row.roadmap : [];
  return {
    kind: "program",
    slug: row.slug,
    title: row.title,
    badgeLabel: row.badge_label || "Signature Program",
    tagline: row.tagline || "",
    headline: row.tagline || "",
    description: row.description || "",
    duration: row.duration || "",
    level: row.level || "",
    delivery: row.delivery_method || row.training_mode || "",
    certification: row.credential || "",
    audience: row.designed_for || row.eligibility || "",
    curriculumAnchor: `${row.slug}-curriculum`,
    image: row.image_url || "/images/courses/abstract-code.svg",
    curriculum: roadmap.map((stage) => ({
      title: stage.title || "",
      label: stage.hours || stage.duration || stage.stage || "Program Stage",
      topics: Array.isArray(stage.topics)
        ? stage.topics
        : Array.isArray(stage.subjects) ? stage.subjects : [],
    })),
  };
}

export async function findProgramBySlug(slug) {
  const supabase = createPublicServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("course_bundles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) console.error(`[SPRINT Programs] Could not load "${slug}" from Supabase:`, error.message);
    if (data) {
      if (!data.is_published || data.program_type !== "signature") return null;
      return toProgramDetailItem(data);
    }
  }

  const fallback = getProgram(slug);
  return fallback || null;
}
