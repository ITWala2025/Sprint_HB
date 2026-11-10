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

  it("links to enrollment as a regular student route", () => {
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
    expect(container.querySelector("main.student-login-page")).toBeInTheDocument();
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/last name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/mobile number/i)).not.toBeInTheDocument();
  });

  it("shows a motivational quote and links to password recovery", () => {
    render(<StudentLoginPage />);

    expect(
      screen.getByText(/your dedication today is the foundation/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/six-digit code confirms your email/i)).toBeNull();
    expect(
      screen.getByRole("link", { name: "Forgot Password?" }),
    ).toHaveAttribute("href", "/student/forgot-password");
  });

  it("accepts the enrollment email and password for an active student profile", async () => {
    const user = userEvent.setup();
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "student-user-id" } },
      error: null,
    });
    mocks.profileResult = {
      data: { role: "student", status: "active" },
      error: null,
    };
    render(<StudentLoginPage />);

    await user.type(screen.getByLabelText(/email address/i), "student@example.com");
    await user.type(screen.getByLabelText(/^password/i), "ValidPass123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "student@example.com",
      password: "ValidPass123!",
    });
    expect(await screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mocks.signOut).not.toHaveBeenCalled();
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

  it("links to password recovery as a regular student route", () => {
    render(<StudentLoginPage />);

    expect(
      screen.getByRole("link", { name: "Forgot Password?" }),
    ).toHaveAttribute("href", "/student/forgot-password");
  });

  it("renders password recovery as regular page content", () => {
    const { container } = render(<StudentForgotPasswordPage />);

    expect(container.querySelector("main.student-forgot-page")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
