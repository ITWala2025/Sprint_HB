import { renderBaseEmailLayout, escapeHtml } from "./base-layout";
import { PasswordSetupEmailData } from "../types";

export function renderPasswordSetupEmail(data: PasswordSetupEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const {
    fullName,
    actionUrl,
    courseName,
    applicationId,
    expiresInMinutes = 60,
  } = data;

  const greeting = fullName ? `Dear ${fullName},` : "Hello,";
  const subject = "Set your password to access the SPRINT Student Portal";

  const applicationNotice = applicationId || courseName
    ? `
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
        ${applicationId ? `
          <div style="margin-bottom: ${courseName ? '10px' : '0'};">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; display: block; margin-bottom: 4px;">
              Application ID
            </span>
            <span style="font-size: 16px; font-family: monospace; font-weight: 700; color: #011f3e;">
              ${escapeHtml(applicationId)}
            </span>
          </div>
        ` : ""}
        ${courseName ? `
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; display: block; margin-bottom: 4px;">
              Applied Program
            </span>
            <span style="font-size: 15px; font-weight: 700; color: #011f3e;">
              ${escapeHtml(courseName)}
            </span>
          </div>
        ` : ""}
      </div>
    `
    : "";

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">
      Your enrollment application for <strong>SPRINT Institutional Training Hub</strong> has been received successfully!
    </p>
    ${applicationNotice}
    <p style="margin: 0 0 16px 0;">
      To track your admission progress, check your verification status, and access your student dashboard, please create your password by clicking the button below.
    </p>
    <div style="background-color: #e8f3ff; border-left: 4px solid #0b63b6; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1e3a8a;">
      <strong>Next step:</strong> After creating your password, you can sign in to the Student Portal at any time to review your submitted application status while admissions review is pending.
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: "Set your password to track your SPRINT enrollment application",
    badgeText: "STUDENT PORTAL",
    title: "Complete Your Account Setup",
    greeting,
    bodyHtml,
    ctaText: "Set My Password",
    ctaUrl: actionUrl,
    securityNote: `This link will expire in ${expiresInMinutes} minutes. If you did not apply for enrollment at SPRINT, please contact us immediately.`,
  });

  const text = `
SPRINT Institutional Training Hub
Student Account Password Setup

${greeting}

Your enrollment application for SPRINT Institutional Training Hub has been received successfully!
${applicationId ? `Application ID: ${applicationId}\n` : ""}${courseName ? `Applied Program: ${courseName}\n` : ""}
To create your password and access the Student Portal to track your application status, please visit:
${actionUrl}

This link is valid for ${expiresInMinutes} minutes.

SPRINT Centre, Hazaribagh, Jharkhand - 825301, India
Contact: +91 85212 83184/85 | info@sprint.naturalelements.co.in
`.trim();

  return { html, text, subject };
}
