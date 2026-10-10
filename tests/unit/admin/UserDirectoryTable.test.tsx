import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/admin/users/actions", () => ({
    deleteStaffUserAction: vi.fn().mockResolvedValue({ success: true }),
    resendStaffInvitationAction: vi.fn().mockResolvedValue({
        success: true,
        email: "asha@example.com",
        tempPassword: "new-temporary-password",
        inviteUrl: "https://example.com/staff/invitation/new-token",
    }),
}));
vi.mock("@/components/admin/roles/CreateUserModal", () => ({
    default: () => <div role="dialog">Create staff user dialog</div>,
}));

import { deleteStaffUserAction, resendStaffInvitationAction } from "@/app/admin/users/actions";
import UserDirectoryTable, { type DirectoryUser } from "@/components/admin/users/UserDirectoryTable";

const users: DirectoryUser[] = [
    {
        id: "user-1",
        full_name: "Asha Kumar",
        email: "asha@example.com",
        role: "staff",
        role_id: "role-admissions",
        is_active: true,
        must_change_password: true,
        first_login: true,
        avatar_url: null,
        roleName: "Admissions Officer",
        roleColor: "red",
    },
    {
        id: "user-2",
        full_name: "Dev Singh",
        email: "dev@example.com",
        role: "staff",
        role_id: "role-academics",
        is_active: false,
        must_change_password: false,
        first_login: false,
        avatar_url: null,
        roleName: "Academic Ops",
        roleColor: "blue",
    },
];

describe("UserDirectoryTable", () => {
    it("filters directory rows by name/email and assigned role", async () => {
        const user = userEvent.setup();
        render(<UserDirectoryTable users={users} roles={[
            { id: "role-admissions", name: "Admissions Officer" },
            { id: "role-academics", name: "Academic Ops" },
        ]} canInvite={true} canDelete={false} />);

        await user.type(screen.getByRole("searchbox"), "asha@");
        expect(screen.getByText("Asha Kumar")).toBeInTheDocument();
        expect(screen.queryByText("Dev Singh")).not.toBeInTheDocument();
        await user.clear(screen.getByRole("searchbox"));
        await user.selectOptions(screen.getByLabelText("Filter by assigned role"), "role-academics");

        expect(screen.getByText("Dev Singh")).toBeInTheDocument();
        expect(screen.queryByText("Asha Kumar")).not.toBeInTheDocument();
    });

    it("opens the create-user modal from the directory action", async () => {
        const user = userEvent.setup();
        render(<UserDirectoryTable users={[]} roles={[]} canInvite={true} canDelete={false} />);

        await user.click(screen.getByRole("button", { name: /invite \/ create user/i }));
        expect(screen.getByRole("dialog")).toHaveTextContent("Create staff user dialog");
    });

    it("deletes a staff account through the server action", async () => {
        const user = userEvent.setup();
        const confirm = vi.fn().mockReturnValue(true);
        Object.defineProperty(window, "confirm", { configurable: true, value: confirm });
        render(<UserDirectoryTable users={users} roles={[]} canInvite={false} canDelete={true} />);

        await user.click(screen.getByRole("button", { name: "Delete Asha Kumar" }));

        expect(confirm).toHaveBeenCalled();
        await waitFor(() => expect(deleteStaffUserAction).toHaveBeenCalledWith("user-1"));
    });

    it("resends an invitation and shows the new temporary credentials", async () => {
        vi.clearAllMocks();
        const user = userEvent.setup();
        render(<UserDirectoryTable users={users} roles={[]} canInvite={true} canDelete={false} />);

        await user.click(screen.getByRole("button", { name: "Resend invitation to asha@example.com" }));

        await waitFor(() => expect(resendStaffInvitationAction).toHaveBeenCalledWith("user-1"));
        expect(await screen.findByRole("heading", { name: "Invitation resent" })).toBeInTheDocument();
        expect(screen.getByText("new-temporary-password")).toBeInTheDocument();
        expect(screen.getByText("https://example.com/staff/invitation/new-token")).toBeInTheDocument();
    });
});