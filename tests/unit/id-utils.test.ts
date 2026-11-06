import { describe, expect, it } from "vitest";
import {
  formatApplicationId,
  isUuid,
  sanitizeStudentId,
} from "@/lib/id-utils";

describe("id-utils", () => {
  describe("isUuid", () => {
    it("detects valid standard UUID strings", () => {
      expect(isUuid("d3b07384-d113-4ec4-9d52-b13be2be0335")).toBe(true);
      expect(isUuid("00000000-0000-0000-0000-000000000000")).toBe(true);
    });

    it("returns false for non-UUID strings", () => {
      expect(isUuid("SPR-APP-2611-0001")).toBe(false);
      expect(isUuid("SPR-2026-0148")).toBe(false);
      expect(isUuid("")).toBe(false);
      expect(isUuid(null)).toBe(false);
      expect(isUuid(undefined)).toBe(false);
    });
  });

  describe("formatApplicationId", () => {
    it("preserves already formatted application IDs", () => {
      expect(formatApplicationId("SPR-APP-2611-0001")).toBe("SPR-APP-2611-0001");
      expect(formatApplicationId("spr-app-2611-abcd")).toBe("SPR-APP-2611-ABCD");
    });

    it("formats from fallback UUID and created date", () => {
      const formatted = formatApplicationId(
        null,
        "a9b8c7d6-1234-5678-90ab-cdef12345678",
        "2026-11-06T10:00:00Z"
      );
      expect(formatted).toBe("SPR-APP-2611-A9B8");
      expect(formatted).toMatch(/^SPR-APP-\d{4}-[A-Z0-9]{4}$/);
    });

    it("never returns a raw UUID", () => {
      const rawUuid = "7c8449c2-5555-4444-3333-222211110000";
      const formatted = formatApplicationId(null, rawUuid, "2026-11-01T00:00:00Z");
      expect(formatted).not.toContain("-5555-");
      expect(formatted).toBe("SPR-APP-2611-7C84");
    });
  });

  describe("sanitizeStudentId", () => {
    it("returns the student ID when valid institutional format", () => {
      expect(sanitizeStudentId("SPR-2026-0001")).toBe("SPR-2026-0001");
      expect(sanitizeStudentId("SPR-2026-0148")).toBe("SPR-2026-0148");
    });

    it("replaces raw UUID with fallback and never renders UUID", () => {
      const rawUuid = "d3b07384-d113-4ec4-9d52-b13be2be0335";
      expect(sanitizeStudentId(rawUuid)).toBe("Not linked");
      expect(sanitizeStudentId(rawUuid, "Pending approval")).toBe("Pending approval");
    });

    it("handles null and empty values gracefully", () => {
      expect(sanitizeStudentId(null)).toBe("Not linked");
      expect(sanitizeStudentId("")).toBe("Not linked");
      expect(sanitizeStudentId("   ")).toBe("Not linked");
    });
  });
});

