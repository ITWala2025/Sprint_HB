import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    updateUser: vi.fn(),
    rpc: vi.fn(),
    refresh: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({ auth: { updateUser: mocks.updateUser }, rpc: mocks.rpc }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ refresh: mocks.refresh }),
}));

import ForcePasswordChangeModal from "@/components/admin/auth/ForcePasswordChangeModal";

describe("ForcePasswordChangeModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.updateUser.mockResolvedValue({ error: null });
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
});