import { assertModuleAccess } from "@/app/admin/authorization";
import { getStudentDirectory } from "@/app/admin/students/list/actions";
import StudentsDirectoryTable from "@/app/admin/students/list/StudentsDirectoryTable";

export const metadata = {
  title: "Student Directory & Attendance",
  description: "View verified active SPRINT students and their enrollment details.",
};

export default async function StudentDirectoryPage() {
  await assertModuleAccess("student_ops");
  const students = await getStudentDirectory();
  const activeStudentCount = students.filter(
    (student) => student.status.toLowerCase() === "active"
  ).length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Student Directory & Attendance</h2>
            <p className="mt-2 text-sm text-brand-text-secondary">
              Browse verified students, contact details, and enrollment information.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-bold text-brand-navy">
            {activeStudentCount} active students
          </span>
        </div>
      </div>

      <StudentsDirectoryTable students={students} />
    </div>
  );
}
