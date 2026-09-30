# Test Suite & Quality Assurance Guide — SPRINT Training Hub

This document is the official reference for testing architecture, test suites, execution commands, coverage status, and best practices across the SPRINT Training Hub codebase.

---

## 1. Testing Architecture & Stack

| Component              | Library / Tool                                       | Version           | Purpose                                                                     |
| ---------------------- | ---------------------------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| **Test Runner**        | Vitest                                               | ^5.0.1            | Fast, Vite-native test runner with ESM and worker thread support            |
| **DOM Environment**    | jsdom, happy-dom                                     | ^29.1.1, ^20.14.5 | Browser DOM simulation for JSX and TSX component suites                     |
| **Component Testing**  | React Testing Library, `@testing-library/user-event` | ^16.3.3, ^14.6.7  | Testing user-centric React component behaviors and interactions             |
| **Custom Matchers**    | `@testing-library/jest-dom`                          | ^7.0.1            | Semantic DOM assertions (`toBeInTheDocument`, `toHaveAttribute`, etc.)      |
| **BDD Specifications** | Gherkin                                              | —                 | Acceptance criteria in [backlog_features.feature](backlog_features.feature) |

### Configuration Files

- **JSX Runner Configuration**: [vitest.config.js](vitest.config.js)
  - Configures the `jsdom` environment for the existing JSX component suites.
  - Registers global test functions (`describe`, `it`, `expect`, `beforeEach`, `afterEach`).
  - Sets up `@/` alias resolution to `./src`.
  - Uses `setupFiles: ["./vitest.setup.js"]`.
- **TSX Runner Configuration**: [vitest.config.mjs](vitest.config.mjs)
  - Configures the `happy-dom` environment for the header TSX suites.
  - Enables the React Vite plugin and global test functions.
  - Uses `setupFiles: ["./tests/setup.tsx"]` and includes `tests/**/*.test.tsx`.
- **Global Setups**: [vitest.setup.js](vitest.setup.js) and [tests/setup.tsx](tests/setup.tsx)
  - Import `@testing-library/jest-dom` matchers and mock Next.js `Image` and `Link` components.
- **Type Declarations**: [tests/vitest.d.ts](tests/vitest.d.ts)
  - Triple-slash references to `vitest/globals` and `@testing-library/jest-dom/vitest` so TypeScript picks up `afterEach`, `toBeInTheDocument`, `toHaveAttribute`, `toHaveClass`, etc.
  - Registered in `tsconfig.json` `include` so `next build` type-checks test files.

---

## 2. Test Execution Commands

### Prerequisites

Before running tests for the first time or in a fresh container/clone:

```bash
npm install
```

_Note: This ensures all devDependencies (`vitest`, `jsdom`, `@testing-library/_`) are properly linked in `node_modules/.bin`.\*

### Running Tests

| Task                   | Command                                                  | Description                                                                              |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Run All Unit Tests** | `npm test`                                               | Runs all Vitest suites using single-worker thread pool (`--pool=threads --maxWorkers=1`) |
| **Watch Mode**         | `npx vitest`                                             | Re-runs tests on file change during active development                                   |
| **Single Test File**   | `npx vitest run tests/unit/contact/StudentForm.test.jsx` | Runs only the specified test file                                                        |
| **Pattern Matching**   | `npx vitest run tests/unit/contact/`                     | Runs all tests inside a matching folder                                                  |
| **Coverage Report**    | `npx vitest run --coverage`                              | Generates detailed coverage statistics                                                   |

### Current Validation Results — 2026-09-22

| Check                    | Command                                                                              | Result                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Unit and component tests | `npm test`                                                                           | **Passed** — 30 test files, 146 tests, including legal layout and campus ticker regressions                     |
| Legal layout test        | `npx vitest run tests/unit/legal/LegalLayout.test.jsx --pool=threads --maxWorkers=1` | **Passed** — verifies no sidebar/table of contents and the compact single-column structure                      |
| Campus ticker test       | `npx vitest run tests/unit/layout/CampusNewsTicker.test.tsx`                         | **Passed** — verifies the red alert icon is replaced by the branded blue megaphone                              |
| Production build         | `npm run build`                                                                      | **Passed** — Next.js production build and static generation completed                                           |
| Lint                     | `npm run lint`                                                                       | **Not available** — `next lint` is unsupported by the installed Next.js 16.3.5 project; ESLint is not installed |

The merged dependency set includes both `jsdom` and `happy-dom`; install dependencies with `npm install` before running tests in a fresh clone.

### Legal page layout validation — 2026-09-22

- `/privacy` and `/terms` render without the former sidebar/table-of-contents navigation.
- Legal content uses a centered single-column article with reduced hero height, article padding, section gaps, and typography.
- Full test suite and production build passed after the layout changes.

### Campus ticker icon validation — 2026-09-22

- The campus updates badge uses `Megaphone` instead of `AlertTriangle`.
- The badge and icon use brand-blue styling instead of the previous red alert treatment.
- The targeted ticker test and full test suite passed; the production build passed.

### Homepage spacing validation — 2026-09-22

- Editor diagnostics: passed for all eight modified Home components.
- Browser validation: passed at 1440px, 1024px, 768px, and 390px; adjacent sections have no added gaps, the hero remains 80svh, the course cards are centered at desktop widths, and the document has no horizontal overflow.
- Browser console note: existing 400 responses remain for missing instructor image paths under `/instructors/`; no new spacing-related runtime errors were introduced.
- No current test dependency blocker; dependencies are installed and the full suite passes.

### About page CTA, spacing & swap-controls validation — 2026-09-22

- Reran the full Vitest suite after the About page changes ("Request a Callback" CTA redirected to `/contact`, reduced section padding, mobile-responsive `w-full sm:w-auto` buttons) and the Vision ⇄ Mission swap controls (arrows removed, dot pagination + touch swipe, then the top hint/counter removed and the cards converted to a left/right sliding track).
- `npm test` result: **Passed** — 30 test files, 152 tests (includes [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx) with 2 tests and [tests/unit/about/StoryVisionMission.test.jsx](tests/unit/about/StoryVisionMission.test.jsx) with 6 tests; zero regressions).
- Production build check: `npm run build` — **Passed** after the changes.

### Package JSON and dev build validation — 2026-09-22

- `node -e "JSON.parse(...)"`: **Passed** — `package.json` parses successfully and reports `npm@10`.
- `npm run build`: **Passed** — Next.js/Tailwind CSS compiled successfully and all 36 static pages were generated.
- `npm run dev`: **Passed after clean restart** — the stale Next.js process was stopped and `.next` development output was regenerated; homepage returned HTTP 200.

---

## 3. Current Test Inventory

### 3.1 Contact & Enquiry Unit Tests (`tests/unit/contact/`)

The contact section implements the specifications from [docs/md/Contact_Us.md](docs/md/Contact_Us.md) and [backlog_features.feature](backlog_features.feature).

| Test Suite                  | File Path                                                                                                  | Focus & Assertions                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ContactHero**             | [tests/unit/contact/ContactHero.test.jsx](tests/unit/contact/ContactHero.test.jsx)                         | Renders hero headline, subtext, social links (LinkedIn, Instagram, YouTube), accessible `aria-label` attributes, and external link security (`rel="noopener noreferrer"`). |
| **ContactMethods**          | [tests/unit/contact/ContactMethods.test.jsx](tests/unit/contact/ContactMethods.test.jsx)                   | Actionable contact cards (Call Now `tel:`, Email Us `mailto:`, WhatsApp `https://wa.me/`), physical address, and office operating hours.                                   |
| **EnquirySection**          | [tests/unit/contact/EnquirySection.test.jsx](tests/unit/contact/EnquirySection.test.jsx)                   | Dynamic tab switching between audiences (Student, Working Professional, Institute, Company), active tab visual indication, and rendering matching form.                    |
| **StudentForm**             | [tests/unit/contact/StudentForm.test.jsx](tests/unit/contact/StudentForm.test.jsx)                         | Student form field rendering, multi-select course trigger, intelligent course-to-message prefill logic, validation handling, and submit button state.                      |
| **WorkingProfessionalForm** | [tests/unit/contact/WorkingProfessionalForm.test.jsx](tests/unit/contact/WorkingProfessionalForm.test.jsx) | Professional form fields (Company Name, Designation, Experience, Target Program), required field validation, and consent toggle.                                           |
| **InstituteForm**           | [tests/unit/contact/InstituteForm.test.jsx](tests/unit/contact/InstituteForm.test.jsx)                     | Institutional representative fields (Institute Name, Contact Person, Official Email, Website, Service Interest), form validation.                                          |
| **CompanyForm**             | [tests/unit/contact/CompanyForm.test.jsx](tests/unit/contact/CompanyForm.test.jsx)                         | Corporate enquiry fields (Company Name, Domain, Role, Purpose Type, Preferred Contact Time), form submission handling.                                                     |
| **LocationSection**         | [tests/unit/contact/LocationSection.test.jsx](tests/unit/contact/LocationSection.test.jsx)                 | SPRINT Hazaribagh center physical location card, landmark notes, embedded Google Maps iframe, and external directions link.                                                |
| **FAQSection**              | [tests/unit/contact/FAQSection.test.jsx](tests/unit/contact/FAQSection.test.jsx)                           | Interactive accordion behavior, expanding/collapsing answers, keyboard accessibility, and `aria-expanded` attributes.                                                      |

### Contact Hero responsive validation — 2026-09-23

- Editor diagnostics: **Passed** for [src/components/contact/ContactHero.jsx](src/components/contact/ContactHero.jsx) and the Contact Hero rules in [src/css/global.css](src/css/global.css).
- Focused ContactHero Vitest invocation: **Blocked** — Vitest 5.0.1 timed out while starting its threads worker; no ContactHero tests executed. The run also reported the existing Vite native-config warning.
- Production build: **Blocked after successful compilation and TypeScript checks** — prerendering `/admin` requires missing Supabase URL/API-key environment variables; this is unrelated to Contact Hero.
- The existing ContactHero test continues to cover the preserved heading, trust points, social link, and enquiry CTA after the eyebrow removal.
- Spacing refinement diagnostics: **Passed** after matching the About Hero minimum height and desktop/tablet/mobile outer padding strategy; no Contact Hero-specific clipping or overflow diagnostics were reported.

### Contact page mobile responsiveness — 2026-09-23

- Editor diagnostics: **Passed** for the Contact responsive CSS, ContactMethods, EnquirySection, and Next configuration.
- Contact Vitest suite: **Blocked** by the existing Vitest 5 worker startup timeout; no Contact tests executed.
- Production build: **Blocked by generated-output/process state** after successful compilation; stale `.next/dev/types` errors appeared, and cleanup was blocked by a separate Next process holding `.next` cache files. The prior clean build compiled and type-checked successfully before stopping on missing Supabase variables while prerendering `/admin`.

### 3.2 About Page Unit Tests (`tests/unit/about/`)

The About page implements the specifications from [docs/md/About_Page.md](docs/md/About_Page.md) (10-section approved layout).

<<<<<<< HEAD
| Test Suite | File Path | Focus & Assertions |
| ------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AboutPage** | [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx) | Renders the "Connect With SPRINT" CTA section, asserts the "Request a Callback" primary CTA resolves to `/contact` with `data-track="cta_contact"` (CTA-05 fallback), verifies the decorative full-bleed hero photo (`picture.sprint-hero-media` > `img.sprint-hero-image` with `alt=""`, About WebP source `about-hero-desktop.webp`), and checks the **horizontal verified-impact band** (`.sprint-hero-stats` `role=list` with 4 `listitem` stats + the "All figures source-verified" line). Mocks `next/link` and `next/image`; polyfills jsdom gaps (`matchMedia`, `IntersectionObserver`). |
| **StoryVisionMission** | [tests/unit/about/StoryVisionMission.test.jsx](tests/unit/about/StoryVisionMission.test.jsx) | Vision/Mission sliding track: no arrow buttons, no top hint/counter, dot pagination at the card bottom with `aria-current` on the active dot, dot-click switching, swipe-left navigation, and vertical-drag rejection. |
=======
| Test Suite | File Path | Focus & Assertions |
| ---------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AboutPage** | [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx) | Renders the "Connect With SPRINT" CTA section and asserts the "Request a Callback" primary CTA resolves to `/contact` with `data-track="cta_contact"` (CTA-05 fallback). Mocks `next/link` and polyfills jsdom gaps (`matchMedia`, `IntersectionObserver`). |
| **StoryVisionMission** | [tests/unit/about/StoryVisionMission.test.jsx](tests/unit/about/StoryVisionMission.test.jsx) | Vision/Mission sliding track: no arrow buttons, no top hint/counter, dot pagination at the card bottom with `aria-current` on the active dot, dot-click switching, swipe-left navigation, and vertical-drag rejection. |

### 3.3 Legal Page Unit Tests (`tests/unit/legal/`)

| Test Suite      | File Path                                                                      | Focus & Assertions                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LegalLayout** | [tests/unit/legal/LegalLayout.test.jsx](tests/unit/legal/LegalLayout.test.jsx) | Confirms `/privacy` and `/terms` share a compact single-column layout, the sidebar/table of contents is absent, and legal sections remain rendered. |

### 3.4 Campus Ticker Unit Tests (`tests/unit/layout/`)

| Test Suite           | File Path                                                                                  | Focus & Assertions                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **CampusNewsTicker** | [tests/unit/layout/CampusNewsTicker.test.tsx](tests/unit/layout/CampusNewsTicker.test.tsx) | Confirms the red alert icon is replaced by the branded blue megaphone and the alert icon is absent. |

> > > > > > > 411e90521d47e5c5a53beb32d9a6bdcace3811b7

---

## 4. Test Specifications & Gherkin Scenarios

Acceptance criteria are specified in [backlog_features.feature](backlog_features.feature). Scenarios include:

- **Section Ordering**: Header → Hero → Enquiry → Map → FAQs → CTA → Footer.
- **Responsive Layout**: Two-column layout on desktop (35-40% reach us, 60-65% form) vs. single column stacked on mobile.
- **Actionable Cards**: Verified click-to-call, mailto, and WhatsApp links.
- **Dynamic Enquiry Form**: Audience switching dynamically renders appropriate fields.
- **Validation**: Specific inline error messages for missing required fields, email formatting, and phone formatting.
- **Intelligent Prefill**: Auto-generating query messages when courses are selected.
- **Privacy Consent**: Mandatory consent checkbox preventing submission when unchecked.

---

## 5. Additional Planned Test Suites & Roadmap

To maintain comprehensive test coverage across the entire platform, the following test suites are planned:

1. **Home Page Tests** (`tests/unit/home/`):
   - Hero headline and CTA button destinations.
   - Partner carousel rendering.
   - Instructor and testimonial card rendering.
2. **About Us Page Tests** (`tests/unit/about/`):
   - `ProfileCard` and `SkillCard` rendering.
   - `StatCounter` count-up behavior and Indian number locale formatting (`en-IN`).
   - Vision & Mission glass card rendering.
3. **Courses & Catalogue Tests** (`tests/unit/courses/`):
   - Filtering by pathway (Undergraduate vs Graduate & Above).
   - Dynamic course page metadata generation and slug resolution.
4. **Careers Page Tests** (`tests/unit/careers/`):
   - Job vacancy listings from [src/data/careers.js](src/data/careers.js).
   - Application form validation and file upload handling.
5. **E2E & Integration Tests** (`tests/e2e/`, `tests/integration/`):
   - End-to-end user journeys for course discovery and enquiry submission using Playwright.

### 3.5 Learner Stories Unit Tests (`tests/unit/home/`)

| Test Suite       | File Path                                                                      | Focus & Assertions                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Testimonials** | [tests/unit/home/Testimonials.test.jsx](tests/unit/home/Testimonials.test.jsx) | Confirms all shared testimonials render in the horizontal snap track, arrow controls are present, and quote/name/role content remains visible. |

### Homepage learner stories horizontal carousel validation - 2026-09-22

- Focused test: `npx vitest run tests/unit/home/Testimonials.test.jsx --pool=threads --maxWorkers=1`
- Result: **Passed** - 1 test, 1 test file.

### Homepage featured program zigzag timeline validation - 2026-09-23

- Editor diagnostics: **Passed** for [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx).
- The existing stage data and observer behavior remain unchanged; the component now uses a centered desktop rail with alternating blocks and a single left rail below `lg`.
- Full Vitest: **Blocked by 11 pre-existing failures** — 34 test files and 156 tests passed; failures are in ContactMethods, CareerHero, and HeaderLogo suites, with no Featured Program failure.
- Production build: **Passed** — Next.js compiled successfully, type-checking completed, and all 36 routes generated.

### Featured program heading alignment validation - 2026-09-23

- Centered the Featured Program intro with responsive `mx-auto w-full max-w-2xl text-center` layout classes.
- Editor diagnostics: **Passed** for [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx).

### Homepage internal spacing validation - 2026-09-23

- Reduced repeated internal spacing across homepage sections while preserving outer section padding and responsive breakpoints.
- Editor diagnostics: **Passed** for all seven updated Home components.
- Production build check: **Passed** — Next.js compiled successfully, type-checking completed, and all 36 routes generated.

### Featured Program single disclosure validation - 2026-09-23

- Added [tests/unit/home/FeaturedProgram.test.jsx](tests/unit/home/FeaturedProgram.test.jsx) for default collapsed state, one-toggle expansion, all four stage renderings, and toggle state text/ARIA updates.
- Focused test: `npx vitest run tests/unit/home/FeaturedProgram.test.jsx --pool=threads --maxWorkers=1`
- Result: **Passed** — 1 test, 1 test file.
- Production build check: **Passed** — Next.js compiled successfully, type-checking completed, and all 36 routes generated.

---

## 6. Best Practices for Writing Tests

1. **Prioritize Accessible Queries**:
   - Prefer: `screen.getByRole("button", { name: /submit/i })`, `screen.getByLabelText(/full name/i)`
   - Secondary: `screen.getByText(...)`, `screen.getByPlaceholderText(...)`
   - Avoid: `container.querySelector(...)` or CSS class selectors.
2. **Test User Behavior, Not Implementation Details**:
   - Simulate user clicks with `fireEvent.click()` or `@testing-library/user-event`.
   - Test visible output and accessible state (`aria-expanded="true"`).
3. **Isolate External Dependencies & Config**:
   - Verify that components correctly consume [src/config/site.config.json](src/config/site.config.json).
4. **Always Clean Up & Isolate State**:
   - Ensure each test can run independently without state leakage.

---

## 7. AI Agent Test Maintenance Protocol

> **CRITICAL PROTOCOL FOR AI AGENTS**:
> Whenever code is added or modified in the repository:
>
> 1. Run the test suite: `npm test` or `npx vitest run --pool=threads --maxWorkers=1`.
> 2. If new components or features were added, create corresponding unit tests under `tests/unit/`.
> 3. Update this document ([Test.md](Test.md)) with:
>    - Newly added test files.
>    - Newly covered scenarios.
>    - Updated test results or status.
> 4. Ensure [memory.md](memory.md) is also updated in tandem.

## 8. Admin Authentication Timeout Validation - 2026-09-23

- TypeScript validation: `npx tsc --noEmit` — **Passed** after the admin authentication refactor.
- Production build: `npm run build` — **Passed**; Next.js compiled successfully and generated all 36 routes.
- Full Vitest suite: `npm test` — **Blocked by 11 pre-existing failures**; 34 of 39 test files and 156 of 167 tests passed. Failures remain in ContactMethods, CareerHero, and HeaderLogo suites, with no admin authentication test failures.
- The updated flow covers the eight-second timeout race, explicit non-admin denial, detailed failure logging, and unconditional `isSubmitting` reset in `finally`.
- No new test file was added; the change is isolated to the admin login page and was validated by the project type-check before the production build.

## 9. Admin-Aware Public Shell Validation - 2026-09-23

- TypeScript validation: `npx tsc --noEmit` - **Passed**.
- Focused header validation: `npx vitest run tests/unit/header_unit_test/Header.test.tsx --pool=threads --maxWorkers=1` - **Passed**; 14 tests across the repository and duplicated worktree discovery.
- The focused run confirms the header mounts without Supabase configuration, preserves scroll and mobile-menu behavior, and retains default public actions through optional prop defaults.
- No new test file was added; the route shell and admin-aware action branches are covered by existing header tests plus the successful production type-check.

## 10. Public Header Restoration Validation - 2026-09-23

- TypeScript validation: `npx tsc --noEmit` - **Passed**.
- Focused header validation: `npx vitest run tests/unit/header_unit_test/Header.test.tsx --pool=threads --maxWorkers=1` - **Passed**; 14 tests passed.
- Production build: `npm run build` - **Passed**; all 36 routes generated successfully.
- Confirmed the Header remains rendered on admin routes while ticker, footer, and WhatsApp public chrome remain suppressed there.

## 11. Homepage Section Spacing and Featured Program Button Validation - 2026-09-24

- Editor diagnostics: **Passed** for all eight modified homepage components.
- Focused homepage tests: `npx vitest run tests/unit/home/FeaturedProgram.test.jsx tests/unit/home/Testimonials.test.jsx --pool=threads --maxWorkers=1` - **Passed**; 4 tests across 4 test files.
- No test logic or test files were added; the existing Featured Program interaction coverage validates the preserved disclosure behavior.

## 12. Font Consistency Audit Validation - 2026-09-24

- Editor diagnostics: **Passed** for [src/css/global.css](src/css/global.css), [src/components/header/HeaderLogo.tsx](src/components/header/HeaderLogo.tsx), and the touched homepage components.
- Post-fix search: **Passed**; no hardcoded font families or font utility mismatches remain in `src/components/Home/`.
- Focused homepage behavior remains covered by the existing Featured Program and Testimonials tests. HeaderLogo tests remain blocked by pre-existing expectations for commented-out `Institutional Hub` content and the old Roboto Slab styling.

## 13. More Learning Paths Card Refresh Validation - 2026-09-24

- Editor diagnostics: **Passed** for [src/components/cards/CourseCard.jsx](src/components/cards/CourseCard.jsx) and [src/data/data.js](src/data/data.js).
- Focused homepage tests: `npx vitest run tests/unit/home/FeaturedProgram.test.jsx tests/unit/home/Testimonials.test.jsx --pool=threads --maxWorkers=1` - **Passed**; 4 tests across 4 test files.
- TypeScript validation: `npx tsc --noEmit` - **Passed**.
- No CourseCard-specific test file exists; validation covered compilation, data shape, existing homepage behavior, and removal of pricing fields from the three More Courses entries.

## 14. More Learning Paths Catalogue Migration Validation - 2026-09-24

- Editor diagnostics: **Passed** for [src/components/Home/MoreCourses.jsx](src/components/Home/MoreCourses.jsx), [src/components/cards/CourseCard.jsx](src/components/cards/CourseCard.jsx), [src/data/courses.js](src/data/courses.js), and [src/data/data.js](src/data/data.js).
- Focused homepage tests: `npx vitest run tests/unit/home/FeaturedProgram.test.jsx tests/unit/home/Testimonials.test.jsx --pool=threads --maxWorkers=1` - **Passed**; 4 tests across 4 test files.
- TypeScript validation: `npx tsc --noEmit` - **Passed**.
- Confirmed the three selected catalogue slugs map to existing dynamic course routes: `/courses/python-and-ai-foundations`, `/courses/docker-and-kubernetes`, and `/courses/cybersecurity-basics`.

## 15. Featured Program Arrow Icon Validation - 2026-09-24

- Editor diagnostics: **Passed** for [src/components/Home/FeaturedProgram.jsx](src/components/Home/FeaturedProgram.jsx).
- Focused test: `npx vitest run tests/unit/home/FeaturedProgram.test.jsx --pool=threads --maxWorkers=1` - **Passed**; 2 test files.
- Confirmed the new ArrowDown points down when closed and uses the existing `rotate-180` class when stages are open.

## 16. Homepage Responsive Timeline Audit Validation - 2026-09-24

- Focused tests: `npx vitest run tests/unit/home/FeaturedProgram.test.jsx tests/unit/home/Testimonials.test.jsx tests/unit/header_unit_test/Header.test.tsx --pool=threads --maxWorkers=1` - **Passed**; 18 tests across 6 test files.
- Editor diagnostics: **Passed** for all seven responsive files changed in this audit.
- Browser matrix: **Passed** at 320, 360, 375, 390, 412, 768, 1024, 1280, and 1536px in both closed and open Featured Program states; landscape 667x320 also passed.
- Verified no horizontal overflow, stage circle/rail misalignment, mobile text overlap, sub-44 visible tap targets, console errors, or console warnings. Long temporary stage text wrapped to 4-5 lines at narrow mobile widths without overlap.

## 21. Restored Shared Faculty & Experts Home Section Validation - 2026-09-24

- Editor diagnostics: **Passed** for the shared Faculty component, Home page, About page, and data file.
- Browser validation: Home and About rendered four Faculty cards with four LinkedIn links at 320, 360, 390, 768, 1024, and 1280px; Home had no overflow and the old mentor section was absent.
- TypeScript validation: `npx tsc --noEmit` - **Passed**.
- Focused Vitest validation: **Blocked before test execution** by the existing `@/` alias resolution failure in the current Vitest configuration; no tests ran.
- Exact merge-marker scan: **Passed**; no `<<<<<<<`, `=======`, or `>>>>>>>` lines remain in tracked project files.

## 22. Home Faculty Eyebrow Validation - 2026-09-24

- TypeScript validation: `npx tsc --noEmit` - **Passed**.
- Browser checks passed at 320, 375, 768, 1024, and 1280px: `MENTORS` stayed single-line, aligned with the heading, used the existing 8px spacing, and caused no Home overflow.
- About rendered without the `MENTORS` eyebrow. No console errors or warnings were observed.

## 23. Home Partner Marquee Logos Validation - 2026-09-24

- Data/file cross-check: **Passed**; the 22 `logoUrl` values are unique and match the 22 `public/images/home/*.webp` files exactly (no missing paths, no unused files, no duplicates).
- Headless Chrome (CDP) matrix at 320, 375, 768, 1024, 1280, and 1440px: **Passed**; 44 rendered images (22 logos × 2 copies), 22 unique logos, `--marquee-duration: 90s`, `marquee-rtl`, track width 8640px, no document horizontal overflow (`scrollWidth === innerWidth`), and hiding the strip did not change `scrollWidth`.
- Loop seam: **Passed**; the distance from the first logo of copy 1 to the first logo of copy 2 equals exactly half the track width (delta 0), and frozen screenshots at `translateX(0)` and `translateX(-50%)` produced byte-identical PNGs.
- Behaviour: **Passed**; animation confirmed moving, `animation-play-state: paused` while hovering the strip and `running` after the pointer leaves, and `animation-name: none` under `prefers-reduced-motion: reduce`.
- Rendering: **Passed**; per-logo frames 128×128 / 144×128 / 192×128 / 240×128 / 112×128 / 96×96 with drawn logo heights 84–96px (previously the wide logos drew at 48–59px).
- Network/console: **Passed**; all 22 raw and 22 optimized (`/_next/image`) logo requests returned 200, no broken images, and the only failed request/console error was the pre-existing `/favicon.ico` 404.
- Merge-marker and import scan: **Passed**; no conflict markers, and both `PartnerCarousel.jsx` imports are still used.

## 24. Careers Job Cards — Role Detail Modal Validation - 2026-09-28

- New suite [tests/unit/careers/OpenPositions.test.jsx](tests/unit/careers/OpenPositions.test.jsx) — **Passed**, 6 tests covering: one card per role with an `aria-haspopup="dialog"` trigger and an Apply button; opening the dialog from the card body trigger with badge, location, duration, stipend, posted date, full description (no `line-clamp-3` inside the dialog), responsibilities, requirements and the mailto CTA href; opening the same dialog from the Apply action; dismissal via the X button, the Escape key and a backdrop click; focus moving to the close button and returning to the trigger; and page-scroll locking/release.
- Focused run: `npx vitest run tests/unit/careers/ --pool=threads --maxWorkers=1` — **Passed**, 10 tests across 2 files (OpenPositions 6 + CareerHero 4).
- Full suite: `npx vitest run --pool=threads --maxWorkers=1` — 22 files / 96 tests, **90 passing**. The 6 failures (ContactHero 1, ContactMethods 1, HeaderLogo 4) are pre-existing and reproduce identically with the Careers changes stashed.
- Server-render check on `localhost:3000/careers`: `#positions-panel` contains 4 `aria-haspopup="dialog"` triggers (2 cards × title + Apply), 2 Apply buttons, the stretched overlay class `after:absolute after:inset-0`, the untouched `line-clamp-3` teaser, and **no** `mailto:` left inside the job list.
- Compiled CSS check: the dev stylesheet chunk contains every new utility used by the dialog — `focus-within:border-brand-red`, `after:inset-0`, `after:rounded-2xl`, `max-h-[92vh]`, `rounded-t-3xl`, `z-[100]`, `backdrop-blur-sm`, `size-4.5`, `line-clamp-3`, `bg-sky-500/15`, `bg-violet-500/15`.
- Header audit: the `/careers` header container (`relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8`) is identical to `/` and to every other public route; only the route-aware active pill differs (Home is active on `/`, no pill is active on `/careers`).
- Harness note: the committed `tests/vitest.config.js|mjs` resolve their `@` alias and `setupFiles` relative to `tests/`, so `npm test` cannot resolve `@/…` imports (same blocker recorded in §21). Validation used a temporary root config that was deleted after the run.


## 25. SPRINT Student Portal Unit Tests Validation — 2026-09-28

- New unit test suites under `tests/unit/student/` covering the full student portal implementation:
  - `StudentSidebar.test.jsx`: 5 tests covering shared config navigation links, default active page indicator (`aria-current="page"`), active route derivation from pathname, collapse/expand toggle, and student identity details.
  - `StudentLayout.test.jsx`: 5 tests covering desktop layout rendering with collapsible sidebar, mobile drawer open/close via button, dismiss on Escape key, dismiss on backdrop click, and scroll lock on `document.body`.
  - `StudentDashboard.test.jsx`: 9 tests covering personalized welcome banner, dynamic calendar with current date highlight (`aria-current="date"`), 4 info cards, learning progress widget with session counters and attendance link, enrollment progress bar (`role="progressbar"`), upcoming live classes empty state, quick action links, bottom support cards (feedback CTA, offer letters, announcements unread badge), and active dashboard highlighting.
  - `StudentPlaceholderRoutes.test.jsx`: 5 parameterized tests for student placeholder sub-routes (Profile, Apply Course, Certificates, Placements, Help & Support).
- Test execution:
  - Extended `tests/vitest.setup.js` with `window.matchMedia` polyfill for jsdom environment.
  - Executed tests using Vitest with `@/` alias resolution: 4 test files, 24 tests, **24 passed (100%)**.
  - Temporary runner config was cleanly removed following validation.
- Build validation: `npm run build` completed successfully, compiling all `/student/*` pages statically.

## 26. Student Portal Sidebar Consolidation Unit Tests Validation — 2026-09-29

- Scope: the nine-item sidebar rail, the three new placeholder routes (`my-course`, `result`, `settings`), the six retired routes (`applications`, `exams`, `cohort`, `attendance`, `permissions`, `placements`) and every dashboard link that used to point at them.
- Student suite: `npx vitest run tests/unit/student --pool=threads --maxWorkers=1` — **Passed**, 5 files / 33 tests.
  - `tests/unit/student/StudentSidebar.test.jsx` — 7 tests: labels + hrefs asserted in order against `src/config/student-navigation.json`, retired sections asserted absent, active-route matcher moved to `/certificate/i`.
  - `tests/unit/student/StudentPlaceholderRoutes.test.jsx` — 7 parameterized placeholder checks (Profile, Apply Courses, My Course, Certificate, Result, Help & Support, Settings).
  - `tests/unit/student/StudentDashboard.test.jsx` — 9 tests: learning-progress card asserted link-free (attendance is no longer a portal section), enrollment CTA asserted as “View My Course” → `/student/my-course`.
  - `tests/unit/student/StudentLayout.test.jsx` — 5 tests (unchanged).
  - `tests/unit/student/StudentPortalNavIntegrity.test.js` — 5 tests (new): nine unique sections, every sidebar href resolves to a `page.jsx`, every portal folder reachable from the rail or the dashboard quick actions (`resources` allow-listed as a dashboard-only destination), no quoted `/student/...` string inside the portal source points at a missing page, retired segments absent from both folders and links.
- Wider JSX suite: `npx vitest run --pool=threads --maxWorkers=1` — `Test Files 3 failed | 18 passed (21)`, `Tests 5 failed | 64 passed (69)`. All five failures sit in `careers/CareerHero` (3), `contact/ContactHero` (1) and `contact/ContactMethods` (1): stale expectations left by `8ac3457` (breadcrumb Home → `/home`), `a20a122` (hero container/padding restructure) and `52b1f99` (phone/email refresh). They are outside the student portal task and were deliberately left untouched; no public-site file was modified.
- Dangling-route check: `git grep -nE "/student/(applications|exams|cohort|attendance|permissions|placements)" -- src tests` returns no matches.
- Harness note (same blocker as §21 and §24): the committed `tests/vitest.config.js|mjs` resolve `@/` and `setupFiles` relative to `tests/`, so `npm test` cannot resolve `@/…` imports; verification used a temporary root config that was deleted after the run.

## 27. SPRINT Student Portal Phase 1 Auth UI (Mock) Unit Tests Validation — 2026-09-30

- Scope: the five mock auth screens (`/student/login`, `/student/forgot-password`, `/student/check-email`, `/student/reset-password`, `/student/password-reset-success`), the shared auth kit in [src/components/student/auth/](src/components/student/auth/), the stub auth layer [src/lib/auth/mock-auth.js](src/lib/auth/mock-auth.js), and the chrome-free gate added to [src/components/layout/PublicSiteShell.jsx](src/components/layout/PublicSiteShell.jsx).
- Auth suite: `npx vitest run --config tests/vitest.config.mjs unit/student/auth` — **Passed**, 8 files / 60 tests.
  - `tests/unit/student/auth/AuthValidation.test.js` — 12 tests: `isValidEmail` boundary cases, `validateLogin` (empty/malformed email, missing password, both errors at once), `getPasswordChecks` (length, upper, lower, number, symbol), `isPasswordValid` / `arePasswordsEqual`, and `validateNewPassword` + `validatePasswordConfirmation`.
  - `tests/unit/student/auth/AuthLayouts.test.jsx` — 7 tests: split layout brand rail, mobile logo, back-to-site link, `AuthCard` heading/description/eyebrow, and the centered variant's focus ring on the support mail link.
  - `tests/unit/student/auth/PasswordInput.test.jsx` — 8 tests: reveal toggle semantics (`aria-pressed`, label swap), rules list wired through `aria-describedby`, live rule ticking, `role="alert"` error announcement (no colour-only signalling), and the disabled/busy state.
  - `tests/unit/student/auth/LoginForm.test.jsx` — 8 tests: portal sign-in card with recovery and enrolment routes, mock preview notice, empty-submit blocking with focus on the first invalid field, malformed email rejection, clearing field errors after correction, busy state (button disabled + `aria-busy`), mock sign-in routing to `/student/dashboard`, and email trimming.
  - `tests/unit/student/auth/ForgotPasswordForm.test.jsx` — 5 tests: recovery card routes, required email, malformed email, request → `/student/check-email` with the address in the query, and the in-flight busy state.
  - `tests/unit/student/auth/CheckEmailPanel.test.jsx` — 7 tests: the confirmed address is echoed, resend shows a confirmation, resend honours the mocked 900 ms delay, and the sign-in / change-address routes.
  - `tests/unit/student/auth/ResetPasswordForm.test.jsx` — 9 tests: requirement list rendering, `aria-describedby` wiring, live rule ticking, both fields required, weak password rejection, confirmation mismatch, mismatch clearing after agreement, success routing to `/student/password-reset-success`, and one reveal toggle per field.
  - `tests/unit/student/auth/PasswordResetSuccessPage.test.jsx` — 4 tests: success panel copy, sign-in CTA, back-to-site link, and the shared centered layout.
- Shell suite: `npx vitest run --config tests/vitest.config.mjs unit/layout` — **Passed**, 2 files / 9 tests; new [tests/unit/layout/PublicSiteShell.test.jsx](tests/unit/layout/PublicSiteShell.test.jsx) (8 tests) asserts that all five auth routes render without the public header, footer or WhatsApp bubble while `/home` keeps them, `/student/dashboard` keeps the public header, and `/admin/dashboard` stays chrome-free.
- Student suite: `npx vitest run --config tests/vitest.config.mjs unit/student` — **Passed**, 13 files.
- `tests/unit/student/StudentPortalNavIntegrity.test.js` — **Passed** after `hasPage()` was taught to resolve `/student/<segment>` links against both `src/app/student/(portal)/<segment>/page.jsx` and the new full-screen `src/app/student/<segment>/page.jsx`: the auth links inside `src/components/student/auth/` are now proven real rather than reported as dangling, and the retired-section guard is unchanged.
- Header suite: `npx vitest run --config tests/vitest.config.mjs unit/header_unit_test` — **Passed** for `MobileNavigation.test.tsx` after the mobile drawer entry was aligned to the "Student Portal" label used by the desktop CTA (four label assertions updated); `HeaderLogo.test.tsx` retains its four pre-existing failures from §26.
- Full suite: `npx vitest run --config tests/vitest.config.mjs --pool=threads --maxWorkers=1` — `Test Files 4 failed | 32 passed (36)`, `Tests 9 failed | 192 passed (201)`. All nine failures are the pre-existing `careers/CareerHero` (3), `contact/ContactHero` (1), `contact/ContactMethods` (1) and `header_unit_test/HeaderLogo` (4) cases documented in §26 — no auth, shell or navigation regression.
- Production build: `npm run build` — **Passed** (exit 0, 54 pages). `/student/login`, `/student/forgot-password`, `/student/reset-password` and `/student/password-reset-success` are static, and `/student/check-email` is dynamic (`ƒ`) because it reads the async `searchParams` promise.
- `npm run lint` remains **unavailable repo-wide**: Next 16 removed `next lint`, so the script exits with `Invalid project directory provided, no such directory: ...\lint` and the repository ships no ESLint config. Validation relied on the Vitest run and the production build.
- Harness note (same blocker as §21, §24 and §26): bare `npm test` discovers 57 files and fails all of them because `vitest run` is not given the config — the committed `tests/vitest.config.mjs` is only applied with an explicit `--config`, which is the invocation used above. The earlier `next-env.d.ts` churn produced by the build check was reverted again.


## 28. Student Enrollment Wizard Shell Unit Tests Validation — 2026-09-30

- Scope: the new `/student/enroll` route, the wizard shell under [src/components/student/enrollment/](src/components/student/enrollment/) (shared state, progress indicator, step navigation) and Step 1 (Personal Information). Steps 2-5 are scaffolded: they own their label, copy, shared-state slice and navigation slot, but their forms land in a later phase.
- Enrollment suite: `npx vitest run --config tests/vitest.config.mjs unit/student/enrollment` — **Passed**, 7 files / 59 tests.
  - [enrollment-validation.test.js](tests/unit/student/enrollment/enrollment-validation.test.js) — 17 tests: mobile normalisation (`+91`, `91`, leading `0`, numbers that genuinely start with 91), name rules (empty, single character, digits rejected, apostrophes/hyphens allowed), mobile rules (too short, not starting 6-9, every common spelling of a real number), the aggregate Step 1 error map, the reused auth email message, and `compactErrors` key ordering.
  - [enrollment-steps.test.js](tests/unit/student/enrollment/enrollment-steps.test.js) — 7 tests: the five ids in order, unique labels plus non-empty copy, the `Component`/`validate`/`initialValues` contract on every step, exactly four scaffolded steps, the seeded state shape, Step 1 validation wired to the auth email rules, and a fresh state object per `createEmptyEnrollment()` call.
  - [EnrollmentWizard.test.jsx](tests/unit/student/enrollment/EnrollmentWizard.test.jsx) — 10 tests: Step 1 opens with the progress indicator and no Back, an empty submit blocks with three inline alerts and focuses the first field, malformed email/phone are rejected, answers survive forward *and* back navigation, a corrected field clears its own error, a completed step is revisitable from the progress indicator while future steps stay disabled, the scaffolded note renders, all five steps walk to the summary that echoes the captured values, "Review my details" reopens the wizard with data intact, and the preview notice stays on the page.
  - [PersonalInformationStep.test.jsx](tests/unit/student/enrollment/PersonalInformationStep.test.jsx) — 7 tests: three labelled fields, required marks plus hint copy, `${idPrefix}-${field}` ids, `email`/`tel` input types and autocomplete tokens, hint wiring through `aria-describedby`, controlled values reported as `[fieldName, value]`, and inline alerts with `aria-invalid`.
  - [EnrollmentProgress.test.jsx](tests/unit/student/enrollment/EnrollmentProgress.test.jsx) — 7 tests: the navigation landmark, the compact "Step 2 of 5" counter with the active label, five ordered items, `aria-current="step"`, the screen-reader state text, revisit-only completed steps, and the all-complete state.
  - [EnrollmentStepFooter.test.jsx](tests/unit/student/enrollment/EnrollmentStepFooter.test.jsx) — 6 tests: submit versus `type="button"`, the pinned mobile bar flipping to `md:static`, the 48px controls, the repeated step counter, Back hidden on Step 1, and the "Submit Enrollment" label on the last step.
  - [EnrollmentSuccessPanel.test.jsx](tests/unit/student/enrollment/EnrollmentSuccessPanel.test.jsx) — 5 tests: eyebrow and heading wiring, the collected values, rows skipped when empty, the mock-submission notice, and both actions.
- Shell: [tests/unit/layout/PublicSiteShell.test.jsx](tests/unit/layout/PublicSiteShell.test.jsx) now also asserts that `/student/enroll` renders without the public header, footer or WhatsApp bubble (9 tests, all passing).
- Full suite: `npx vitest run --config tests/vitest.config.mjs --pool=threads --maxWorkers=1` — `Test Files 4 failed | 39 passed (43)`, `Tests 9 failed | 252 passed (261)`. The nine failures are the pre-existing `careers/CareerHero` (3), `contact/ContactHero` (1), `contact/ContactMethods` (1) and `header_unit_test/HeaderLogo` (4) cases documented in §26 and §27 — no enrollment, auth or shell regression.
- Production build: `npm run build` — **Passed** (exit 0); `/student/enroll` is generated as a static route alongside the five auth routes.
- Mobile and accessibility notes: the Back/Continue bar is `fixed` below `md` (with a safe-area inset for notched phones) and `md:static` inside the step card; every control is `h-12` (48px, above the 44px touch-target floor); the wizard moves focus to the new step heading after each change; and every validation message renders with `role="alert"` on the field that caused it.
- Deliberate non-goals for this phase (documented in the wizard docblock): no backend, no persistence and no `?step=` URL sync, so a browser refresh restarts the wizard.


## 29. Auth Screen Co-location Refactor Unit Tests Validation — 2026-09-30

- Scope: pruning `src/components/student/auth/` down to the pieces that are genuinely shared. The five single-use screens now live in their own route files, so the folder holds eight reusable modules instead of thirteen mixed ones.
- Merged back into their routes (component file deleted, JSX moved verbatim): `LoginForm` → [src/app/student/login/page.jsx](src/app/student/login/page.jsx), `ForgotPasswordForm` → [forgot-password/page.jsx](src/app/student/forgot-password/page.jsx), `CheckEmailPanel` → [check-email/page.jsx](src/app/student/check-email/page.jsx), `ResetPasswordForm` → [reset-password/page.jsx](src/app/student/reset-password/page.jsx), `PasswordResetSuccessPanel` → [password-reset-success/page.jsx](src/app/student/password-reset-success/page.jsx).
- Kept separate because they are imported by two or more screens (or by the enrollment wizard): `AuthButton` (7 import sites), `AuthField` (5), `AuthCard` (5), `AuthSplitLayout` (3), `AuthCenteredLayout` (2), `PasswordInput` (2), `auth-validation.js` (6, including `enrollment-validation.js`), `PasswordRequirements` (1 today, but a self-contained live-rules widget the enrollment Account step is documented to reuse).
- Route metadata now lives in a per-route `layout.jsx` for the four routes whose `page.jsx` had to become a Client Component: `title`, `description` and `robots: { index: false, follow: false }` were moved unchanged. Next only resolves the `metadata` export in Server Components, which is why the split exists. `password-reset-success` keeps its metadata in `page.jsx` because that screen has no hooks and is still a Server Component.
- `check-email` also changed mechanism: the async server page that awaited `searchParams` is now a client page reading `?email=` with `useSearchParams`, wrapped in its own `<Suspense>` boundary with a skeleton fallback. The route changed from dynamic (`ƒ`) to a **prerendered static shell** in the build output — a small improvement — and the repeated-parameter behaviour is preserved (`searchParams.get` takes the first value).
- Test files retargeted at the route modules (the only place each screen is served) and renamed to match: `LoginForm.test.jsx` → `LoginPage.test.jsx`, `ForgotPasswordForm.test.jsx` → `ForgotPasswordPage.test.jsx`, `ResetPasswordForm.test.jsx` → `ResetPasswordPage.test.jsx`, `CheckEmailPanel.test.jsx` → `CheckEmailPage.test.jsx`; `PasswordResetSuccessPage.test.jsx`, `AuthLayouts.test.jsx`, `AuthValidation.test.js` and `PasswordInput.test.jsx` kept their scope. `CheckEmailPage.test.jsx` now mocks `next/navigation#useSearchParams` instead of calling the page function with a `searchParams` promise (same three cases: address echoed, repeated parameter, missing parameter).
- Auth suite: `npx vitest run --config tests/vitest.config.mjs unit/student/auth` — **Passed**, 8 files.
- Full suite: `npx vitest run --config tests/vitest.config.mjs --pool=threads --maxWorkers=1` — `Test Files 4 failed | 39 passed (43)`, `Tests 9 failed | 250 passed (259)`. The nine failures are the pre-existing CareerHero (3), ContactHero (1), ContactMethods (1) and HeaderLogo (4) cases; the total dropped by two because the old check-email file had seven cases and the new one has five (two of them were the removed server-component invocation checks).
- Production build: `npm run build` — **Passed** (exit 0). Metadata was verified against the prerendered HTML rather than assumed: `login.html` → `Student Sign In | SPRINT`, `forgot-password.html` → `Forgot Password | SPRINT`, `check-email.html` → `Check Your Email | SPRINT`, `reset-password.html` → `Reset Password | SPRINT`, `password-reset-success.html` → `Password Reset Successful | SPRINT`, each with `robots: noindex, nofollow`.

## 30. Enrollment Step 2 — Education & Career Profile (Optional) Unit Tests Validation — 2026-09-30

- Scope: Step 2 stops being a scaffold. It now collects eight optional profile fields (Current education level, College/University, Degree/Course, Year/Semester, Graduation year, City, State, Current role) plus the specialization picker, and becomes the wizard's first `isOptional` step — skippable without ever blocking progress.
- Shared primitives gained the two additive hooks the step needed: `AuthField` renders a `<select>` when passed `options` (`{ value, label }[]` — same label/hint/error/`aria-*` wiring, empty option from `placeholder`, chevron unless `trailing` overrides) and `AuthButton` gained a `ghost` variant for quiet tertiary actions like "Skip for now".
- Validation stayed deliberately thin because the step is optional: `validateGraduationYearField` is the only rule (empty passes; filled must be four digits between 1980 and current year + 8) and `validateEducationProfile` aggregates it, so "Skip for now" needs no special case and an untouched step always passes Continue.
- The registry entry (`enrollment-steps.js`) carries the new contract fields: `isOptional: true`, the agreed `skipNotice`, eight `initialValues`, and `specialization.initialValues.track` — Step 2 writes the career choice into Step 3's slice so the next phase can reuse it.
- `EducationStep.jsx` renders the eight `AuthField`s (2-up from `sm`; graduation year numeric with `maxLength={4}` and its inline error) and an 11-option radio `fieldset` (the ten tracks plus "I'm not sure yet", exported as `SPECIALIZATION_OPTIONS`) that writes through the wizard's new cross-slice `onChangeIn("specialization")("track")`.
- Navigation: `EnrollmentStepFooter` accepts `onSkip`/`skipLabel` and renders a `type="button"` ghost action grouped with Back (one row on mobile, `md:contents` unwrapped into the desktop [Back] [Skip] [Continue] toolbar); the wizard's `handleSkip` bypasses validation, keeps every typed answer, advances, and shows the step's `skipNotice` in a `role="status"` notice on the landing step (cleared by the next navigation). The panel shows an "Optional" chip from `step.isOptional` and the page adds `pb-44` on mobile while an optional step is active so the taller pinned bar never covers the form.
- Test files: [EducationStep.test.jsx](tests/unit/student/enrollment/EducationStep.test.jsx) — 8 tests (stateful harness mirroring the wizard contract: eight labelled optional controls, all 11 radios including "I'm not sure yet", cross-slice `["specialization", "track", …]` write, checked state, controlled values, education-slice edits, `aria-invalid` + `role="alert"` on a bad year, optional-step copy). [EnrollmentWizard.test.jsx](tests/unit/student/enrollment/EnrollmentWizard.test.jsx) — 14 tests (the previous ten retargeted to the new Step 2 heading, the scaffold assertion moved to Step 3, plus: the optional step offers Skip and an empty form passes Continue; skip lands on Specialization with the exact `skipNotice` in `role="status"`; partial answers and the chosen track survive skip-and-return; a broken graduation year blocks Continue with focus but never a skip). [EnrollmentStepFooter.test.jsx](tests/unit/student/enrollment/EnrollmentStepFooter.test.jsx) — 8 tests (previous six plus Skip being `type="button"`/`h-12`/firing `onSkip`, and no skip on required steps where Back sits directly in the row). [enrollment-steps.test.js](tests/unit/student/enrollment/enrollment-steps.test.js) — 8 tests (three scaffolded steps now, only Step 2 optional with the agreed notice text, the eight-field + `track` seed shape). [enrollment-validation.test.js](tests/unit/student/enrollment/enrollment-validation.test.js) — 21 tests (four new graduation-year cases: empty passes, plausible years, non-4-digit shapes, out-of-window years).
- Enrollment suite: `npx vitest run --config tests/vitest.config.mjs --pool=threads --maxWorkers=1 unit/student/enrollment` — **Passed**, 8 files / 78 tests.
- Full suite: `npx vitest run --config tests/vitest.config.mjs --pool=threads --maxWorkers=1` — `Test Files 4 failed | 40 passed (44)`, `Tests 9 failed | 269 passed (278)`. The same nine pre-existing CareerHero (3), ContactHero (1), ContactMethods (1) and HeaderLogo (4) failures, triaged: they expect `/` links and older hero/header copy while commit `8ac3457` ("update navigation links to point to /home") changed the components and routes — none of the four files (nor their components) imports `student/auth` or `student/enrollment`, so Step 2 cannot be their cause (verified by import scan and a stash round-trip that reproduced the failures independently of this work).
- Production build: `npm run build` — **Passed** (exit 0), `/student/enroll` prerendered with the new Step 2 in place.


## 31. Auth Screen Removal — Suite Impact — 2026-09-30

- Scope change: the five auth screens (login, forgot-password, check-email, reset-password, password-reset-success) moved to a teammate. Deleted: the five route folders, `AuthCard.jsx`, `AuthSplitLayout.jsx`, `AuthCenteredLayout.jsx`, `src/lib/auth/mock-auth.js` (the mock backend seam), and six test files (the five screen suites + `AuthLayouts`). Retained as shared/Step-5 kit: `AuthButton`, `AuthField`, `auth-validation.js` (+ `AuthValidation.test.js`), `PasswordInput`, `PasswordRequirements` (+ `PasswordInput.test.jsx`) — the wizard imports the first three; the password pair is reserved for the Account step.
- Suites: `unit/student/enrollment unit/student/auth` → **10 files / 98 tests passed**. Full suite → `Test Files 5 failed | 33 passed (38)`, `Tests 10 failed | 230 passed (240)`: the nine pre-existing career/contact/header failures plus the one **expected** `StudentPortalNavIntegrity` case ("leaves no portal link pointing at a removed section") — `EnrollmentWizard` links `/student/login`, which the teammate's rebuilt routes will serve again; failure explicitly accepted at deletion time.
- Production build: `npm run build` — **Passed**; `app-path-routes-manifest.json` contains no auth routes and keeps `/student/enroll/page` plus every `/student/(portal)` route.

