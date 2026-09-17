import Hero from "@/components/Home/Hero";
import WhatWeGive from "@/components/Home/WhatWeGive";
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
 * 1. Header  2. Hero  3. What We Give  4. Partner Associations
 * 5. Featured Course/Program  6. More Courses  7. Instructors
 * 8. Testimonials  9. FAQs  10. Contact CTA  11. Footer
 */
export default function HomePage() {
  return (
    <>
      
      <main>
        <Hero />
        <WhatWeGive />
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
