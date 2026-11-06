import { assertModuleAccess } from "@/app/admin/authorization";
import StudentsDirectoryTable from "@/app/admin/students/list/StudentsDirectoryTable";
import { getStudentDirectory } from "@/app/admin/students/list/actions";

export const metadata = {
    title: "Student Directory | SPRINT Admin",
    description: "Manage approved students, contact information, enrolled courses, and enrollment dates.",
    robots: { index: false, follow: false },
};

export default async function StudentDirectoryPage() {
    await assertModuleAccess("student_ops");

    let students;
    try {
        students = await getStudentDirectory();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load student directory data.";
        return (
            <div className="mx-auto max-w-[1500px] space-y-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm" aria-live="polite">
                    We couldn&apos;t load the student directory right now. {message}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Student Directory</h2>
                        <p className="mt-2 text-sm text-brand-text-secondary">Manage approved students, contact information, enrolled courses, and enrollment dates.</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        {students.length} approved students
                    </span>
                </div>
            </div>

            <StudentsDirectoryTable students={students} />
        </div>
    );
}
