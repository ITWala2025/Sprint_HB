import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PersonalInformationStep from "@/components/student/enrollment/steps/PersonalInformationStep";

describe("PersonalInformationStep", () => {
  const renderStep = (props = {}) =>
    render(
      <PersonalInformationStep
        idPrefix="personal"
        values={{}}
        errors={{}}
        onChange={() => () => {}}
        {...props}
      />,
    );

  it("renders the three labelled fields every enrollment file needs", () => {
    renderStep();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
  });

  it("marks every field as required with a readable hint", () => {
    renderStep();

    ["full name", "email address", "mobile number"].forEach((label) => {
      expect(screen.getByLabelText(new RegExp(`^${label}`, "i"))).toBeRequired();
    });

    const asterisks = screen.getAllByText("*");
    expect(asterisks).toHaveLength(3);
    asterisks.forEach((mark) => expect(mark).toHaveAttribute("aria-hidden", "true"));

    expect(screen.getByText(/all three fields are required/i)).toBeInTheDocument();
  });

  it("derives every field id from the step id prefix", () => {
    renderStep();

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("id", "personal-name");
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("id", "personal-email");
    expect(screen.getByLabelText(/mobile number/i)).toHaveAttribute("id", "personal-phone");
  });

  it("uses the mobile-friendly input types and autocomplete tokens", () => {
    renderStep();

    const email = screen.getByLabelText(/email address/i);
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("inputmode", "email");
    expect(email).toHaveAttribute("autocomplete", "email");

    const phone = screen.getByLabelText(/mobile number/i);
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("inputmode", "tel");
    expect(phone).toHaveAttribute("autocomplete", "tel");
    expect(phone).toHaveAttribute("maxlength", "16");

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("autocomplete", "name");
  });

  it("links each hint to its input so screen readers read it with the field", () => {
    renderStep();

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute(
      "aria-describedby",
      "personal-name-hint",
    );
    expect(screen.getByText(/certificate/i)).toHaveAttribute("id", "personal-name-hint");
    expect(screen.getByText(/login link arrive here/i)).toHaveAttribute(
      "id",
      "personal-email-hint",
    );
  });

  it("renders the wizard's values and reports edits by field name", () => {
    const changes = [];
    renderStep({
      values: { name: "Ananya Sharma", email: "", phone: "" },
      onChange: (field) => (event) => changes.push([field, event.target.value]),
    });

    expect(screen.getByLabelText(/full name/i)).toHaveValue("Ananya Sharma");

    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: "98765 43210" },
    });

    expect(changes).toEqual([["phone", "98765 43210"]]);
  });

  it("surfaces a validation message as an inline alert on the field", () => {
    renderStep({
      errors: { name: "Please enter your full name.", phone: "Please enter a valid 10-digit mobile number." },
    });

    const name = screen.getByLabelText(/full name/i);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAttribute("aria-describedby", "personal-name-hint personal-name-error");

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Please enter your full name.");
    expect(alerts[1]).toHaveTextContent("Please enter a valid 10-digit mobile number.");
  });
});
