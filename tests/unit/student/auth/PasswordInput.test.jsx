import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AuthField from "@/components/student/auth/AuthField";
import PasswordInput from "@/components/student/auth/PasswordInput";

describe("PasswordInput", () => {
  const renderPassword = (props = {}) =>
    render(
      <PasswordInput
        id="student-password"
        label="New Password"
        value=""
        onChange={() => {}}
        {...props}
      />,
    );

  it("masks the value by default and reveals it from the toggle", async () => {
    const user = userEvent.setup();
    renderPassword();

    expect(screen.getByLabelText(/^new password/i)).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show New Password" }));
    expect(screen.getByLabelText(/^new password/i)).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide New Password" }));
    expect(screen.getByLabelText(/^new password/i)).toHaveAttribute("type", "password");
  });

  it("uses a non-submitting button with an aria-controls pointer to the field", () => {
    renderPassword();

    const toggle = screen.getByRole("button", { name: "Show New Password" });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-controls", "student-password");
    expect(toggle.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("reports the error to assistive tech instead of relying on colour", () => {
    renderPassword({
      value: "abc",
      error: "Please meet all password requirements listed below.",
    });

    const input = screen.getByLabelText(/^new password/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "student-password-error");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please meet all password requirements listed below.",
    );
  });

  it("marks the field valid again once the error clears", () => {
    const { rerender } = renderPassword({ value: "abc", error: "Too short." });
    rerender(
      <PasswordInput
        id="student-password"
        label="New Password"
        value="Sprint@2026"
        onChange={() => {}}
      />,
    );

    const input = screen.getByLabelText(/^new password/i);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("can hide the toggle entirely", () => {
    renderPassword({ showToggle: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("accepts a custom toggle label so two password fields stay distinguishable", () => {
    renderPassword({ toggleAriaLabel: "Show confirmation password" });
    expect(
      screen.getByRole("button", { name: "Show confirmation password" }),
    ).toBeInTheDocument();
  });
});

describe("AuthField", () => {
  it("wires the label, hint and error to the input", () => {
    render(
      <AuthField
        id="student-login-email"
        label="Email address"
        hint="Use your enrolment email."
        error="Please enter your email."
        required
        value=""
        onChange={() => {}}
      />,
    );

    const input = screen.getByLabelText(/email address/i);
    expect(input).toHaveAttribute("id", "student-login-email");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "student-login-email-hint student-login-email-error",
    );
    expect(screen.getByText("Use your enrolment email.")).toHaveAttribute(
      "id",
      "student-login-email-hint",
    );
    expect(screen.getByRole("alert")).toHaveAttribute("id", "student-login-email-error");
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("omits error wiring when the field is valid", () => {
    render(<AuthField id="student-login-email" label="Email address" value="" onChange={() => {}} />);

    const input = screen.getByLabelText(/email address/i);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
