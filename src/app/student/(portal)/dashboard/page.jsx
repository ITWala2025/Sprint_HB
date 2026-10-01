import AnnouncementsCard from "@/components/student/dashboard/AnnouncementsCard";
import LearningProgress from "@/components/student/dashboard/LearningProgress";
import QuickActions from "@/components/student/dashboard/QuickActions";
import UpcomingLiveClasses from "@/components/student/dashboard/UpcomingLiveClasses";
import WelcomeBanner from "@/components/student/dashboard/WelcomeBanner";
import { mockAnnouncements } from "@/data/student";
import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";

export const metadata = {
  title: "Student Dashboard",
  description:
    "Your SPRINT learning dashboard — current course, cohort, progress, attendance, live classes and placements.",
  alternates: { canonical: "/student/dashboard" },
};

/**
 * Student Dashboard (UI pass).
 * Section order: hero → announcement shortcut → live classes → quick actions →
 * announcements.
 * All values come from `src/data/student.js` mock data.
 */
export default function StudentDashboardPage() {
  const unreadCount = mockAnnouncements.filter((item) => item.unread).length;

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <WelcomeBanner>
        <LearningProgress compact />
      </WelcomeBanner>

      <Link
        href="#dashboard-announcements"
        className="sprint-focus group flex min-h-12 items-center gap-3 rounded-lg border border-brand-border bg-brand-white px-4 py-2.5 text-sm transition-colors hover:border-brand-red hover:bg-brand-red-light"
      >
        <Bell className="size-4 shrink-0 text-brand-red" aria-hidden="true" />
        <span className="font-semibold text-brand-navy">Announcements</span>
        <span className="rounded-full bg-brand-red-light px-2 py-0.5 text-[11px] font-bold text-brand-red">
          {unreadCount} new
        </span>
        <ArrowRight
          className="ml-auto size-4 shrink-0 text-brand-text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      <UpcomingLiveClasses />

      <QuickActions />

      <AnnouncementsCard />
    </div>
  );
}
