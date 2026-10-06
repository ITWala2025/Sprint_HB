import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

/*
 * The edge guard is what actually keeps the portal shut once the session is
 * gone, so it is tested directly here.
 *
 * Only the Supabase factory is faked: a real NextRequest goes in and a real
 * NextResponse comes out, so the assertions cover the genuine redirect
 * behaviour rather than a hand-rolled stub.
 */
const { getUserMock, profileMock, serverClientMock } = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const profileMock = vi.fn();

  return {
    getUserMock,
    profileMock,
    serverClientMock: {
      auth: { getUser: getUserMock },
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: profileMock }),
        }),
      }),
    },
  };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => serverClientMock,
}));

import { updateSession } from "@/lib/supabase/middleware";

/* Must mirror PORTAL_ROUTE_PREFIXES in src/lib/supabase/middleware.ts. */
const PORTAL_ROUTES = [
  "/student/dashboard",
  "/student/my-course",
  "/student/apply-course",
  "/student/assignments",
  "/student/certificates",
  "/student/profile",
  "/student/resources",
  "/student/result",
  "/student/settings",
  "/student/help-support",
];

const signIn = () => getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });

const visit = (pathname) =>
  updateSession(new NextRequest(new URL(pathname, "https://sprint.test")));

describe("student portal session guard", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    profileMock.mockReset();
  });

  /* This is the state the Logout button leaves behind: cookies cleared, so
     getUser() resolves to no user on every later request. */
  describe("after the session is invalidated", () => {
    beforeEach(() => {
      getUserMock.mockResolvedValue({ data: { user: null } });
    });

    it.each(PORTAL_ROUTES)("bounces an unauthenticated visit to %s", async (route) => {
      const response = await visit(route);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/student/login");
    });

    it("bounces nested portal URLs, not just the exact routes", async () => {
      const response = await visit("/student/dashboard/progress/2026");

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/student/login");
    });

    it("still lets the student reach Sign In to authenticate again", async () => {
      const response = await visit("/student/login");

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    });
  });

  it("admits an active student to the portal while the session is live", async () => {
    signIn();
    profileMock.mockResolvedValue({ data: { role: "student", status: "active" } });

    const response = await visit("/student/dashboard");

    expect(response.status).toBe(200);
  });

  it("rejects an authenticated user who is not an active student", async () => {
    signIn();
    profileMock.mockResolvedValue({ data: { role: "student", status: "inactive" } });

    const response = await visit("/student/dashboard");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/student/login");
  });
});