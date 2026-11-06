import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const sendMail = vi.fn();
  const createTransport = vi.fn(() => ({
    sendMail,
  }));
  return { sendMail, createTransport };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mocks.createTransport,
  },
}));

import {
  isSmtpConfigured,
  sendEmail,
  sendVerificationEmail,
  sendPasswordSetupEmail,
} from "@/lib/email/mailer";

describe("Mailer Service", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mocks.sendMail.mockReset();
    mocks.createTransport.mockClear();
  });

  it("identifies when SMTP is not configured", () => {
    expect(isSmtpConfigured()).toBe(false);
  });

  it("identifies when SMTP is configured", () => {
    vi.stubEnv("SMTP_HOST", "smtp.resend.com");
    vi.stubEnv("SMTP_USER", "resend");
    vi.stubEnv("SMTP_PASS", "re_secret_123");

    expect(isSmtpConfigured()).toBe(true);
  });

  it("skips delivery gracefully when SMTP credentials are not configured", async () => {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("dispatches email immediately via Nodemailer transport when configured", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.resend.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "resend");
    vi.stubEnv("SMTP_PASS", "re_secret_123");
    vi.stubEnv("SMTP_FROM", '"SPRINT Hub" <admissions@sprint.institute>');

    mocks.sendMail.mockResolvedValueOnce({
      messageId: "msg-id-123",
    });

    const result = await sendPasswordSetupEmail(
      { email: "student@example.com", name: "Vikram Mehta" },
      {
        fullName: "Vikram Mehta",
        actionUrl: "https://sprint.institute/set-password?token=xyz",
        courseName: "Cloud DevOps Architect Track",
      }
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("msg-id-123");
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        from: '"SPRINT Hub" <admissions@sprint.institute>',
        subject: expect.stringContaining("Set your password"),
        html: expect.stringContaining("Vikram Mehta"),
      })
    );
  });
});
