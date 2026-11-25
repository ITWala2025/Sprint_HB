import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    pathname: vi.fn(() => "/staff/dashboard"),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    usePathname: () => mocks.pathname(),
    useRouter: () => ({}),
}));

vi.mock("next/link", () => ({
    default: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({
        auth: {
            signOut: mocks.signOut,
            onAuthStateChange: mocks.onAuthStateChange,
        },
    }),
}));

vi.mock("@/app/admin/permissions-context", () => ({
    AdminPermissionsProvider: ({ children }: { children: ReactNode }) => children,
}));

import AdminLayoutClient from "@/app/admin/AdminLayoutClient";

describe("AdminLayoutClient sign out", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.pathname.mockReturnValue("/staff/dashboard");
        mocks.signOut.mockResolvedValue({ error: null });
        mocks.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
    });

    it.each([
        {
            pathname: "/staff/dashboard",
            role: "staff",
            role_name: "Course Designer",
            permissions: { courses: { view: true } },
            redirectTo: "/staff/login?signout=1",
        },
        {
            pathname: "/admin/dashboard",
            role: "staff",
            role_name: "Super Admin",
            permissions: { full_access: true },
            redirectTo: "/staff/login?signout=1",
        },
        {
            pathname: "/admin/dashboard",
            role: "admin",
            role_name: "Admin",
            permissions: null,
            redirectTo: "/admin?signout=1",
        },
    ])("routes $role sign-out from $pathname to the correct login", async ({
        pathname,
        role,
        role_name,
        permissions,
        redirectTo,
    }) => {
        mocks.pathname.mockReturnValue(pathname);
        const originalLocation = window.location;
        const assign = vi.fn();
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { assign },
        });

        render(
            <AdminLayoutClient
                initialProfile={{
                    role,
                    is_active: true,
                    must_change_password: false,
                    role_name,
                    permissions,
                    full_name: "Test User",
                    email: "test@example.com",
                }}
                pendingRegistrationCount={null}
            >
                <p>Workspace content</p>
            </AdminLayoutClient>,
        );

        await userEvent.setup().click(screen.getByRole("button", { name: "Sign Out" }));

        await waitFor(() => expect(assign).toHaveBeenCalledWith(redirectTo));
        expect(mocks.signOut).toHaveBeenCalledOnce();
        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });
});
