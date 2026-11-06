import { describe, expect, it } from "vitest";
import {
  renderVerificationEmail,
  renderPasswordSetupEmail,
  renderPasswordResetEmail,
  renderStaffInviteEmail,
  renderEnrollmentApprovedEmail,
} from "@/lib/email/templates";

describe("Email Templates", () => {
  it("renders verification email with SPRINT brand elements, OTP token, and action link", () => {
    const { html, text, subject } = renderVerificationEmail({
      fullName: "Priya Singh",
      actionUrl: "https://sprint.institute/student/enroll?token=xyz",
      token: "847291",
      expiresInMinutes: 15,
    });

    expect(subject).toContain("Verify your email");
    expect(html).toContain("SPRINT");
    expect(html).toContain("Institutional Training Hub");
    expect(html).toContain("Priya Singh");
    expect(html).toContain("847291");
    expect(html).toContain("https://sprint.institute/student/enroll?token=xyz");
    expect(html).toContain("#f81529"); // Brand red
    expect(html).toContain("#011f3e"); // Brand navy
    expect(html).toContain("15 minutes");
    expect(text).toContain("847291");
  });

  it("renders password setup email with course details, application ID, and setup link", () => {
    const { html, text, subject } = renderPasswordSetupEmail({
      fullName: "Rahul Kumar",
      actionUrl: "https://sprint.institute/set-password?token=abc",
      courseName: "Applied AI & Cloud Engineering",
      applicationId: "SPR-APP-2611-0042",
      expiresInMinutes: 60,
    });

    expect(subject).toContain("Set your password");
    expect(html).toContain("Rahul Kumar");
    expect(html).toContain("SPR-APP-2611-0042");
    expect(html).toContain("Applied AI &amp; Cloud Engineering");
    expect(html).toContain("https://sprint.institute/set-password?token=abc");
    expect(html).toContain("Student Portal");
    expect(text).toContain("Rahul Kumar");
    expect(text).toContain("SPR-APP-2611-0042");
    // Ensure no raw UUID is leaked
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it("renders password reset email with security reminders", () => {
    const { html, text, subject } = renderPasswordResetEmail({
      fullName: "Amit Verma",
      actionUrl: "https://sprint.institute/set-password?recovery=1",
      userRole: "student",
      expiresInMinutes: 30,
    });

    expect(subject).toContain("Reset your SPRINT Account password");
    expect(html).toContain("Amit Verma");
    expect(html).toContain("SPRINT Student Portal");
    expect(html).toContain("Password security reminder");
    expect(text).toContain("Amit Verma");
  });

  it("renders staff invitation email with temporary password", () => {
    const { html, text, subject } = renderStaffInviteEmail({
      fullName: "Dr. Anjali Sen",
      actionUrl: "https://sprint.institute/staff/login",
      roleName: "AI/ML Lead Instructor",
      tempPassword: "TempPassword#2026",
      expiresInMinutes: 60,
    });

    expect(subject).toContain("invited to join the SPRINT");
    expect(html).toContain("Dr. Anjali Sen");
    expect(html).toContain("AI/ML Lead Instructor");
    expect(html).toContain("TempPassword#2026");
    expect(html).toContain("Accept Invitation &amp; Sign In");
    expect(text).toContain("TempPassword#2026");
  });

  it("renders enrollment approval email with student ID and application ID", () => {
    const { html, text, subject } = renderEnrollmentApprovedEmail({
      fullName: "Kavita Roy",
      courseName: "Cloud DevOps Architect Track",
      studentId: "SPR-2026-0142",
      applicationId: "SPR-APP-2611-0015",
      portalUrl: "https://sprint.institute/student/login",
    });

    expect(subject).toContain("Congratulations! Your SPRINT Enrollment has been Approved");
    expect(html).toContain("Kavita Roy");
    expect(html).toContain("SPR-2026-0142");
    expect(html).toContain("SPR-APP-2611-0015");
    expect(html).toContain("Cloud DevOps Architect Track");
    expect(html).toContain("https://sprint.institute/student/login");
    expect(html).toContain("Verified &amp; Approved");
    expect(text).toContain("SPR-2026-0142");
    expect(text).toContain("SPR-APP-2611-0015");
    // Ensure no raw UUID is leaked
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });
});

