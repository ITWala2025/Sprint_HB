import { renderBaseEmailLayout, escapeHtml } from "./base-layout";
import { EnrollmentApprovedEmailData } from "../types";

export function renderEnrollmentApprovedEmail(data: EnrollmentApprovedEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const {
    fullName,
    courseName,
    studentId,
    applicationId,
    portalUrl,
  } = data;

  const greeting = fullName ? `Dear ${fullName},` : "Hello,";
  const subject = "🎉 Congratulations! Your SPRINT Enrollment has been Approved";

  const detailsBlock = `
    <div style="background-color: #edf7f3; border: 1px solid #c8e2d7; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; margin-bottom: 12px;">
        Official Admission Details
      </div>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        ${applicationId ? `
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #475569; width: 140px; font-weight: 600;">Application ID:</td>
          <td style="padding: 4px 0; font-size: 14px; color: #011f3e; font-family: monospace; font-weight: 700;">${escapeHtml(applicationId)}</td>
        </tr>
        ` : ""}
        ${studentId ? `
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #475569; width: 140px; font-weight: 600;">Student ID:</td>
          <td style="padding: 4px 0; font-size: 14px; color: #011f3e; font-family: monospace; font-weight: 700;">${escapeHtml(studentId)}</td>
        </tr>
        ` : ""}
        ${courseName ? `
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #475569; font-weight: 600;">Enrolled Program:</td>
          <td style="padding: 4px 0; font-size: 14px; color: #011f3e; font-weight: 700;">${escapeHtml(courseName)}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #475569; font-weight: 600;">Admission Status:</td>
          <td style="padding: 4px 0; font-size: 14px; color: #166534; font-weight: 700;">Verified &amp; Approved</td>
        </tr>
      </table>
    </div>
  `;

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">
      We are delighted to inform you that your enrollment application has been verified and <strong>officially approved</strong> by the SPRINT Academic Admissions Committee!
    </p>
    ${detailsBlock}
    <p style="margin: 0 0 16px 0;">
      Your student portal account is now active. You have full access to your curriculum materials, upcoming lecture schedules, mentor support, and hands-on lab environments.
    </p>
    <div style="background-color: #f1f5f9; border-left: 4px solid #011f3e; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #334155;">
      💡 <strong>Getting Started:</strong> Click below to log in to the SPRINT Student Portal using your registered email and password.
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: "Your SPRINT enrollment application has been approved — welcome aboard!",
    badgeText: "ADMISSION APPROVED",
    badgeColor: "#22c55e",
    title: "Welcome to SPRINT Institutional Training Hub!",
    greeting,
    bodyHtml,
    ctaText: "Access Student Portal",
    ctaUrl: portalUrl,
    securityNote: "You are receiving this official admission notification because your application at SPRINT Centre, Hazaribagh was approved.",
  });

  const text = `
SPRINT Institutional Training Hub
Admission Approval Notification

${greeting}

Congratulations! Your enrollment application has been officially verified and approved by the SPRINT Academic Admissions Committee.

${applicationId ? `Application ID: ${applicationId}\n` : ""}${studentId ? `Student ID: ${studentId}\n` : ""}${courseName ? `Enrolled Program: ${courseName}\n` : ""}Admission Status: Verified & Approved

To access your student portal and view your courses:
${portalUrl}

SPRINT Centre, Hazaribagh, Jharkhand - 825301, India
Contact: +91 85212 83184/85 | info@sprint.naturalelements.co.in
`.trim();

  return { html, text, subject };
}
