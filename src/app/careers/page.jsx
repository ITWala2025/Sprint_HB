import CareerHero from "@/components/careers/CareerHero";
import WhyJoinSprint from "@/components/careers/WhyJoinSprint";
import OpenPositions from "@/components/careers/OpenPositions";
import HiringProcess from "@/components/careers/HiringProcess";
import { careerRoles } from "@/data/careers";
import siteConfig from "@/config/site.config.json";
// import ApplicationForm from "@/components/careers/ApplicationForm";

export const metadata = {
  title: "Careers & Internships",
  description:
    "Explore open positions and internships at SPRINT Institutional Hub. Join our mission to bridge the academic–industry gap with hands-on, mentor-led tech education.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers & Internships | SPRINT",
    description:
      "Build the future of tech education. View open roles for engineers, educators, and operations.",
    url: "/careers",
    type: "website",
    siteName: "SPRINT Institutional Training Hub",
    locale: "en_IN",
    images: [
      {
        url: `${siteConfig.url}/images/og-careers.jpg`,
        width: 1200,
        height: 630,
        alt: "SPRINT Careers & Internships",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers & Internships | SPRINT",
    description:
      "Build the future of tech education. View open roles for engineers, educators, and operations.",
    images: [`${siteConfig.url}/images/og-careers.jpg`],
  },
};

/* JobPosting schema array for structured data */
function buildJobPostings() {
  return careerRoles.map((role) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: role.description,
    identifier: {
      "@type": "PropertyValue",
      name: "SPRINT",
      value: role.id,
    },
    datePosted: role.postedDate,
    validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    employmentType: role.type === "internship" ? "INTERN" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.logo}`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hazaribagh",
        addressRegion: "Jharkhand",
        addressCountry: "IN",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: role.type === "internship" ? 20000 : 30000,
        maxValue: role.type === "internship" ? 20000 : 45000,
        unitText: "MONTH",
      },
    },
    responsibilities: role.responsibilities,
    qualifications: role.requirements,
  }));
}

/* Helper to safely serialize JSON-LD for dangerouslySetInnerHTML */
function ldJson(obj) {
  return {
    __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
  };
}

export default function CareersPage() {
  const jobPostings = buildJobPostings();
  return (
    <>
      {/* Structured data: JobPosting array */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldJson({
          "@context": "https://schema.org",
          "@graph": jobPostings,
        })}
      />
      <CareerHero />
      <WhyJoinSprint />
      <OpenPositions />
      <HiringProcess />
      {/* <ApplicationForm /> */}
    </>
  );
}