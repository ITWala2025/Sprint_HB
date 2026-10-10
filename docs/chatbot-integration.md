# SPRINT chatbot integration

The public-site chatbot is mounted in `src/components/layout/PublicSiteShell.jsx` via `src/components/ai/AiAssistant.tsx`. The browser posts the current message, up to 12 recent user/assistant turns, and the current page to `/api/chat`. The route validates the input and calls the server-only Ollama integration.

The default configuration in `.env` uses the local Ollama deployment:

```env
NEXT_PUBLIC_CHATBOT_API_URL=/api/chat
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

The browser sends a `POST` request in this shape:

```json
{
  "message": "Tell me about SPRINT RISE",
  "history": [
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "pathname": "/programs"
}
```

The route validates the payload and then calls the local Ollama model through `src/app/chatbot/chatbot-service.server.js`. The request includes up to six recent turns in the model prompt, alongside verified SPRINT facts. If the model is unavailable, the route falls back to the verified demo replies so the interface stays usable. The response contract remains the same:

```json
{
  "reply": "SPRINT RISE is a six-month program...",
  "action": { "label": "Explore SPRINT RISE", "href": "/programs/sprint-rise" },
  "suggestions": ["Who can apply?", "What are the fees?"]
}
```

For career guidance or help choosing a course, the assistant should first ask a short, friendly question about the visitor's interests, goals, or current experience when those details are missing. It should use answers from the conversation before suggesting relevant SPRINT learning options, and should not default to a generic refusal or list courses without context.

Important: the route must not import the client-side `chatbot-service.js` module or call `getChatbotReply()`, which issues a browser fetch. Shared deterministic replies live in `chatbot-core.js`, and Ollama integration stays in `chatbot-service.server.js`.

Action links may be same-site paths, HTTPS URLs, `tel:` links, or `mailto:`
links. Keep provider credentials on the server side and do not expose them in the public browser environment.
