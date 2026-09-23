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

## 18. Admin Authentication Timeout - 2026-09-23

- Updated [src/app/admin/page.tsx](src/app/admin/page.tsx) to race the complete Supabase sign-in and profile-role lookup flow against an eight-second timeout.
- The admin profile lookup uses `maybeSingle()` and requires `role === "admin"`; other roles are signed out and receive an explicit access-denied message.
- Authentication failures are logged with `console.error`, and the submit state is reset in `finally` so timeout and error paths cannot leave the button stuck.
- Successful authentication redirects with `window.location.href = "/admin/dashboard"` so edge middleware receives the refreshed session cookies.
