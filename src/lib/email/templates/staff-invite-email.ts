import { renderBaseEmailLayout, escapeHtml } from "./base-layout";
import { StaffInviteEmailData } from "../types";

export function renderStaffInviteEmail(data: StaffInviteEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const {
    fullName,
    actionUrl,
    roleName,
    tempPassword,
    expiresInMinutes = 60,
  } = data;

  const greeting = fullName ? `Dear ${fullName},` : "Hello,";
  const subject = "You have been invited to join the SPRINT Institutional Training Hub team";

  const credentialsBlock = tempPassword
    ? `
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px 20px; margin: 20px 0; border: 1px solid #cbd5e1;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #475569; margin-bottom: 6px;">
          Temporary Sign-In Password
        </div>
        <div style="font-family: 'Space Grotesk', -apple-system, monospace; font-size: 20px; font-weight: 700; color: #011f3e; letter-spacing: 1px;">
          ${escapeHtml(tempPassword)}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
          You will be required to change this password on your first sign-in.
        </div>
      </div>
    `
    : "";

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">
      Welcome to <strong>SPRINT Institutional Training Hub</strong>! An administrator has invited you to join the team with the role of <strong>${escapeHtml(roleName)}</strong>.
    </p>
    ${credentialsBlock}
    <p style="margin: 0 0 16px 0;">
      Please click the button below to accept your invitation, confirm your staff account, and set up your permanent credentials.
    </p>
    <div style="background-color: #e8f3ff; border-left: 4px solid #0b63b6; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #1e3a8a;">
      <strong>Institutional access:</strong> As a staff member, your account grants administrative access according to your assigned permissions. Keep your credentials strictly confidential.
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: "Welcome to SPRINT — Complete your staff onboarding",
    badgeText: "STAFF INVITATION",
    title: "Welcome to the SPRINT Team",
    greeting,
    bodyHtml,
    ctaText: "Accept Invitation & Sign In",
    ctaUrl: actionUrl,
    securityNote: `This invitation link will expire in ${expiresInMinutes} minutes. If you believe this invitation was sent in error, please contact the SPRINT administration team.`,
  });

  const text = `
SPRINT Institutional Training Hub
Staff & Faculty Invitation

${greeting}

Welcome to SPRINT Institutional Training Hub! You have been invited to join the team as ${roleName}.
${tempPassword ? `\nTemporary Password: ${tempPassword}\n(You will be asked to change this on your first sign-in)\n` : ""}
To accept your invitation and activate your account, please visit:
${actionUrl}

This invitation link expires in ${expiresInMinutes} minutes.

SPRINT Centre, Hazaribagh, Jharkhand - 825301, India
Contact: +91 85212 83184/85 | info@sprint.naturalelements.co.in
`.trim();

  return { html, text, subject };
}
