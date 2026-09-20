import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { bundles, getBundle } from "@/data/courses";

export function generateStaticParams() { return bundles.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getBundle(slug);
  return item ? { title: item.title, description: item.description, alternates: { canonical: `/bundles/${item.slug}` } } : {};
}
export default async function BundlePage({ params }) {
  const { slug } = await params;
  const item = getBundle(slug);
  if (!item) notFound();
  return <DetailPage item={item} />;
}
