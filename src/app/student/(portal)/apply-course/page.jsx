import { BookPlus } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "Apply for a Course" };

export default function StudentApplyCoursePage() {
  return (
    <StudentPlaceholderPage
      title="Apply Courses"
      description="Enroll into your next SPRINT program or add a specialist module to your current pathway."
      icon={BookPlus}
      note="The application form reuses the public enquiry components once enrollment is connected."
    />
  );
}
