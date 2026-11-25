import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  updateUserById: vi.fn(),
  updates: [] as Array<{ table: string; values: Record<string, unknown> }>,
  enrollmentRows: [] as Array<{ id: string; application_number: string }>,
  rpcCalls: [] as Array<{ name: string; args: Record<string, unknown> }>,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: mocks.getUser },
  }),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    auth: { admin: { updateUserById: mocks.updateUserById } },
    rpc: (name: string, args: Record<string, unknown>) => {
      mocks.rpcCalls.push({ name, args });
      return mocks.rpc(name, args);
    },
    from: (table: string) => ({
      select: () => ({
        eq: (field: string) => {
          if (table === "enrollments" && field === "legacy_registration_id") {
            return Promise.resolve({ data: mocks.enrollmentRows, error: null });
          }
          return ({
          eq: () => ({ maybeSingle: mocks.maybeSingle }),
          maybeSingle: mocks.maybeSingle,
          });
        },
      }),
      update: (values: Record<string, unknown>) => {
        mocks.updates.push({ table, values });
        return ({
        eq: () => ({
          select: () => ({
            maybeSingle: () => Promise.resolve({ data: { id: "updated-id" }, error: null }),
          }),
        }),
        });
      },
    }),
  }),
}));

import {
  checkEnrollmentEmailAction,
  submitStudentEnrollmentAction,
} from "@/app/student/enroll/actions";

const input = {
  personal: {
    firstName: "Ananya",
    lastName: "Sharma",
    email: "ananya@sprint.co.in",
    dob: "2004-06-15",
    country: "India",
    state: "Jharkhand",
    phone: "9876543210",
    city: "Ranchi",
  },
  education: {},
};

describe("student enrollment actions", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://sprint.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
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
    mocks.rpc.mockResolvedValue({
      data: {
        registration_id: "registration-id",
        application_id: "SPR-APP-2611-0001",
        enrollment_count: 0,
      },
      error: null,
    });
    mocks.maybeSingle.mockResolvedValue({
      data: { id: "resolved-course-id" },
      error: null,
    });
    mocks.updateUserById.mockResolvedValue({ data: { user: { id: "student-auth-id" } }, error: null });
    mocks.rpcCalls = [];
    mocks.updates = [];
    mocks.enrollmentRows = [];
  });

  it("uses a server-only RPC to check whether the email is already registered", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: true, error: null });

    await expect(checkEnrollmentEmailAction(input.personal.email)).resolves.toEqual({
      success: true,
      exists: true,
    });
    expect(mocks.rpcCalls[0]).toEqual({
      name: "check_auth_email_exists",
      args: { p_email: input.personal.email },
    });
  });

  it("routes an empty course selection to registrations only", async () => {
    const result = await submitStudentEnrollmentAction(input);

    expect(result).toMatchObject({
      success: true,
      applicationId: "SPR-APP-2611-0001",
      hasCourseEnrollment: false,
    });
    expect(mocks.rpcCalls).toHaveLength(1);
    expect(mocks.rpcCalls[0].name).toBe("submit_student_intake");
    expect(mocks.rpcCalls[0].args).toMatchObject({
      p_user_id: "student-auth-id",
      p_full_name: "Ananya Sharma",
      p_email: input.personal.email,
      p_college_institution: null,
      p_date_of_birth: "2004-06-15",
      p_country: "India",
      p_state: "Jharkhand",
      p_products: [],
    });
  });

  it("resolves and submits multiple courses and bundles for transactional enrollment inserts", async () => {
    mocks.enrollmentRows = [
      { id: "enrollment-1", application_number: "SPR-APP-2611-0001" },
      { id: "enrollment-2", application_number: "SPR-APP-2611-AB12" },
    ];
    mocks.rpc.mockResolvedValue({
      data: {
        registration_id: "registration-id",
        application_id: "SPR-APP-2611-0001",
        enrollment_count: 2,
      },
      error: null,
    });

    const result = await submitStudentEnrollmentAction({
      ...input,
      education: {
        collegeInstitution: "SPRINT Test College",
        courseIds: ["course-slug"],
        bundleIds: ["bundle-id"],
      },
    });

    expect(result).toMatchObject({
      success: true,
      hasCourseEnrollment: true,
    });
    expect(mocks.rpcCalls[0].args.p_products).toEqual([
      { course_id: "resolved-course-id", bundle_id: null },
      { course_id: null, bundle_id: "resolved-course-id" },
    ]);
    expect(mocks.rpcCalls[0].args.p_college_institution).toBe("SPRINT Test College");
  });

  it("uses the Step 1 city and completes the profile and auth name after intake", async () => {
    const result = await submitStudentEnrollmentAction({
      ...input,
      personal: { ...input.personal, city: "" },
      education: { city: "Legacy City" },
    });

    expect(result.success).toBe(true);
    expect(mocks.updates).toContainEqual({
      table: "registrations",
      values: expect.objectContaining({ city: "Legacy City" }),
    });
    expect(mocks.updates).toContainEqual({
      table: "profiles",
      values: { onboarding_completed: true, full_name: "Ananya Sharma" },
    });
    expect(mocks.updateUserById).toHaveBeenCalledWith(
      "student-auth-id",
      {
        user_metadata: {
          full_name: "Ananya Sharma",
          first_name: "Ananya",
          last_name: "Sharma",
        },
      },
    );
  });

  it("rejects unverified or mismatched email sessions before writing", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "other-user", email: "other@example.com" } },
      error: null,
    });

    const result = await submitStudentEnrollmentAction(input);

    expect(result).toMatchObject({
      success: false,
      error: expect.stringMatching(/verify the same email/i),
    });
    expect(mocks.rpcCalls).toHaveLength(0);
  });

  it("surfaces authentication email lookup errors", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "RPC missing" },
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await expect(checkEnrollmentEmailAction(input.personal.email)).resolves.toEqual({
        success: false,
        error: "We couldn't check this email. Please try again.",
      });
    } finally {
      errorSpy.mockRestore();
    }
  });
});
