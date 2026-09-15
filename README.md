# SPRINT_HB — Institutional Training Hub (Next.js)

SPRINT is a job-ready training platform in Hazaribagh, Jharkhand, India, focused on
bridging the academic–industry gap through hands-on programs in **emerging
technologies (AI/ML, Cloud, DevOps)**.

This repository is the **Next.js (App Router)** implementation. All brand design
tokens live in [`src/css/global.css`](src/css/global.css) (Tailwind CSS v4 `@theme`),
and the single source of truth for the About page lives in
[`docs/md/About_Page.md`](docs/md/About_Page.md).

## Prerequisites

- **Node.js** `>= 20` (project developed on Node v24)
- **npm** `>= 10`

## Folder Structure

```text
src/
├── app/                          # Next.js App Router routes
│   ├── layout.jsx                # Root layout (global Header + Footer, global CSS)
│   ├── page.jsx                  # Home (/)
│   ├── about/page.jsx            # About Us (/about)  ← spec: docs/md/About_Page.md
│   ├── courses/page.jsx          # Courses (/courses)
│   ├── contact/page.jsx          # Contact (/contact)
│   ├── updates/page.jsx          # Updates (/updates)
│   ├── register/page.jsx         # Enrollment (/register)
│   └── student/login/page.jsx    # Student Portal (/student/login)
├── components/
│   ├── layout/
│   │   ├── Header.jsx            # Global sticky header (client component)
│   │   └── Footer.jsx            # Global 5-column footer
│   └── cards/
│       ├── ProfileCard.jsx       # Leadership / Faculty card (DRY, shared)
│       ├── SkillCard.jsx         # Industry skill card (AI / Cloud / DevOps)
│       ├── StatCounter.jsx       # Impact counter (client, count-up)
│       ├── VisionMissionCard.jsx # Vision & Mission glass cards
│       └── Reveal.jsx            # Scroll reveal wrapper (client)
├── config/
│   ├── navigation.json           # Header navigation (single source)
│   └── site.config.json          # Brand + contact details (tel:, mailto:, wa.me)
├── css/
│   ├── global.css                # Tailwind v4 + SPRINT brand theme  (DO NOT EDIT casually)
│   ├── header.css                # Reserved for header-level CSS
│   ├── footer.css                # Reserved for footer-level CSS
│   └── about.css                 # About-page helpers (glass cards, accents)
├── data/
│   ├── about.json                # About page content (swap-in verified data here)
│   └── courses.json              # Course catalogue data
└── assets/                       # Fonts / icons / images / videos
```

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
# → open http://localhost:3000/about

# 3. Production build (validate + optimise)
npm run build

# 4. Serve the production build
npm start
# → open http://localhost:3000
```

## Scripts

| Command            | What it does                     |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start dev server (hot reload)    |
| `npm run build`    | Create an optimised production build |
| `npm start`        | Serve the production build       |
| `npm run lint`     | Run Next.js lint checks          |

## Notes

- All person profiles, statistics and contact details in `src/data/about.json` are
  **sample/placeholder content pending verification** (requirements AB-13, AB-18 in
  `docs/md/About_Page.md`). Swap them with the approved, source-verified data before
  production release.
- Contact deep links (`tel:`, `mailto:`, `wa.me`) are centralised in
  `src/config/site.config.json`.
