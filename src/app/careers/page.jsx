import CareerHero from "@/components/careers/CareerHero";
import WhyJoinSprint from "@/components/careers/WhyJoinSprint";
import OpenPositions from "@/components/careers/OpenPositions";
import HiringProcess from "@/components/careers/HiringProcess";
import ApplicationForm from "@/components/careers/ApplicationForm";

export const metadata = {
  title: "Careers & Internships | SPRINT",
  description:
    "Explore open positions and internships at SPRINT Institutional Hub. Join our mission to bridge the academic–industry gap with hands-on, mentor-led tech education.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers & Internships | SPRINT",
    description:
      "Build the future of tech education. View open roles for engineers, educators, and operations.",
    url: "/careers",
    type: "website",
  },
};

export default function CareersPage() {
  return (
    <>
      <CareerHero />
      <WhyJoinSprint />
      <OpenPositions />
      <HiringProcess />
      <ApplicationForm />
    </>
  );
}