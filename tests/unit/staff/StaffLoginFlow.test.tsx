import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    signInWithPassword: vi.fn(),
    profileSingle: vi.fn(),
    signOut: vi.fn(),
    updateUser: vi.fn(),
    completeSetup: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
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

describe("Staff login and first-time password setup", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("opens the first-time setup modal after a successful temporary-password login", async () => {
        mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: "staff-1" } }, error: null });
        mocks.profileSingle.mockResolvedValue({
            data: { first_login: true, must_change_password: true, is_active: true },
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

    it("validates and submits the permanent password before completing setup", async () => {
        mocks.updateUser.mockResolvedValue({ error: null });
        mocks.completeSetup.mockResolvedValue({ success: true });
        const assign = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { assign },
        });

        const user = userEvent.setup();
        const invitationToken = "b".repeat(64);
        render(<FirstTimePasswordModal invitationToken={invitationToken} />);
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));
        expect(screen.getByRole("alert")).toHaveTextContent("Enter and confirm your new password.");

        await user.type(screen.getByLabelText("New Password"), "PermanentPassword123");
        await user.type(screen.getByLabelText("Confirm New Password"), "PermanentPassword123");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: "PermanentPassword123" }));
        expect(mocks.completeSetup).toHaveBeenCalledWith(invitationToken);
        expect(assign).toHaveBeenCalledWith("/staff/dashboard");
        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });

    it("shows the profile error and clears the session after login to an inactive account", async () => {
        mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: "staff-1" } }, error: null });
        mocks.profileSingle.mockResolvedValue({
            data: { first_login: false, must_change_password: false, is_active: false },
            error: null,
        });
        mocks.signOut.mockResolvedValue({ error: null });

        const user = userEvent.setup();
        render(<StaffLoginForm initialEmail="" />);
        await user.type(screen.getByLabelText("Email"), "staff@example.com");
        await user.type(screen.getByLabelText("Password"), "CorrectPassword123");
        await user.click(screen.getByRole("button", { name: "Sign In" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("This staff account is inactive or unavailable.");
        expect(mocks.signOut).toHaveBeenCalledOnce();
    });
});
