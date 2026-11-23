import { notFound } from "next/navigation";
import DetailPage from "@/components/courses/DetailPage";
import { findProgramBySlug } from "@/lib/program-data.server";
import siteConfig from "@/config/site.config.json";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const program = await findProgramBySlug("career-accelerator");
  if (!program) return {};
  return {
    title: program.title,
    description: program.description,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: {
      title: `${program.title} | SPRINT`,
      description: program.description,
      url: `/programs/${program.slug}`,
      type: "website",
      siteName: "SPRINT Institutional Training Hub",
      locale: "en_IN",
      images: [
        {
          url: program.image ? `${siteConfig.url}${program.image}` : `${siteConfig.url}/images/og-program.jpg`,
          width: 1200,
          height: 630,
          alt: program.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${program.title} | SPRINT`,
      description: program.description,
      images: [program.image ? `${siteConfig.url}${program.image}` : `${siteConfig.url}/images/og-program.jpg`],
    },
  };
}

export default async function CareerAcceleratorPage() {
  const program = await findProgramBySlug("career-accelerator");
  if (!program) notFound();

  return <DetailPage item={program} />;
}
