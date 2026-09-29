import { LifeBuoy } from "lucide-react";

import StudentPlaceholderPage from "@/components/student/StudentPlaceholderPage";

export const metadata = { title: "Help & Support" };

export default function StudentHelpSupportPage() {
  return (
    <StudentPlaceholderPage
      title="Help & Support"
      description="Raise a ticket, browse learner FAQs or reach the SPRINT support desk directly."
      icon={LifeBuoy}
      note="Ticket history and support response times come with the authenticated account."
    />
  );
}
