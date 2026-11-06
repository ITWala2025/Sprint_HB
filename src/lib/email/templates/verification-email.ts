import { renderBaseEmailLayout } from "./base-layout";
import { VerificationEmailData } from "../types";

export function renderVerificationEmail(data: VerificationEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const {
    fullName,
    actionUrl,
    token,
    expiresInMinutes = 15,
  } = data;

  const greeting = fullName ? `Dear ${fullName},` : "Hello,";
  const subject = "Verify your email address for SPRINT Enrollment";

  const tokenHtml = token
    ? `
      <div style="background-color: #f1f5f9; border: 2px dashed #011f3e; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #475569; margin-bottom: 8px;">
          Your 6-Digit Verification Code
        </div>
        <div style="font-family: 'Space Grotesk', -apple-system, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #011f3e;">
          ${token}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
          Valid for ${expiresInMinutes} minutes
        </div>
      </div>
    `
    : "";

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">
      Thank you for initiating your enrollment application with <strong>SPRINT Institutional Training Hub</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">
      To verify your email address and continue your registration in your current browser session, please click the verification button below.
    </p>
    ${tokenHtml}
    <div style="background-color: #fff0f2; border-left: 4px solid #f81529; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #991b1b;">
      <strong>Note:</strong> Please open this link in the same browser window where you started your enrollment form so your session is preserved.
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: "Verify your email address to complete SPRINT enrollment",
    badgeText: "EMAIL VERIFICATION",
    title: "Verify Your Email Address",
    greeting,
    bodyHtml,
    ctaText: "Verify Email & Continue Enrollment",
    ctaUrl: actionUrl,
    securityNote: `This link will expire in ${expiresInMinutes} minutes. If you did not begin an enrollment at SPRINT, you can safely ignore this email.`,
  });

  const text = `
SPRINT Institutional Training Hub
Email Verification

${greeting}

Thank you for initiating your enrollment application with SPRINT Institutional Training Hub.

To verify your email address and continue your registration, please open this URL in the same browser session:
${actionUrl}

${token ? `Your verification code is: ${token}\n` : ""}
This link expires in ${expiresInMinutes} minutes.

SPRINT Centre, Hazaribagh, Jharkhand - 825301, India
Contact: +91 85212 83184/85 | info@sprint.naturalelements.co.in
`.trim();

  return { html, text, subject };
}

