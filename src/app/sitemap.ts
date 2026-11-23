import { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { courses, bundles } from "@/data/courses";
import { rolePaths } from "@/data/learningPaths";
import { normalizeBundle } from "@/lib/course-utils";
import siteConfig from "@/config/site.config.json";

const BASE_URL = siteConfig.url;

function toAbsolute(url: string): string {
  return `${BASE_URL}${url}`;
}

function getStaticRoutes(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: toAbsolute("/"), changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: toAbsolute("/about"), changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: toAbsolute("/courses"), changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: toAbsolute("/programs/sprint-rise"), changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: toAbsolute("/programs/career-accelerator"), changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: toAbsolute("/careers"), changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: toAbsolute("/contact"), changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: toAbsolute("/terms"), changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: toAbsolute("/privacy"), changeFrequency: "yearly", priority: 0.3, lastModified: now },
  ];
}

async function getDynamicCourseRoutes(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicServerClient();
  let courseSlugs: string[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (!error && data?.length) {
        courseSlugs = data
          .filter((row) => row.slug && typeof row.slug === "string")
          .map((row) => row.slug);
      }
    } catch {
      // ignore, fall back to static
    }
  }

  if (!courseSlugs.length) {
    courseSlugs = courses.map((c) => c.slug).filter(Boolean);
  }

  return courseSlugs.map((slug) => ({
    url: toAbsolute(`/courses/${slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: new Date(),
  }));
}

async function getDynamicBundleRoutes(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicServerClient();
  let bundleSlugs: string[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("course_bundles")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (!error && data?.length) {
        bundleSlugs = data
          .filter((row) => row.slug && typeof row.slug === "string")
          .map((row) => row.slug);
      }
    } catch {
      // ignore, fall back to static
    }
  }

  if (!bundleSlugs.length) {
    bundleSlugs = bundles.map((b) => b.slug).filter(Boolean);
  }

  return bundleSlugs.map((slug) => ({
    url: toAbsolute(`/bundles/${slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: new Date(),
  }));
}

async function getDynamicLearningPathRoutes(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicServerClient();
  let pathSlugs: string[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("learning_paths")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (!error && data?.length) {
        pathSlugs = data
          .filter((row) => row.slug && typeof row.slug === "string")
          .map((row) => row.slug);
      }
    } catch {
      // ignore, fall back to static
    }
  }

  if (!pathSlugs.length) {
    pathSlugs = rolePaths.map((p) => p.slug).filter(Boolean);
  }

  return pathSlugs.map((slug) => ({
    url: toAbsolute(`/learning-paths/${slug}`),
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: new Date(),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = getStaticRoutes();
  const [courseRoutes, bundleRoutes, learningPathRoutes] = await Promise.all([
    getDynamicCourseRoutes(),
    getDynamicBundleRoutes(),
    getDynamicLearningPathRoutes(),
  ]);

  const allRoutes = [...staticRoutes, ...courseRoutes, ...bundleRoutes, ...learningPathRoutes];

  const seen = new Set<string>();
  return allRoutes.filter((route) => {
    if (seen.has(route.url)) return false;
    seen.add(route.url);
    return true;
  });
}