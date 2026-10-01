import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StudentLayout from "@/components/student/StudentLayout";

const mockPathname = vi.fn(() => "/student/dashboard");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

const openDrawerButton = () =>
  screen.getByRole("button", { name: /open student portal navigation/i });

const drawerPanel = () => document.getElementById("student-sidebar-drawer");

describe("StudentLayout", () => {
  beforeEach(() => {
    /* jsdom has no matchMedia; the layout uses it to auto-close the drawer. */
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("wraps page content with the collapsible portal sidebar", () => {
    render(
      <StudentLayout>
        <p>Dashboard content</p>
      </StudentLayout>,
    );

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /student portal navigation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
  });

  it("hides the redundant portal label on the dashboard but keeps it on other pages", () => {
    const { rerender } = render(
      <StudentLayout>
        <p>Dashboard content</p>
      </StudentLayout>,
    );

    expect(
      screen.queryByText("Student Portal", { selector: "p" }),
    ).not.toBeInTheDocument();

    mockPathname.mockReturnValue("/student/profile");
    rerender(
      <StudentLayout>
        <p>Profile content</p>
      </StudentLayout>,
    );

    expect(
      screen.getByText("Student Portal", { selector: "p" }),
    ).toBeInTheDocument();
  });

  it("opens the mobile drawer from the portal bar and closes it with the X", async () => {
    const user = userEvent.setup();
    render(
      <StudentLayout>
        <p>Dashboard content</p>
      </StudentLayout>,
    );

    expect(openDrawerButton()).toHaveAttribute("aria-expanded", "false");
    expect(drawerPanel()).toBeNull();

    await user.click(openDrawerButton());
    expect(openDrawerButton()).toHaveAttribute("aria-expanded", "true");
    expect(drawerPanel()).not.toBeNull();

    await user.click(
      screen.getByRole("button", { name: /close student portal navigation/i }),
    );
    expect(drawerPanel()).toBeNull();
    expect(openDrawerButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the drawer with the Escape key", async () => {
    const user = userEvent.setup();
    render(
      <StudentLayout>
        <p>Dashboard content</p>
      </StudentLayout>,
    );

    await user.click(openDrawerButton());
    expect(drawerPanel()).not.toBeNull();

    await user.keyboard("{Escape}");
    expect(drawerPanel()).toBeNull();
  });

  it("closes the drawer when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(
      <StudentLayout>
        <p>Dashboard content</p>
      </StudentLayout>,
    );

    await user.click(openDrawerButton());
    const backdrop = screen.getByTestId("student-drawer-backdrop");

    await user.click(backdrop);
    expect(drawerPanel()).toBeNull();
  });

  it("locks page scroll only while the drawer is open", async () => {
    const user = userEvent.setup();
    render(
      <StudentLayout>
        <p>Dashboard content</p>
      </StudentLayout>,
    );

    await user.click(openDrawerButton());
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });
});
