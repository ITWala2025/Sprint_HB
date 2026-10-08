import { notFound } from "next/navigation";
import LearningPathDetailPage from "@/components/courses/LearningPathDetailPage";
import { getLearningPath, rolePaths } from "@/data/learningPaths";

export function generateStaticParams() {
  return rolePaths.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  return path
    ? {
        title: `${path.role} Learning Path`,
        description: `Explore the three-stage learning path for ${path.role}.`,
      }
    : {};
}

export default async function LearningPathPage({ params }) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) notFound();

  return <LearningPathDetailPage path={path} />;
}
