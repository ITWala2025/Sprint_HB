import { BookOpen } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "My Course" };

export default function StudentMyCoursePage() {
  return (
    <StudentPlaceholderPage
      title="My Course"
      description="The program you are enrolled in — module plan, live session timetable, mentor and cohort details."
      icon={BookOpen}
      note="Course records appear here once the enrollment module is connected."
    />
  );
}