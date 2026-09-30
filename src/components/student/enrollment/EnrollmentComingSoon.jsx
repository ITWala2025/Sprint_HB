import { Construction } from "lucide-react";

/**
 * Body shown by the scaffolded steps of the enrollment wizard.
 *
 * Steps 3-5 exist as routes, progress entries and step components so the shell,
 * the shared state and the navigation can be reviewed end to end. Their forms
 * land in the next phase; until then each one lists the fields it will collect
 * instead of pretending to be a finished screen.
 */
export default function EnrollmentComingSoon({ note, fields = [] }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-brand-off-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red-light text-brand-red"
        >
          <Construction className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-navy">
            This step is scaffolded for now.
          </p>
          {note ? (
            <p className="mt-1 text-xs leading-relaxed text-brand-text-secondary">{note}</p>
          ) : null}
        </div>
      </div>

      {fields.length ? (
        <>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
            Fields arriving in the next phase
          </p>
          <ul className="mt-2.5 space-y-2">
            {fields.map((field) => (
              <li
                key={field}
                className="flex items-start gap-2 text-xs leading-snug text-brand-text-secondary"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red"
                />
                {field}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-brand-text-muted">
        Use <span className="font-semibold text-brand-navy">Continue</span> to carry on — the
        wizard keeps every answer you have already given.
      </p>
    </div>
  );
}
