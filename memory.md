# Project Memory — SPRINT Institutional Training Hub

> **Single Source of Truth** for codebase architecture, technical stack, core entities, directory structures, design guidelines, and business constraints for the SPRINT Training Hub web platform.

---

## 1. Project Overview & Mission

- **Organization**: SPRINT (SPRINT Institutional Training Hub)
- **Location**: SPRINT Centre, Hazaribagh, Jharkhand — 825301, India
- **Core Mission**: Bridging the academic–industry gap by delivering hands-on, production-grade training in emerging technologies:
  - Artificial Intelligence & Machine Learning (AI/ML)
  - Cloud-Native Technologies & Architecture
  - DevOps, CI/CD, Containerization, and Scalable Infrastructure
  - Full-Stack Software Engineering (MERN & Java ecosystems)
- **Target Audiences**:
  1. **College Students** (B.Tech, BCA, MCA, B.Sc CS/IT) seeking industry employability skills.
  2. **Graduates & Career Switchers** transitioning into tech careers.
  3. **Working Professionals** upskilling in cloud, DevOps, and AI.
  4. **Academic Institutions** looking for curriculum partnerships, labs, and faculty development programs.
  5. **Enterprises & Hiring Partners** seeking pre-trained talent or corporate training.

---

## 2. Technical Stack

| Layer                      | Technologies                                            | Notes & Versions                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**              | Next.js (App Router), React 19, React-DOM 19            | Next.js ^16.3.5, React ^19.1.0 (modern Server & Client components)                                                                                                                 |
| **Language & Type Safety** | TypeScript, JavaScript                                  | TypeScript 7.0.2; `tsconfig.json` uses bundler module resolution and `react-jsx`                                                                                                   |
| **Styling**                | Tailwind CSS v4, PostCSS, Custom CSS                    | Tailwind v4 with `@theme` directive; PostCSS `@tailwindcss/postcss`                                                                                                                |
| **Design Tokens**          | Brand theme in [src/css/global.css](src/css/global.css) | Custom palette (`brand-navy`, `brand-red`, surfaces, typography)                                                                                                                   |
| **Icons**                  | Lucide React, React Icons                               | `lucide-react` (^0.525.0), `react-icons` (^5.7.0)                                                                                                                                  |
| **Typography**             | Space Grotesk (Headings), Inter (Body)                  | Configured via `next/font/google` in root layout                                                                                                                                   |
| **Database & Auth**        | Supabase (PostgreSQL 15+)                               | Complete schema, enums, triggers, and RLS policies in [src/Supabase/.sql](src/Supabase/.sql)                                                                                       |
| **Testing**                | Vitest, React Testing Library, jsdom, happy-dom         | Vitest ^5.0.1, `@testing-library/react` ^16.3.3, `@testing-library/jest-dom` ^7.0.1, `@testing-library/user-event` ^14.6.7                                                         |
| **Type Definitions**       | `tests/vitest.d.ts`                                     | Triple-slash references to `vitest/globals` and `@testing-library/jest-dom/vitest` so TypeScript picks up `afterEach`, `toBeInTheDocument`, `toHaveAttribute`, `toHaveClass`, etc. |
| **Runtime & Node**         | Node.js >= 20 (Node v24 tested), npm >= 10              | Target OS: macOS / Linux / Windows                                                                                                                                                 |

---

## 3. Directory Structure

```text
.
├── backlog_features.feature       # Gherkin specification for feature requirements & acceptance criteria
├── jsconfig.json                  # Path aliases (@/* -> ./src/*)
├── next.config.mjs                # Next.js build and image optimization settings
├── package.json                   # Dependencies, devDependencies, and npm scripts
├── postcss.config.mjs             # PostCSS plugins for Tailwind v4
├── README.md                      # Project onboarding and developer documentation
├── vitest.config.js               # Vitest runner configuration with jsdom & path aliases
├── vitest.config.mjs              # TSX header-test runner configuration with happy-dom
├── vitest.setup.js                # Global test setup (jest-dom matchers)
├── config/
│   └── environments/              # Environment-specific configuration (development, staging, production)
├── docs/
│   ├── architecture/              # Architecture diagrams and specifications (e.g., Auth_Model_Sprint.pdf)
│   ├── decisions/                 # Architecture Decision Records (ADRs)
│   ├── md/                        # Markdown requirement specifications:
│   │   ├── About_Page.md          # 10-section About Us specification
│   │   ├── Contact_Us.md          # Multi-audience contact & enquiry specification
│   │   ├── FOOTER_DOCUMENTATION.md# Footer requirements and column specifications
│   │   ├── HEADER_DOCUMENTATION.md# Sticky navigation, mobile drawer, actions spec
│   │   ├── Home_Page_Requirements.md # Home page requirements
│   │   └── sprint_websit_markdown.md # Global requirement tracker (P0–P4 priority matrix)
│   └── releases/                  # Release notes and changelogs
├── public/                        # Static assets, robots.txt, videos, favicons, fonts, images
├── scripts/                       # Build, deployment, and verification shell scripts
├── src/
│   ├── app/                       # Next.js App Router routes & layouts
│   │   ├── layout.jsx             # Global Root Layout (Header, News Ticker, Footer, WhatsApp floating CTA)
│   │   ├── page.jsx               # Home Page
│   │   ├── about/page.jsx         # About Us Page (/about)
│   │   ├── courses/page.jsx       # Course Catalogue (/courses)
│   │   ├── courses/[slug]/page.jsx# Dynamic Course Detail (/courses/:slug)
│   │   ├── bundles/[slug]/page.jsx# Dynamic Career Package Detail (/bundles/:slug)
│   │   ├── contact/page.jsx       # Contact & Multi-Audience Enquiry Page (/contact)
│   │   ├── careers/page.jsx       # Careers & Open Positions (/careers)
│   │   ├── updates/page.jsx       # Campus News & Updates (/updates)
│   │   ├── terms/page.jsx         # Terms & Conditions (/terms)
│   │   ├── privacy/page.jsx       # Privacy Policy (/privacy)
│   │   ├── register/              # Registration portal routes
│   │   ├── student/login/         # Student portal login
│   │   └── admin/login/           # Admin dashboard login
│   ├── components/                # Reusable React components
│   │   ├── cards/                 # ProfileCard, SkillCard, StatCounter, VisionMissionCard, Reveal
│   │   ├── careers/               # CareerHero, WhyJoinSprint, OpenPositions, HiringProcess, ApplicationForm
│   │   ├── contact/               # ContactHero, EnquirySection, StudentForm, WorkingProfessionalForm,
│   │   │                          # InstituteForm, CompanyForm, ContactMethods, LocationSection, FAQSection
│   │   ├── courses/               # CourseCatalogue, CourseDetail, DetailPage
│   │   ├── footer/                # Global 5-column Footer (Footer.jsx)
│   │   ├── header/                # Header.tsx, DesktopNavigation.tsx, MobileNavigation.tsx, HeaderLogo.tsx, HeaderActions.tsx
│   │   ├── Home/                  # Hero, PartnerCarousel, FeaturedProgram, MoreCourses, Instructors, Testimonials, FAQSection, ContactCTA
│   │   ├── layout/                # CampusNewsTicker.tsx, ConditionalCampusNewsTicker.jsx
│   │   ├── legal/                 # LegalLayout, LegalNotice, LegalSection, LegalTableOfContents
│   │   └── sections/              # StoryVisionMission and section wrappers
│   ├── config/                    # Centralized JSON configuration
│   │   ├── navigation.json        # Single source of truth for header navigation items
│   │   └── site.config.json       # Centralized contact numbers, emails, addresses, social profiles
│   ├── css/                       # Stylesheets
│   │   ├── global.css             # Tailwind v4 theme, CSS variables, glassmorphism utilities, floating button
│   │   ├── header.css             # Header-specific styling
│   │   ├── footer.css             # Footer-specific layout & typography styling
│   │   └── contact.css            # Contact section styling
│   ├── data/                      # Structured JSON and JS data sources
│   │   ├── about.json             # Leadership, faculty, timeline, values, impact statistics
│   │   ├── courses.json           # Raw course catalogue and curriculum data
│   │   ├── courses.js             # Course accessor methods (`courses`, `bundles`, `catalogueItems`, `getCourse`, `getBundle`)
│   │   ├── careers.js             # Open job positions, hiring steps, perks, company values
│   │   └── data.js                # Shared data exports
│   ├── Supabase/
│   │   └── .sql                   # Complete PostgreSQL schema, RLS, functions, triggers
│   └── utils/                     # Shared utility functions
└── tests/
    ├── setup.tsx                  # TSX test setup and Next.js component mocks
    ├── e2e/                       # End-to-end test scenarios
    ├── fixtures/                  # Test mock data and fixtures
    ├── integration/               # Integration tests
    ├── unit/                      # Component unit tests
    │   │   ├── contact/               # Contact and enquiry component tests
    │   │   ├── header_unit_test/      # Header, navigation, logo, and action tests
    │   │   ├── layout/                # Campus news ticker tests
    │   │   └── legal/                 # Legal page layout tests
    └── vitest.d.ts                # Vitest global & jest-dom matcher type declarations
```

---

## 4. Key Application Pages & Routing

1. **Home (`/`)** — [src/app/page.jsx](src/app/page.jsx):
   - Hero section with value proposition and CTAs.
   - Partner carousel (hiring & academic partners).
   - Featured program showcase.
   - Course overview and technology pathways.
   - Instructors from leading tech MNCs.
   - Student testimonials and placement success stories.
   - Frequently Asked Questions accordion.
   - Direct Contact / Enquiry CTA.

2. **About Us (`/about`)** — [src/app/about/page.jsx](src/app/about/page.jsx):
   - Implements the 10-section specification in [docs/md/About_Page.md](docs/md/About_Page.md).
   - Organization schema (JSON-LD) for structured SEO.
   - Mission, Vision, and Core Values glass cards.
   - Leadership & Advisory Board profiles via `ProfileCard`.
   - Emerging Tech Faculty profiles.
   - Verified impact statistics (`StatCounter`) formatted with Indian number formatting (`en-IN`).

3. **Courses & Learning Pathways (`/courses`)** — [src/app/courses/page.jsx](src/app/courses/page.jsx):
   - Filterable catalogue by audience (Undergraduate vs. Graduate & Above) and technology track.
   - Course cards displaying duration, mode (Online / Hybrid / Offline), difficulty, tools, and pricing.
   - Dynamic individual course route: `/courses/[slug]` handled by [src/app/courses/[slug]/page.jsx](src/app/courses/[slug]/page.jsx).
   - Career bundle route: `/bundles/[slug]` handled by [src/app/bundles/[slug]/page.jsx](src/app/bundles/[slug]/page.jsx).

4. **Contact & Enquiry (`/contact`)** — [src/app/contact/page.jsx](src/app/contact/page.jsx):
   - Dynamic tabbed enquiry forms tailored for 4 distinct audiences:
     - **Students**: Interested courses selection, auto-generated prefill message.
     - **Working Professionals**: Company, designation, years of experience, target program.
     - **Academic Institutes**: Institutional requirements, campus visits, faculty enablement.
     - **Enterprises / Companies**: Hiring requirements, corporate training, customized batches.
   - Actionable contact cards (Click-to-call, mailto, WhatsApp API link, physical center address).
   - Embedded Google Map of Hazaribagh Centre.
   - Contact-specific FAQ accordion.

5. **Careers & Internships (`/careers`)** — [src/app/careers/page.jsx](src/app/careers/page.jsx):
   - Hero, why join SPRINT, 4-step hiring process.
   - Dynamic job list fetched from [src/data/careers.js](src/data/careers.js).
   - Interactive job application form with file upload / resume URL.

6. **Legal Pages (`/terms`, `/privacy`)** — [src/app/terms/page.jsx](src/app/terms/page.jsx), [src/app/privacy/page.jsx](src/app/privacy/page.jsx):
   - Shared compact single-column legal document layout with no sidebar or table-of-contents navigation.
   - Reduced hero, article padding, section spacing, and typography for a shorter, denser reading experience.

---

## 5. Database Schema & Supabase Architecture

The database schema is defined in [src/Supabase/.sql](src/Supabase/.sql) with strict Row Level Security (RLS), custom PostgreSQL enum types, and automated triggers.

### Custom PostgreSQL Enums

- `user_role`: `'admin'`, `'instructor'`, `'student'`, `'staff'`
- `audience_type`: `'student'`, `'working_professional'`, `'institute'`, `'company'`
- `training_mode`: `'Online'`, `'Offline'`, `'Hybrid'`
- `batch_status`: `'upcoming'`, `'enrolling'`, `'ongoing'`, `'completed'`, `'cancelled'`
- `registration_status`: `'pending'`, `'approved'`, `'rejected'`, `'enrolled'`, `'cancelled'`
- `enrollment_status`: `'active'`, `'completed'`, `'dropped'`, `'suspended'`
- `assessment_type`: `'quiz'`, `'assignment'`, `'midterm'`, `'final_exam'`, `'capstone_project'`
- `ticker_category`: `'ANNOUNCEMENT'`, `'MAINTENANCE'`, `'DEADLINE'`, `'TIP/ALERT'`
- `job_type`: `'internship'`, `'full-time'`, `'part-time'`, `'contract'`
- `application_status`: `'submitted'`, `'screening'`, `'interview'`, `'offered'`, `'rejected'`, `'archived'`

### Core Tables

1. `profiles`: Extends `auth.users`, stores name, email, role, phone, avatar.
2. `students`: Academic details, registration number, college, branch, semester.
3. `courses`: Course titles, slug, category, difficulty, duration, pricing, curriculum (JSONB), tools, outcomes.
4. `course_bundles`: Multi-course career bundles and packages.
5. `bundle_courses`: Many-to-many relationship mapping courses to bundles.
6. `batches`: Scheduled cohorts with start date, mode, seat capacity, status.
7. `registrations`: Student course applications and intake submissions.
8. `enrollments`: Student enrolled status per batch, progress %, certificate issuance.
9. `assessments` & `assessment_results`: Quizzes, projects, grades, and feedback.
10. `enquiries`: Multi-audience contact form submissions with assigned admin tracking.
11. `career_openings` & `job_applications`: Jobs and applicant resumes.
12. `campus_updates`: Live ticker announcements with expiration timestamp.
13. `instructors`, `testimonials`, `partners`: Social proof entities displayed across the website.

### Row Level Security (RLS) & Helper Functions

- `public.is_admin()`: Security definer checking if `auth.uid()` has `role = 'admin'`.
- `public.is_staff()`: Security definer checking if `auth.uid()` has `admin`, `instructor`, or `staff` role.
- Public read access is granted for active courses, active job openings, published updates, and public testimonials.
- Authenticated users can read/modify their own profiles and registrations.
- Anyone can submit new `enquiries`, `registrations`, and `job_applications`.

---

## 6. Design System & Brand Identity

- **Color Palette** (defined in [src/css/global.css](src/css/global.css)):
  - Primary Navy: `#011f3e` (`--color-brand-navy`)
  - Accent Red: `#f81529` (`--color-brand-red`)
  - Dark Navy: `#001831` (`--color-brand-navy-dark`)
  - Surfaces: `#ffffff` (`--color-brand-white`), `#f8fafc` (`--color-brand-off-white`), `#f1f5f9` (`--color-brand-surface`)
  - Borders: `#e2e8f0` (`--color-brand-border`)
  - Accent Blues: `#0b63b6` (`--color-brand-blue`), `#e8f3ff` (`--color-brand-blue-light`)
- **Typography**:
  - Display / Headings: `Space Grotesk` (`var(--font-display)`)
  - Body Copy: `Inter` (`var(--font-body)`)
- **Accessibility & UX**:
  - Skip to main content link on body top.
  - WCAG AA compliant contrast ratios.
  - Keyboard focus rings and ARIA attributes on interactive tabs, drawers, and form controls.
  - Responsive design across mobile (<768px), tablet (768–1024px), and desktop (>1024px).

---

## 7. Critical Project Rules & Conventions

### Package Metadata

- `package.json` declares `packageManager: "npm@10"` to keep dependency installation and Next/Tailwind package discovery consistent across development environments.

1. **Centralized Contact Information**:
   - **Never** hardcode telephone numbers, email addresses, or social media URLs inside individual components.
   - Always import from [src/config/site.config.json](src/config/site.config.json).
2. **Centralized Navigation**:
   - Navigation links, labels, and dropdown hierarchies must be referenced from [src/config/navigation.json](src/config/navigation.json).
3. **App Router Conventions**:
   - Default to Server Components (`.jsx`).
   - Add `"use client"` **only** when managing state, hooks (`useState`, `useEffect`, `usePathname`), or client event listeners.
4. **Data Verification**:
   - Sample profiles and dummy testimonials are placeholders pending formal verification per `docs/md/About_Page.md` (AB-13/AB-18).
5. **Testing & Code Health**:
   - Component tests live in `tests/unit/`.
   - Feature specifications live in [backlog_features.feature](backlog_features.feature).
   - Tests must run using `npm test` or `npx vitest run`.

## 8. Homepage Spacing Update — 2026-09-22

- Normalized homepage section rhythm to `py-12 md:py-16 lg:py-20` across the hero, partner carousel, featured program, course paths, instructors, testimonials, FAQs, and contact CTA.
- Reduced the hero minimum height to `min-h-[80svh]` to remove dead space below the statistics while preserving a substantial image-led hero.
- Tightened the partner marquee and featured-program timeline internal gaps.
- Set the three-course desktop grid to three columns so the cards remain centered without an unused fourth column.

## 9. About Page CTA & Spacing Update — 2026-09-22

- Redirected the About page final CTA "Request a Callback" from `/register` to `/contact` (per `docs/md/About_Page.md` CTA-05 fallback — the `/register` route is still a placeholder containing only `.gitkeep`). Source of truth updated in `cta.primaryCta.href` at [src/data/about.json](src/data/about.json).
- Updated the tracking attribute for that CTA from `cta_register` to `cta_contact` in [src/app/about/page.jsx](src/app/about/page.jsx); mirrored the change in the event tables of [docs/md/About_Page.md](docs/md/About_Page.md).
- Normalized the About page section rhythm to the site-wide spacing convention `py-12 md:py-16 lg:py-20` (matching the homepage rhythm recorded in §8): hero reduced to `py-16 md:py-24` (was `py-20 md:py-28`), content sections (Story/Vision/Mission, Leadership, Faculty, Industry) reduced to `py-12 md:py-16 lg:py-20` (was `py-16 md:py-24`), and the bottom CTA section reduced to `py-12 md:py-16 lg:py-20` (was `py-16 md:py-24`).
- Made every About page CTA button mobile-responsive with the existing `w-full sm:w-auto` + `justify-center` pattern (hero primary, hero secondary, "View Courses" industry link, and the bottom "Request a Callback" button); tightened the bottom CTA top margin from `mt-8 sm:mt-9` to `mt-6 sm:mt-7`.
- Added [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx) covering the CTA redirect (`href="/contact"`, `data-track="cta_contact"`) and CTA section rendering.

## 14. Contact Hero Responsive Cleanup — 2026-09-23

- Removed the red `CONTACT US` eyebrow and its reserved spacing from [src/components/contact/ContactHero.jsx](src/components/contact/ContactHero.jsx); the breadcrumb, heading, description, trust points, social links, CTA, and existing responsive image assets remain unchanged.
- Updated the Contact Hero rules in [src/css/global.css](src/css/global.css): reduced desktop hero-owned top/bottom padding by approximately 30%, added a tablet range for copy width and spacing, and adjusted mobile hero height, padding, heading clamp, and breadcrumb rhythm to prevent clipping or horizontal overflow.
- Refined the Contact Hero again against the existing About Hero reference: restored `2rem` top and `3.25rem` bottom desktop padding, matched the `min(700px, calc(100vh - 5rem))` minimum height, added proportional tablet padding, and changed mobile to content-driven height with About-style `2.5rem 0.75rem 2rem` padding.

## 15. Contact Page Mobile Responsiveness — 2026-09-23

- Kept the existing Contact page structure and desktop styling, then added scoped mobile rules in [src/css/global.css](src/css/global.css): compacted Reach Us panel/card padding and gaps, reduced mobile form panel spacing, made the enquiry heading fluid, and allowed the audience selector to wrap in its existing two-column layout at narrow widths.
- Adjusted the shared WhatsApp CTA only at mobile widths with responsive `right`/safe-area `bottom` offsets and a smaller touch-safe size so it stays visible without covering enquiry content.
- Disabled the Next.js development indicator in [next.config.mjs](next.config.mjs). The black `N` was not rendered by SPRINT components; it was the framework dev indicator visible during local development.

## 10. About Page Vision/Mission Swap Controls — 2026-09-22

- Reworked the Vision ⇄ Mission swap surface in [src/components/sections/StoryVisionMission.jsx](src/components/sections/StoryVisionMission.jsx) per stakeholder feedback (page `src/app/about/page.jsx`, §3.4):
  - **Removed the prev/next arrow buttons** and the unused `sprint-story-arrow` CSS in [src/css/global.css](src/css/global.css).
  - **Added dot pagination at the bottom of the card**: two `<button>` dots ("Show Vision" / "Show Mission") with `aria-current` on the active dot, `aria-controls="vision-mission-swap"`, click-to-jump, and a 24px+ hit area (`p-2` wrapper with a small active pill indicator `bg-current`).
  - **Added touch swipe switching** (`touchstart`/`touchend` delta with `SWIPE_THRESHOLD = 48`, horizontal-dominant check; left = next, right = previous).
  - Replaced the top hint "Auto-advances — pause on hover" with **"Auto-advances · swipe to switch"** (kept the live `01 / 02` counter with `aria-live="polite"`).
  - Preserved auto-rotate (4s), pause on hover/touch/focus, keyboard arrow navigation on the focused surface, reduced-motion handling, and the always-in-DOM SEO panes.
- Added functional spec **§3.4.8 Vision ⇄ Mission Swap Controls** (`VM-SW-01..07`) in [docs/md/About_Page.md](docs/md/About_Page.md).
- Added [tests/unit/about/StoryVisionMission.test.jsx](tests/unit/about/StoryVisionMission.test.jsx) (5 tests: no arrows, dot rendering/active state, dot-click switching, swipe-left next, vertical-drag rejection).

## 11. About Page Vision/Mission Clean Surface & Horizontal Slide — 2026-09-22

- Per further stakeholder feedback, removed the top control row from the Vision ⇄ Mission card in [src/components/sections/StoryVisionMission.jsx](src/components/sections/StoryVisionMission.jsx):
  - Deleted the hint text "Auto-advances · swipe to switch" and the `01 / 02` live counter (and the now-unused `pad()` helper plus `.sprint-story-head`, `.sprint-story-hint`, `.sprint-story-counter` CSS).
- The two cards now live on a **horizontal sliding track** (`sprint-swap-viewport` + `sprint-swap-track`): switching translates the track by `index × 100%` (`translateX`), so the cards genuinely scroll left/right like a carousel. Pane crossfade classes (`.sprint-swap-pane` opacity/translateY `.is-hidden`) were replaced; reduced motion disables the slide via `.sprint-swap-track { transition: none }`.
- Dots at the bottom, touch swipe, keyboard arrows and the 4s auto-rotate all remain unchanged.
- Updated spec rows `VM-SW-01`/`VM-SW-02` in [docs/md/About_Page.md](docs/md/About_Page.md) and added a "no hint/counter" assertion to [tests/unit/about/StoryVisionMission.test.jsx](tests/unit/about/StoryVisionMission.test.jsx).

<<<<<<< HEAD

## 12. About Page Hero Photo Layer — 2026-09-22

- Added a decorative full-bleed hero photo to the About "Who is SPRINT?" hero in [src/app/about/page.jsx](src/app/about/page.jsx), using the same treatment as the Contact hero: `<picture>` with mobile/desktop WebP sources (`/images/contact/contact-hero-mobile.webp` and `contact-hero-desktop.webp`) rendered via `next/image` (`fill`, `priority`, `sizes="100vw"`, `alt=""`) inside `aria-hidden` media/overlay layers (spec `HR-02`).
- Unlike Contact's dark-navy overlay, the About hero uses a **light glass overlay** (`.sprint-hero-overlay`, `rgba(248,250,252,0.86 → 0.62)` gradient) so the approved navy-on-light hero text stays WCAG-readable while the photo shows through; mobile switches `object-position: center bottom` like Contact.
- New CSS: `.sprint-hero-media`, `.sprint-hero-image`, `.sprint-hero-overlay` in [src/css/global.css](src/css/global.css).
- The hero reuses the Contact image assets (no dedicated `/images/about/` asset yet) — swap the `src`/`srcSet` paths in the `<picture>` block when an About-specific photograph is supplied.
- Updated spec row `HR-02` in [docs/md/About_Page.md](docs/md/About_Page.md) and added a hero-image assertion (and a `next/image` mock) to [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx).

## 13. About Page Hero — Contact-Style Dark Overlay & Horizontal Impact Band — 2026-09-23

- **Fixed the hero image reference** in [src/app/about/page.jsx](src/app/about/page.jsx): the photo was previously wired with an invalid backslash URL (`src="\images\about_page\image.png"`) and the mobile `<source>` still pointed at the **Contact** assets. The hero now uses dedicated About assets in `public/images/about_page/`:
  - `about-hero-desktop.webp` (1600w, ~78 KB) rendered by `next/image` (`fill`, `priority`, `sizes="100vw"`, `alt=""`) and `about-hero-mobile.webp` (800w, ~29 KB) served by the `<picture>` `<source media="(max-width: 767px)">` — generated from the supplied 1672×940 `image.png` (2.2 MB) via `sharp`. This honours the §7.1 page-weight budget (compressed WebP) that the previous raw PNG violated.
- **Reworked the hero to the Contact-page anatomy** (§3.2 HR-02): full-bleed photo, **dark-navy left-heavy overlay** (`.sprint-hero-overlay`, `90deg` rgba(1,31,62, 0.94→0.04) — replaces the earlier light-glass overlay), breadcrumb (`Home › About Us`), red eyebrow `› About SPRINT`, giant balanced H1 (`.sprint-hero-title`, clamp + `text-wrap: balance`) with a red-accent brand word, description, and primary/secondary CTAs. The navy mesh `.sprint-hero-bg` provides a readable fallback while the photo loads.
- **"Our Impact" now renders as a horizontal stat band** (§3.8): the four verified stats moved out of the old 320px right-side proof card into a full-width band anchored at the hero base — 4-across on `>=768px`, 2×2 on mobile (`.sprint-hero-stats` grid). Dark-glass stat tiles (`.sprint-hero-stat`, white/8 + backdrop blur) keep the gradient red→purple numbers (`.sprint-hero-stat-value`, now `font-size/weight` in CSS) and end with the green `CheckCircle2` "All figures source-verified" line (`.sprint-hero-verified`).
- **Data/config**: added `hero.titleHighlight: "SPRINT"` to [src/data/about.json](src/data/about.json); the new `HighlightHeroTitle` helper in [src/app/about/page.jsx](src/app/about/page.jsx) wraps that word in a `.sprint-hero-title-accent` span.
- **CSS**: replaced `.sprint-hero-grid` / `.sprint-hero-proof` / `.sprint-hero-proof-line` with `.sprint-hero-content`, `.sprint-hero-breadcrumb`, `.sprint-hero-eyebrow`, `.sprint-hero-copy`, `.sprint-hero-title(-accent)`, `.sprint-hero-description`, `.sprint-hero-ctas`, `.sprint-hero-stats`, `.sprint-hero-stat`, `.sprint-hero-stat-label`, `.sprint-hero-stat-context`, `.sprint-hero-verified` in [src/css/global.css](src/css/global.css); mobile media query now stacks CTAs and keeps the 2×2 stat grid.
- # **Tests**: updated [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx) to assert the About WebP source (`about-hero-desktop.webp`) and added a "horizontal impact band" test (`.sprint-hero-stats` role=list, 4 `listitem`s, source-verified line). All 10 About tests pass (`npx vitest run --pool=threads --maxWorkers=1 tests/unit/about/...`).

## 12. Legal Page Layout Update — 2026-09-22

- Removed the shared sidebar/table-of-contents column from `/privacy` and `/terms` by updating `src/components/legal/LegalLayout.jsx`.
- Changed legal pages to a single-column `max-w-4xl` document flow and reduced hero/article vertical rhythm.
- Reduced legal headings, body copy, notice text, padding, and section gaps while retaining responsive spacing and accessible section anchors.
- Added `tests/unit/legal/LegalLayout.test.jsx` to verify the sidebar is absent and the compact single-column structure is rendered.

## 13. Campus Ticker Icon Update — 2026-09-22

- Replaced the red `AlertTriangle` badge on the campus updates ticker with a blue `Megaphone` icon.
- Applied the brand-blue translucent badge and light-blue icon treatment while leaving ticker content and behavior unchanged.
- Added `tests/unit/layout/CampusNewsTicker.test.tsx` to prevent the alert icon from returning.

## 14. Homepage Learner Stories Horizontal Carousel - 2026-09-22

- Updated [src/components/Home/Testimonials.jsx](src/components/Home/Testimonials.jsx) to render the shared `testimonials` data in one horizontal scroll-snap row instead of wrapping cards vertically.
- Added responsive card widths for one visible card on mobile, two on tablet, and three on desktop, with hidden scrollbars and compact fixed card height behavior.
- Added manual previous/next controls and mouse pointer dragging; touch scrolling remains native. There is no autoplay.

## 15. Homepage Featured Program Zigzag Timeline - 2026-09-23

- Updated [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx) to place the four existing stages on a centered vertical rail with alternating left/right content blocks at desktop widths.
- Added `01` through `04` numbered red badges on the rail while preserving the existing stage labels, titles, descriptions, and scroll-driven active state.
- Below the `lg` breakpoint, the layout collapses to a single left-aligned column with the rail and badges on the left for narrow screens.
- Centered the Featured Program intro heading and description with a fluid, responsive `max-w-2xl` wrapper.

## 16. Homepage Internal Spacing Update - 2026-09-23

- Reduced repeated content offsets from `mt-10` to `mt-8` in the Featured Program, course paths, instructors, learner stories, FAQs, and Contact CTA sections.
- Tightened the Featured Program timeline rows on small screens from `py-10` to `py-6` while retaining the generous desktop `lg:py-12` rhythm.
- Reduced the partner marquee label gap responsively (`mt-4 md:mt-6`) and the mobile course CTA gap to `mt-6`.
- Preserved outer section padding, hero composition, interactive behavior, and responsive breakpoints to avoid collapsing intentional visual structure.

## 17. Featured Program Single Disclosure - 2026-09-23

- Updated [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx) to default the Featured Program section to a collapsed state showing the label, title, overall description, and one `View Program Stages` toggle.
- The toggle reveals all four existing timeline stages together in the preserved responsive zigzag layout, changes to `Hide Program Stages`, rotates the chevron, and animates the complete panel with one grid-row transition.
- The scroll observer now attaches only while the stage panel is expanded; stage content and copy remain unchanged.
- Added [tests/unit/home/FeaturedProgram.test.jsx](tests/unit/home/FeaturedProgram.test.jsx) covering collapsed and expanded single-panel behavior.
  <<<<<<< HEAD

## 18. Admin Authentication Timeout - 2026-09-23

- Updated [src/app/admin/page.tsx](src/app/admin/page.tsx) to race the complete Supabase sign-in and profile-role lookup flow against an eight-second timeout.
- The admin profile lookup uses `maybeSingle()` and requires `role === "admin"`; other roles are signed out and receive an explicit access-denied message.
- Authentication failures are logged with `console.error`, and the submit state is reset in `finally` so timeout and error paths cannot leave the button stuck.
- # Successful authentication redirects with `window.location.href = "/admin/dashboard"` so edge middleware receives the refreshed session cookies.
  > > > > > > > 411e90521d47e5c5a53beb32d9a6bdcace3811b7
  > > > > > > > ac7bac9d9e633a9f5a9d53dc31086a430f49584d

## 19. Admin-Aware Public Shell - 2026-09-23

- Added [src/components/layout/PublicSiteShell.jsx](src/components/layout/PublicSiteShell.jsx) to use `usePathname()` and render public header, campus ticker, footer, WhatsApp affordance, and main content only outside `/admin/*` routes.
- Updated [src/app/layout.jsx](src/app/layout.jsx) to delegate public chrome to `PublicSiteShell`, leaving the admin route subtree to [src/app/admin/layout.tsx](src/app/admin/layout.tsx).
- Updated the public header components to resolve the Supabase session and `public.profiles.role`; admins see an `Admin Dashboard` action while non-admin and signed-out users retain `Student Portal` and `Enroll Now` actions on desktop and mobile.
- Auth initialization is guarded when public Supabase environment variables are unavailable, preserving the public navigation fallback in isolated test environments.

## 20. Public Header Restoration on Admin Routes - 2026-09-23

- Updated [src/components/layout/PublicSiteShell.jsx](src/components/layout/PublicSiteShell.jsx) to keep the public Header visible on `/admin/*` routes while hiding only the announcement ticker, public footer, and WhatsApp affordance there.
- Admin-authenticated desktop and mobile actions now use the prominent `Go to Dashboard` label and link to `/admin/dashboard`; guest and signed-out states continue to show the default public actions.
- Preserved the Header Supabase auth listener and profile-role lookup so action buttons swap immediately on sign-in and sign-out.

## 21. Homepage Section Spacing and Featured Program Button - 2026-09-24

- Recorded existing homepage outer vertical padding before the change: Hero, Featured Program, More Courses, Instructors, Testimonials, FAQs, and Contact CTA used `py-12 md:py-16 lg:py-20`; Partner Carousel used `py-6 md:py-8 lg:py-10`.
- Reduced those values by 30% without changing horizontal padding: the first group now uses `py-[2.1rem] md:py-[3.5rem] lg:py-[4.375rem]`, and Partner Carousel uses `py-[1.05rem] md:py-[1.4rem] lg:py-[1.75rem]`.
- Updated the Featured Program disclosure button styling only: stronger default touch treatment, red hover fill, glow, lift, focus-visible ring, active scale feedback, and a larger hover-nudging chevron. Toggle behavior and content remain unchanged.

## 22. Font Consistency Audit - 2026-09-24

- Confirmed `Space_Grotesk` is loaded as `--font-display` for headings/display text and `Inter` is loaded as `--font-body` for body text and controls in [src/app/layout.jsx](src/app/layout.jsx).
- Updated [src/css/global.css](src/css/global.css) so body text, headings, links, and buttons use the loaded `--font-body`/`--font-display` variables instead of Trebuchet MS and Georgia fallbacks.
- Updated [src/components/header/HeaderLogo.tsx](src/components/header/HeaderLogo.tsx) to use `font-display` and removed the unloaded inline `Roboto Slab` family while preserving existing logo spacing and color.

## 23. More Learning Paths Card Refresh - 2026-09-24

- Updated [src/data/data.js](src/data/data.js) with placeholder durations for the three More Courses cards: Data Science (`16 weeks`), Cloud & DevOps (`12 weeks`), and Product Management (`8 weeks`). Removed their unused pricing and discount fields.
- Updated [src/components/cards/CourseCard.jsx](src/components/cards/CourseCard.jsx) to replace pricing with a muted Clock duration row and add a bottom-aligned red Know More CTA with an ArrowRight icon, hover lift, pointer cursor, transition, and keyboard focus ring.
- Preserved each card's existing outer course link and all existing category, title, description, and rating content.

## 24. More Learning Paths Uses Courses Catalogue - 2026-09-24

- Updated [src/components/Home/MoreCourses.jsx](src/components/Home/MoreCourses.jsx) to select `python-and-ai-foundations`, `docker-and-kubernetes`, and `cybersecurity-basics` directly from [src/data/courses.js](src/data/courses.js).
- Updated [src/components/cards/CourseCard.jsx](src/components/cards/CourseCard.jsx) to consume the catalogue's `image`, `description`, `duration`, and `slug` fields and omit ratings when the source does not provide them. Detail links now resolve to each `/courses/<slug>` route.
- Removed the obsolete homepage-only `moreCourses` duplicate data from [src/data/data.js](src/data/data.js); no other sections use it.

## 25. Featured Program Arrow Icon - 2026-09-24

- Updated [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx) to replace the small `⌄` glyph with lucide-react `ArrowDown`.
- Preserved the existing icon span styling, `rotate-180` expanded-state behavior, button text, toggle logic, and all other button styles.

## 26. Homepage Responsive Timeline Audit - 2026-09-24

- Updated [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx) so mobile stage text has a clear gap from the numbered rail circle, the circle is fixed at 40px, centered on the rail, and top-aligned with the stage label. Desktop `lg:` positioning remains unchanged.
- Updated homepage/shared-shell layout classes in [src/components/Home/Testimonials.jsx](src/components/Home/Testimonials.jsx), [src/components/Home/MoreCourses.jsx](src/components/Home/MoreCourses.jsx), [src/components/header/Header.tsx](src/components/header/Header.tsx), [src/components/header/DesktopNavigation.tsx](src/components/header/DesktopNavigation.tsx), [src/components/header/MobileNavigation.tsx](src/components/header/MobileNavigation.tsx), and [src/components/footer/Footer.jsx](src/components/footer/Footer.jsx) to remove the 320px header squeeze and enforce 44px tap targets.
- Browser validation covered closed/open stages, long temporary stage wrapping, portrait widths 320/360/375/390/412, tablet 768, desktop 1024/1280/1536, and landscape 667x320 with no horizontal overflow or console issues.

## 31. Restored Shared Faculty & Experts Home Section - 2026-09-24

- Restored [src/components/sections/FacultyExperts.jsx](src/components/sections/FacultyExperts.jsx) as the shared About/Home implementation using [src/data/about.json](src/data/about.json) and [src/components/cards/ProfileCard.jsx](src/components/cards/ProfileCard.jsx).
- Replaced the Home Instructors slot with Faculty & Experts while preserving the current About section spacing and design.
- Removed the unused [src/components/Home/Instructors.jsx](src/components/Home/Instructors.jsx) and mentor array from [src/data/data.js](src/data/data.js).

## 32. Home Faculty Eyebrow - 2026-09-24

- Added an optional `eyebrow` prop to [src/components/sections/FacultyExperts.jsx](src/components/sections/FacultyExperts.jsx), using the existing Home eyebrow classes.
- Passed `eyebrow="MENTORS"` only from [src/app/page.jsx](src/app/page.jsx); About remains without the label.

## 33. Home Partner Marquee Logos - 2026-09-24

- Expanded the Section 6.3 partner marquee in [src/data/data.js](src/data/data.js) from 8 to 22 logos by adding every unused partner file in `public/images/home/` (algocirrus, dell, eyogi-gurukul, global-medtech-solutions, hcl, iqvia, it-wala, kdadks, lululemon, sitetracker, swavlamban, tessellation, vishal-creations, zupharm-laboratories). Existing ids `p1`–`p8` are unchanged and the new entries use `p9`–`p22`; the order alternates industry/institutional partners with the larger technology partners so neither group forms a block.
- Updated [src/components/Home/PartnerCarousel.jsx](src/components/Home/PartnerCarousel.jsx) so the 64px spacing moved from the track's `gap-16` to a per-card `pr-16`. The duplicated track now measures exactly twice one loop, which is what makes the existing `marquee-rtl` `-50%` keyframe land on a seamless seam; a flex `gap` has no trailing space and drifted by half a gap (32px) per loop.
- Marquee duration is now derived from the real loop width (22 logo frames + gaps = 4320px) at the original 48px/s and passed to the existing `--marquee-duration` custom property in [src/css/global.css](src/css/global.css), so the longer track scrolls at the previous speed (90s) instead of the hard-coded 32s fallback.
- Added per-logo frame overrides that keep the shared `object-contain` height and never stretch or crop the artwork: wide wordmarks get wider frames (algocirrus `w-36`, zupharm-laboratories `w-48`, global-medtech-solutions `w-60`, swavlamban/vishal-creations `w-28`) while square logo marks get `size-24` (eyogi-gurukul, it-wala), so every logo reads at the same visual height instead of a 48–59px sliver.
- `next/image` usage with `width`/`height`, lazy loading, the `opacity-80` card, hover pause, reduced-motion handling, the heading text and all section spacing are unchanged. Alt text is now `${name} logo` (for example `Zupharm Laboratories logo`).

## 34. Admin RBAC and User Provisioning - 2026-09-25

- Added the RBAC console at [src/app/admin/roles/page.tsx](src/app/admin/roles/page.tsx) with role metrics, role catalog filtering, user assignments, access matrix, audit placeholder, and responsive tabbed admin UI.
- Added shared RBAC metadata and permission helpers in [src/components/admin/roles/types.ts](src/components/admin/roles/types.ts), role create/edit behavior in [src/components/admin/roles/RoleModal.tsx](src/components/admin/roles/RoleModal.tsx), and staff provisioning with generated credentials in [src/components/admin/roles/CreateUserModal.tsx](src/components/admin/roles/CreateUserModal.tsx).
- Added [src/Supabase/RBAC Schema.sql](src/Supabase/RBAC%20Schema.sql) for `public.roles`, `profiles.role_id`, active-profile state, RLS policies, seeded roles, permission checks, and `admin_create_staff_user`. Apply this migration before using custom roles or staff provisioning against Supabase.
- Admin sidebar access is controlled in [src/app/admin/layout.tsx](src/app/admin/layout.tsx). `Settings & Access` is a collapsible Management group containing `/admin/roles`; legacy profiles with `role = 'admin'` receive full navigation access even when `role_id` or permissions are null. Permission loading temporarily shows the standard navigation to prevent empty sidebar groups.
- The profile lookup first selects `profiles.role` so legacy admin access does not depend on the optional `roles` relationship. Custom roles then attempt the `role_id` and `roles(name, permissions)` lookup.
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) accepts either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or the existing `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This fallback is required because the current `.env.local` defines the anon key.
- Validation completed with `npx tsc --noEmit`, `npm run build`, and `git diff --check`. The dev server is not left running after verification.
