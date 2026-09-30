import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";

export const metadata = {
  title: "Student Enrollment",
  description:
    "Start your SPRINT enrollment: share your details, education, specialization and learning path, then set up your Student Portal account.",
  // The wizard is a task, not a landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

export default function StudentEnrollPage() {
  return <EnrollmentWizard />;
}
