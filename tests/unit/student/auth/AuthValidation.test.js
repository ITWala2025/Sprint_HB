import { describe, expect, it } from "vitest";

import {
  EMAIL_PATTERN,
  PASSWORD_RULES,
  getPasswordRuleState,
  passwordMeetsAllRules,
  validateConfirmPassword,
  validateEmailField,
  validateNewPassword,
  validateRequiredField,
} from "@/components/student/auth/auth-validation";

describe("auth validation helpers", () => {
  describe("validateEmailField", () => {
    it("rejects an empty or whitespace-only value", () => {
      expect(validateEmailField("")).toBe("Please enter your email.");
      expect(validateEmailField("   ")).toBe("Please enter your email.");
    });

    it("rejects malformed addresses", () => {
      expect(validateEmailField("asha")).toBe("Please enter a valid email address.");
      expect(validateEmailField("asha@")).toBe("Please enter a valid email address.");
      expect(validateEmailField("asha@sprint")).toBe("Please enter a valid email address.");
      expect(validateEmailField("asha @sprint.co.in")).toBe(
        "Please enter a valid email address.",
      );
    });

    it("accepts and trims real-looking addresses", () => {
      expect(validateEmailField("  asha.kumar@sprint.co.in  ")).toBe("");
      expect(EMAIL_PATTERN.test("student+portal@example.com")).toBe(true);
    });
  });

  describe("validateRequiredField", () => {
    it("returns the supplied message only when the value is blank", () => {
      expect(validateRequiredField("", "Please enter your password.")).toBe(
        "Please enter your password.",
      );
      expect(validateRequiredField("   ", "Please enter your password.")).toBe(
        "Please enter your password.",
      );
      expect(validateRequiredField("secret", "Please enter your password.")).toBe("");
    });
  });

  describe("password rules", () => {
    it("exposes five rules and marks each one against the typed value", () => {
      const rules = getPasswordRuleState("Sprint@2026");
      expect(PASSWORD_RULES).toHaveLength(5);
      expect(rules.every((rule) => rule.met)).toBe(true);
      expect(passwordMeetsAllRules("Sprint@2026")).toBe(true);
    });

    it("flags exactly the rules a weak password breaks", () => {
      const unmet = getPasswordRuleState("sprint")
        .filter((rule) => !rule.met)
        .map((rule) => rule.id);

      // "sprint" is lowercase-only and too short, but has no digit or symbol.
      expect(unmet).toEqual(["length", "uppercase", "number", "symbol"]);
      expect(passwordMeetsAllRules("sprint")).toBe(false);
    });
  });

  describe("validateNewPassword", () => {
    it("requires a value", () => {
      expect(validateNewPassword("")).toBe("Please enter a new password.");
    });

    it("points at the requirements list when a rule is broken", () => {
      expect(validateNewPassword("Sprint")).toBe(
        "Please meet all password requirements listed below.",
      );
    });

    it("accepts a password that satisfies every rule", () => {
      expect(validateNewPassword("Sprint@2026")).toBe("");
    });
  });

  describe("validateConfirmPassword", () => {
    it("requires a confirmation", () => {
      expect(validateConfirmPassword("Sprint@2026", "")).toBe(
        "Please confirm your new password.",
      );
    });

    it("detects a mismatch", () => {
      expect(validateConfirmPassword("Sprint@2026", "Sprint@2027")).toBe(
        "Passwords do not match.",
      );
    });

    it("accepts an identical value", () => {
      expect(validateConfirmPassword("Sprint@2026", "Sprint@2026")).toBe("");
    });
  });
});
