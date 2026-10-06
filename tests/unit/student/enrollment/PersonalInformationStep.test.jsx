import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PersonalInformationStep from "@/components/student/enrollment/steps/PersonalInformationStep";

const FIELD_IDS = [
  "personal-firstName",
  "personal-lastName",
  "personal-email",
  "personal-dob",
  "personal-country",
  "personal-state",
  "personal-phone",
];

const FIELD_LABELS = [
  /^first name/i,
  /^last name/i,
  /email address/i,
  /date of birth/i,
  /^country/i,
  /^state/i,
  /phone number/i,
];

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

  it("renders the seven labelled fields in the agreed order", () => {
    renderStep();

    FIELD_LABELS.forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });

    // The two-column grid holds exactly those fields, in that order — the
    // phone lands alone in the left column of the last row.
    const grid = screen.getByLabelText(/^first name/i).closest(".grid");
    const ids = [...grid.children].map((cell) => cell.querySelector("input, select")?.id);
    expect(ids).toEqual(FIELD_IDS);
  });

  it("drops Full Name, Gender and City", () => {
    renderStep();

    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/gender/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^city/i)).not.toBeInTheDocument();
  });

  it("lays the fields out as a two-column grid that collapses to one column on mobile", () => {
    renderStep();

    const grid = screen.getByLabelText(/^first name/i).closest(".grid");
    expect(grid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "gap-x-6", "gap-y-5");
  });

  it("marks every field as required with a readable hint", () => {
    renderStep();

    FIELD_LABELS.forEach((label) => {
      expect(screen.getByLabelText(label)).toBeRequired();
    });

    const asterisks = screen.getAllByText("*");
    expect(asterisks).toHaveLength(7);
    asterisks.forEach((mark) => expect(mark).toHaveAttribute("aria-hidden", "true"));

    expect(screen.getByText(/all seven fields are required/i)).toBeInTheDocument();
  });

  it("derives every field id from the step id prefix", () => {
    renderStep();

    FIELD_IDS.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
  });

  it("uses the mobile-friendly input types and autocomplete tokens", () => {
    renderStep();

    const email = screen.getByLabelText(/email address/i);
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("inputmode", "email");
    expect(email).toHaveAttribute("autocomplete", "email");

    const dob = screen.getByLabelText(/date of birth/i);
    expect(dob).toHaveAttribute("type", "date");
    expect(dob).toHaveAttribute("autocomplete", "bday");

    const phone = screen.getByLabelText(/phone number/i);
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("inputmode", "tel");
    expect(phone).toHaveAttribute("autocomplete", "tel");

    expect(screen.getByLabelText(/^first name/i)).toHaveAttribute("autocomplete", "given-name");
    expect(screen.getByLabelText(/^last name/i)).toHaveAttribute("autocomplete", "family-name");
    expect(screen.getByLabelText(/^country/i)).toHaveAttribute("autocomplete", "country-name");
    expect(screen.getByLabelText(/^state/i)).toHaveAttribute("autocomplete", "address-level1");
  });

  it("keeps the native date input without rendering the custom calendar icon", () => {
    renderStep();

    const dob = screen.getByLabelText(/date of birth/i);
    expect(dob).toHaveAttribute("type", "date");
    expect(dob).toHaveClass("pl-4");
    expect(dob.closest(".relative.mt-2").querySelector("svg.lucide-calendar-days")).toBeNull();
  });

  it("shows the +91 prefix box next to the phone input", () => {
    renderStep();

    expect(screen.getByText("+91")).toBeInTheDocument();
    const phone = screen.getByLabelText(/phone number/i);
    // The prefix sits in the same row as the input it labels.
    expect(phone.closest(".flex")).toContainElement(screen.getByText("+91"));
  });

  it("keeps the phone icon inside the number input, clear of the +91 prefix", () => {
    renderStep();

    const phone = screen.getByLabelText(/phone number/i);
    const field = phone.closest(".relative.mt-2");

    expect(field.querySelectorAll("svg.lucide-phone")).toHaveLength(1);
    expect(phone.parentElement).toContainElement(field.querySelector("svg.lucide-phone"));
  });

  it("links each hint to its input so screen readers read it with the field", () => {
    renderStep();

    expect(screen.getByLabelText(/^first name/i)).toHaveAttribute(
      "aria-describedby",
      "personal-firstName-hint",
    );
    expect(screen.getByText(/certificate/i)).toHaveAttribute("id", "personal-firstName-hint");
    expect(screen.getByText(/login link arrive here/i)).toHaveAttribute(
      "id",
      "personal-email-hint",
    );
  });

  it("renders the wizard's values and reports edits by field name", () => {
    const changes = [];
    renderStep({
      values: { firstName: "Ananya", lastName: "", email: "", dob: "2004-06-15" },
      onChange: (field) => (event) => changes.push([field, event.target.value]),
    });

    expect(screen.getByLabelText(/^first name/i)).toHaveValue("Ananya");
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue("2004-06-15");

    fireEvent.change(screen.getByLabelText(/^last name/i), {
      target: { value: "Sharma" },
    });

    expect(changes).toEqual([["lastName", "Sharma"]]);
  });

  it("stores the phone as at most ten digits whatever was typed or pasted", () => {
    const changes = [];
    renderStep({
      onChange: (field) => (event) => changes.push([field, event.target.value]),
    });

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+91 98765 43210" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "987654321055" },
    });

    expect(changes).toEqual([
      ["phone", "9876543210"],
      ["phone", "9876543210"],
    ]);
  });

  it("defaults Country to India with the State list enabled", () => {
    renderStep();

    const country = screen.getByLabelText(/^country/i);
    expect(country).toHaveValue("India");
    expect(country).toBeEnabled();

    const state = screen.getByLabelText(/^state/i);
    expect(state).toBeEnabled();
    expect(within(state).getByText("Karnataka")).toBeInTheDocument();
    expect(within(state).getByText("Jharkhand")).toBeInTheDocument();
  });

  it("disables the State dropdown until a Country is chosen", () => {
    renderStep({ values: { country: "", state: "" } });

    const state = screen.getByLabelText(/^state/i);
    expect(state).toBeDisabled();
    expect(screen.getByText(/choose a country above/i)).toBeInTheDocument();
  });

  it("replaces the State options when the Country changes", () => {
    const { rerender } = renderStep({ values: { country: "India", state: "Karnataka" } });
    expect(within(screen.getByLabelText(/^state/i)).getByText("Karnataka")).toBeInTheDocument();

    rerender(
      <PersonalInformationStep
        idPrefix="personal"
        values={{ country: "Canada", state: "" }}
        errors={{}}
        onChange={() => () => {}}
      />,
    );

    const state = screen.getByLabelText(/^state/i);
    expect(within(state).getByText("Ontario")).toBeInTheDocument();
    expect(within(state).queryByText("Karnataka")).not.toBeInTheDocument();
  });

  it("clears the previous State answer as soon as the Country changes", () => {
    const changes = [];
    renderStep({
      values: { country: "India", state: "Karnataka" },
      onChange: (field) => (event) => changes.push([field, event.target.value]),
    });

    fireEvent.change(screen.getByLabelText(/^country/i), { target: { value: "Canada" } });

    expect(changes).toEqual([
      ["country", "Canada"],
      ["state", ""],
    ]);
  });

  it("surfaces a validation message as an inline alert on the field", () => {
    renderStep({
      errors: {
        firstName: "Please enter your first name.",
        phone: "Please enter a valid 10-digit mobile number.",
      },
    });

    const firstName = screen.getByLabelText(/^first name/i);
    expect(firstName).toHaveAttribute("aria-invalid", "true");
    expect(firstName).toHaveAttribute(
      "aria-describedby",
      "personal-firstName-hint personal-firstName-error",
    );

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Please enter your first name.");
    expect(alerts[1]).toHaveTextContent("Please enter a valid 10-digit mobile number.");
  });
});
