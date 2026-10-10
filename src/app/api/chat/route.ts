import { getLocalChatbotReply } from "@/app/chatbot/chatbot-service.server";

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return Response.json(
      { error: "Message must contain between 1 and 500 characters." },
      { status: 400 },
    );
  }

  const { message, pathname, history } = payload as {
    message?: unknown;
    pathname?: unknown;
    history?: unknown;
  };

  if (typeof message !== "string" || !message.trim() || message.length > 500) {
    return Response.json(
      { error: "Message must contain between 1 and 500 characters." },
      { status: 400 },
    );
  }

  const safePathname =
    typeof pathname === "string" && pathname.startsWith("/") ? pathname : "/";
  const safeHistory: ChatHistoryMessage[] = Array.isArray(history)
    ? history.slice(-12).flatMap((item): ChatHistoryMessage[] => {
        if (typeof item !== "object" || item === null) return [];

        const { role, content } = item as {
          role?: unknown;
          content?: unknown;
        };
        if (
          (role !== "user" && role !== "assistant") ||
          typeof content !== "string" ||
          !content.trim()
        ) {
          return [];
        }

        return [{ role, content: content.trim().slice(0, 500) }];
      })
    : [];

  const result = await getLocalChatbotReply({
    message: message.trim(),
    history: safeHistory,
    pathname: safePathname,
  });

  return Response.json({
    reply: result.reply,
    action: result.action,
    actionLink: result.action?.href,
    actionLabel: result.action?.label,
    suggestions: result.suggestions,
  });
}

export async function GET() {
  return Response.json({
    status: "ok",
    service: "ollama-local-chatbot",
    description: "Local SPRINT chatbot endpoint powered by Ollama.",
  });
}

export async function OPTIONS() {
  return Response.json(
    {
      allow: "POST, OPTIONS",
      message: "SPRINT local chatbot endpoint.",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
