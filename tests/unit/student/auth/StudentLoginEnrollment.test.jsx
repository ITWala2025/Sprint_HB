import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  profileResult: { data: null, error: null },
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mocks.getUser,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve(mocks.profileResult),
        }),
      }),
    }),
  }),
}));

import StudentLoginPage from "@/app/student/login/page";
import StudentForgotPasswordPage from "@/app/student/forgot-password/page";

describe("StudentLoginPage enrollment actions", () => {
  afterEach(() => {
    cleanup();
    mocks.getUser.mockClear();
    mocks.signInWithPassword.mockReset();
    mocks.signOut.mockReset();
    mocks.profileResult = { data: null, error: null };
  });

  it("navigates directly to enrollment instead of opening its intercepted modal", () => {
    render(<StudentLoginPage />);

    const enrollLinks = screen.getAllByRole("link", { name: /enroll now/i });
    expect(enrollLinks).toHaveLength(2);
    enrollLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/student/enroll");
      expect(link.tagName).toBe("A");
    });
  });

  it("does not render the removed account creation form", () => {
    const { container } = render(<StudentLoginPage />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelector("main")).not.toBeInTheDocument();
    expect(
      container.querySelector(".student-login-page--modal"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/last name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/mobile number/i)).not.toBeInTheDocument();
  });

  it("explains that email verification does not set a password", () => {
    render(<StudentLoginPage />);

    expect(
      screen.getByText(/verification link only confirms your email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/use Forgot Password now/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/check your application status while it is under review/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Forgot Password?" }),
    ).toHaveAttribute("href", "/student/forgot-password");
  });

  it("explains what to do when a student profile is missing", async () => {
    const user = userEvent.setup();
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "student-user-id" } },
      error: null,
    });
    mocks.profileResult = { data: null, error: null };
    render(<StudentLoginPage />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "student@example.com",
    );
    await user.type(
      screen.getByLabelText(/^password/i),
      "ValidPass123!",
    );
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn't find your Student Portal profile/i,
    );
    expect(mocks.signOut).toHaveBeenCalled();
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
