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
      dob: "2004-06-15",
      country: "India",
      state: "Karnataka",
      phone: "9876543210",
    },
    education: {},
    account: {},
  };

  const renderPanel = (props = {}) =>
    render(
      <EnrollmentSuccessPanel
        headingId="enrollment-success-heading"
        values={values}
        onReviewDetails={vi.fn()}
        {...props}
      />,
    );

  it("heads the panel as the end of the wizard", () => {
    renderPanel();

    expect(screen.getByText("Enrollment complete")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Your enrollment details are ready" }),
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
        personal: { firstName: "Ananya", lastName: "", email: "", dob: "", country: "India", state: "", phone: "" },
      },
    });

    expect(screen.queryByText("Last name")).not.toBeInTheDocument();
    expect(screen.queryByText("Email address")).not.toBeInTheDocument();
    expect(screen.queryByText("Phone number")).not.toBeInTheDocument();
  });

  it("stays honest about the mock submission", () => {
    renderPanel();

    expect(screen.getByText(/nothing has been submitted/i)).toBeInTheDocument();
  });

  it("offers a way back into the wizard and back to the site", async () => {
    const user = userEvent.setup();
    const onReviewDetails = vi.fn();
    renderPanel({ onReviewDetails });

    expect(screen.getByRole("link", { name: /back to the homepage/i })).toHaveAttribute(
      "href",
      "/home",
    );

    await user.click(screen.getByRole("button", { name: /review my details/i }));
    expect(onReviewDetails).toHaveBeenCalledTimes(1);
  });
});
