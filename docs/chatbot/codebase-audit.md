# SPRINT chatbot codebase audit

## Confirmed architecture

The project is a Next.js App Router site with a public chatbot UI (`src/app/chatbot/ChatbotWidget.jsx`). The client-side service (`src/app/chatbot/chatbot-service.js`) decides whether to answer in demo mode or call a configured backend. The server endpoint (`src/app/api/chat/route.ts`) is the real backend entry point and calls the local Ollama model.

### Current implementation summary

- Public widget: `src/app/chatbot/ChatbotWidget.jsx`
- Shared service contract: `src/app/chatbot/chatbot-service.js`
- Server route: `src/app/api/chat/route.ts`
- Compatibility route: `src/app/api/ai-chat/route.ts`
- Local model config: `.env`

## Confirmed observations

### Demo mode

When `NEXT_PUBLIC_CHATBOT_API_URL` is unset or empty, the service returns a static fallback response. The demo replies are intentionally simple and include action links such as `/courses` and `/contact`.

### Backend mode

When a custom endpoint is configured, the browser calls that URL with JSON payload fields: `message`, `history`, and `pathname`.

### Recursion risk

The main architecture risk is a loop between a service function that calls a backend and a server route that imports the same service function and triggers another fetch to the same route. The fix is to split server-side logic from client-side logic and keep the route responsible for local Ollama calls instead of invoking the browser fetch helper.

## Relevant knowledge sources

- `src/data/programs.js` — SPRINT RISE and Career Accelerator facts
- `src/data/courses.js` — courses and topic coverage
- `docs/md/README.md` — program/platform overview
- `src/app/about/page.jsx` — location and program positioning
- `src/config/site.config.json` — contact and navigation metadata

## Verified facts

- SPRINT is a job-ready training platform in Hazaribagh, Jharkhand.
- The platform emphasizes AI/ML, Cloud, and DevOps.
- SPRINT RISE is a six-month program, delivered online + in campus.
- The Career Accelerator is for B.Tech and MCA students and includes Foundations, Ignite, and Outperform phases.
- Contact details and the center address are represented in the site config and demo strings.

## Missing or non-verified facts

- Detailed tuition or scholarship tables are not yet backed by a canonical source file in the repository.
- The chatbot answers should clearly defer to admissions for pricing and eligibility edge cases.

## Security and validation

- No secrets are committed to the codebase.
- Route handlers validate request bodies and required message fields.
- Unsafe action links are filtered before being returned from the browser service.
- Local model endpoints stay on a private local server rather than a public cloud API.

## Proposed implementation direction

- Keep the browser contract stable.
- Use the local route as the canonical AI integration endpoint.
- Call Ollama from the server via `OLLAMA_URL` and `OLLAMA_MODEL` config.
- Keep demo fallback as the contingency for missing model infrastructure.
