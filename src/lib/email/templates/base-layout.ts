/**
 * SPRINT Email Base Layout
 * High-deliverability, responsive HTML email shell compliant with Gmail, Outlook, Apple Mail, and mobile clients.
 */

export interface BaseLayoutOptions {
  preheader?: string;
  badgeText?: string;
  badgeColor?: string;
  title: string;
  greeting?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryHtml?: string;
  securityNote?: string;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderBaseEmailLayout(options: BaseLayoutOptions): string {
  const {
    preheader = "Important update from SPRINT Training Hub",
    badgeText = "SPRINT VERIFIED",
    title,
    greeting = "Hello,",
    bodyHtml,
    ctaText,
    ctaUrl,
    secondaryHtml,
    securityNote = "If you did not request this email, no action is needed. You can safely ignore this message.",
  } = options;

  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    table, td {
      border-collapse: collapse;
      border-spacing: 0;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    @media screen and (max-width: 600px) {
      .container-table {
        width: 100% !important;
        max-width: 100% !important;
      }
      .content-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .button-cta {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <!-- Preheader preview text (hidden in display) -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; min-height: 100%;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!-- Container Table -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container-table" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(1, 31, 62, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background-color: #f81529;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color: #011f3e; padding: 28px 32px;" class="content-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- SPRINT Brand Wordmark & Tagline -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none;">
                            SPRINT<span style="color: #f81529;">.</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 4px;">
                          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; color: #94a3b8;">
                            Institutional Training Hub
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #f8fafc; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
                      ${escapeHtml(badgeText)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;" class="content-padding">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #011f3e; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${escapeHtml(title)}
              </h1>
              
              ${greeting ? `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155; font-weight: 600;">${escapeHtml(greeting)}</p>` : ""}

              <div style="font-size: 15px; line-height: 1.6; color: #334155;">
                ${bodyHtml}
              </div>

              ${ctaText && ctaUrl ? `
              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #f81529;">
                          <a href="${ctaUrl}" target="_blank" class="button-cta" style="display: inline-block; background-color: #f81529; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(248, 21, 41, 0.25); text-align: center; border: 1px solid #d9142a;">
                            ${escapeHtml(ctaText)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 12px; color: #64748b; line-height: 1.5; word-break: break-all;">
                <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">Having trouble with the button?</p>
                <p style="margin: 0;">Copy and paste this URL into your browser:</p>
                <p style="margin: 4px 0 0 0; color: #0b63b6;"><a href="${ctaUrl}" style="color: #0b63b6; text-decoration: underline;">${escapeHtml(ctaUrl)}</a></p>
              </div>
              ` : ""}

              ${secondaryHtml ? `<div style="margin-top: 24px;">${secondaryHtml}</div>` : ""}

              <!-- Security Advisory Notice -->
              ${securityNote ? `
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px dashed #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5;">
                <p style="margin: 0;">
                  🔒 <span style="color: #64748b;">${escapeHtml(securityNote)}</span>
                </p>
              </div>
              ` : ""}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #001831; padding: 28px 32px; color: #94a3b8; font-size: 12px; line-height: 1.6;" class="content-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #ffffff; font-size: 14px; margin-bottom: 4px;">
                      SPRINT Institutional Training Hub
                    </div>
                    <div style="color: #94a3b8; margin-bottom: 12px;">
                      Bridging the academic–industry gap in emerging technologies
                    </div>
                    <div style="color: #cbd5e1; margin-bottom: 6px;">
                      📍 SPRINT Centre, Hazaribagh, Jharkhand — 825301, India
                    </div>
                    <div style="color: #cbd5e1; margin-bottom: 12px;">
                      📞 <a href="tel:+918521283184" style="color: #cbd5e1; text-decoration: none;">+91 85212 83184/85</a> &nbsp;|&nbsp; ✉️ <a href="mailto:info@sprint.naturalelements.co.in" style="color: #cbd5e1; text-decoration: none;">info@sprint.naturalelements.co.in</a>
                    </div>
                    <div style="padding-top: 12px; border-top: 1px solid #062c52; font-size: 11px; color: #64748b;">
                      &copy; ${currentYear} SPRINT (Natural Elements). All rights reserved. This is an automated transactional message.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
