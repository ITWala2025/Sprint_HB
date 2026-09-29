import { Award } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "My Certificates" };

export default function StudentCertificatesPage() {
  return (
    <StudentPlaceholderPage
      title="Certificate"
      description="Course completion certificates, module badges and verified skill credentials."
      icon={Award}
      note="Certificates are generated after each module sign-off."
    />
  );
}
