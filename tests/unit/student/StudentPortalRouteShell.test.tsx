import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { mockPathname, back, replace } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => "/student/forgot-password"),
  back: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockPathname,
  useRouter: () => ({ back, replace }),
}));

import StudentPortalRouteShell from "@/components/student/StudentPortalRouteShell";

describe("StudentPortalRouteShell", () => {
  afterEach(() => {
    cleanup();
    mockPathname.mockReset();
    mockPathname.mockReturnValue("/student/forgot-password");
    back.mockReset();
    replace.mockReset();
  });

  it.each([
    ["/student/login", "Student Portal"],
    ["/student/forgot-password", "Reset your password"],
    ["/student/check-email", "Check your email"],
    ["/student/reset-password", "Create a new password"],
    ["/student/password-reset-success", "Password updated"],
    ["/student/enroll", "Student enrollment"],
    ["/student/dashboard", "Student dashboard"],
  ])("renders %s in a modal on a direct route load", (pathname, title) => {
    mockPathname.mockReturnValue(pathname);
    render(
      <StudentPortalRouteShell>
        <p>Student page</p>
      </StudentPortalRouteShell>,
    );

    expect(screen.getByRole("dialog", { name: title })).toHaveTextContent(
      "Student page",
    );
  });

  it("returns a directly loaded student modal to home when closed", () => {
    mockPathname.mockReturnValue("/student/login");
    render(
      <StudentPortalRouteShell>
        <p>Student page</p>
      </StudentPortalRouteShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close student page" }));

    expect(replace).toHaveBeenCalledWith("/home");
    expect(back).not.toHaveBeenCalled();
  });
});
