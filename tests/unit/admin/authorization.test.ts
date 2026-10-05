import { describe, expect, it } from "vitest";
import { canAccessAdminRoute } from "../../../src/app/admin/authorization";

describe("admin route authorization", () => {
    it("allows dashboard access to every authenticated role", () => {
        expect(canAccessAdminRoute("/admin/dashboard", {}, "staff", "Admissions Officer")).toBe(true);
    });

    it("matches nested routes to their most specific permission", () => {
        expect(canAccessAdminRoute(
            "/admin/courses/advanced",
            { academics: { view: true } },
            "staff",
            "Academic Ops",
        )).toBe(true);
    });

    it("denies users without a matching view permission", () => {
        expect(canAccessAdminRoute(
            "/admin/roles",
            { admissions: { view: true } },
            "staff",
            "Admissions Officer",
        )).toBe(false);
    });

    it("grants the legacy admin role full access", () => {
        expect(canAccessAdminRoute("/admin/roles", null, "admin", null)).toBe(true);
    });

    it("denies unmapped admin routes for scoped roles", () => {
        expect(canAccessAdminRoute("/admin/unmapped", {}, "staff", "Support")).toBe(false);
    });
});