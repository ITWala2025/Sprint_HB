/**
 * Student Portal — mock data for the UI-only dashboard pass.
 *
 * Every export is prefixed `mock` on purpose: when real authentication and
 * Supabase data are wired in (separate task, scoped to /student/*), replace
 * these constants with the authenticated student's records. Nothing else in
 * the dashboard components needs to change — they only read these shapes.
 */

export const mockStudent = {
  id: "SPR-2026-0148",
  firstName: "Ananya",
  fullName: "Ananya Sharma",
  initials: "AS",
  email: "ananya.sharma@example.com",
  phone: "+91 90000 00000",
  city: "Hazaribagh, Jharkhand",
  program: "Agentic AI & Cloud Engineering",
  cohort: "AI Engineering — Batch 07",
  joinedOn: "2026-04-12",
  greetingQuote:
    "Consistency beats intensity — one module a week is still a career in motion.",
};

export const mockEnrollment = {
  courseTitle: "Agentic AI & Cloud Engineering",
  domain: "Artificial Intelligence",
  cohortName: "AI Engineering — Batch 07",
  cohortStart: "2026-07-01",
  cohortEnd: "2027-01-15",
  mentorName: "Rahul Verma",
  modulesPassed: 6,
  modulesTotal: 10,
  progressPercent: 62,
  nextMilestone: "Capstone project review",
  mode: "Hybrid — Hazaribagh campus + live online",
};

export const mockLearningProgress = {
  completionPercent: 68,
  status: "On track",
  statusTone: "positive",
  attendedSessions: 24,
  missedSessions: 3,
  totalSessions: 27,
  streakDays: 12,
  lastUpdated: "2026-09-26",
};

export const mockMentors = [
  { id: "mentor-1", name: "Rahul Verma", expertise: "Cloud & DevOps" },
  { id: "mentor-2", name: "Priya Nair", expertise: "Applied AI" },
];

/* Day-of-month markers so the calendar widget keeps working in any month. */
export const mockCalendar = {
  classDays: [4, 11, 18, 25],
  holidayDays: [2],
};

/* Intentionally empty: renders the empty state until sessions are scheduled. */
export const mockUpcomingClasses = [];

export const mockAnnouncements = [
  {
    id: "ann-1",
    title: "Capstone review slots are live",
    body: "Book your slot with your mentor before 30 September.",
    date: "2026-09-26",
    tag: "Academics",
    unread: true,
  },
  {
    id: "ann-2",
    title: "Cloud lab credits topped up",
    body: "Each learner has fresh sandbox hours for the DevOps module.",
    date: "2026-09-22",
    tag: "Labs",
    unread: true,
  },
  {
    id: "ann-3",
    title: "Placement drive — 12 partner companies",
    body: "Registration opens next week for the October hiring cycle.",
    date: "2026-09-18",
    tag: "Placements",
    unread: false,
  },
];

export const mockOfferLetters = [
  {
    id: "offer-1",
    company: "Tessellation Technologies",
    role: "Data Analyst Intern",
    stipend: "₹18,000 / month",
    issuedOn: "2026-09-20",
    status: "Pending acceptance",
  },
];

export const mockQuickActions = [
  { id: "qa-assignments", label: "View Assignments", href: "/student/assignments" },
  { id: "qa-resources", label: "View Resources", href: "/student/resources" },
  { id: "qa-result", label: "View Result", href: "/student/result" },
  { id: "qa-certificates", label: "My Certificates", href: "/student/certificates" },
];
