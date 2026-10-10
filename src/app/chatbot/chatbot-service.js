"use client";

import { getDemoChatbotReply } from "./chatbot-core";

export { getDemoChatbotReply } from "./chatbot-core";

const isSafeActionHref = (href) =>
  typeof href === "string" &&
  (/^\/(?!\/)/.test(href) ||
    /^https:\/\//i.test(href) ||
    /^tel:/i.test(href) ||
    /^mailto:/i.test(href));

function normalizeApiAction(action) {
  if (
    !action ||
    typeof action.label !== "string" ||
    !action.label.trim() ||
    !isSafeActionHref(action.href)
  ) {
    return null;
  }

  return { label: action.label.trim(), href: action.href };
}

export async function getChatbotReply({ message, history = [], pathname = "/" }) {
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_API_URL;

  if (!endpoint) {
    return getDemoChatbotReply(message, pathname);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-12),
      pathname,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chatbot request failed (${response.status}).`);
  }

  const payload = await response.json();
  if (!payload || typeof payload.reply !== "string" || !payload.reply.trim()) {
    throw new Error("The chatbot API returned an invalid response.");
  }

  return {
    reply: payload.reply.trim(),
    action: normalizeApiAction(payload.action),
    suggestions: Array.isArray(payload.suggestions)
      ? payload.suggestions.filter(
          (suggestion) => typeof suggestion === "string" && suggestion.trim(),
        )
      : [],
  };
}
