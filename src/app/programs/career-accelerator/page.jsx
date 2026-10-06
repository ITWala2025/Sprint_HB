import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { getProgram } from "@/data/programs";

const program = getProgram("career-accelerator");

export const metadata = {
  title: program.title,
  description: program.description,
  alternates: { canonical: `/programs/${program.slug}` },
};

export default function CareerAcceleratorPage() {
  if (!program) notFound();

  return <DetailPage item={program} />;
}
