import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { getProgram } from "@/data/programs";

const program = getProgram("sprint-rise");

export const metadata = {
  title: program.title,
  description: program.description,
  alternates: { canonical: `/programs/${program.slug}` },
};

export default function SprintRisePage() {
  if (!program) notFound();

  return <DetailPage item={program} />;
}
