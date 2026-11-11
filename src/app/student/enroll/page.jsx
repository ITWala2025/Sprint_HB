import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";

export const metadata = {
  title: "Student Enrollment",
  description:
    "Start your SPRINT enrollment, optionally share your education profile, and verify your email with a secure link.",
  // The wizard is a task, not a landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

export default function StudentEnrollPage() {
  return <EnrollmentWizard />;
}
