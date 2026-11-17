import CourseCatalogue from "@/components/courses/CourseCatalogue";
import { catalogueItems, normalizeDatabaseCourse } from "@/data/courses";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { normalizeBundle, normalizeLearningPath } from "@/lib/course-utils";
import { rolePaths } from "@/data/learningPaths";

export const revalidate = 60;

export const metadata = {
  title: "Courses & Learning Pathways",
  description: "Explore SPRINT's practical courses, career packages, and technology learning pathways for students and working professionals.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  let initialItems = catalogueItems;
  let initialPaths = rolePaths.map(normalizeLearningPath);

  const supabase = createPublicServerClient();
  if (supabase) {
    try {
      const [courseResult, learningPathResult, bundleResult] = await Promise.all([
        supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("learning_paths").select("*").eq("is_published", true).order("title"),
        supabase.from("course_bundles").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      ]);

      const dbCourses = courseResult.data?.length
        ? courseResult.data.map(normalizeDatabaseCourse)
        : catalogueItems.filter((item) => item.kind === "course");

      const dbBundles = bundleResult.data?.length
        ? bundleResult.data.map((row) => normalizeBundle(row))
        : catalogueItems.filter((item) => item.kind === "bundle");

      if (courseResult.data?.length || bundleResult.data?.length) {
        initialItems = [...dbCourses, ...dbBundles.filter((item) => item.kind === "bundle")];
      }

      if (learningPathResult.data?.length) {
        initialPaths = learningPathResult.data.map(normalizeLearningPath);
      }
    } catch (err) {
      console.error("[CoursesPage] Could not pre-fetch courses from database:", err);
    }
  }

  return <CourseCatalogue items={initialItems} initialLearningPaths={initialPaths} />;
}
