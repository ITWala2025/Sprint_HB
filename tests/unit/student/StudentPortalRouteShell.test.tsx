import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { mockPathname } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => "/student/forgot-password"),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockPathname,
}));

import StudentPortalRouteShell from "@/components/student/StudentPortalRouteShell";

describe("StudentPortalRouteShell", () => {
  afterEach(() => {
    cleanup();
    mockPathname.mockReset();
    mockPathname.mockReturnValue("/student/forgot-password");
  });

  it.each([
    "/student/login",
    "/student/forgot-password",
    "/student/check-email",
    "/student/reset-password",
    "/student/password-reset-success",
    "/student/enroll",
  ])("opens the Student Portal modal from %s", (pathname) => {
    mockPathname.mockReturnValue(pathname);
    render(
      <StudentPortalRouteShell>
        <p>Student page</p>
      </StudentPortalRouteShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Student Portal" }));

    expect(
      screen.getByRole("dialog", { name: "Student Portal sign in" }),
    ).toBeInTheDocument();
  });

  it("does not duplicate the header launcher on portal pages", () => {
    mockPathname.mockReturnValue("/student/dashboard");

    render(
      <StudentPortalRouteShell>
        <p>Student dashboard</p>
      </StudentPortalRouteShell>,
    );

    expect(
      screen.queryByRole("button", { name: "Student Portal" }),
    ).not.toBeInTheDocument();
  });
});
