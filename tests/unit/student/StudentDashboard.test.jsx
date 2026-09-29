import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudentDashboardPage from "@/app/student/(portal)/dashboard/page";
import StudentPortalLayout from "@/app/student/(portal)/layout";
import {
  mockAnnouncements,
  mockEnrollment,
  mockLearningProgress,
  mockMentors,
  mockQuickActions,
  mockStudent,
} from "@/data/student";

vi.mock("next/navigation", () => ({
  usePathname: () => "/student/dashboard",
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }) => <img src={src} alt={alt} {...rest} />,
}));

const now = new Date();
const monthLabel = `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(now)} ${now.getFullYear()}`;

const card = (heading) =>
  screen.getByRole("heading", { name: heading }).closest("section");

describe("Student dashboard", () => {
  it("greets the student from mock data with the motivational line", () => {
    render(<StudentDashboardPage />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: new RegExp(`welcome back, ${mockStudent.firstName}`, "i"),
    });

    expect(heading).toBeInTheDocument();
    expect(screen.getByText(mockStudent.greetingQuote)).toBeInTheDocument();
    expect(
      screen.getAllByText(mockStudent.program).length,
    ).toBeGreaterThanOrEqual(1);

    // Banner styling stays on the SPRINT design system.
    expect(heading.closest("section")).toHaveClass("bg-brand-navy", "rounded-3xl");
  });

  it("renders the calendar for the current month and highlights today", () => {
    render(<StudentDashboardPage />);

    expect(screen.getByText(monthLabel)).toBeInTheDocument();
    expect(screen.getByText("Class day")).toBeInTheDocument();

    const today = document.querySelector('[aria-current="date"]');
    expect(today).not.toBeNull();
    expect(today).toHaveTextContent(String(now.getDate()));
  });

  it("renders the four info cards", () => {
    render(<StudentDashboardPage />);

    expect(screen.getByText("Current Course")).toBeInTheDocument();
    expect(screen.getByText("Learning Status")).toBeInTheDocument();
    expect(screen.getByText("Mentors")).toBeInTheDocument();
    // "Cohort" also labels a chip in the welcome banner.
    expect(screen.getAllByText("Cohort").length).toBeGreaterThanOrEqual(2);

    expect(screen.getAllByText(mockEnrollment.courseTitle).length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText(mockLearningProgress.status).length,
    ).toBeGreaterThanOrEqual(1);
    mockMentors.forEach((mentor) => {
      expect(screen.getAllByText(new RegExp(mentor.name)).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders the learning progress chart and attendance counters inline", () => {
    render(<StudentDashboardPage />);

    const progress = within(card(/my learning progress/i));

    expect(progress.getByText(`${mockLearningProgress.completionPercent}%`)).toBeInTheDocument();
    expect(progress.getByText("Attended")).toBeInTheDocument();
    expect(progress.getByText(String(mockLearningProgress.attendedSessions))).toBeInTheDocument();
    expect(progress.getByText("Missed")).toBeInTheDocument();
    expect(progress.getByText(String(mockLearningProgress.missedSessions))).toBeInTheDocument();
    expect(progress.getByText("Total")).toBeInTheDocument();
    expect(progress.getByText(String(mockLearningProgress.totalSessions))).toBeInTheDocument();
    /* Attendance is no longer a portal section, so the card keeps no outbound link. */
    expect(progress.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders current enrollment details with a progress bar", () => {
    render(<StudentDashboardPage />);

    const enrollment = within(card(/current enrollment/i));

    expect(enrollment.getByText(mockEnrollment.courseTitle)).toBeInTheDocument();
    expect(enrollment.getByText(mockEnrollment.domain)).toBeInTheDocument();
    expect(enrollment.getByText(mockEnrollment.cohortName)).toBeInTheDocument();
    expect(
      enrollment.getByText(
        `${mockEnrollment.modulesPassed} of ${mockEnrollment.modulesTotal}`,
      ),
    ).toBeInTheDocument();

    expect(enrollment.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(mockEnrollment.progressPercent),
    );
    expect(
      enrollment.getByRole("link", { name: /view my course/i }),
    ).toHaveAttribute("href", "/student/my-course");
  });

  it("renders the upcoming live classes empty state", () => {
    render(<StudentDashboardPage />);

    expect(screen.getByText("Upcoming Live Classes")).toBeInTheDocument();
    expect(screen.getByText("No live classes scheduled yet")).toBeInTheDocument();
  });

  it("renders every quick action", () => {
    render(<StudentDashboardPage />);

    mockQuickActions.forEach((action) => {
      expect(screen.getByRole("link", { name: action.label })).toHaveAttribute(
        "href",
        action.href,
      );
    });
  });

  it("renders the bottom row of support cards with a notification badge", () => {
    render(<StudentDashboardPage />);

    const unread = mockAnnouncements.filter((item) => item.unread).length;

    expect(
      screen.getByRole("heading", { name: "Share Your Experience" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /share feedback/i })).toHaveAttribute(
      "href",
      "/contact",
    );

    expect(
      screen.getByRole("heading", { name: /offer letters/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Data Analyst Intern")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /announcements/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${unread} new`)).toBeInTheDocument();
    expect(screen.getByText(mockAnnouncements[0].title)).toBeInTheDocument();
  });

  it("keeps Dashboard highlighted in the portal sidebar layout", () => {
    render(
      <StudentPortalLayout>
        <StudentDashboardPage />
      </StudentPortalLayout>,
    );

    const activeLinks = screen.getAllByRole("link", { current: "page" });
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0]).toHaveTextContent(/dashboard/i);
  });
});
