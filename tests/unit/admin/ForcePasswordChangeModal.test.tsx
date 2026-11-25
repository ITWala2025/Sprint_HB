import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    updateUser: vi.fn(),
    completeSetup: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({
        auth: { updateUser: mocks.updateUser },
    }),
}));

vi.mock("@/app/staff/login/actions", () => ({
    completeFirstTimeStaffSetupAction: mocks.completeSetup,
}));

import ForcePasswordChangeModal from "@/components/admin/auth/ForcePasswordChangeModal";

describe("ForcePasswordChangeModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.updateUser.mockResolvedValue({ error: null });
        mocks.completeSetup.mockResolvedValue({ success: true });
    });

    it("does not dismiss on Escape or backdrop interaction", async () => {
        const user = userEvent.setup();
        render(<ForcePasswordChangeModal onSuccess={vi.fn()} />);

        fireEvent.keyDown(document, { key: "Escape" });
        await user.click(screen.getByRole("dialog"));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("validates the password before sending any update", async () => {
        const user = userEvent.setup();
        render(<ForcePasswordChangeModal onSuccess={vi.fn()} />);

        await user.type(screen.getByLabelText("New Password"), "weak");
        await user.type(screen.getByLabelText("Confirm Password"), "weak");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(/at least 8 characters/i);
        expect(mocks.updateUser).not.toHaveBeenCalled();
    });

    it("submits first-time password changes to the server action", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const replace = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { replace },
        });
        render(<ForcePasswordChangeModal onSuccess={onSuccess} />);

        await user.type(screen.getByLabelText("New Password"), "Permanent9");
        await user.type(screen.getByLabelText("Confirm Password"), "Permanent9");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(mocks.completeSetup).toHaveBeenCalledWith({
            newPassword: "Permanent9",
            invitationToken: undefined,
        });
        expect(mocks.updateUser).not.toHaveBeenCalled();
        expect(replace).toHaveBeenCalledWith("/staff/dashboard");
        expect(onSuccess).toHaveBeenCalledOnce();
        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });

    it("resets the password, clears profile flags, and signs out in password-reset mode", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const replace = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { replace },
        });

        render(<ForcePasswordChangeModal mode="password_reset" onSuccess={onSuccess} />);

        expect(screen.getByRole("heading", { name: "Reset Your Password" })).toBeInTheDocument();
        expect(screen.getByText("Enter your new permanent password below.")).toBeInTheDocument();
        await user.type(screen.getByLabelText("New Password"), "NewPermanent9");
        await user.type(screen.getByLabelText("Confirm Password"), "NewPermanent9");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(mocks.completeSetup).toHaveBeenCalledWith({
            newPassword: "NewPermanent9",
            invitationToken: undefined,
        });
        expect(mocks.updateUser).not.toHaveBeenCalled();
        expect(replace).toHaveBeenCalledWith("/admin/dashboard");
        expect(onSuccess).toHaveBeenCalledOnce();

        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });
});