import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardBento from "@/components/student/dashboard/DashboardBento";
import {
  filterAssessmentsByCourseAccess,
  filterLiveClassesByCourseAccess,
} from "@/lib/student-assessment-access";

const dashboardProps = {
  student: { firstName: "Ananya" },
  enrollment: { courseTitle: "AI Engineering" },
  progress: { completionPercent: 68, status: "On track" },
  activeCourseCount: 2,
  pendingAssignments: [
    {
      id: "assessment-1",
      title: "Build a portfolio project",
      course_name: "AI Engineering",
      week_label: "Week 4",
      due_date: "2026-11-25",
    },
  ],
  pendingAssignmentCount: 1,
  certificateCount: 0,
  applications: [
    {
      id: "application-1",
      courseTitle: "Cloud Engineering",
      status: "pending",
      createdAt: "2026-11-10",
    },
  ],
  liveClasses: [
    {
      id: "class-1",
      title: "Prompt Engineering Workshop",
      course_name: "AI Engineering",
      mentor_name: "Riya Mentor",
      scheduled_at: "2026-11-25T09:30:00.000Z",
      platform: "Google Meet",
      meeting_url: "https://meet.google.com/example",
    },
  ],
  announcements: [
    {
      id: "announcement-1",
      title: "Schedule update",
      body: "The next workshop has moved to Wednesday.",
      tag: "ANNOUNCEMENT",
      date: "2026-11-18",
    },
  ],
  profileCompletion: 50,
  hasApplicationsOrEnrollments: true,
};

describe("Student dashboard", () => {
  it("limits assessment visibility to enrolled course IDs or normalized course names", () => {
    const assessments = [
      { id: "by-id", course_id: "course-1", course_name: "Different display name" },
      { id: "by-name", course_name: "  Cloud Engineering " },
      { id: "unrelated", course_id: "course-2", course_name: "Data Science" },
    ];
    const access = {
      courseIds: new Set(["course-1"]),
      courseNames: new Set(["cloud engineering"]),
    };

    expect(filterAssessmentsByCourseAccess(assessments, access).map((item) => item.id)).toEqual([
      "by-id",
      "by-name",
    ]);
    expect(filterAssessmentsByCourseAccess(assessments, {
      courseIds: new Set(),
      courseNames: new Set(),
    })).toEqual([]);
  });

  it("limits live class visibility to normalized enrolled course names", () => {
    const liveClasses = [
      { id: "enrolled", course_name: "  AI Engineering " },
      { id: "unrelated", course_name: "Cloud Engineering" },
    ];
    const access = {
      courseIds: new Set(),
      courseNames: new Set(["ai engineering"]),
    };

    expect(filterLiveClassesByCourseAccess(liveClasses, access).map((item) => item.id)).toEqual([
      "enrolled",
    ]);
    expect(filterLiveClassesByCourseAccess(liveClasses, {
      courseIds: new Set(),
      courseNames: new Set(),
    })).toEqual([]);
  });

  it("renders the welcome banner and four KPI cards", () => {
    render(<DashboardBento {...dashboardProps} />);

    expect(screen.getByRole("heading", { name: "Welcome back, Ananya" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse courses/i })).toHaveAttribute(
      "href",
      "/student/apply-course",
    );
    expect(screen.getAllByText("68%")).toHaveLength(2);

    const stats = screen.getByRole("region", { name: "Student overview" });
    expect(within(stats).getByText("Active Courses")).toBeInTheDocument();
    expect(within(stats).getByText("2")).toBeInTheDocument();
    expect(within(stats).getByText("Pending Assignments")).toBeInTheDocument();
    expect(within(stats).getByText("Overall Progress")).toBeInTheDocument();
    expect(within(stats).getByText("Certificates")).toBeInTheDocument();
  });

  it("shows a profile completion card at 50% and hides it when complete", () => {
    const { rerender } = render(<DashboardBento {...dashboardProps} />);

    expect(screen.getByRole("heading", { name: "Complete Your Profile" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Profile completion" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    expect(screen.getByRole("link", { name: /complete profile/i })).toHaveAttribute(
      "href",
      "/student/profile",
    );

    rerender(<DashboardBento {...dashboardProps} profileCompletion={100} />);
    expect(screen.queryByRole("heading", { name: "Complete Your Profile" })).not.toBeInTheDocument();
  });

  it("welcomes students to SPRINT when they have no applications or enrollments", () => {
    render(
      <DashboardBento
        {...dashboardProps}
        hasApplicationsOrEnrollments={false}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Welcome to SPRINT, Ananya!" }),
    ).toBeInTheDocument();
  });

  it("switches between pending assignments and course applications", () => {
    render(<DashboardBento {...dashboardProps} />);

    expect(screen.getByText("Build a portfolio project")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "My Course Applications" }));

    expect(screen.getByText("Cloud Engineering")).toBeInTheDocument();
    expect(screen.queryByText("Build a portfolio project")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/student/apply-course",
    );
  });

  it("renders live class details, an IST label, and a direct join link", () => {
    render(<DashboardBento {...dashboardProps} />);

    expect(screen.getByText("Prompt Engineering Workshop")).toBeInTheDocument();
    expect(screen.getByText("Google Meet")).toBeInTheDocument();
    const joinLink = screen.getByRole("link", { name: /join class/i });
    expect(joinLink).toHaveAttribute("href", "https://meet.google.com/example");
    expect(joinLink).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/IST/)).toBeInTheDocument();
  });

  it("renders one unified announcements card and four quick actions", () => {
    render(<DashboardBento {...dashboardProps} />);

    expect(screen.getAllByRole("heading", { name: "Announcements" })).toHaveLength(1);
    expect(screen.getByText("Schedule update")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick Actions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /assignments/i })).toHaveAttribute(
      "href",
      "/student/assignments",
    );
    expect(screen.getByRole("link", { name: /resources/i })).toHaveAttribute(
      "href",
      "/student/resources",
    );
    expect(screen.getByRole("link", { name: /results/i })).toHaveAttribute(
      "href",
      "/student/result",
    );
    expect(screen.getByRole("link", { name: /certificates/i })).toHaveAttribute(
      "href",
      "/student/certificates",
    );
  });
});
