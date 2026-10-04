import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ provision: vi.fn() }));

vi.mock("@/app/admin/users/actions", () => ({
    provisionStaffUserAction: mocks.provision,
}));

import CreateUserModal from "@/components/admin/roles/CreateUserModal";

const roles = [{ id: "role-admissions", name: "Admissions Officer", is_active: true }];

describe("CreateUserModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.provision.mockResolvedValue({ success: true, userId: "user-1" });
    });

    it("calls the provisioning action with the selected role and shows sent credentials", async () => {
        const user = userEvent.setup();
        const onCreated = vi.fn();
        render(<CreateUserModal roles={roles} onClose={vi.fn()} onCreated={onCreated} />);

        await user.type(screen.getByPlaceholderText("Staff member name"), "Asha Kumar");
        await user.type(screen.getByPlaceholderText("name@sprint.institute"), "asha@example.com");
        await user.click(screen.getByRole("button", { name: /create user and send invitation/i }));

        expect(mocks.provision).toHaveBeenCalledWith(expect.objectContaining({
            fullName: "Asha Kumar",
            email: "asha@example.com",
            roleId: "role-admissions",
            roleName: "Admissions Officer",
        }));
        expect(await screen.findByRole("heading", { name: "Invitation sent" })).toBeInTheDocument();
        expect(onCreated).toHaveBeenCalledOnce();
    });

    it("shows a server action failure as an accessible error toast", async () => {
        const user = userEvent.setup();
        mocks.provision.mockResolvedValue({ success: false, error: "Email delivery failed." });
        render(<CreateUserModal roles={roles} onClose={vi.fn()} onCreated={vi.fn()} />);

        await user.type(screen.getByPlaceholderText("Staff member name"), "Asha Kumar");
        await user.type(screen.getByPlaceholderText("name@sprint.institute"), "asha@example.com");
        await user.click(screen.getByRole("button", { name: /create user and send invitation/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Email delivery failed.");
    });
});