import { assertModuleAccess } from "@/app/admin/authorization";
import EnrollmentApplicationsTable from "@/app/admin/students/enrollments/EnrollmentApplicationsTable";
import { getRegistrations } from "@/app/admin/students/enrollments/actions";

export default async function EnrollmentApplicationsPage() {
    await assertModuleAccess("student_ops");

    const rows = await getRegistrations();

    const pendingCount = rows.filter((row) => row.status === "pending").length;

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Enrollment Applications</h2>
                        <p className="mt-2 text-sm text-brand-text-secondary">Review and process new student applications for upcoming programs.</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-brand-red-light px-3 py-1.5 text-xs font-bold text-brand-red">
                        {pendingCount} pending review
                    </span>
                </div>
            </div>

            <EnrollmentApplicationsTable registrations={rows} />
        </div>
    );
}
