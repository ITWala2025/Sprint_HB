import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  insertPayload: null as Record<string, unknown> | null,
  insertSingle: vi.fn(),
  duplicateLimit: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mocks.getUser,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
    },
  }),
}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: mocks.duplicateLimit,
          }),
        }),
        like: () => ({
          order: () => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
      insert: (payload: Record<string, unknown>) => {
        mocks.insertPayload = payload;
        return {
          select: () => ({
            single: mocks.insertSingle,
          }),
        };
      },
    }),
  }),
}));

import { submitStudentEnrollmentAction } from "@/app/student/enroll/actions";

const input = {
  personal: {
    firstName: "Ananya",
    lastName: "Sharma",
    email: "ananya@sprint.co.in",
    dob: "2004-06-15",
    country: "India",
    state: "Jharkhand",
    phone: "9876543210",
  },
  education: {},
};

describe("submitStudentEnrollmentAction", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://sprint.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3001");
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "student-auth-id",
          email: input.personal.email,
          email_confirmed_at: "2026-01-01T00:00:00.000Z",
        },
      },
      error: null,
    });
    mocks.duplicateLimit.mockResolvedValue({ data: [], error: null });
    mocks.insertSingle.mockResolvedValue({
      data: { id: "application-id" },
      error: null,
    });
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.insertPayload = null;
  });

  it("links the submitted application to the verified user and sends a password setup email", async () => {
    const result = await submitStudentEnrollmentAction(input);

    expect(result).toMatchObject({
      success: true,
      passwordSetupEmailSent: true,
    });
    if (result.success) {
      expect(result.applicationId).toMatch(/^SPR-APP-\d{4}-\w{4}$/);
    }
    expect(mocks.insertPayload).toMatchObject({
      applicant_user_id: "student-auth-id",
      status: "pending",
      course_id: null,
    });
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      input.personal.email,
      { redirectTo: "http://localhost:3001/set-password" },
    );
  });

  it("preserves the successful enrollment when the password setup email fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.resetPasswordForEmail.mockResolvedValue({
      error: { message: "SMTP unavailable" },
    });

    try {
      const result = await submitStudentEnrollmentAction(input);

      expect(result).toMatchObject({
        success: true,
        passwordSetupEmailSent: false,
      });
      if (result.success) {
        expect(result.applicationId).toMatch(/^SPR-APP-\d{4}-\w{4}$/);
        expect(result.message).toMatch(/Forgot Password/);
      }
    } finally {
      errorSpy.mockRestore();
    }
  });
});
