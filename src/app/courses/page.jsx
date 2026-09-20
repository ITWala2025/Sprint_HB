import CourseCatalogue from "@/components/courses/CourseCatalogue";
import { catalogueItems } from "@/data/courses";

export const metadata = {
  title: "Courses & Learning Pathways",
  description: "Explore SPRINT's practical courses, career packages, and technology learning pathways for students and working professionals.",
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  return <CourseCatalogue items={catalogueItems} />;
}
