import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { courses, getCourse } from "@/data/courses";

export function generateStaticParams() { return courses.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getCourse(slug);
  return item ? { title: item.title, description: item.description, alternates: { canonical: `/courses/${item.slug}` } } : {};
}
export default async function CoursePage({ params }) {
  const { slug } = await params;
  const item = getCourse(slug);
  if (!item) notFound();
  return <DetailPage item={item} />;
}
