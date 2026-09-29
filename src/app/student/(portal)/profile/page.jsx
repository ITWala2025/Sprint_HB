import { UserRound } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "My Profile" };

export default function StudentProfilePage() {
  return (
    <StudentPlaceholderPage
      title="Profile"
      description="Your SPRINT learner record — personal details, program, cohort allocation and mentor mapping."
      icon={UserRound}
      note="Profile records and edit controls arrive with the authenticated student account."
    />
  );
}
