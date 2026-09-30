import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import EducationStep, {
  SPECIALIZATION_OPTIONS,
} from "@/components/student/enrollment/steps/EducationStep";

/**
 * A miniature copy of the wizard's shared-state contract: a stateful harness
 * that records every write (`[slice, field, value]`) *and* feeds the new value
 * back into the component, exactly like `EnrollmentWizard` does — so typing
 * accumulates and a clicked radio stays checked.
 */
const renderStep = ({ values: initialValues = {}, errors = {}, track: initialTrack = "" } = {}) => {
  const writes = [];

  function Harness() {
    const [values, setValues] = useState(initialValues);
    const [track, setTrack] = useState(initialTrack);

    const onChange = (field) => (event) => {
      writes.push(["education", field, event.target.value]);
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
    };

    const onChangeIn = (sliceId) => (field) => (event) => {
      writes.push([sliceId, field, event.target.value]);
      if (sliceId === "specialization") setTrack(event.target.value);
    };

    return (
      <EducationStep
        idPrefix="education"
        values={values}
        errors={errors}
        onChange={onChange}
        onChangeIn={onChangeIn}
        specialization={{ track }}
      />
    );
  }

  render(<Harness />);
  return { writes };
};

describe("EducationStep", () => {
  it("renders all eight profile fields as labelled, optional controls", () => {
    renderStep();

    [
      /current education level/i,
      /college \/ university/i,
      /degree \/ course/i,
      /year \/ semester/i,
      /graduation year/i,
      /city/i,
      /state/i,
      /current role/i,
    ].forEach((label) => {
      expect(screen.getByLabelText(label), String(label)).toBeInTheDocument();
    });

    // Nothing on this step is mandatory: no `required` attribute anywhere.
    screen
      .getAllByRole("textbox")
      .forEach((control) => expect(control).not.toBeRequired());
    expect(screen.getByLabelText(/current education level/i)).not.toBeRequired();
    expect(screen.getByRole("combobox")).not.toBeRequired();
  });

  it("offers every requested specialization as a radio, including 'I'm not sure yet'", () => {
    renderStep();

    const group = screen.getByRole("group", { name: /choose your specialization/i });
    expect(group).toBeInTheDocument();

    SPECIALIZATION_OPTIONS.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toHaveAttribute("type", "radio");
    });

    expect(screen.getByLabelText("AI Engineer")).toBeInTheDocument();
    expect(screen.getByLabelText("Site Reliability Engineer (SRE)")).toBeInTheDocument();
    expect(screen.getByLabelText("I'm not sure yet")).toBeInTheDocument();
    expect(SPECIALIZATION_OPTIONS).toHaveLength(11);
  });

  it("writes a specialization choice into the shared specialization slice", async () => {
    const user = userEvent.setup();
    const { writes } = renderStep();

    await user.click(screen.getByLabelText("Cloud Engineer"));

    expect(writes).toContainEqual(["specialization", "track", "cloud-engineer"]);
  });

  it("reports a selected track as checked and any other as unchecked", () => {
    renderStep({ track: "sre" });

    expect(screen.getByLabelText("Site Reliability Engineer (SRE)")).toBeChecked();
    expect(screen.getByLabelText("AI Engineer")).not.toBeChecked();
  });

  it("keeps typed answers as controlled values that survive a re-render", () => {
    renderStep({
      values: { city: "Bengaluru", level: "bachelors", graduationYear: "2027" },
    });

    expect(screen.getByLabelText(/city/i)).toHaveValue("Bengaluru");
    expect(screen.getByLabelText(/current education level/i)).toHaveValue("bachelors");
    expect(screen.getByLabelText(/graduation year/i)).toHaveValue("2027");
  });

  it("reports profile edits against the education slice", async () => {
    const user = userEvent.setup();
    const { writes } = renderStep();

    await user.type(screen.getByLabelText(/city/i), "Pune");

    expect(writes.at(-1)).toEqual(["education", "city", "Pune"]);
  });

  it("surfaces the graduation-year error as an inline alert on the field", () => {
    renderStep({ errors: { graduationYear: "Please enter a 4-digit year (for example 2027)." } });

    const year = screen.getByLabelText(/graduation year/i);
    expect(year).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a 4-digit year (for example 2027).",
    );
  });

  it("marks the step as optional in its own guidance", () => {
    renderStep();

    expect(screen.getByText("Optional step")).toBeInTheDocument();
    expect(screen.getByText(/can be added later from your Student Dashboard/i)).toBeInTheDocument();
  });
});
