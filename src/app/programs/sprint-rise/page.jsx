import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { findProgramBySlug } from "@/lib/program-data.server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const program = await findProgramBySlug("sprint-rise");
  return program ? {
    title: program.title,
    description: program.description,
    alternates: { canonical: `/programs/${program.slug}` },
  } : {};
}

export default async function SprintRisePage() {
  const program = await findProgramBySlug("sprint-rise");
  if (!program) notFound();

  return <DetailPage item={program} />;
}
