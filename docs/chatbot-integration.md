# SPRINT chatbot integration

The public-site chatbot is mounted in `PublicSiteShell` and uses SPRINT demo
answers while no API endpoint is configured. Demo answers are based on the
course and program information currently represented by the site.

Set `NEXT_PUBLIC_CHATBOT_API_URL` to enable a chatbot backend. The browser sends
a `POST` request with JSON in this shape:

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

The API must return JSON containing a non-empty `reply`. It may also include
`action` with `label` and `href`, and a `suggestions` array of prompt strings:

```json
{
  "reply": "SPRINT RISE is a six-month program...",
  "action": { "label": "Explore SPRINT RISE", "href": "/programs/sprint-rise" },
  "suggestions": ["Who can apply?", "What are the fees?"]
}
```

Action links may be same-site paths, HTTPS URLs, `tel:` links, or `mailto:`
links. Keep provider credentials on a server-side API/proxy; do not put secrets
in the public environment variable.
