import AnnouncementsCard from "@/components/student/dashboard/AnnouncementsCard";
import CurrentEnrollment from "@/components/student/dashboard/CurrentEnrollment";
import DashboardCalendar from "@/components/student/dashboard/DashboardCalendar";
import InfoCards from "@/components/student/dashboard/InfoCards";
import LearningProgress from "@/components/student/dashboard/LearningProgress";
import OfferLettersCard from "@/components/student/dashboard/OfferLettersCard";
import QuickActions from "@/components/student/dashboard/QuickActions";
import ShareExperienceCard from "@/components/student/dashboard/ShareExperienceCard";
import UpcomingLiveClasses from "@/components/student/dashboard/UpcomingLiveClasses";
import WelcomeBanner from "@/components/student/dashboard/WelcomeBanner";

export const metadata = {
  title: "Student Dashboard",
  description:
    "Your SPRINT learning dashboard — current course, cohort, progress, attendance, live classes and placements.",
  alternates: { canonical: "/student/dashboard" },
};

/**
 * Student Dashboard (UI pass).
 * Section order: welcome banner → calendar + info cards → progression →
 * live classes → quick actions → announcements row.
 * All values come from `src/data/student.js` mock data.
 */
export default function StudentDashboardPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <WelcomeBanner />

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6">
        <DashboardCalendar />
        <InfoCards />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <LearningProgress />
        <CurrentEnrollment />
      </div>

      <UpcomingLiveClasses />

      <QuickActions />

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <ShareExperienceCard />
        <OfferLettersCard />
        <AnnouncementsCard />
      </div>
    </div>
  );
}
