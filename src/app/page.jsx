import { permanentRedirect } from "next/navigation";
import siteConfig from "@/config/site.config.json";

export const metadata = {
  title: "SPRINT | AI, Cloud, DevOps & Full-Stack Training in Jharkhand",
  description:
    "SPRINT is a job-ready training hub in Hazaribagh, Jharkhand, bridging the academic-industry gap with hands-on programs in AI/ML, Cloud and DevOps.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function RootPage() {
  permanentRedirect("/home");
}