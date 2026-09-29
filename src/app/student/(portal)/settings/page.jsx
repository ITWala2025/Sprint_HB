import { Settings } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "Settings" };

export default function StudentSettingsPage() {
  return (
    <StudentPlaceholderPage
      title="Settings"
      description="Account preferences, notification channels, password and privacy controls for your learner account."
      icon={Settings}
      note="Preference storage is wired with the authenticated student account."
    />
  );
}