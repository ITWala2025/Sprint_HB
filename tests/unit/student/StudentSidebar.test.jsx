import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import StudentSidebar from "@/components/student/StudentSidebar";
import navigation from "@/config/student-navigation.json";
import { mockStudent } from "@/data/student";

const mockPathname = vi.fn(() => "/student/dashboard");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

const getNav = () =>
  screen.getByRole("navigation", { name: /student portal navigation/i });

describe("StudentSidebar", () => {
  it("renders every portal nav item from the shared config", () => {
    render(<StudentSidebar />);

    const nav = getNav();
    expect(nav.querySelectorAll("a")).toHaveLength(navigation.length);

    navigation.forEach((item) => {
      expect(
        within(nav).getByRole("link", { name: new RegExp(item.label, "i") }),
      ).toHaveAttribute("href", item.href);
    });
  });

  it("shows the eight agreed sections in the agreed order", () => {
    render(<StudentSidebar />);

    const expectedLabels = [
      "Dashboard",
      "Profile",
      "Apply Courses",
      "My Course",
      "Assignment",
      "Certificate",
      "Result",
      "Help & Support",
    ];

    /* The JSON config is the single source of truth for the rail. */
    expect(navigation.map((item) => item.label)).toEqual(expectedLabels);

    const nav = getNav();
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(navigation.map((item) => item.href));
  });

  it("does not show the redundant Student Portal eyebrow", () => {
    render(<StudentSidebar />);

    expect(screen.queryByText("Student Portal")).not.toBeInTheDocument();
  });

  it("drops the sections that are no longer part of the portal", () => {
    render(<StudentSidebar />);

    const nav = getNav();
    [
      "Applications",
      "Exams",
      "Cohort",
      "Attendance",
      "Permissions",
      "Placements",
    ].forEach((label) => {
      expect(
        within(nav).queryByRole("link", { name: new RegExp(label, "i") }),
      ).not.toBeInTheDocument();
    });
  });

  it("marks Dashboard as the current page by default", () => {
    render(<StudentSidebar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(1);
  });

  it("derives the active item from the current pathname", () => {
    mockPathname.mockReturnValueOnce("/student/certificates");
    render(<StudentSidebar />);

    expect(screen.getByRole("link", { name: /certificate/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("collapses to icon-only and expands again from the toggle", async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();

    const { rerender } = render(
      <StudentSidebar onToggleCollapse={onToggleCollapse} />,
    );

    const collapseButton = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    await user.click(collapseButton);
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);

    rerender(<StudentSidebar collapsed onToggleCollapse={onToggleCollapse} />);

    const expandButton = screen.getByRole("button", {
      name: /expand sidebar/i,
    });
    expect(expandButton).toHaveAttribute("aria-expanded", "false");

    // Labels stay available to assistive tech, the visual heading is gone.
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Student Portal")).not.toBeInTheDocument();
    // The collapsed badge is dropped to keep the rail 76px wide.
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("shows the signed-in student identity block", () => {
    render(<StudentSidebar />);

    expect(screen.getByText(mockStudent.fullName)).toBeInTheDocument();
    expect(screen.getByText(mockStudent.id)).toBeInTheDocument();
    expect(screen.getByText(mockStudent.initials)).toBeInTheDocument();
  });
});
