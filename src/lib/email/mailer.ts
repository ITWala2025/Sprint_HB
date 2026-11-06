import "server-only";
import nodemailer, { Transporter } from "nodemailer";
import {
  SendEmailOptions,
  SendEmailResult,
  EmailRecipient,
  VerificationEmailData,
  PasswordSetupEmailData,
  PasswordResetEmailData,
  StaffInviteEmailData,
  EnrollmentApprovedEmailData,
} from "./types";
import {
  renderVerificationEmail,
  renderPasswordSetupEmail,
  renderPasswordResetEmail,
  renderStaffInviteEmail,
  renderEnrollmentApprovedEmail,
} from "./templates";

let cachedTransporter: Transporter | null = null;

/**
 * Checks whether SMTP credentials have been provided in the environment.
 */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Creates or retrieves a pooled Nodemailer transporter for immediate delivery.
 */
export function getMailTransporter(): Transporter | null {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return cachedTransporter;
}

/**
 * Sends a raw email immediately using the configured SMTP transport.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn(
      "[SPRINT Mailer] SMTP is not configured. Email was skipped. " +
      "Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable instant delivery."
    );
    return {
      success: false,
      skipped: true,
      error: "SMTP provider is not configured. Check environment variables.",
    };
  }

  const defaultFrom =
    process.env.SMTP_FROM ||
    '"SPRINT Institutional Training Hub" <noreply@sprint.institute>';

  try {
    const info = await transporter.sendMail({
      from: options.from || defaultFrom,
      to: options.to,
      replyTo: options.replyTo || "info@sprint.naturalelements.co.in",
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to deliver email via SMTP";
    console.error("[SPRINT Mailer] Immediate delivery error:", errorMessage, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Sends a branded verification / magic link email immediately.
 */
export async function sendVerificationEmail(
  recipient: EmailRecipient,
  data: VerificationEmailData
): Promise<SendEmailResult> {
  const { html, text, subject } = renderVerificationEmail({
    ...data,
    fullName: recipient.name || data.fullName,
  });

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
}

/**
 * Sends a branded password setup email immediately upon student enrollment.
 */
export async function sendPasswordSetupEmail(
  recipient: EmailRecipient,
  data: PasswordSetupEmailData
): Promise<SendEmailResult> {
  const { html, text, subject } = renderPasswordSetupEmail({
    ...data,
    fullName: recipient.name || data.fullName,
  });

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
}

/**
 * Sends a branded password reset email immediately.
 */
export async function sendPasswordResetEmail(
  recipient: EmailRecipient,
  data: PasswordResetEmailData
): Promise<SendEmailResult> {
  const { html, text, subject } = renderPasswordResetEmail({
    ...data,
    fullName: recipient.name || data.fullName,
  });

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
}

/**
 * Sends a branded staff onboarding / invitation email immediately.
 */
export async function sendStaffInviteEmail(
  recipient: EmailRecipient,
  data: StaffInviteEmailData
): Promise<SendEmailResult> {
  const { html, text, subject } = renderStaffInviteEmail({
    ...data,
    fullName: recipient.name || data.fullName,
  });

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
}

/**
 * Sends a branded admission approval & welcome email immediately upon enrollment approval.
 */
export async function sendEnrollmentApprovedEmail(
  recipient: EmailRecipient,
  data: EnrollmentApprovedEmailData
): Promise<SendEmailResult> {
  const { html, text, subject } = renderEnrollmentApprovedEmail({
    ...data,
    fullName: recipient.name || data.fullName,
  });

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
}

