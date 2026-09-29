import { GraduationCap } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "Result" };

export default function StudentResultPage() {
  return (
    <StudentPlaceholderPage
      title="Result"
      description="Module assessments, capstone grades and your published program result card."
      icon={GraduationCap}
      note="Results are published by the academics team and appear here automatically."
    />
  );
}