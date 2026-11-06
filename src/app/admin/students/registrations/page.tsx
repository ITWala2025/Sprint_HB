import { assertModuleAccess } from "@/app/admin/authorization";
import RegistrationsTable from "@/app/admin/students/registrations/RegistrationsTable";
import { getStudentRegistrations } from "@/app/admin/students/registrations/actions";

export default async function RegistrationsPage() {
    await assertModuleAccess("student_ops");
    const registrations = await getStudentRegistrations();

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Student Registrations</h2>
                        <p className="mt-2 text-sm text-brand-text-secondary">
                            Review sign-ups submitted without a course selection.
                        </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-brand-red-light px-3 py-1.5 text-xs font-bold text-brand-red">
                        {registrations.filter((registration) => registration.status === "pending").length} pending review
                    </span>
                </div>
            </div>

            <RegistrationsTable registrations={registrations} />
        </div>
    );
}
