import { Check, Eye, X } from "lucide-react";

const applications = [
    { name: "Aarav Mehta", email: "aarav.mehta@example.com", program: "Full Stack Engineering", submitted: "24 Sep 2026", status: "Pending" },
    { name: "Ishita Roy", email: "ishita.roy@example.com", program: "Cloud & DevOps", submitted: "23 Sep 2026", status: "Pending" },
    { name: "Kabir Sharma", email: "kabir.sharma@example.com", program: "AI / ML Foundations", submitted: "22 Sep 2026", status: "Pending" },
    { name: "Nandini Das", email: "nandini.das@example.com", program: "Data Analytics", submitted: "20 Sep 2026", status: "Reviewing" },
];

const statusStyles: Record<string, string> = {
    Pending: "bg-brand-red-light text-brand-red",
    Reviewing: "bg-amber-50 text-amber-700",
};

export default function EnrollmentApplicationsPage() {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Student Operations</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Enrollment Applications</h2>
                        <p className="mt-2 text-sm text-brand-text-secondary">Review and process new student applications for upcoming programs.</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-brand-red-light px-3 py-1.5 text-xs font-bold text-brand-red">3 pending review</span>
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Enrollment applications">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-brand-text-muted">
                            <tr>
                                <th className="px-5 py-3 font-bold sm:px-6">Applicant</th>
                                <th className="px-5 py-3 font-bold">Program</th>
                                <th className="px-5 py-3 font-bold">Submitted</th>
                                <th className="px-5 py-3 font-bold">Status</th>
                                <th className="px-5 py-3 text-right font-bold sm:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.map((application) => (
                                <tr key={application.email} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 sm:px-6"><p className="font-semibold text-brand-navy">{application.name}</p><p className="mt-1 text-xs text-brand-text-muted">{application.email}</p></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-brand-text-secondary">{application.program}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-xs text-brand-text-muted">{application.submitted}</td>
                                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[application.status]}`}>{application.status}</span></td>
                                    <td className="px-5 py-4 sm:px-6"><div className="flex justify-end gap-2"><button type="button" aria-label={`View details for ${application.name}`} className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition hover:border-brand-navy hover:bg-brand-surface"><Eye className="size-4" aria-hidden="true" /></button><button type="button" aria-label={`Accept ${application.name}`} className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"><Check className="size-4" aria-hidden="true" /></button><button type="button" aria-label={`Reject ${application.name}`} className="sprint-focus inline-flex size-9 items-center justify-center rounded-lg bg-brand-red-light text-brand-red transition hover:bg-red-100"><X className="size-4" aria-hidden="true" /></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}