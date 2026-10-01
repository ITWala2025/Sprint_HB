import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudentDashboardPage from "@/app/student/(portal)/dashboard/page";
import StudentPortalLayout from "@/app/student/(portal)/layout";
import {
  mockAnnouncements,
  mockLearningProgress,
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

describe("Student dashboard", () => {
  it("pairs the welcome heading with progress and cohort dates in the hero", () => {
    render(<StudentDashboardPage />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: new RegExp(`welcome back, ${mockStudent.firstName}`, "i"),
    });

    expect(heading).toBeInTheDocument();
    const hero = heading.closest("section");
    expect(hero).toHaveClass("bg-brand-navy", "rounded-2xl");
    expect(
      within(hero).getByRole("heading", { name: /my learning progress/i }),
    ).toBeInTheDocument();
    expect(
      within(hero).getByRole("img", {
        name: `${mockLearningProgress.completionPercent} percent learning progress`,
      }),
    ).toBeInTheDocument();
    expect(
      within(hero).getByText(mockLearningProgress.status),
    ).toBeInTheDocument();
    expect(
      within(hero).getByText(/Cohort: 1 Jul 2026 – 15 Jan 2027/),
    ).toBeInTheDocument();
    expect(
      within(hero).queryByText(mockStudent.greetingQuote),
    ).not.toBeInTheDocument();
    expect(within(hero).queryByText("Student Portal")).not.toBeInTheDocument();
    expect(
      within(hero).queryByText(mockStudent.program),
    ).not.toBeInTheDocument();
  });

  it("removes the calendar, info cards, enrollment, feedback, and offer letters", () => {
    render(<StudentDashboardPage />);

    [
      /current course/i,
      /learning status/i,
      /mentors/i,
      /current enrollment/i,
      /share your experience/i,
      /offer letters/i,
    ].forEach((name) => {
      expect(screen.queryByRole("heading", { name })).not.toBeInTheDocument();
    });
    expect(screen.queryByText("Class day")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /share feedback/i }),
    ).not.toBeInTheDocument();
  });

  it("orders the announcement shortcut, classes, quick actions, then the full announcements", () => {
    render(<StudentDashboardPage />);

    const hero = screen.getByRole("heading", { level: 1 }).closest("section");
    const shortcut = screen.getByRole("link", {
      name: /announcements.*2 new/i,
    });
    const classes = screen
      .getByRole("heading", { name: /upcoming live classes/i })
      .closest("section");
    const quickActions = screen
      .getByRole("heading", { name: /quick actions/i })
      .closest("section");
    const announcements = screen
      .getByRole("heading", { name: /^announcements/i })
      .closest("section");

    expect(Array.from(hero.parentElement.children)).toEqual([
      hero,
      shortcut,
      classes,
      quickActions,
      announcements,
    ]);
    expect(shortcut).toHaveAttribute("href", "#dashboard-announcements");
    expect(announcements).toHaveAttribute("id", "dashboard-announcements");
  });

  it("shows only the requested progress details in the hero", () => {
    render(<StudentDashboardPage />);

    const progress = screen
      .getByRole("heading", { name: /my learning progress/i })
      .closest("section");

    expect(
      within(progress).getByRole("img", {
        name: `${mockLearningProgress.completionPercent} percent learning progress`,
      }),
    ).toBeInTheDocument();
    expect(
      within(progress).getByText(mockLearningProgress.status),
    ).toBeInTheDocument();
    expect(within(progress).getByText(/Cohort:/)).toBeInTheDocument();
    expect(within(progress).queryByText("Attended")).not.toBeInTheDocument();
    expect(within(progress).queryByText("Missed")).not.toBeInTheDocument();
  });

  it("renders the upcoming live classes empty state", () => {
    render(<StudentDashboardPage />);

    expect(screen.getByText("Upcoming Live Classes")).toBeInTheDocument();
    expect(
      screen.getByText("No live classes scheduled yet"),
    ).toBeInTheDocument();
  });

  it("renders every quick action", () => {
    render(<StudentDashboardPage />);

    mockQuickActions.forEach((action) => {
      expect(screen.getByRole("link", { name: action.label })).toHaveAttribute(
        "href",
        action.href,
      );
    });
    expect(
      screen.getByRole("heading", { name: /quick actions/i }),
    ).toBeInTheDocument();
  });

  it("renders compact announcement rows and the live unread count", () => {
    render(<StudentDashboardPage />);

    const unread = mockAnnouncements.filter((item) => item.unread).length;
    const announcements = screen
      .getByRole("heading", { name: /^announcements/i })
      .closest("section");

    expect(
      screen.getByRole("link", {
        name: new RegExp(`announcements ${unread} new`, "i"),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^announcements/i }),
    ).toBeInTheDocument();
    expect(
      within(announcements).getByText(`${unread} new`),
    ).toBeInTheDocument();
    mockAnnouncements.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.body)).toBeInTheDocument();
      expect(screen.getByText(item.tag)).toBeInTheDocument();
    });
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
