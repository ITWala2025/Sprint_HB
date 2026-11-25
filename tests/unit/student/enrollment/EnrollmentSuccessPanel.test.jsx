import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import EnrollmentSuccessPanel from "@/components/student/enrollment/EnrollmentSuccessPanel";

describe("EnrollmentSuccessPanel", () => {
  const values = {
    personal: {
      firstName: "Ananya",
      lastName: "Sharma",
      email: "ananya@sprint.co.in",
      city: "Ranchi",
      dob: "2004-06-15",
      country: "India",
      state: "Karnataka",
      phone: "9876543210",
    },
    education: {},
    password: {},
  };

  const renderPanel = (props = {}) =>
    render(
      <EnrollmentSuccessPanel
        headingId="enrollment-success-heading"
        values={values}
        {...props}
      />,
    );

  it("heads the panel as the end of the wizard", () => {
    renderPanel();

    expect(screen.getByText("Registration complete")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Your registration is complete" }),
    ).toHaveAttribute("id", "enrollment-success-heading");
  });

  it("echoes back what the wizard collected from the other steps", () => {
    renderPanel();

    expect(screen.getByText("First name")).toBeInTheDocument();
    expect(screen.getByText("Ananya")).toBeInTheDocument();
    expect(screen.getByText("Sharma")).toBeInTheDocument();
    expect(screen.getByText("ananya@sprint.co.in")).toBeInTheDocument();
    expect(screen.getByText("2004-06-15")).toBeInTheDocument();
    expect(screen.getByText("India")).toBeInTheDocument();
    expect(screen.getByText("Karnataka")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
  });

  it("skips rows the student has not filled in", () => {
    renderPanel({
      values: {
        ...values,
        personal: {
          firstName: "Ananya",
          lastName: "",
          email: "",
          dob: "",
          city: "",
          country: "India",
          state: "",
          phone: "",
        },
      },
    });

    expect(screen.queryByText("Last name")).not.toBeInTheDocument();
    expect(screen.queryByText("Email address")).not.toBeInTheDocument();
    expect(screen.queryByText("Phone number")).not.toBeInTheDocument();
  });

  it("distinguishes a registration-only submission from a course enrollment", () => {
    renderPanel();

    expect(
      screen.getByText(/your registration has been saved/i),
    ).toBeInTheDocument();
  });

  it("confirms course enrollment and offers an explicit dashboard action", () => {
    renderPanel({ hasCourseEnrollment: true });

    expect(
      screen.getByText(/registration and course enrollment have been submitted/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/password is set/i)).toHaveTextContent(
      "ananya@sprint.co.in",
    );
  });

  it("offers a manual course continuation when a next path is present", () => {
    renderPanel({ nextPath: "/courses/data-science" });

    expect(
      screen.getByRole("button", { name: /continue to course/i }),
    ).toBeInTheDocument();
  });

  it("waits for an explicit button action before continuing", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    renderPanel({ onContinue });
    expect(onContinue).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /go to dashboard/i }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("renders the application ID in SPR-APP-YYMM-XXXX format and does not leak UUID", () => {
    const { container } = renderPanel({ applicationId: "SPR-APP-2611-0012" });

    expect(screen.getByText("Application ID")).toBeInTheDocument();
    expect(screen.getByText("SPR-APP-2611-0012")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });
});
