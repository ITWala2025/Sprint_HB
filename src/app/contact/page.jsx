import ContactHero from "@/components/contact/ContactHero";
import EnquirySection from "@/components/contact/EnquirySection";
import LocationSection from "@/components/contact/LocationSection";
import FAQSection from "@/components/contact/FAQSection";

import "@/css/contact.css";

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <EnquirySection />
      <LocationSection />
      <FAQSection />
    </>
  );
}