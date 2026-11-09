# Frontend QA Audit

**Audit date:** November 9, 2026  
**Git checkout:** `main` at `4d0e855a1a83a5e08641be205760af7364ea036a`  
**Git update:** `git pull --ff-only` completed; branch was already up to date.  
**Scope:** Inspection and testing only. No product/source fixes were made. `.env` was not opened or inspected.

## A. Overall Summary

- **Frontend page modules:** 48, including one intercepted modal implementation.
- **Routes:** 47 fixed route examples returned a final HTTP 200 after following redirects. Auth-protected routes redirect to their sign-in state. The production build reported 48 application routes plus the proxy/middleware entry.
- **Catalogue details:** 20 catalogue-linked course, bundle, and learning-path URLs returned successfully in the previous route sweep on this checkout.
- **Responsive matrix:** Nine principal public pages at 1920, 1366, 768, 425, 375, and 320 pixels: 54 page/viewport checks.
- **Build:** `npm run build` succeeded on the current checkout.
- **Tests:** 70 test files: 58 passed, 12 failed. 452 tests passed and 38 failed (490 executed).
- **Git:** Pull was already current. Build changed the generated references in `next-env.d.ts`; those build-generated references were restored to the clean pre-build state. No source changes remain from the audit.
- **Blocked:** Authenticated Admin/Staff/Student flows, successful email delivery, full accessibility/visual audit, and PowerPoint comparison (no PowerPoint found).

## B. Page-by-Page Status

| Page / route | UI / functionality status | Responsive | Content / technical status |
|---|---|---|---|
| Home — `/`, `/home` | Loaded | No overflow in tested matrix | Copy issues below; no runtime/image errors in sampled route sweep |
| About — `/about` | Loaded | Overflow at 375px and 320px | Heading hierarchy issue below |
| Course catalogue — `/courses` | Loaded; search field renders | No overflow in tested matrix | Footer scholarship anchor has no target |
| Courses — `/courses/[slug]` | 13 catalogue-linked pages loaded | Not exhaustively tested per detail | Route check passed |
| Bundles — `/bundles/[slug]` | Three catalogue-linked pages loaded | Not exhaustively tested per detail | One public title has “Test”; one roadmap is placeholder |
| Learning paths — `/learning-paths/[slug]` | Four linked pages loaded | Not exhaustively tested per detail | Route check passed |
| SPRINT RISE — `/programs/sprint-rise` | Loaded; stage accordions render | No overflow in tested matrix | Learning-board placeholder; requested aggregate hours and Enterprise Roles absent |
| Career Accelerator — `/programs/career-accelerator` | Loaded; all three phase accordions expand | No overflow in tested matrix | Learning-board placeholder; requested total hours and Enterprise Roles absent |
| Contact — `/contact` | Loaded; four audience forms render; empty submissions rejected | Overflow at 320px | Alphabetic phone text passes browser validity |
| Careers — `/careers` | Loaded | No overflow in tested matrix | Content not exhaustively proofread |
| Privacy / Terms — `/privacy`, `/terms` | Loaded | No overflow in tested matrix | Pages contain sample/dummy legal text |
| Login, recovery, enrollment — `/login`, `/forgot-password`, `/set-password`, `/student/*` account routes | Screens load; auth completion not exercised | Not exhaustively tested | Backend/email journeys blocked |
| Student portal — `/student/*` portal routes | Auth/access gate reached; unknown student path shows a fallback | Not exhaustively tested | Authenticated state unavailable |
| Admin — `/admin/*` | Sign-in gate reached | Not exhaustively tested | Admin workflows blocked without credentials |
| Staff — `/staff/*` | Access/login gate and invalid-token screen load | Not exhaustively tested | Valid invitation/login flow blocked |
| Invalid URLs | Generic invalid URL and invalid course/bundle/path URLs show 404; refresh preserves it. Unknown `/student/*` segment shows a fallback with HTTP 200. | Not tested | No runtime error confirmed |

## C. Findings

### Medium

1. **Contact forms accept invalid phone text**
   - **Route:** `/contact`
   - **Reproduction:** Select any audience form and enter `abc` in its phone field.
   - **Expected:** Reject non-phone input with useful validation.
   - **Actual:** All four phone inputs have no pattern constraint; browser validity accepts `abc`.
   - **Suggested correction:** Add suitable client- and server-side phone format/length validation.

2. **Horizontal overflow on narrow screens**
   - **Routes:** `/about` at 375px and 320px; `/contact` at 320px.
   - **Expected:** Page content fits the viewport without horizontal scrolling.
   - **Actual:** About document width exceeds the viewport by approximately 43–101px depending on the measured run; Contact exceeds it by approximately 24–32px. Other matrix pairs had no detected overflow.
   - **Suggested correction:** Constrain moving ticker content and narrow-screen Contact layout.

3. **Program Learning Board placeholder is visible**
   - **Routes:** `/programs/sprint-rise`, `/programs/career-accelerator`.
   - **Actual:** Both show “Learning Board topics and activities have not yet been provided.”
   - **Suggested correction:** Add approved learning-board topics/activities or remove the placeholder when the approved program content is ready.

4. **Requested program information is missing**
   - **Routes:** `/programs/sprint-rise`, `/programs/career-accelerator`.
   - **Actual:** Neither page displays aggregate total hours or an Enterprise Roles section. Rise lists stages of 124, 46, 40, and 90 hours (300 hours combined). Career Accelerator displays “3 Years (6 Semesters).”
   - **Suggested correction:** Verify requested hours and roles against the approved PowerPoint and publish the verified information. No PowerPoint deck was available in the repository, so consistency could not be established.

5. **Bundle roadmap placeholder**
   - **Route:** `/bundles/non-it-to-tech-transition`.
   - **Actual:** The page says “Program roadmap coming soon.”
   - **Suggested correction:** Add approved roadmap content or clearly mark the package as not yet available.

6. **Scholarship footer link has no destination section**
   - **Link:** `/courses#scholarship`.
   - **Actual:** No element with `id="scholarship"` exists on the catalogue page.
   - **Suggested correction:** Add the intended target section or point to the current scholarship information/contact destination.

7. **Legal pages contain sample/dummy policy content**
   - **Routes:** `/privacy`, `/terms`.
   - **Actual:** Both pages explicitly identify themselves as sample/dummy. Terms use fictional “Example State” and “Example City”; both use `privacy@example.com`.
   - **Suggested correction:** Replace with approved production policies and valid contact details if these pages are intended for public production use.

8. **Unit tests fail**
   - **Actual:** 12 of 70 test files failed; 38 of 490 executed tests failed.
   - **Failing groups include:** Careers hero, Contact hero/methods, Home faculty filmstrip/featured program/testimonials, header logo/mobile enroll, student dashboard/placeholder routes/sidebar, and student portal navigation integrity.
   - **Suggested correction:** Triage failures before treating the test suite as a release gate. No fixes were made.

9. **Installed Next.js does not satisfy manifest/lock**
   - **Actual:** Manifest declares `^16.4.1`; lockfile resolves `16.4.2`; installed package reports `16.3.5`. `npm ls next --depth=0` marks the installed package invalid.
   - **Suggested correction:** Reconcile the local installation with the lockfile. No packages were installed or changed during this audit.

### Low

10. **About heading hierarchy skips from H2 to H4**
    - **Route:** `/about`.
    - **Actual:** “Aditya Ranjan” is an H4 after an H2 “Leadership.”
    - **Suggested correction:** Use sequential heading levels or non-heading markup if appropriate.

11. **Bundle title includes test suffix**
    - **Route:** `/bundles/non-it-to-tech-transition`.
    - **Actual:** “Non-IT to Tech Transition Package - Test.”
    - **Suggested correction:** Confirm the public title and remove the test suffix if unintended.

12. **Telephone URI contains slash-separated numbers**
    - **Route:** Contact/footer telephone link.
    - **Actual:** `tel:+918521283184/85`.
    - **Suggested correction:** Use a dialable number or provide separate telephone links.

## D. Grammar and Content

| Page | Existing text | Suggested text | Type |
|---|---|---|---|
| About | “Who we are?” | “Who are we?” or “Who We Are.” | Heading grammar |
| Home | “We do not teach, We #Empower” | “We do not teach—we empower.” | Comma splice / capitalization |
| Footer | “Hands on, production level education in Cloud, AI, and Software Systems bridging the academic industry gap with job ready, execution first training.” | “Hands-on, production-level education in cloud, AI, and software systems, bridging the academic–industry gap with job-ready, execution-first training.” | Hyphenation / punctuation |
| Bundle detail | “Non-IT to Tech Transition Package - Test” | Confirm the approved public package title. | Test/demo text |

These are confirmed copy observations, not applied corrections. A full proofreading pass of every dynamic and authenticated page was not completed.

## E. Technical Results

- **Production build:** Passed with `next build --webpack`; compilation, TypeScript, static page generation, and route optimization completed.
- **Route checks:** All 47 tested fixed routes reached HTTP 200 after following redirects. Protected routes redirect to their sign-in/access screens.
- **Detail routes:** 20 catalogue-linked routes returned successfully in the route sweep.
- **404s:** Invalid dynamic and generic URLs returned the expected 404 page; refresh retained the 404.
- **Runtime sample:** No console/page errors, HTTP error responses, or broken images were observed in the sampled public routes in the prior browser sweep. Rapid-navigation aborted media/map requests were not treated as application failures.
- **Form submission:** Successful email delivery was not attempted to avoid sending a real enquiry.
- **Tests:** 38 failures / 452 passes across 70 test files.
- **Environment:** Installed Next.js version mismatch noted in Finding 9.

## F. Responsive Results

| Viewport | Result |
|---|---|
| Desktop — 1920px | No overflow detected |
| Laptop — 1366px | No overflow detected |
| Tablet — 768px | No overflow detected |
| Mobile — 425px | No overflow detected |
| Mobile — 375px | About page overflows |
| Small mobile — 320px | About and Contact pages overflow |

The matrix covers the nine main public pages, not every authenticated portal page.

## G. Final Status and Limitations

- **Working:** Main public pages, tested fixed routes, catalogue-linked detail pages, expected 404 behavior, form required/email checks, and program accordion interactions.
- **Needs attention:** Findings in Section C, particularly small-screen overflow, phone validation, missing/placeholder program content, link targets, demo legal copy, test failures, and dependency mismatch.
- **Not verified:** Authenticated Admin/Staff/Student user journeys, successful login/enrollment/email/contact submission, valid staff invitation flow, PowerPoint consistency, full keyboard/focus and contrast audit, external link destinations, and responsive behavior of every protected portal page.
- **Git:** Checkout is `main` at commit `4d0e855a1a83a5e08641be205760af7364ea036a`; fast-forward pull was already up to date.
- **Inspection-only:** No product code or dependencies were changed. The `.env` file was not read. Build-generated `next-env.d.ts` changes were returned to their pre-build state.
