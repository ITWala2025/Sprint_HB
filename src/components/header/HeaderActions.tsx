import Link from "next/link";
import { ArrowRight, LayoutDashboard, UserRound } from "lucide-react";
import StudentAvatarDropdown from "@/components/header/StudentAvatarDropdown";

export default function HeaderActions({
  isAdmin = false,
  studentInitials = null,
  studentFullName = null,
  accessibleBrandRed = false,
}: {
  isAdmin?: boolean;
  studentInitials?: string | null;
  studentFullName?: string | null;
  accessibleBrandRed?: boolean;
}) {
  return (
    <div className="hidden shrink-0 items-center gap-3 lg:flex">
      {isAdmin ? (
        <Link href="/admin/dashboard" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-dark">
          <LayoutDashboard className="size-4.5" aria-hidden="true" />
          Go to Dashboard
        </Link>
      ) : studentInitials ? (
<<<<<<< HEAD
        <StudentAvatarDropdown
          initials={studentInitials}
          fullName={studentFullName || "Student"}
        />
=======
        <Link
          href="/student/dashboard"
          aria-label="Student dashboard"
          className="inline-flex size-11 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-navy-dark"
        >
          {studentInitials}
        </Link>
>>>>>>> dd10251e57d9cd5ad5391ba4ea8ed321bebced5e
      ) : (
        <>
          <Link href="/student/login" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-sm transition-colors hover:bg-brand-off-white">
            <UserRound className="size-4.5" aria-hidden="true" />
            Student Portal
          </Link>
          <a href="/student/enroll" className={`sprint-enroll-button inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl ${accessibleBrandRed ? "bg-brand-red-accessible" : "bg-brand-red"} px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-red-dark`}>
            <span className="floating-dots" aria-hidden="true"><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /><i className="dot" /></span>
            Enroll Now
            <ArrowRight className="enroll-arrow size-4.25" aria-hidden="true" />
          </a>
        </>
      )}
    </div>
  );
}
