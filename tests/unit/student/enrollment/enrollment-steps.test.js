import { describe, expect, it } from "vitest";

import {
  ENROLLMENT_STEP_COUNT,
  ENROLLMENT_STEP_IDS,
  ENROLLMENT_STEPS,
  createEmptyEnrollment,
} from "@/components/student/enrollment/enrollment-steps";

describe("Enrollment step registry", () => {
  it("keeps the five agreed steps in order", () => {
    expect(ENROLLMENT_STEP_IDS).toEqual([
      "personal",
      "education",
      "specialization",
      "learningPath",
      "account",
    ]);
    expect(ENROLLMENT_STEP_COUNT).toBe(5);
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

  it("marks exactly the three scaffolded steps", () => {
    const scaffolded = ENROLLMENT_STEPS.filter((step) => step.isScaffolded).map((step) => step.id);

    expect(scaffolded).toEqual(["specialization", "learningPath", "account"]);
  });

  it("marks only Step 2 optional and hands it the agreed skip notice", () => {
    const optional = ENROLLMENT_STEPS.filter((step) => step.isOptional);

    expect(optional.map((step) => step.id)).toEqual(["education"]);
    expect(optional[0].skipNotice).toBe(
      "You can complete your education & career profile later from your Student Dashboard.",
    );
    expect(optional[0].description).toMatch(
      /You can skip this step and complete it later from your Student Dashboard\./,
    );

    ENROLLMENT_STEPS.filter((step) => !step.isOptional).forEach((step) => {
      expect(step.skipNotice, step.id).toBeUndefined();
    });
  });

  it("seeds every step's slice of the shared state", () => {
    expect(createEmptyEnrollment()).toEqual({
      personal: { name: "", email: "", phone: "" },
      education: {
        level: "",
        institution: "",
        degree: "",
        year: "",
        graduationYear: "",
        city: "",
        state: "",
        currentRole: "",
      },
      // Step 2 writes the specialization choice into this slice (see EducationStep).
      specialization: { track: "" },
      learningPath: {},
      account: {},
    });
  });

  it("validates the personal step against the shared email and mobile rules", () => {
    const personal = ENROLLMENT_STEPS[0];

    expect(personal.validate({ name: "A", email: "nope", phone: "123" })).toEqual({
      name: "Your name needs at least 2 characters.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid 10-digit mobile number.",
    });
  });

  it("hands out a fresh state object so step defaults can never leak between mounts", () => {
    const first = createEmptyEnrollment();
    const second = createEmptyEnrollment();

    first.personal.name = "Ananya Sharma";

    expect(second.personal.name).toBe("");
    expect(first.personal).not.toBe(second.personal);
  });
});
