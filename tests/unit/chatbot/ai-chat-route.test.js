import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/ai-chat/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/ai-chat", () => {
  it("returns a reply and optional action in the public API contract", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHATBOT_API_URL", "");
    const response = await POST(
      new Request("http://localhost/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "What courses do you have?",
          pathname: "/courses",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      reply: expect.stringContaining("AI/ML"),
      actionLink: "/courses",
      actionLabel: "Browse all courses",
    });
  });

  it("rejects missing, empty, and oversized messages", async () => {
    for (const payload of [
      null,
      {},
      { message: " " },
      { message: "a".repeat(501) },
    ]) {
      const response = await POST(
        new Request("http://localhost/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );

      expect(response.status).toBe(400);
    }
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
  });
});
