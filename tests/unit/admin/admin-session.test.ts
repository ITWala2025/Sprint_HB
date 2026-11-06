import { describe, expect, it } from "vitest";
import {
    createAdminSessionToken,
    verifyAdminSessionToken,
    type AdminSessionPayload,
} from "@/lib/auth/admin-session";

describe("admin session token management", () => {
    const mockSession: Omit<AdminSessionPayload, "exp"> = {
        userId: "user_test_123",
        email: "admin@sprint.institute",
        fullName: "Sprint Administrator",
        role: "admin",
        roleName: "Super Admin",
        isActive: true,
        isAdmin: true,
        mustChangePassword: false,
        permissions: { full_access: true },
    };

    it("creates and verifies a valid HMAC-signed session token", async () => {
        const token = await createAdminSessionToken(mockSession);
        expect(typeof token).toBe("string");
        expect(token).toContain(".");

        const verified = await verifyAdminSessionToken(token);
        expect(verified).not.toBeNull();
        expect(verified?.userId).toBe("user_test_123");
        expect(verified?.email).toBe("admin@sprint.institute");
        expect(verified?.isAdmin).toBe(true);
        expect(verified?.isActive).toBe(true);
    });

    it("rejects a tampered session token", async () => {
        const token = await createAdminSessionToken(mockSession);
        const [payloadB64, sigB64] = token.split(".");

        // Tamper with payload
        const tamperedPayload = btoa(JSON.stringify({ ...mockSession, isAdmin: true, role: "attacker" }));
        const tamperedToken = `${tamperedPayload}.${sigB64}`;

        const verified = await verifyAdminSessionToken(tamperedToken);
        expect(verified).toBeNull();
    });

    it("rejects an expired session token", async () => {
        const expiredSession = {
            ...mockSession,
            exp: Date.now() - 1000, // expired 1s ago
        };
        const token = await createAdminSessionToken(expiredSession);
        const verified = await verifyAdminSessionToken(token);
        expect(verified).toBeNull();
    });

    it("handles invalid or malformed tokens safely", async () => {
        expect(await verifyAdminSessionToken("")).toBeNull();
        expect(await verifyAdminSessionToken("not-a-token")).toBeNull();
        expect(await verifyAdminSessionToken("part1.part2.part3")).toBeNull();
    });
});

