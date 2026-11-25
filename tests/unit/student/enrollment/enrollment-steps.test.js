import { describe, expect, it } from "vitest";

import {
  ENROLLMENT_STEP_COUNT,
  ENROLLMENT_STEP_IDS,
  ENROLLMENT_STEPS,
  createEmptyEnrollment,
} from "@/components/student/enrollment/enrollment-steps";

describe("Enrollment step registry", () => {
  it("keeps personal details and password setup as the only registration steps", () => {
    expect(ENROLLMENT_STEP_IDS).toEqual(["personal", "password"]);
    expect(ENROLLMENT_STEP_COUNT).toBe(2);
  });

  it("gives every step a unique label and its own copy", () => {
    expect(new Set(ENROLLMENT_STEPS.map((step) => step.label)).size).toBe(ENROLLMENT_STEP_COUNT);

    ENROLLMENT_STEPS.forEach((step) => {
      expect(step.label, step.id).toBeTruthy();
      expect(step.title, step.id).toBeTruthy();
      expect(step.description, step.id).toBeTruthy();
    });
  });

  it("keeps the wizard contract on every step", () => {
    ENROLLMENT_STEPS.forEach((step) => {
      expect(typeof step.Component, step.id).toBe("function");
      expect(typeof step.validate, step.id).toBe("function");
      expect(typeof step.initialValues, step.id).toBe("object");
      expect(typeof step.validate({}), step.id).toBe("object");
    });
  });

  it("keeps every step connected to its live behavior", () => {
    const scaffolded = ENROLLMENT_STEPS.filter((step) => step.isScaffolded).map((step) => step.id);

    expect(scaffolded).toEqual([]);
  });

  it("does not include education or course selection in registration", () => {
    expect(ENROLLMENT_STEP_IDS).not.toContain("education");
    expect(ENROLLMENT_STEPS.some((step) => step.isOptional)).toBe(false);
  });

  it("seeds every step's slice of the shared state", () => {
    expect(createEmptyEnrollment()).toEqual({
      personal: {
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        city: "",
        country: "India",
        state: "",
        phone: "",
      },
      password: {
        newPassword: "",
        confirmPassword: "",
      },
    });
  });

  it("validates the personal step against the shared email and mobile rules", () => {
    const personal = ENROLLMENT_STEPS[0];

    expect(
      personal.validate({
        firstName: "A",
        lastName: "",
        email: "nope",
        // Country arrives pre-seeded from initialValues.
        country: "India",
        state: "",
        phone: "123",
      }),
    ).toEqual({
      firstName: "Your name needs at least 2 characters.",
      lastName: "Please enter your last name.",
      email: "Please enter a valid email address.",
      dob: "Please enter your date of birth.",
      city: "Please enter your town or city.",
      state: "Please select your state.",
      country: "",
      phone: "Please enter a valid 10-digit mobile number.",
    });
  });

  it("hands out a fresh state object so step defaults can never leak between mounts", () => {
    const first = createEmptyEnrollment();
    const second = createEmptyEnrollment();

    first.personal.firstName = "Ananya";

    expect(second.personal.firstName).toBe("");
    expect(first.personal).not.toBe(second.personal);
  });
});
