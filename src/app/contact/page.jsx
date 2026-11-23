import ContactHero from "@/components/contact/ContactHero";
import EnquirySection from "@/components/contact/EnquirySection";
import LocationSection from "@/components/contact/LocationSection";
import FAQSection from "@/components/contact/FAQSection";
import siteConfig from "@/config/site.config.json";
import { FAQ_DATA } from "@/data/contactFaqs";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with SPRINT Institutional Training Hub. Visit our centre in Hazaribagh, Jharkhand, or reach us by phone, email, or WhatsApp for admissions and enquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | SPRINT",
    description:
      "Get in touch with SPRINT Institutional Training Hub. Visit our centre in Hazaribagh, Jharkhand, or reach us by phone, email, or WhatsApp.",
    url: "/contact",
    type: "website",
    siteName: "SPRINT Institutional Training Hub",
    locale: "en_IN",
    images: [
      {
        url: `${siteConfig.url}/images/og-contact.jpg`,
        width: 1200,
        height: 630,
        alt: "Contact SPRINT Institutional Training Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | SPRINT",
    description:
      "Get in touch with SPRINT Institutional Training Hub. Visit our centre in Hazaribagh, Jharkhand.",
    images: [`${siteConfig.url}/images/og-contact.jpg`],
  },
};

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

/* FAQPage schema (SEO §7.3) — uses the same FAQ data as the Contact page component */
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map((faq) => ({
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

export default function ContactPage() {
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
      <ContactHero />
      <EnquirySection />
      <LocationSection />
      <FAQSection />
    </>
  );
}