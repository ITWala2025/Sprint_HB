import Link from "next/link";
import { ArrowRight, FileText, Inbox } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";
import { mockOfferLetters } from "@/data/student";
import { formatShortDate } from "@/utils/dates";

/** Offer Letters — issued placement offers, with an empty state for new learners. */
export default function OfferLettersCard() {
  const hasOffers = mockOfferLetters.length > 0;

  return (
    <StudentCard
      title="Offer Letters"
      icon={FileText}
      badge={hasOffers ? String(mockOfferLetters.length) : undefined}
      className="h-full"
    >
      {hasOffers ? (
        <ul className="flex flex-col gap-3">
          {mockOfferLetters.map((offer) => (
            <li
              key={offer.id}
              className="rounded-2xl border border-brand-border bg-brand-off-white px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-navy">
                    {offer.role}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-brand-text-muted">
                    {offer.company}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-red-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-red">
                  {offer.status}
                </span>
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                <div className="flex gap-1">
                  <dt className="text-brand-text-muted">Stipend:</dt>
                  <dd className="font-semibold text-brand-text-secondary">
                    {offer.stipend}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-brand-text-muted">Issued:</dt>
                  <dd className="font-semibold text-brand-text-secondary">
                    {formatShortDate(offer.issuedOn)}
                  </dd>
                </div>
              </dl>

              <Link
                href="/student/certificates"
                className="sprint-focus group mt-3 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-brand-red transition-colors hover:text-brand-red-dark"
              >
                View in Certificates
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-border bg-brand-off-white px-6 py-8 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-red-light text-brand-red">
            <Inbox className="size-6" aria-hidden="true" />
          </span>
          <h3 className="font-display text-base font-bold text-brand-navy">
            No offer letters yet
          </h3>
          <p className="max-w-sm text-xs leading-relaxed text-brand-text-secondary">
            Offers land here as soon as a partner company issues them to you.
          </p>
        </div>
      )}
    </StudentCard>
  );
}
