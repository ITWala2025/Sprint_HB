import { ClipboardList } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "My Assignments" };

export default function StudentAssignmentsPage() {
  return (
    <StudentPlaceholderPage
      title="Assignment"
      description="Submitted and pending assignments with mentor feedback and submission deadlines."
      icon={ClipboardList}
      note="Assignment drops and grading appear here once the academics module is connected."
    />
  );
}
