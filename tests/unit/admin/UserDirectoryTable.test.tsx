import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/components/admin/roles/CreateUserModal", () => ({
    default: () => <div role="dialog">Create staff user dialog</div>,
}));

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
        ]} canInvite={true} />);

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
        render(<UserDirectoryTable users={[]} roles={[]} canInvite={true} />);

        await user.click(screen.getByRole("button", { name: /invite \/ create user/i }));
        expect(screen.getByRole("dialog")).toHaveTextContent("Create staff user dialog");
    });
});