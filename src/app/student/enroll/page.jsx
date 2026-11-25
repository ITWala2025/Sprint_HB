import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";
import { resolveStudentLoginNextPath } from "@/lib/student-login-redirect";

export const metadata = {
  title: "Student Enrollment",
  description: "Create your SPRINT Student Portal account and verify your email.",
  // The wizard is a task, not a landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

export default async function StudentEnrollPage({ searchParams }) {
  const query = await searchParams;
  const requestedNext = typeof query?.next === "string" ? query.next : "";
  const nextPath = resolveStudentLoginNextPath(
    requestedNext ? new URLSearchParams({ next: requestedNext }).toString() : "",
  );
  return <EnrollmentWizard nextPath={nextPath} />;
}
