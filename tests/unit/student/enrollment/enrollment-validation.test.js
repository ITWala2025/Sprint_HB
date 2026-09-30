import { describe, expect, it } from "vitest";

import {
  compactErrors,
  normalizeMobile,
  validateEducationProfile,
  validateGraduationYearField,
  validateMobileField,
  validateNameField,
  validatePersonalInformation,
} from "@/components/student/enrollment/enrollment-validation";

describe("Enrollment validation", () => {
  describe("normalizeMobile", () => {
    it.each([
      ["9876543210", "9876543210"],
      ["98765 43210", "9876543210"],
      ["+91 98765 43210", "9876543210"],
      ["91 9876543210", "9876543210"],
      ["098765 43210", "9876543210"],
      // A real number that happens to start with 91 must survive untouched.
      ["9123456789", "9123456789"],
    ])("normalises %s to %s", (input, expected) => {
      expect(normalizeMobile(input)).toBe(expected);
    });
  });

  describe("validateNameField", () => {
    it("asks for the name when the field is empty", () => {
      expect(validateNameField("")).toBe("Please enter your full name.");
      expect(validateNameField("   ")).toBe("Please enter your full name.");
    });

    it("rejects a single character", () => {
      expect(validateNameField("A")).toBe("Your name needs at least 2 characters.");
    });

    it("rejects digits and symbols", () => {
      expect(validateNameField("Ananya 123")).toBe(
        "Please use letters only — spaces, hyphens and apostrophes are fine.",
      );
    });

    it("accepts the separators real names use", () => {
      expect(validateNameField("Ananya Sharma")).toBe("");
      expect(validateNameField("O'Brien-Kaur")).toBe("");
      expect(validateNameField("  Ananya Sharma  ")).toBe("");
    });
  });

  describe("validateMobileField", () => {
    it("asks for a number when the field is empty", () => {
      expect(validateMobileField("")).toBe("Please enter your mobile number.");
    });

    it("rejects numbers that are not ten digits or do not start 6-9", () => {
      expect(validateMobileField("98765")).toBe("Please enter a valid 10-digit mobile number.");
      expect(validateMobileField("1234567890")).toBe(
        "Please enter a valid 10-digit mobile number.",
      );
    });

    it("accepts every common way of writing an Indian mobile number", () => {
      expect(validateMobileField("9876543210")).toBe("");
      expect(validateMobileField("+91 98765 43210")).toBe("");
      expect(validateMobileField("098765 43210")).toBe("");
    });
  });

  describe("validatePersonalInformation", () => {
    it("returns one entry per field, valid fields included", () => {
      expect(validatePersonalInformation({})).toEqual({
        name: "Please enter your full name.",
        email: "Please enter your email.",
        phone: "Please enter your mobile number.",
      });
    });

    it("reuses the auth module's email rules", () => {
      const errors = validatePersonalInformation({ email: "asha@sprint" });
      expect(errors.email).toBe("Please enter a valid email address.");
    });

    it("passes a complete step", () => {
      expect(
        compactErrors(
          validatePersonalInformation({
            name: "Ananya Sharma",
            email: "ananya@sprint.co.in",
            phone: "98765 43210",
          }),
        ),
      ).toEqual({});
    });
  });

  describe("compactErrors", () => {
    it("drops the empty messages and keeps the failing fields in order", () => {
      expect(compactErrors({ name: "", phone: "Bad number." })).toEqual({
        phone: "Bad number.",
      });
      expect(Object.keys(compactErrors({ name: "a", email: "b", phone: "" }))).toEqual([
        "name",
        "email",
      ]);
    });
  });

  describe("validateGraduationYearField (Step 2 — the only rule on an optional step)", () => {
    it("accepts an empty year so an untouched or skipped step always passes", () => {
      expect(validateGraduationYearField("")).toBe("");
      expect(validateGraduationYearField("   ")).toBe("");
      expect(validateEducationProfile({})).toEqual({ graduationYear: "" });
    });

    it("accepts a plausible four-digit year", () => {
      expect(validateGraduationYearField("2027")).toBe("");
      expect(validateGraduationYearField("1995")).toBe("");
    });

    it("rejects anything that is not exactly four digits", () => {
      const message = "Please enter a 4-digit year (for example 2027).";

      expect(validateGraduationYearField("20")).toBe(message);
      expect(validateGraduationYearField("20275")).toBe(message);
      expect(validateGraduationYearField("abcd")).toBe(message);
      expect(validateEducationProfile({ graduationYear: "20" })).toEqual({
        graduationYear: message,
      });
    });

    it("rejects years outside the accepted window", () => {
      expect(validateGraduationYearField("1979")).toMatch(/between 1980 and/);
      expect(validateGraduationYearField(String(new Date().getFullYear() + 9))).toMatch(
        /between 1980 and/,
      );
    });
  });
});
