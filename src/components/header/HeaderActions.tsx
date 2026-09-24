import Link from "next/link";
import { ArrowRight, LayoutDashboard, UserRound } from "lucide-react";

export default function HeaderActions({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <div className="hidden shrink-0 items-center gap-3 lg:flex">
      {isAdmin ? (
        <Link href="/admin/dashboard" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-dark">
          <LayoutDashboard className="size-4.5" aria-hidden="true" />
          Go to Dashboard
        </Link>
      ) : (
        <>
          <Link href="/student/login" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-sm transition-colors hover:bg-brand-off-white">
            <UserRound className="size-4.5" aria-hidden="true" />
            Student Portal
          </Link>
          <Link href="/register" className="sprint-enroll-button inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-red-dark">
            <span className="floating-dots" aria-hidden="true"><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /></span>
            Enroll Now
            <ArrowRight className="enroll-arrow size-4.25" aria-hidden="true" />
          </Link>
        </>
      )}
    </div>
  );
}
