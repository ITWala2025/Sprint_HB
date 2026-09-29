import Link from "next/link";
import { Star } from "lucide-react";

import StudentCard from "@/components/student/StudentCard";

/** Share Your Experience — testimonial prompt with SPRINT's red star accent. */
export default function ShareExperienceCard() {
  return (
    <StudentCard title="Share Your Experience" icon={Star} className="h-full">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} className="size-4 fill-brand-red text-brand-red" />
          ))}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-brand-text-secondary">
          Your review helps the next cohort choose with confidence — and it takes
          less than two minutes.
        </p>

        <p className="mt-3 text-xs text-brand-text-muted">
          Opens the SPRINT enquiry form so our team can follow up with you.
        </p>

        <Link
          href="/contact"
          className="sprint-focus mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark sm:self-start"
        >
          Share Feedback
        </Link>
      </div>
    </StudentCard>
  );
}
