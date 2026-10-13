import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser },
  }),
}));

import StudentLoginPage from "@/app/student/login/page";
import StudentForgotPasswordPage from "@/app/student/forgot-password/page";

describe("StudentLoginPage enrollment actions", () => {
  afterEach(() => {
    cleanup();
    getUser.mockClear();
  });

  it("sends both Enroll Now links to the enrollment page", () => {
    render(<StudentLoginPage />);

    const enrollLinks = screen.getAllByRole("link", { name: /enroll now/i });
    expect(enrollLinks).toHaveLength(2);
    enrollLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/student/enroll");
    });
  });

  it("does not render the removed account creation form", () => {
    render(<StudentLoginPage />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/last name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/mobile number/i)).not.toBeInTheDocument();
  });

  it("opens password recovery through the intercepted student route", () => {
    render(<StudentLoginPage isModal />);

    expect(
      screen.getByRole("link", { name: "Forgot Password?" }),
    ).toHaveAttribute("href", "/student/forgot-password");
  });

  it("renders password recovery in the route-modal layout", () => {
    const { container } = render(<StudentForgotPasswordPage isModal />);

    expect(container.querySelector("main")).not.toBeInTheDocument();
    expect(
      container.querySelector(".student-forgot-page--modal"),
    ).toBeInTheDocument();
  });
});
