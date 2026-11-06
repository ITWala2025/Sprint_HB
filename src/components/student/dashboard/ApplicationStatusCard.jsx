const STATUS_LABELS = {
  pending: "Under review",
  approved: "Approved",
  rejected: "Not approved",
};

export default function ApplicationStatusCard({ applications }) {
  if (!applications?.length) return null;

  return (
    <section
      aria-labelledby="student-applications-heading"
      className="rounded-2xl border border-brand-border bg-brand-white p-5 shadow-brand-card sm:p-6"
    >
      <h2
        id="student-applications-heading"
        className="font-display text-lg font-bold text-brand-navy"
      >
        My course applications
      </h2>
      <ul className="mt-4 divide-y divide-brand-border">
        {applications.map((application) => (
          <li
            key={application.id}
            className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-brand-navy">
                {application.courseTitle}
              </p>
              {application.applicationId && (
                <p className="mt-0.5 font-mono text-xs font-semibold text-brand-navy">
                  Application ID: {application.applicationId}
                </p>
              )}
              <p className="mt-1 text-xs text-brand-text-secondary">
                Submitted{" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="w-fit rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-navy">
              {STATUS_LABELS[application.status] ?? "Status unavailable"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
