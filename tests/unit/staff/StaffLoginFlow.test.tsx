import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    signInWithPassword: vi.fn(),
    profileSingle: vi.fn(),
    signOut: vi.fn(),
    updateUser: vi.fn(),
    completeSetup: vi.fn(),
    middlewareGetUser: vi.fn(),
    middlewareAccountRecord: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
    createServerClient: () => ({
        auth: { getUser: mocks.middlewareGetUser },
    }),
}));

vi.mock("@/lib/auth/admin-session", () => ({
    ADMIN_SESSION_COOKIE: "sprint_admin_session",
    ADMIN_SESSION_MAX_AGE_SECONDS: 3600,
    createAdminSessionToken: vi.fn().mockResolvedValue("admin-session"),
}));

vi.mock("@/lib/auth/student-session", () => ({
    STUDENT_SESSION_COOKIE: "sprint_student_session",
    STUDENT_SESSION_MAX_AGE_SECONDS: 3600,
    createStudentSessionToken: vi.fn(),
    verifyStudentSessionToken: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
    createServiceClient: () => ({ from: vi.fn() }),
}));

vi.mock("@/lib/supabase/staff", () => ({
    getUserAccountRecord: mocks.middlewareAccountRecord,
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({
        auth: {
            signInWithPassword: mocks.signInWithPassword,
            signOut: mocks.signOut,
            updateUser: mocks.updateUser,
        },
        from: () => ({
            select: () => ({
                eq: () => ({ single: mocks.profileSingle }),
            }),
        }),
    }),
}));

vi.mock("@/app/staff/login/actions", () => ({
    completeFirstTimeStaffSetupAction: mocks.completeSetup,
}));

import StaffLoginForm from "@/app/staff/login/StaffLoginForm";
import FirstTimePasswordModal from "@/components/staff/auth/FirstTimePasswordModal";
import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest } from "next/server";

describe("Staff login and first-time password setup", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function setMiddlewareStaffProfile(overrides: Record<string, unknown> = {}) {
        mocks.middlewareGetUser.mockResolvedValue({
            data: { user: { id: "staff-1", email: "staff@example.com" } },
            error: null,
        });
        const profile = {
            role: "staff",
            status: "active",
            is_active: true,
            first_login: false,
            must_change_password: false,
            full_name: "Staff User",
            email: "staff@example.com",
            roles: { name: "Admissions", is_active: true, permissions: { full_access: false } },
            ...overrides,
        };
        mocks.middlewareAccountRecord.mockResolvedValue({
            record: {
                ...profile,
                account_type: profile.role,
                role_name: null,
                created_at: "",
                updated_at: "",
            },
            error: null,
        });
    }

    it("opens the first-time setup modal after a successful temporary-password login", async () => {
        mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: "staff-1" } }, error: null });
        mocks.profileSingle.mockResolvedValue({
            data: { role: "staff", first_login: true, must_change_password: true, is_active: true },
            error: null,
        });

        const user = userEvent.setup();
        const invitationToken = "a".repeat(64);
        render(<StaffLoginForm initialEmail="staff@example.com" invitationToken={invitationToken} />);
        await user.type(screen.getByLabelText("Password"), "TemporaryPassword123");
        await user.click(screen.getByRole("button", { name: "Sign In" }));

        expect(await screen.findByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Set Your New Password" })).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toHaveValue("staff@example.com");
        expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
    });

    it("keeps broad-access staff on login for setup and returns them to the admin dashboard", async () => {
        mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: "staff-1" } }, error: null });
        mocks.profileSingle.mockResolvedValue({
            data: {
                role: "staff",
                first_login: true,
                must_change_password: false,
                is_active: true,
                roles: { permissions: { full_access: true } },
            },
            error: null,
        });
        mocks.completeSetup.mockResolvedValue({ success: true });
        const replace = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { replace, hash: "", search: "" },
        });

        const user = userEvent.setup();
        render(<StaffLoginForm initialEmail="admin-staff@example.com" />);
        await user.type(screen.getByLabelText("Password"), "TemporaryPassword123");
        await user.click(screen.getByRole("button", { name: "Sign In" }));

        expect(await screen.findByRole("dialog")).toBeInTheDocument();
        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/dashboard"));
        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });

    it("validates and submits the permanent password before completing setup", async () => {
        mocks.completeSetup.mockResolvedValue({ success: true });
        window.history.replaceState({}, "", "/staff/login?invitation=token&email=staff%40example.com");
        const replace = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { replace },
        });

        const user = userEvent.setup();
        const invitationToken = "b".repeat(64);
        render(<FirstTimePasswordModal invitationToken={invitationToken} />);
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));
        expect(screen.getByRole("alert")).toHaveTextContent("Enter and confirm your new password.");

        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        await waitFor(() => expect(mocks.completeSetup).toHaveBeenCalledWith({
            newPassword: "PermanentPassword123",
            invitationToken,
        }));
        expect(mocks.updateUser).not.toHaveBeenCalled();
        expect(replace).toHaveBeenCalledWith("/staff/dashboard");
        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });

    it.each([
        { first_login: true, must_change_password: false },
        { first_login: false, must_change_password: true },
    ])("keeps a staff member with setup flags on the login page: %o", async (flags) => {
        setMiddlewareStaffProfile(flags);

        const response = await updateSession(new NextRequest("https://example.com/staff/login"));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });

    it("keeps broad-access staff with setup flags on the staff login page", async () => {
        setMiddlewareStaffProfile({
            first_login: true,
            roles: { name: "Operations", is_active: true, permissions: { full_access: true } },
        });

        const response = await updateSession(new NextRequest("https://example.com/staff/login"));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });

    it("redirects broad-access staff with setup flags from admin workspace routes to staff login", async () => {
        setMiddlewareStaffProfile({
            must_change_password: true,
            roles: { name: "Operations", is_active: true, permissions: { full_access: true } },
        });

        const response = await updateSession(new NextRequest("https://example.com/admin/dashboard"));

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("https://example.com/staff/login");
    });

    it("allows an active course designer to access the staff dashboard without dashboard permission", async () => {
        setMiddlewareStaffProfile({
            roles: {
                name: "Course Designer",
                is_active: true,
                permissions: { courses: { view: true } },
            },
        });

        const response = await updateSession(new NextRequest("https://example.com/staff/dashboard"));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });

    it("rewrites an authorized scoped staff course route to the admin implementation", async () => {
        setMiddlewareStaffProfile({
            roles: {
                name: "Course Designer",
                is_active: true,
                permissions: { courses: { view: true } },
            },
        });

        const response = await updateSession(new NextRequest("https://example.com/staff/courses"));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
        expect(response.headers.get("x-middleware-rewrite")).toBe("https://example.com/admin/courses");
    });

    it.each([
        { first_login: true, must_change_password: false },
        { first_login: false, must_change_password: true },
    ])("redirects staff with setup flags from workspace routes to login: %o", async (flags) => {
        setMiddlewareStaffProfile(flags);

        const response = await updateSession(new NextRequest("https://example.com/staff/dashboard"));

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("https://example.com/staff/login");
    });

    it.each([
        { pathname: "/staff/login", method: "POST" },
        { pathname: "/admin/login", method: "POST" },
        { pathname: "/staff/login", method: "GET", headers: { "next-action": "server-action-id" } },
    ])("does not redirect login submissions: %o", async ({ pathname, method, headers }) => {
        setMiddlewareStaffProfile();

        const response = await updateSession(new NextRequest(`https://example.com${pathname}`, { method, headers }));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });

    it.each(["/staff/dashboard", "/staff/courses"])(
        "redirects unauthenticated requests to %s to staff login even when the admin cookie exists",
        async (pathname) => {
        mocks.middlewareGetUser.mockResolvedValue({ data: { user: null }, error: null });
        const request = new NextRequest(`https://example.com${pathname}`);
        request.cookies.set("sprint_admin_session", "stale-session");

        const response = await updateSession(request);

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("https://example.com/staff/login");
        expect(response.cookies.get("sprint_admin_session")?.value).toBe("");
        },
    );

    it.each([
        { pathname: "/staff/login?signout=1", expected: "https://example.com/staff/login" },
        { pathname: "/admin?signout=1", expected: "https://example.com/admin" },
    ])("clears the Auth and admin session cookies during sign-out: %o", async ({ pathname, expected }) => {
        const request = new NextRequest(`https://example.com${pathname}`);
        request.cookies.set("sprint_admin_session", "signed-session");
        request.cookies.set("sb-project-auth-token", "auth-session");

        const response = await updateSession(request);

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(expected);
        expect(response.cookies.get("sprint_admin_session")?.value).toBe("");
        expect(response.cookies.get("sb-project-auth-token")?.value).toBe("");
    });

    it("lets a Server Action on a staff workspace return its own expired-session result", async () => {
        mocks.middlewareGetUser.mockResolvedValue({ data: { user: null }, error: null });
        const request = new NextRequest("https://example.com/staff/dashboard", {
            method: "POST",
            headers: { "next-action": "server-action-id" },
        });
        request.cookies.set("sprint_admin_session", "signed-session");

        const response = await updateSession(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
        expect(response.cookies.get("sprint_admin_session")).toBeUndefined();
    });

    it("displays the exact server-side password update error", async () => {
        const passwordError = "New password should be different from the temporary password.";
        mocks.completeSetup.mockResolvedValue({ success: false, error: passwordError });

        const user = userEvent.setup();
        render(<FirstTimePasswordModal />);
        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(passwordError);
        expect(mocks.completeSetup).toHaveBeenCalledWith({
            newPassword: "PermanentPassword123",
            invitationToken: undefined,
        });
        expect(mocks.updateUser).not.toHaveBeenCalled();
    });

    it("redirects expired sessions back to login with the invitation and email", async () => {
        const originalSearch = window.location.search;
        const replace = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { search: "?invitation=abc123&email=staff%40example.com", replace },
        });
        mocks.completeSetup.mockResolvedValue({
            success: false,
            code: "SESSION_EXPIRED",
            error: "Your login session expired. Please sign in again with your temporary password.",
        });

        const user = userEvent.setup();
        render(<FirstTimePasswordModal invitationToken="abc123" />);
        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        await waitFor(() => expect(replace).toHaveBeenCalledWith(
            "/staff/login?invitation=abc123&email=staff%40example.com",
        ));
        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
        window.history.replaceState({}, "", originalSearch || "/");
    });

    it("displays the exact first-time setup action error", async () => {
        const actionError = "Your invitation could not be marked as used.";
        mocks.updateUser.mockResolvedValue({ error: null });
        mocks.completeSetup.mockResolvedValue({ success: false, error: actionError });

        const user = userEvent.setup();
        render(<FirstTimePasswordModal />);
        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(actionError);
    });

    it("logs and displays unexpected password setup errors", async () => {
        const unexpectedError = new Error("Action response could not be read.");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        mocks.updateUser.mockResolvedValue({ error: null });
        mocks.completeSetup.mockRejectedValue(unexpectedError);

        const user = userEvent.setup();
        render(<FirstTimePasswordModal />);
        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(unexpectedError.message);
        expect(consoleError).toHaveBeenCalledWith(
            "[SPRINT Staff Setup] Could not complete first-time password setup:",
            unexpectedError,
        );
        consoleError.mockRestore();
    });

    it("shows the profile error and clears the session after login to an inactive account", async () => {
        mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: "staff-1" } }, error: null });
        mocks.profileSingle.mockResolvedValue({
            data: { role: "staff", first_login: false, must_change_password: false, is_active: false },
            error: null,
        });
        mocks.signOut.mockResolvedValue({ error: null });

        const user = userEvent.setup();
        render(<StaffLoginForm initialEmail="" />);
        await user.type(screen.getByLabelText("Email"), "staff@example.com");
        await user.type(screen.getByLabelText("Password"), "CorrectPassword123");
        await user.click(screen.getByRole("button", { name: "Sign In" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("This staff account is inactive. Contact your administrator.");
        expect(mocks.signOut).toHaveBeenCalledOnce();
    });

    it("rejects and signs out a student account attempting staff login", async () => {
        mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: "student-1" } }, error: null });
        mocks.profileSingle.mockResolvedValue({
            data: { role: "student", first_login: false, must_change_password: false, is_active: true },
            error: null,
        });
        mocks.signOut.mockResolvedValue({ error: null });

        const user = userEvent.setup();
        render(<StaffLoginForm initialEmail="" />);
        await user.type(screen.getByLabelText("Email"), "student@example.com");
        await user.type(screen.getByLabelText("Password"), "StudentPassword123");
        await user.click(screen.getByRole("button", { name: "Sign In" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "This is a student account. Use the Student Portal to sign in.",
        );
        expect(mocks.signOut).toHaveBeenCalledOnce();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
