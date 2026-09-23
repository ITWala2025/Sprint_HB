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

### 3.2 About Page Unit Tests (`tests/unit/about/`)

The About page implements the specifications from [docs/md/About_Page.md](docs/md/About_Page.md) (10-section approved layout).

| Test Suite             | File Path                                                                                    | Focus & Assertions                                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AboutPage**          | [tests/unit/about/AboutPage.test.jsx](tests/unit/about/AboutPage.test.jsx)                   | Renders the "Connect With SPRINT" CTA section and asserts the "Request a Callback" primary CTA resolves to `/contact` with `data-track="cta_contact"` (CTA-05 fallback). Mocks `next/link` and polyfills jsdom gaps (`matchMedia`, `IntersectionObserver`). |
| **StoryVisionMission** | [tests/unit/about/StoryVisionMission.test.jsx](tests/unit/about/StoryVisionMission.test.jsx) | Vision/Mission sliding track: no arrow buttons, no top hint/counter, dot pagination at the card bottom with `aria-current` on the active dot, dot-click switching, swipe-left navigation, and vertical-drag rejection.                                      |

### 3.3 Legal Page Unit Tests (`tests/unit/legal/`)

| Test Suite      | File Path                                                                      | Focus & Assertions                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LegalLayout** | [tests/unit/legal/LegalLayout.test.jsx](tests/unit/legal/LegalLayout.test.jsx) | Confirms `/privacy` and `/terms` share a compact single-column layout, the sidebar/table of contents is absent, and legal sections remain rendered. |

### 3.4 Campus Ticker Unit Tests (`tests/unit/layout/`)

| Test Suite           | File Path                                                                                  | Focus & Assertions                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **CampusNewsTicker** | [tests/unit/layout/CampusNewsTicker.test.tsx](tests/unit/layout/CampusNewsTicker.test.tsx) | Confirms the red alert icon is replaced by the branded blue megaphone and the alert icon is absent. |

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
