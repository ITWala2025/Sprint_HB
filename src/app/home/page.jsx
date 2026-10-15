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

const homeFacultyProfiles = about.faculty.profiles.map((profile) => ({
  ...profile,
  image:
    profile.image ??
    (profile.name === "Ananya Roy" ? "/images/home/Ananya.jpeg" : undefined),
}));
const academicLead = about.leadership.profiles.find(
  (profile) => profile.name === "Priya Verma",
);
const homeFacultyAndAcademicProfiles = [
  ...homeFacultyProfiles,
  {
    ...academicLead,
    image: "/images/home/Priya.jpeg",
  },
];

export const metadata = {
  title: "SPRINT Training Hub",
  description:
    "Mentor-led technology and digital skills programs built for students, professionals, and institutions.",
  alternates: { canonical: "/home" },
};

/**
 * Home Page — assembled in the exact section order from Section 4 of the
 * requirements doc:
 * 1. Header  2. Hero  3. Partner Associations
 * 4. Featured Course/Program  5. More Courses  6. Faculty & Experts
 * 7. Testimonials  8. FAQs  9. Contact CTA  10. Footer
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      <PartnerCarousel />
      <FeaturedProgram />
      <MoreCourses />
      <FacultyExperts
        accessibleBrandRed
        sectionClassName="sprint-section bg-brand-white"
        contentClassName="mx-auto max-w-[1200px] px-6 py-[1.4rem] md:py-[1.925rem] lg:py-[2.45rem]"
        profilesContent={<FacultyFilmstrip profiles={homeFacultyAndAcademicProfiles} />}
      />
      <Testimonials />
      <FAQSection />
      <ContactCTA />
    </main>
  );
}