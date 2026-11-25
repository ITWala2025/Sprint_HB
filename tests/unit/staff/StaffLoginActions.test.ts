import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    cookies: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    createServiceClient: vi.fn(),
    verifyAdminSessionToken: vi.fn(),
    createAdminSessionToken: vi.fn(),
    updateUserById: vi.fn(),
    serviceFrom: vi.fn(),
    revalidatePath: vi.fn(),
    cookieStore: {
        getAll: vi.fn(() => []),
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("@supabase/ssr", () => ({
    createServerClient: () => ({
        auth: {
            getUser: mocks.getUser,
            signInWithPassword: mocks.signInWithPassword,
        },
    }),
}));

vi.mock("next/headers", () => ({
    cookies: mocks.cookies,
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/supabase/service", () => ({
    createServiceClient: mocks.createServiceClient,
}));

vi.mock("@/lib/auth/admin-session", () => ({
    ADMIN_SESSION_COOKIE: "sprint_admin_session",
    ADMIN_SESSION_MAX_AGE_SECONDS: 28800,
    createAdminSessionToken: mocks.createAdminSessionToken,
    verifyAdminSessionToken: mocks.verifyAdminSessionToken,
}));

import { completeFirstTimeStaffSetupAction } from "@/app/staff/login/actions";

describe("completeFirstTimeStaffSetupAction session recovery", () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
        mocks.cookies.mockResolvedValue(mocks.cookieStore);
        mocks.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: "Auth session missing!" },
        });
        mocks.verifyAdminSessionToken.mockResolvedValue(null);
        mocks.createServiceClient.mockReturnValue({
            auth: { admin: { updateUserById: mocks.updateUserById } },
            from: mocks.serviceFrom,
        });
    });

    afterEach(() => {
        if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
    });

    it("clears the stale signed cookie and returns a clean expired-session result", async () => {
        const result = await completeFirstTimeStaffSetupAction({
            newPassword: "PermanentPassword123",
        });

        expect(result).toEqual({
            success: false,
            code: "SESSION_EXPIRED",
            error: "Your login session expired. Please sign in again with your temporary password.",
        });
        expect(mocks.cookieStore.delete).toHaveBeenCalledWith("sprint_admin_session");
        expect(JSON.stringify(result)).not.toContain("Auth session missing!");
        expect(mocks.createServiceClient).not.toHaveBeenCalled();
    });

    it("uses a verified signed session only to look up and validate the profile", async () => {
        mocks.cookieStore.get.mockReturnValue({ value: "signed-session" });
        mocks.verifyAdminSessionToken.mockResolvedValue({
            userId: "staff-user",
            isActive: true,
        });
        const profileQuery = {
            select: vi.fn(),
            eq: vi.fn(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
        profileQuery.select.mockReturnValue(profileQuery);
        profileQuery.eq.mockReturnValue(profileQuery);
        mocks.serviceFrom.mockReturnValue(profileQuery);

        const result = await completeFirstTimeStaffSetupAction({
            newPassword: "PermanentPassword123",
        });

        expect(mocks.serviceFrom).toHaveBeenCalledWith("profiles");
        expect(profileQuery.eq).toHaveBeenCalledWith("id", "staff-user");
        expect(result).toEqual({
            success: false,
            error: "Your staff profile could not be verified.",
        });
        expect(mocks.updateUserById).not.toHaveBeenCalled();
        expect(mocks.cookieStore.delete).not.toHaveBeenCalled();
    });
});
