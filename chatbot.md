# SPRINT chatbot architecture

This repository uses a local-first chatbot pattern that keeps the public UI and the AI backend separate. The browser does not call the model directly; it posts to a server route that can use a local Ollama instance, and it falls back to verified demo answers when local inference is unavailable.

## Key files

- `src/app/chatbot/ChatbotWidget.jsx` — public chat UI used in the website shell
- `src/app/chatbot/chatbot-service.js` — shared request/response contract and demo logic
- `src/app/api/chat/route.ts` — primary server-side endpoint used by the browser
- `src/app/api/ai-chat/route.ts` — compatibility alias retained for older client calls
- `.env` — local Ollama configuration (`OLLAMA_URL`, `OLLAMA_MODEL`)

## Request flow

1. The browser sends a `POST` request to `/api/chat`.
2. The server route validates the incoming message and pathname.
3. The route calls the local Ollama model through `getLocalChatbotReply()`.
4. If Ollama is unreachable or returns an empty reply, the route falls back to the verified demo response.
5. The route returns the same public contract the UI expects: `reply`, `actionLink`, `actionLabel`, and optional `suggestions`.

## Recursion guard

The route must never call the same client-side `getChatbotReply()` function that issues a `fetch()` back to `/api/chat`. That would recurse forever. The implementation resolves this by keeping the route-side logic separate from the browser-side function and by using a dedicated local Ollama request helper.

## Verified content

The project’s verified source material is anchored in the codebase, including `src/data/programs.js`, `src/data/courses.js`, `docs/md/README.md`, and the public about/contact pages.

## Local development notes

- Local model endpoint: `http://127.0.0.1:11434`
- Model name: `llama3.2:3b`
- The public app uses `NEXT_PUBLIC_CHATBOT_API_URL=/api/chat` and does not expose credentials or secrets in the browser.
