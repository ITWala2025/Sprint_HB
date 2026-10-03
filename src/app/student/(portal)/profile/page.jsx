import { Settings, UserRound } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "My Profile" };

export default function StudentProfilePage() {
  return (
    <div className="flex flex-col gap-5">
      <StudentPlaceholderPage
        title="Profile"
        description="Your SPRINT learner record — personal details, program, cohort allocation and mentor mapping."
        icon={UserRound}
        note="Profile records and edit controls arrive with the authenticated student account."
      />
      <StudentCard
        id="settings"
        title="Settings"
        description="Account preferences, notification channels, password and privacy controls for your learner account."
        icon={Settings}
      >
        <p className="text-sm leading-relaxed text-brand-text-secondary">
          Preference storage is wired with the authenticated student account.
        </p>
      </StudentCard>
    </div>
  );
}
