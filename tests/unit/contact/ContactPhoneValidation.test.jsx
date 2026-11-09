import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CompanyForm from "@/components/contact/CompanyForm";
import InstituteForm from "@/components/contact/InstituteForm";
import StudentForm from "@/components/contact/StudentForm";
import WorkingProfessionalForm from "@/components/contact/WorkingProfessionalForm";
import { POST } from "@/app/api/contact/route";
import {
  CONTACT_PHONE_ERROR,
  getContactPhoneError,
  isValidContactPhone,
} from "@/lib/contact-phone";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({ sendMail }),
  },
}));

describe("contact phone validation", () => {
  it.each([
    ["10-digit number beginning with 6", "6123456789"],
    ["10-digit number beginning with 7", "7123456789"],
    ["10-digit number beginning with 8", "8123456789"],
    ["10-digit number beginning with 9", "9123456789"],
    ["+91 country code", "+919876543210"],
    ["+91 country code with separators", "+91 98765-43210"],
    ["parentheses and separators", "+91 (98765) 43210"],
  ])("accepts %s", (_description, phone) => {
    expect(isValidContactPhone(phone)).toBe(true);
  });

  it.each([
    ["empty", ""],
    ["alphabetic", "abc"],
    ["mixed alphabetic", "+91 98765 CALL"],
    ["punctuation only", "+()- ."],
    ["too short", "987654321"],
    ["too long", "+91 98765432101"],
    ["invalid mobile prefix", "5123456789"],
    ["foreign country code", "+44 20 7946 0958"],
    ["country code without plus", "919876543210"],
    ["repeated plus", "++919876543210"],
    ["unbalanced parentheses", "+91 (98765 43210"],
    ["empty parentheses", "+91 () 9876543210"],
  ])("rejects %s", (_description, phone) => {
    expect(isValidContactPhone(phone)).toBe(false);
  });

  it("keeps an empty value to native required-field validation", () => {
    expect(getContactPhoneError("")).toBe("");
  });

  it.each([
    ["student", StudentForm, "student-phone"],
    ["working professional", WorkingProfessionalForm, "professional-phone"],
    ["institute", InstituteForm, "institute-phone"],
    ["company", CompanyForm, "company-phone"],
  ])("%s form blocks invalid phones and accepts Indian numbers", async (_name, Form, id) => {
    const { container, unmount } = render(<Form />);
    const phone = container.querySelector(`#${id}`);
    const form = container.querySelector("form");

    expect(phone).toBeInTheDocument();
    expect(phone).toBeRequired();
    expect(phone.validity.valueMissing).toBe(true);
    const email = container.querySelector('input[type="email"]');
    expect(email).toHaveAttribute("type", "email");
    fireEvent.change(email, { target: { value: "invalid-email" } });
    expect(email.checkValidity()).toBe(false);
    fireEvent.change(email, { target: { value: "valid@example.com" } });

    for (const control of form.querySelectorAll("[required]")) {
      if (control !== phone) {
        control.required = false;
      }
    }

    fireEvent.change(phone, { target: { value: "abc" } });
    expect(phone.checkValidity()).toBe(false);
    expect(form.checkValidity()).toBe(false);
    expect(phone.validationMessage).toBe(CONTACT_PHONE_ERROR);

    fireEvent.blur(phone);
    expect(screen.getByRole("alert")).toHaveTextContent(CONTACT_PHONE_ERROR);
    expect(phone).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(phone, { target: { value: "+91 (98765) 43210" } });
    expect(phone.checkValidity()).toBe(true);
    expect(phone).not.toHaveAttribute("aria-invalid");
    expect(form.checkValidity()).toBe(true);

    unmount();
  });
});

describe("POST /api/contact phone validation", () => {
  afterEach(() => {
    sendMail.mockReset();
    vi.unstubAllEnvs();
  });

  it.each(["abc", "+()- .", "+91 (98765 43210", "+91 98765432101", "5123456789", "+44 20 7946 0958"])(
    "rejects invalid phone %s before attempting email delivery",
    async (phone) => {
      const response = await POST(
        new Request("http://localhost/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audience: "student",
            fullName: "Test User",
            email: "test@example.com",
            phone,
          }),
        }),
      );

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        success: false,
        error: "Please provide a valid phone number.",
      });
    },
  );

  it("rejects an empty phone as a required field", async () => {
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: "student",
          fullName: "Test User",
          email: "test@example.com",
          phone: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Audience, full name, email, and phone are required.",
    });
  });

  it("accepts a valid Indian phone and continues through email delivery", async () => {
    vi.stubEnv("SMTP_USER", "test@example.com");
    vi.stubEnv("SMTP_PASS", "test-password");
    sendMail.mockResolvedValue({ messageId: "test-message-id" });

    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: "student",
          fullName: "Test User",
          email: "test@example.com",
          phone: "+91 98765 43210",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true });
    expect(sendMail).toHaveBeenCalledOnce();
  });
});
