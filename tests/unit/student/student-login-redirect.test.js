import { describe, expect, it } from "vitest";
import { resolveStudentLoginNextPath } from "@/lib/student-login-redirect";

describe("resolveStudentLoginNextPath", () => {
  it("returns a valid individual course path after login", () => {
    expect(
      resolveStudentLoginNextPath("?next=%2Fcourses%2Fcloud-fundamentals"),
    ).toBe("/courses/cloud-fundamentals");
  });

  it.each([
    "?next=https%3A%2F%2Fexample.com",
    "?next=%2F%2Fevil.example",
    "?next=%2Fstudent%2Fenroll%2Fdirect%3Ftype%3Dbundle%26product%3Dabc",
    "?next=%2Fcourses%2Fnot-a-valid-slug%2Fextra",
  ])("rejects unsafe or unsupported destinations: %s", (search) => {
    expect(resolveStudentLoginNextPath(search)).toBe("/student/dashboard");
  });
});
