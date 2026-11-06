import { renderBaseEmailLayout } from "./base-layout";
import { PasswordResetEmailData } from "../types";

export function renderPasswordResetEmail(data: PasswordResetEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const {
    fullName,
    actionUrl,
    userRole = "student",
    expiresInMinutes = 60,
  } = data;

  const greeting = fullName ? `Dear ${fullName},` : "Hello,";
  const subject = "Reset your SPRINT Account password";

  const portalName =
    userRole === "admin"
      ? "SPRINT Administrative Console"
      : userRole === "staff"
      ? "SPRINT Faculty & Staff Console"
      : "SPRINT Student Portal";

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">
      We received a request to reset the password for your account on the <strong>${portalName}</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">
      Click the button below to choose a new, secure password. If you initiated this request, please complete it promptly.
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #475569;">
      🛡️ <strong>Password security reminder:</strong> Use at least 8 characters, combining uppercase and lowercase letters, numbers, and symbols. Never share your password with anyone.
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: "Reset your SPRINT account password securely",
    badgeText: "SECURITY ALERT",
    badgeColor: "#011f3e",
    title: "Password Reset Request",
    greeting,
    bodyHtml,
    ctaText: "Reset My Password",
    ctaUrl: actionUrl,
    securityNote: `This link will expire in ${expiresInMinutes} minutes. If you did not request a password reset, you can safely ignore this message — your existing password remains unchanged.`,
  });

  const text = `
SPRINT Institutional Training Hub
Password Reset Request

${greeting}

We received a request to reset your password for the ${portalName}.

To choose a new password, visit:
${actionUrl}

This link is valid for ${expiresInMinutes} minutes.
If you did not request a password reset, you can safely ignore this message.

SPRINT Centre, Hazaribagh, Jharkhand - 825301, India
Contact: +91 85212 83184/85 | info@sprint.naturalelements.co.in
`.trim();

  return { html, text, subject };
}

