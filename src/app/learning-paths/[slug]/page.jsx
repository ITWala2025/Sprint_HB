import { notFound } from "next/navigation";
import LearningPathDetailPage from "@/components/courses/LearningPathDetailPage";
import { getLearningPath, rolePaths } from "@/data/learningPaths";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { normalizeLearningPath } from "@/lib/course-utils";
import siteConfig from "@/config/site.config.json";

export const dynamic = "force-dynamic";
export function generateStaticParams() {
  return rolePaths.map(({ slug }) => ({ slug }));
}

async function findLearningPath(slug) {
  const supabase = createPublicServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) console.error(`[SPRINT Learning Paths] Could not load "${slug}" from Supabase:`, error.message);
    if (data) return normalizeLearningPath(data);
  }

  const fallback = getLearningPath(slug);
  return fallback ? normalizeLearningPath(fallback) : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = await findLearningPath(slug);
  if (!path) return { title: "Learning Path Not Found", robots: { index: false } };

  return {
    title: `${path.title} Learning Path`,
    description: `Explore the ${path.stages.length}-stage learning path for ${path.title}.`.slice(0, 155),
    alternates: { canonical: `/learning-paths/${path.slug}` },
    openGraph: {
      title: `${path.title} Learning Path | SPRINT`,
      description: `Explore the ${path.stages.length}-stage learning path for ${path.title}.`,
      url: `/learning-paths/${path.slug}`,
      type: "website",
      siteName: "SPRINT Institutional Training Hub",
      locale: "en_IN",
      images: [
        {
          url: `${siteConfig.url}/images/og-learning-path.jpg`,
          width: 1200,
          height: 630,
          alt: `${path.title} Learning Path`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${path.title} Learning Path | SPRINT`,
      description: `Explore the ${path.stages.length}-stage learning path for ${path.title}.`,
      images: [`${siteConfig.url}/images/og-learning-path.jpg`],
    },
  };
}

export default async function LearningPathPage({ params }) {
  const { slug } = await params;
  const path = await findLearningPath(slug);
  if (!path) notFound();

  return <LearningPathDetailPage path={path} />;
}
