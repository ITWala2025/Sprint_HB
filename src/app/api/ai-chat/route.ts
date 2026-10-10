import { getChatbotReply } from "@/app/chatbot/chatbot-service";

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

  const message = payload.message;
  const requestedPathname =
    "pathname" in payload ? payload.pathname : undefined;
  if (typeof message !== "string" || !message.trim() || message.length > 500) {
    return Response.json(
      { error: "Message must contain between 1 and 500 characters." },
      { status: 400 },
    );
  }

  const pathname =
    typeof requestedPathname === "string" && requestedPathname.startsWith("/")
      ? requestedPathname
      : "/";
  const result = await getChatbotReply({
    message: message.trim(),
    pathname,
  });

  return Response.json({
    reply: result.reply,
    actionLink: result.action?.href,
    actionLabel: result.action?.label,
  });
}
