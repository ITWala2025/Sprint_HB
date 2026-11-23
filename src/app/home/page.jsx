import Hero from "@/components/Home/Hero";
import PartnerCarousel from "@/components/Home/PartnerCarousel";
import FeaturedProgram from "@/components/Home/FeaturedProgram";
import MoreCourses from "@/components/Home/MoreCourses";
import FacultyExperts from "@/components/sections/FacultyExperts";
import FacultyFilmstrip from "@/components/Home/FacultyFilmstrip";
import Testimonials from "@/components/Home/Testimonials";
import FAQSection from "@/components/Home/FAQSection";
import ContactCTA from "@/components/Home/ContactCTA";
import about from "@/data/about.json";
import { faqs } from "@/data/data";
import siteConfig from "@/config/site.config.json";
// import WhyChooseSprint from "@/components/Home/WhyChooseSprint";

export const metadata = {
  title: "Home",
  description:
    "SPRINT Institutional Training Hub — hands-on, production-level training in AI/ML, Cloud and DevOps for students, graduates and professionals in Jharkhand.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SPRINT | AI, Cloud, DevOps & Full-Stack Training in Jharkhand",
    description:
      "SPRINT Institutional Training Hub — hands-on, production-level training in AI/ML, Cloud and DevOps for students, graduates and professionals.",
    url: "/",
    type: "website",
    siteName: "SPRINT Institutional Training Hub",
    locale: "en_IN",
    images: [
      {
        url: `${siteConfig.url}/images/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "SPRINT Institutional Training Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPRINT | AI, Cloud, DevOps & Full-Stack Training in Jharkhand",
    description:
      "SPRINT Institutional Training Hub — hands-on, production-level training in AI/ML, Cloud and DevOps.",
    images: [`${siteConfig.url}/images/og-home.jpg`],
  },
};

export const revalidate = 60;

/* EducationalOrganization schema (SEO §7.1) */
const educationalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteConfig.legalName,
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.logo}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "SPRINT Centre",
    addressLocality: "Hazaribagh",
    addressRegion: "Jharkhand",
    postalCode: "825301",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.contact.telHref.replace("tel:", ""),
    email: siteConfig.contact.email,
    contactType: "admissions",
    availableLanguage: ["en", "hi"],
  },
  sameAs: siteConfig.socials.map((s) => s.href),
  description: siteConfig.description,
};

/* FAQPage schema (SEO §7.3) — uses the same FAQ data as the Home page component */
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

/* Helper to safely serialize JSON-LD for dangerouslySetInnerHTML */
function ldJson(obj) {
  return {
    __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
  };
}

/**
 * Home Page — assembled in the exact section order from Section 4 of the
 * requirements doc:
 * 1. Header  2. Hero  3. Partner Associations
 * 4. Featured Course/Program  5. More Courses  6. Faculty & Experts
 * 7. Testimonials  8. FAQs  9. Contact CTA  10. Footer
 */
export default function HomePage() {
  return (
    <>
      {/* Structured data: EducationalOrganization + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldJson({
          "@context": "https://schema.org",
          "@graph": [educationalOrgSchema, faqPageSchema],
        })}
      />
      <main>
        <Hero />
        <PartnerCarousel />
        <FeaturedProgram />
        <MoreCourses />
        <FacultyExperts
          accessibleBrandRed
          sectionClassName="sprint-section bg-brand-white"
          contentClassName="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8 lg:py-10"
          profilesContent={<FacultyFilmstrip profiles={about.faculty.profiles} />}
        />
        {/* <WhyChooseSprint />  */}

        <Testimonials />
        <FAQSection />
        <ContactCTA />
      </main>
    </>
  );
}