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

The route validates the payload and handles common factual requests directly. The chatbot's verified context is built from the published course catalogue, course packages, programs, role-based learning paths, site address, and public contact information, together with verified Q&A records. Course, program, package, and role-path detail questions can be answered from those sources without Ollama. Other questions call the local model with up to six recent turns and the same verified facts. Fees, scholarships, enrollment decisions, and guarantees are not published as confirmed details and are routed to admissions rather than guessed. Published office-hour information conflicts, so the chatbot asks visitors to confirm current hours; unverified travel details such as distance from a landmark are identified as unknown.

Chatbot Q&A is organized into editable topic files in `data/chatbot/`, such as `courses_QA_dataset.json`, `admission_QA_dataset.json`, `scholarship_QA_dataset.json`, `payment_QA_dataset.json`, `registration_QA_dataset.json`, and `sprint_dashboard_QA_dataset.json`. Each record retains its detailed `category`, verification status, and alternative questions. The chatbot reads these topic files directly through `src/app/chatbot/chatbot-qa-datasets.js`. After editing topic files, run `npm run chatbot:qa:build` to regenerate `data/chatbot/sprint-qa-master.json`, which is kept as a consolidated compatibility/export copy. The evaluation dataset remains separate.

Only master records marked `verified` can provide FAQ answers or model context. Published project catalogues and public site configuration provide additional verified facts. For fees and other unpublished policies, the chatbot says the details are not published and directs the visitor to admissions without sending the question to Ollama or using unverified answer text. Other matching `needs_review` questions are likewise handed off. Questions with no reliable match use the deterministic demo reply or the model's verified-facts-only prompt; the chatbot cannot promise answers to every possible or unpublished question.

The response contract remains the same:

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
