import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isValidContactPhone } from "@/lib/contact-phone";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      audience,
      fullName,
      email,
      phone,
      course,
      message,
      ...details
    } = body || {};

    if (!audience || !fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Audience, full name, email, and phone are required." },
        { status: 400 },
      );
    }

    if (!isValidContactPhone(phone)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid phone number." },
        { status: 400 },
      );
    }

    const host = process.env.SMTP_HOST || "smtp.hostinger.com";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT) || 465;

    if (!host || !user || !pass) {
      return NextResponse.json(
        { success: false, error: "SMTP is not configured on the server." },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    const safeText = (value) => String(value ?? "").replace(/[<>&"]/g, (character) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
    }[character]));

    const courseText = Array.isArray(course) ? course.join(", ") : course || "Not specified";
    const detailRows = Object.entries(details)
      .filter(([, value]) => value !== "" && value !== false && value != null)
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
        const text = Array.isArray(value) ? value.join(", ") : String(value);
        return `<tr><td><strong>${safeText(label)}</strong></td><td>${safeText(text)}</td></tr>`;
      })
      .join("");

    const to = process.env.SMTP_TO || user;
    const from = process.env.SMTP_FROM || `"SPRINT Website" <${user}>`;
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `New ${audience} enquiry from ${fullName}`,
      text: [
        `Audience: ${audience}`,
        `Full name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Course: ${courseText}`,
        "",
        `Message: ${message || ""}`,
        "",
        ...Object.entries(details)
          .filter(([, value]) => value !== "" && value !== false && value != null)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`),
      ].join("\n"),
      html: `
        <h2>New SPRINT website enquiry</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
          <tr><td><strong>Audience</strong></td><td>${safeText(audience)}</td></tr>
          <tr><td><strong>Full name</strong></td><td>${safeText(fullName)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${safeText(email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${safeText(phone)}</td></tr>
          <tr><td><strong>Course</strong></td><td>${safeText(courseText)}</td></tr>
          <tr><td><strong>Message</strong></td><td>${safeText(message || "")}</td></tr>
          ${detailRows}
        </table>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("[Contact API] Failed to send enquiry:", error);
    console.error("SMTP Error Details:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
