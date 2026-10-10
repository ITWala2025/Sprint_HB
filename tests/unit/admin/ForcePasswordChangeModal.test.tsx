import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    updateUser: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
    profileUpdate: vi.fn(),
    rpc: vi.fn(),
    refresh: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({
        auth: {
            updateUser: mocks.updateUser,
            getUser: mocks.getUser,
            signOut: mocks.signOut,
        },
        from: () => ({ update: mocks.profileUpdate }),
        rpc: mocks.rpc,
    }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ refresh: mocks.refresh }),
}));

import ForcePasswordChangeModal from "@/components/admin/auth/ForcePasswordChangeModal";

describe("ForcePasswordChangeModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.updateUser.mockResolvedValue({ error: null });
        mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
        mocks.profileUpdate.mockReturnValue({
            eq: () => ({
                select: () => ({
                    maybeSingle: () => Promise.resolve({ data: { id: "user-1" }, error: null }),
                }),
            }),
        });
        mocks.signOut.mockResolvedValue({ error: null });
        mocks.rpc.mockResolvedValue({ data: true, error: null });
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

    it("updates Auth, verifies reset completion, and refreshes the admin shell", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        render(<ForcePasswordChangeModal onSuccess={onSuccess} />);

        await user.type(screen.getByLabelText("New Password"), "Permanent9");
        await user.type(screen.getByLabelText("Confirm Password"), "Permanent9");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(mocks.updateUser).toHaveBeenCalledWith({ password: "Permanent9" });
        expect(mocks.rpc).toHaveBeenCalledWith("complete_staff_password_reset");
        expect(mocks.refresh).toHaveBeenCalledOnce();
        expect(onSuccess).toHaveBeenCalledOnce();
    });

    it("resets the password, clears profile flags, and signs out in password-reset mode", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const assign = vi.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { assign },
        });

        render(<ForcePasswordChangeModal mode="password_reset" onSuccess={onSuccess} />);

        expect(screen.getByRole("heading", { name: "Reset Your Password" })).toBeInTheDocument();
        expect(screen.getByText("Enter your new permanent password below.")).toBeInTheDocument();
        await user.type(screen.getByLabelText("New Password"), "NewPermanent9");
        await user.type(screen.getByLabelText("Confirm Password"), "NewPermanent9");
        await user.click(screen.getByRole("button", { name: "Set permanent password" }));

        expect(mocks.updateUser).toHaveBeenCalledWith({ password: "NewPermanent9" });
        expect(mocks.getUser).toHaveBeenCalledOnce();
        expect(mocks.profileUpdate).toHaveBeenCalledWith({ must_change_password: false, first_login: false });
        expect(mocks.signOut).toHaveBeenCalledOnce();
        expect(assign).toHaveBeenCalledWith("/admin?password_reset=success");
        expect(onSuccess).toHaveBeenCalledOnce();

        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });
});