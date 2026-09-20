import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

export default function HeaderActions() {
  return (
    <div className="hidden shrink-0 items-center gap-3 lg:flex">
      <Link
        href="/student/login"
        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-sm transition-colors hover:bg-brand-off-white"
      >
        <UserRound className="size-4.5" aria-hidden="true" />
        Student Portal
      </Link>
      <Link
        href="/register"
        className="sprint-enroll-button inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-red-dark"
      >
        <span className="floating-dots" aria-hidden="true">
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
        </span>
        Enroll Now
        <ArrowRight className="enroll-arrow size-4.25" aria-hidden="true" />
      </Link>
    </div>
  );
}
