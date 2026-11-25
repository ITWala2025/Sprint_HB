import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    query: {
        select: vi.fn(),
        neq: vi.fn(),
        order: vi.fn(),
    },
}));

vi.mock("@/lib/supabase/service", () => ({
    createServiceClient: () => ({ from: mocks.from }),
}));

import { getStaffDirectoryRecords } from "@/lib/supabase/staff";

describe("staff directory data", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.query.select.mockReturnValue(mocks.query);
        mocks.query.neq.mockReturnValue(mocks.query);
        mocks.query.order.mockResolvedValue({
            data: [{
                id: "staff-1",
                full_name: "Asha Kumar",
                email: "asha@example.com",
                account_type: "staff",
                role_id: "role-courses",
                role_name: "Course Designer",
                is_active: true,
                status: "active",
                first_login: false,
                must_change_password: false,
                created_at: "2025-01-01T00:00:00.000Z",
                updated_at: "2025-01-02T00:00:00.000Z",
                roles: {
                    id: "role-courses",
                    name: "Course Designer",
                    color: "blue",
                    permissions: { courses: { view: true } },
                    is_active: true,
                },
            }],
            error: null,
        });
        mocks.from.mockReturnValue(mocks.query);
    });

    it("loads directory rows from public.staff with assigned role metadata", async () => {
        const records = await getStaffDirectoryRecords();

        expect(mocks.from).toHaveBeenCalledWith("staff");
        expect(mocks.query.select).toHaveBeenCalledWith(expect.stringContaining("account_type"));
        expect(mocks.query.select).toHaveBeenCalledWith(expect.stringContaining("roles(id, name, color, permissions, is_active)"));
        expect(mocks.query.neq).toHaveBeenCalledWith("account_type", "student");
        expect(records[0]).toMatchObject({
            id: "staff-1",
            role_name: "Course Designer",
            roles: { permissions: { courses: { view: true } } },
        });
    });
});
