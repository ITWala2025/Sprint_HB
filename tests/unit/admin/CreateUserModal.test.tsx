import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ provision: vi.fn() }));

vi.mock("../../../src/app/admin/users/actions", () => ({
    provisionStaffUserAction: mocks.provision,
}));

import CreateUserModal from "../../../src/components/admin/roles/CreateUserModal";

const roles = [{ id: "role-admissions", name: "Admissions Officer", is_active: true }];

describe("CreateUserModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.provision.mockResolvedValue({
            success: true,
            userId: "user-1",
            loginUrl: "https://example.com/auth/verify?token=one-time",
        });
    });

    it("submits the temporary password and confirms the created account details", async () => {
        const user = userEvent.setup();
        const onCreated = vi.fn();
        render(<CreateUserModal roles={roles} onClose={vi.fn()} onCreated={onCreated} />);

        await user.type(screen.getByPlaceholderText("Staff member name"), "Asha Kumar");
        await user.type(screen.getByPlaceholderText("name@sprint.institute"), "asha@example.com");
        const passwordField = screen.getByPlaceholderText("Set temporary password");
        const submittedPassword = (passwordField as HTMLInputElement).value;
        expect(submittedPassword).toHaveLength(12);
        await user.click(screen.getByRole("button", { name: "Create user" }));

        expect(mocks.provision).toHaveBeenCalledWith(expect.objectContaining({
            fullName: "Asha Kumar",
            email: "asha@example.com",
            roleId: "role-admissions",
            roleName: "Admissions Officer",
            tempPassword: submittedPassword,
        }));
        expect(await screen.findByRole("heading", { name: "Staff account created" })).toBeInTheDocument();
        expect(screen.getByText("asha@example.com")).toBeInTheDocument();
        expect(screen.getByText("https://example.com/auth/verify?token=one-time")).toBeInTheDocument();
        expect(onCreated).toHaveBeenCalledOnce();
    });

    it("shows a server action failure as an accessible error toast", async () => {
        const user = userEvent.setup();
        mocks.provision.mockResolvedValue({ success: false, error: "The staff account could not be created." });
        render(<CreateUserModal roles={roles} onClose={vi.fn()} onCreated={vi.fn()} />);

        await user.type(screen.getByPlaceholderText("Staff member name"), "Asha Kumar");
        await user.type(screen.getByPlaceholderText("name@sprint.institute"), "asha@example.com");
        await user.click(screen.getByRole("button", { name: "Create user" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("The staff account could not be created.");
    });
});