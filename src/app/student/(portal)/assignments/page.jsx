import AssignmentsClient from "@/components/student/AssignmentsClient";
import { getStudentAssignmentsAction } from "./actions";

export const metadata = { title: "My Assignments" };

export default async function StudentAssignmentsPage() {
  const result = await getStudentAssignmentsAction();
  return (
    <AssignmentsClient
      initialAssessments={result.success ? result.assessments : []}
      initialSubmissions={result.success ? result.submissions : []}
      initialError={result.success ? "" : result.error}
    />
  );
}
