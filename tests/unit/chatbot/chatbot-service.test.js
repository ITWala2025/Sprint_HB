import { afterEach, describe, expect, it, vi } from "vitest";
import { getChatbotReply, getDemoChatbotReply } from "@/app/chatbot/chatbot-service";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("chatbot service", () => {
  it("answers course questions with a catalogue call to action in demo mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHATBOT_API_URL", "");

    const result = await getChatbotReply({ message: "What courses do you have?" });

    expect(result.reply).toContain("AI/ML");
    expect(result.action).toEqual({
      label: "Browse all courses",
      href: "/courses",
    });
  });

  it("includes current page context in the demo fallback", () => {
    const result = getDemoChatbotReply("Can you help?", "/about");

    expect(result.reply).toContain("/about");
    expect(result.suggestions).toContain("Explore courses");
  });

  it("helps visitors navigate site pages with relevant prompts", () => {
    const result = getDemoChatbotReply("What pages are on the website?");

    expect(result.action.href).toBe("/courses");
    expect(result.suggestions).toContain("Programs page");
  });

  it("links program questions to an existing program detail page", () => {
    const result = getDemoChatbotReply("Tell me about the Career Accelerator");

    expect(result.action.href).toBe("/programs/sprint-rise");
  });

  it("sends the request context and validates backend replies", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHATBOT_API_URL", "https://chat.example.test/reply");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "Here are the details.",
        action: { label: "See details", href: "/courses" },
        suggestions: ["Tell me more"],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getChatbotReply({
      message: "Tell me more",
      history: [{ role: "user", content: "Hi" }],
      pathname: "/courses",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://chat.example.test/reply",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          message: "Tell me more",
          history: [{ role: "user", content: "Hi" }],
          pathname: "/courses",
        }),
      }),
    );
    expect(result.action.href).toBe("/courses");
    expect(result.suggestions).toEqual(["Tell me more"]);
  });

  it("drops unsafe backend action links", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHATBOT_API_URL", "https://chat.example.test/reply");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          reply: "Try this.",
          action: { label: "Open", href: "javascript:alert(1)" },
        }),
      }),
    );

    const result = await getChatbotReply({ message: "Help" });

    expect(result.action).toBeNull();
  });

  it("surfaces HTTP errors instead of returning demo-shaped success", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHATBOT_API_URL", "https://chat.example.test/reply");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(getChatbotReply({ message: "Help" })).rejects.toThrow(
      "Chatbot request failed (503)",
    );
  });
});
