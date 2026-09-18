import Hero from "@/components/Home/Hero";
import PartnerCarousel from "@/components/Home/PartnerCarousel";
import FeaturedProgram from "@/components/Home/FeaturedProgram";
import MoreCourses from "@/components/Home/MoreCourses";
import Instructors from "@/components/Home/Instructors";
import Testimonials from "@/components/Home/Testimonials";
import FAQSection from "@/components/Home/FAQSection";
import ContactCTA from "@/components/Home/ContactCTA";


/**
 * Home Page — assembled in the exact section order from Section 4 of the
 * requirements doc:
 * 1. Header  2. Hero  3. Partner Associations
 * 4. Featured Course/Program  5. More Courses  6. Instructors
 * 7. Testimonials  8. FAQs  9. Contact CTA  10. Footer
 */
export default function HomePage() {
  return (
    <>
      
      <main>
        <Hero />
        <PartnerCarousel />
        <FeaturedProgram />
        <MoreCourses />
        <Instructors />
        <Testimonials />
        <FAQSection />
        <ContactCTA />
      </main>
      
    </>
  );
}
