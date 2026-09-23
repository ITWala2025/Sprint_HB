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
    │   ├── contact/               # Contact and enquiry component tests
    │   └── header_unit_test/      # Header, navigation, logo, and action tests
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
   - Structured layout with sidebar navigation, sticky table of contents, and responsive readability.

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
- **Tests**: updated [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx) to assert the About WebP source (`about-hero-desktop.webp`) and added a "horizontal impact band" test (`.sprint-hero-stats` role=list, 4 `listitem`s, source-verified line). All 10 About tests pass (`npx vitest run --pool=threads --maxWorkers=1 tests/unit/about/...`).