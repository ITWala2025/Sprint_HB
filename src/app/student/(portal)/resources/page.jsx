import { BookOpen } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "Learning Resources" };

/**
 * Not part of the sidebar — it is the destination for the dashboard's
 * "View Resources" quick action.
 */
export default function StudentResourcesPage() {
  return (
    <StudentPlaceholderPage
      title="Resources"
      description="Session recordings, reading lists, lab notebooks and downloadable course material."
      icon={BookOpen}
      note="Resources are published by mentors after each live session."
    />
  );
}
