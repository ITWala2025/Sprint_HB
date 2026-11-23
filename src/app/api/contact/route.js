import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isValidContactPhone } from "@/lib/contact-phone";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const audienceTypes = new Set(["student", "working_professional", "institute", "company"]);

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }
  return typeof value === "string" && value.trim() ? [value.trim()] : [];
}

function normalizeAudience(value) {
  if (value === "professional") return "working_professional";
  return audienceTypes.has(value) ? value : null;
}

function buildEnquiryRecord(body, audienceType) {
  const fullName = toText(body.fullName) || toText(body.contactPerson);
  const email = toText(body.email);
  const phone = toText(body.phone);
  const courses = ["student", "working_professional"].includes(audienceType)
    ? toStringArray(body.interested_courses ?? body.course)
    : [];
  const services = audienceType === "institute"
    ? toStringArray(body.services ?? body.course)
    : [];
  const purposes = audienceType === "company"
    ? toStringArray(body.purpose_types ?? body.purposes ?? body.course)
    : [];
  const companyName = toText(body.companyName);
  const instituteName = toText(body.instituteName);
  const designation = toText(body.designation);
  const role = toText(body.role);
  const domain = toText(body.domain);
  const website = toText(body.website);
  const contactPersonName = toText(body.contactPerson) || fullName;
  const preferredContactTime = toText(body.preferred_contact_time)
    || toText(body.contactTime)
    || toText(body.availableTime);

  return {
    audience_type: audienceType,
    full_name: fullName,
    email,
    phone,
    company_name: companyName || (audienceType === "working_professional" ? toText(body.company) : null),
    current_company: audienceType === "working_professional" ? toText(body.company) || null : null,
    current_designation: audienceType === "working_professional" ? designation || null : null,
    designation: designation || role || null,
    role_designation: audienceType === "company" ? role || null : designation || null,
    domain: domain || null,
    company_domain: audienceType === "company" ? domain || null : null,
    total_experience: toText(body.experience) || null,
    institute_name: instituteName || null,
    contact_person_name: ["institute", "company"].includes(audienceType) ? contactPersonName : null,
    website: website || null,
    website_url: website || null,
    interested_courses: courses,
    interested_programs: courses,
    services,
    interested_services: services,
    purpose_types: purposes,
    purposes,
    preferred_contact_time: preferredContactTime || null,
    message: toText(body.message) || null,
    privacy_consent: body.privacy === true,
    metadata: body,
    status: "new",
  };
}

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
    const audienceType = normalizeAudience(audience);
    const normalizedFullName = toText(fullName);
    const normalizedEmail = toText(email);
    const normalizedPhone = toText(phone);

    if (!audienceType || !normalizedFullName || !normalizedEmail || !normalizedPhone) {
      return NextResponse.json(
        { success: false, error: "Audience, full name, email, and phone are required." },
        { status: 400 },
      );
    }

    if (!isValidContactPhone(normalizedPhone)) {
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
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      console.error("[Contact API] Supabase service-role client is not configured.");
      return NextResponse.json(
        { success: false, error: "Enquiry storage is not configured on the server." },
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
    const emailOptions = {
      from,
      to,
      replyTo: normalizedEmail,
      subject: `New ${audience} enquiry from ${normalizedFullName}`,
      text: [
        `Audience: ${audience}`,
        `Full name: ${normalizedFullName}`,
        `Email: ${normalizedEmail}`,
        `Phone: ${normalizedPhone}`,
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
          <tr><td><strong>Full name</strong></td><td>${safeText(normalizedFullName)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${safeText(normalizedEmail)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${safeText(normalizedPhone)}</td></tr>
          <tr><td><strong>Course</strong></td><td>${safeText(courseText)}</td></tr>
          <tr><td><strong>Message</strong></td><td>${safeText(message || "")}</td></tr>
          ${detailRows}
        </table>
      `,
    };

    const [emailResult, enquiryResult] = await Promise.allSettled([
      transporter.sendMail(emailOptions),
      serviceClient.from("enquiries").insert(
        buildEnquiryRecord(body, audienceType),
      ),
    ]);

    if (emailResult.status === "rejected") {
      console.error("[Contact API] SMTP delivery failed:", emailResult.reason);
    }
    if (enquiryResult.status === "rejected" || enquiryResult.value?.error) {
      console.error("[Contact API] Enquiry persistence failed:", enquiryResult.status === "rejected"
        ? enquiryResult.reason
        : enquiryResult.value.error);
    }
    if (emailResult.status === "rejected" || enquiryResult.status === "rejected" || enquiryResult.value?.error) {
      return NextResponse.json(
        { success: false, error: "Your enquiry could not be fully processed. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been sent successfully.",
      messageId: emailResult.value.messageId,
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
