# SPRINT Website – About Page (About Us)

## Document Information

| Field | Value |
|---|---|
| Page Title | About Us |
| File | `About_Page.md` |
| Authors | Ujjwal, Ayush |
| Source Document | `sprint_websit_markdown.md` – SPRINT Website Requirements (Sheet1) |
| Document Date | 09-09-2026 |
| Version | 1.0 |
| Status / Sprint | Not Started / TBD |

> **Purpose:** This document defines the **About Us** page of the SPRINT website and
> maps every section of the page to the requirement IDs (`AB-xx`, `GL-xx`) from the
> source requirements document, so that implementation, QA and sprint tracking can be
> traced back to the approved requirements.

---

## 1. Page Overview

The **About Us** page introduces visitors to SPRINT and builds trust and institutional
credibility. It explains who SPRINT is, why it was established, the leadership and
faculty behind the institution, its vision and mission, and the emerging technologies it
focuses on — presented in a way that reflects SPRINT's practical, job-ready approach.

### 1.1 Page Goals

- Establish trust and institutional credibility (**AB-13 – AB-18**).
- Communicate why SPRINT exists and its job-ready approach (**AB-08 – AB-12**).
- Present the Vision and Mission clearly (**AB-19 – AB-21**).
- Position SPRINT as a modern institution focused on emerging technologies (**AB-01 – AB-07**).
- Move visitors toward the primary conversion action (enquiry / registration) (**GL-06, GL-39**).

### 1.2 Target Audience / Users

- Prospective students (undergraduate, graduate and above) evaluating SPRINT.
- Working professionals considering up-skilling (soft skills, PMO/PCS, Hi-Tech IT).
- Parents / guardians researching institutional credibility.
- Hiring partners and industry stakeholders assessing SPRINT's approach.

---

## 2. Page Structure (Section Order)

Stacking order of the About Us page, top to bottom:

| # | Section | Primary Mapped Requirements |
|---|---|---|
| 1 | Page Hero – "About Us" title + short intro | GL-12 (Page title/meta), GL-11 |
| 2 | Who We Are – Leadership & Founding team | AB-13, AB-16, AB-17, AB-15 |
| 3 | Who We Are – Faculty / Instructor profiles | AB-14, AB-16, AB-17, AB-15 |
| 4 | Vision & Mission | AB-19, AB-20, AB-21 |
| 5 | Why We Exist | AB-08, AB-09, AB-10, AB-11, AB-12 |
| 6 | Emerging Technology | AB-01, AB-02, AB-03, AB-04, AB-05, AB-06, AB-07 |
| 7 | Final CTA / Contact strip | GL-06, GL-15, GL-16, GL-17 |
| 8 | Global header & footer (site-wide) | GL-01, GL-14 |

### 2.1 Page Wireframe (ASCII Sketch)

```
+--------------------------------------------------------------+
| GLOBAL HEADER (logo | Home | Courses | About Us | Updates |  |
| Contact | CTA)  — GL-01, GL-37, GL-39, GL-43, GL-46          |
+--------------------------------------------------------------+
| HERO: "About Us" - Page Title + 1-2 line intro       GL-12   |
+--------------------------------------------------------------+
| WHO WE ARE - Leadership & Founding Team                       |
| [Photo] [Photo] [Photo]   AB-13, AB-15, AB-16, AB-17         |
| WHO WE ARE - Faculty / Instructors AB-14, AB-15, AB-16,AB-17 |
+--------------------------------------------------------------+
| VISION & MISSION (distinct visual cards)  AB-19, AB-20,AB-21 |
+--------------------------------------------------------------+
| WHY WE EXIST                                                 |
|  - Why SPRINT was established  AB-08                         |
|  - Academic-industry gap       AB-09                         |
|  - Job-ready approach          AB-10                         |
|  - Practical execution skills  AB-11                         |
|  - Stats / callouts (verified) AB-12                         |
+--------------------------------------------------------------+
| EMERGING TECHNOLOGY (infographic/cards)                      |
|  AI/ML, Cloud, Microservices, DevOps, skill gap  AB-01..07   |
+--------------------------------------------------------------+
| FINAL CTA / CONTACT STRIP (call, email, WhatsApp) GL-15,16,17|
+--------------------------------------------------------------+
| GLOBAL FOOTER (site links, legal, social)   GL-14, GL-18,    |
| GL-21, GL-22                                                 |
+--------------------------------------------------------------+
```

---
## 3. About-Specific Requirement Mapping

All requirement details (priority, phase, dependencies, status) below are taken directly
from the source document `sprint_websit_markdown.md`.

### 3.1 About / Who We Are

**Mapped requirements: AB-13 – AB-18**

| Requirement ID | Requirement | Priority | Phase | How it maps to the About Us page | Dependencies | Status |
|---|---|---|---|---|---|---|
| AB-13 | Leadership/founding team section | P1 | 1, 2, 4 | Dedicated sub-section under "Who We Are" introducing SPRINT's leadership / founding team | Verified profiles | Not Started / TBD |
| AB-14 | Faculty/instructor profiles | P1 | 1, 2, 4 | Faculty/instructor profile cards below the leadership section | Verified profiles | Not Started / TBD |
| AB-15 | Profile photographs | P2 | 2, 4, 5 | Approved professional photographs for every leadership and faculty profile | Approved photographs | Not Started / TBD |
| AB-16 | Designations | P1 | 1, 2, 4 | Each profile card displays the verified designation/title | Verified information | Not Started / TBD |
| AB-17 | Short professional biographies | P1 | 1, 2, 4 | Each profile card includes a short, approved professional bio | Approved biographies | Not Started / TBD |
| AB-18 | Only verified credentials/information | P0 | 1, 2, 4, 5 | Content governance: no unverified credentials, claims or titles are published; all profiles pass a verification process before release | Verification process | Not Started / TBD |

> **Note:** AB-15 priority is P2 as per the source sheet; AB-18 is the only **P0** item in
> this group — it is the single source of truth for the whole "Who We Are" section.

### 3.2 About / Vision & Mission

**Mapped requirements: AB-19 – AB-21**

| Requirement ID | Requirement | Priority | Phase | How it maps to the About Us page | Dependencies | Status |
|---|---|---|---|---|---|---|
| AB-19 | Vision statement | P1 | 1, 2, 4 | A clearly written, approved Vision statement presented as a headline block | Approved institutional content | Not Started / TBD |
| AB-20 | Mission statement | P1 | 1, 2, 4 | A clearly written, approved Mission statement presented alongside the Vision | Approved institutional content | Not Started / TBD |
| AB-21 | Distinct visual treatment for Vision/Mission | P2 | 2, 4, 5 | Vision and Mission are rendered as two distinct, visually separated cards/blocks so they read as independent statements | Design system | Not Started / TBD |

> **Note:** AB-21 priority is P2 per the source sheet.

### 3.3 About / Why We Exist

**Mapped requirements: AB-08 – AB-12**

| Requirement ID | Requirement | Priority | Phase | How it maps to the About Us page | Dependencies | Status |
|---|---|---|---|---|---|---|
| AB-08 | Explain why SPRINT was established | P1 | 1, 2, 4 | Narrative sub-section explaining the founding story and purpose of SPRINT | Institutional content | Not Started / TBD |
| AB-09 | Explain academic-industry gap | P1 | 1, 2, 4 | Content block describing the gap between academic education and industry needs that SPRINT addresses | Research/content | Not Started / TBD |
| AB-10 | Explain SPRINT's job-ready approach | P1 | 1, 2, 4 | Content block describing how SPRINT trains learners to be job-ready | Institutional content | Not Started / TBD |
| AB-11 | Highlight practical execution/deployment skills | P1 | 1, 2, 4 | Emphasis on hands-on execution, deployment and real-world application skills across the section | Technical content | Not Started / TBD |
| AB-12 | Supporting statistics/callouts where verified | P2 | 1, 2, 4 | Verified stats/callouts (e.g., placement/outcome figures) are displayed as callout cards; unverified numbers must not be shown | Verified statistics | Not Started / TBD |

### 3.4 About / Emerging Technology

**Mapped requirements: AB-01 – AB-07**

| Requirement ID | Requirement | Priority | Phase | How it maps to the About Us page | Dependencies | Status |
|---|---|---|---|---|---|---|
| AB-01 | Explain importance of emerging technologies | P1 | 1, 2, 4 | Intro narrative explaining why emerging technologies matter today | Content research | Not Started / TBD |
| AB-02 | AI/ML | P1 | 1, 2, 4 | Dedicated tech card/entry for AI/ML | Approved content | Not Started / TBD |
| AB-03 | Cloud Computing | P1 | 1, 2, 4 | Dedicated tech card/entry for Cloud Computing | Approved content | Not Started / TBD |
| AB-04 | Microservices | P1 | 1, 2, 4 | Dedicated tech card/entry for Microservices | Approved content | Not Started / TBD |
| AB-05 | DevOps | P1 | 1, 2, 4 | Dedicated tech card/entry for DevOps | Approved content | Not Started / TBD |
| AB-06 | Explain industry skill gap | P1 | 1, 2, 4 | Content block explaining the industry skill gap SPRINT closes | Research/content | Not Started / TBD |
| AB-07 | Visual/infographic presentation | P1 | 2, 4, 5 | The Emerging Technology section is presented as an infographic / visual cards layout rather than plain text | Visual assets | Not Started / TBD |

> **Note:** Shared by the "Why We Exist" and "Emerging Technology" sections, the skill-gap
> message (AB-06 / AB-09) should be written once (content reuse) and referenced in both
> sections to keep terminology consistent.

---
## 4. Global Requirement Mapping (Applicable to the About Us Page)

The following `GL-xx` requirements also apply to the About Us page because they are
global ("across all public pages"). They are grouped for easy sprint planning. Priorities
and phases are taken from the source document.

### 4.1 Navigation & Header

| Requirement ID | Requirement | Priority | Mapping to the About Us page | Status |
|---|---|---|---|---|
| GL-01 | Consistent header/navigation across all public pages | P0 | About Us page uses the same global header/navigation as all public pages | Not Started / TBD |
| GL-37 | Primary navigation links | P0 | "About Us" appears as a labelled primary link in the main navigation (labels: Home, Courses, About Us, Updates, Contact) | Not Started / TBD |
| GL-39 | Primary header CTA | P1 | Header retains its primary CTA (registration/enquiry) while on the About page | Not Started / TBD |
| GL-40 | Sticky header | P1 | Sticky header remains visible while scrolling the longer About page content | Not Started / TBD |
| GL-41 | Mobile navigation menu | P0 | Mobile menu provides access to About Us on smaller screens | Not Started / TBD |
| GL-43 | Active navigation state | P1 | "About Us" nav item shows a visually active state when this page is open | Not Started / TBD |
| GL-46 | Header visual hierarchy | P1 | Header clearly distinguishes SPRINT logo and the nav sequence including About Us | Not Started / TBD |

### 4.2 Footer & Legal

| Requirement ID | Requirement | Priority | Mapping to the About Us page | Status |
|---|---|---|---|---|
| GL-14 | Consistent footer across the website | P1 | About Us page shares the global footer (site links incl. About Us, contact, social) | Not Started / TBD |
| GL-18 | Social media links | P2 | Footer social links link to verified SPRINT profiles | Not Started / TBD |
| GL-21 | Privacy Policy | P0 | Footer links to Privacy Policy from the About page | Not Started / TBD |
| GL-22 | Terms & Conditions | P1 | Footer links to Terms & Conditions from the About page | Not Started / TBD |

### 4.3 Responsive, Design System & Accessibility

| Requirement ID | Requirement | Priority | Mapping to the About Us page | Status |
|---|---|---|---|---|
| GL-02 | Responsive design (mobile/tablet/desktop) | P0 | All About sections (profile cards, vision/mission, tech cards, infographic) are responsive | Not Started / TBD |
| GL-03 | Mobile-first layout & interaction | P0 | About page laid out and built mobile-first | Not Started / TBD |
| GL-05 | Consistent typography, spacing, buttons, cards, UI components | P1 | About page uses the SPRINT design system components only | Not Started / TBD |
| GL-08 | Accessible color contrast & readable typography | P1 | Vision/Mission cards, callouts and profile cards meet contrast and type standards | Not Started / TBD |
| GL-09 | Keyboard-accessible interactive elements | P1 | All About page interactive elements (CTAs, cards, tabs) are keyboard accessible | Not Started / TBD |
| GL-10 | Meaningful alt text for important images | P1 | Profile photos and infographic images carry descriptive alt text | Not Started / TBD |
| GL-07 | Fast-loading and optimized images/video/assets | P1 | Profile photos and infographic assets are compressed/optimized | Not Started / TBD |
### 4.4 SEO, CTA, Security & Analytics

| Requirement ID | Requirement | Priority | Mapping to the About Us page | Status |
|---|---|---|---|---|
| GL-11 | SEO-friendly URLs and page hierarchy | P1 | Uses `/about` or similar SEO-friendly URL in the page hierarchy | Not Started / TBD |
| GL-12 | Page titles and meta descriptions | P1 | Unique "About Us" title tag and meta description | Not Started / TBD |
| GL-13 | XML sitemap and robots configuration | P1 | About Us included in XML sitemap | Not Started / TBD |
| GL-06 | Clear primary CTA hierarchy | P1 | Primary CTA (Enquire/Register) clearly accents the (otherwise informational) About page | Not Started / TBD |
| GL-04 | HTTPS/SSL across the complete website | P0 | About page served over HTTPS | Not Started / TBD |
| GL-19 | Analytics/event tracking for important CTAs and forms | P2 | Track clicks on About page CTAs/final CTA strip | Not Started / TBD |
| GL-20 | 404/error page | P2 | Site-wide error page handles missing About-adjacent routes | Not Started / TBD |
| GL-23 | Scalable architecture for future portal/features | P1 | About page built as a reusable page template | Not Started / TBD |

### 4.5 Contact & AI Assistant

| Requirement ID | Requirement | Priority | Mapping to the About Us page | Status |
|---|---|---|---|---|
| GL-15 | Click-to-call phone numbers on mobile | P1 | Final CTA/contact strip phone numbers are tap-to-call on mobile | Not Started / TBD |
| GL-16 | Clickable email addresses | P1 | Contact email is a clickable `mailto:` link | Not Started / TBD |
| GL-17 | WhatsApp enquiry/contact CTA | P1 | WhatsApp CTA available in the final contact strip | Not Started / TBD |
| GL-47 | AI-powered visitor assistance bot | P2 | AI chat available on the About page | Not Started / TBD |
| GL-48 | Visitor intent discovery | P2 | Bot asks visitors what they'd like to know (courses, eligibility, etc.) | Not Started / TBD |
| GL-49 | SPRINT information Q&A | P2 | Bot answers SPRINT questions using approved content (incl. About content) | Not Started / TBD |
| GL-50 | Website content discovery | P2 | Bot can direct visitors to About Us content on the site | Not Started / TBD |
| GL-51 | Context-aware responses | P2 | Bot uses conversation context for follow-ups | Not Started / TBD |
| GL-52 | Escalation to human contact | P1 | Bot escalates to human contact (call/WhatsApp) when needed | Not Started / TBD |
| GL-53 | AI bot interface | P2 | Chat widget is clearly identifiable and opens a conversational interface | Not Started / TBD |
| GL-54 | Mobile AI assistant experience | P2 | AI chat is fully usable on mobile | Not Started / TBD |
| GL-55 | Knowledge accuracy and content control | P1 | Bot only uses approved/up-to-date SPRINT info; states when it can't answer reliably | Not Started / TBD |
| GL-56 | AI bot testing and fallback handling | P1 | Bot tested against common, ambiguous, unsupported and mis-assumption questions before launch | Not Started / TBD |

---
## 5. Content Requirements (Copy Checklist)

Content required for the About Us page, mapped to requirements. All content must be
verified and approved before publishing (AB-18, GL-55).

| # | Required Content | Mapped Requirement | Owner / Input Needed | Status |
|---|---|---|---|---|
| 1 | "About Us" page title + intro paragraph | GL-12 | Content team | Not Started / TBD |
| 2 | Leadership/founding team profiles: name, designation, short bio, verified photo | AB-13, AB-15, AB-16, AB-17, AB-18 | Leadership | Not Started / TBD |
| 3 | Faculty/instructor profiles: name, designation, short bio, verified photo | AB-14, AB-15, AB-16, AB-17, AB-18 | Faculty coordination | Not Started / TBD |
| 4 | Vision statement (approved) | AB-19 | Management | Not Started / TBD |
| 5 | Mission statement (approved) | AB-20 | Management | Not Started / TBD |
| 6 | Why SPRINT was established (narrative) | AB-08 | Management / Content | Not Started / TBD |
| 7 | Academic–industry gap explanation | AB-09 | Content / Research | Not Started / TBD |
| 8 | SPRINT's job-ready approach & practical skills emphasis | AB-10, AB-11 | Academic / Content | Not Started / TBD |
| 9 | Verified statistics / callouts (if any available) | AB-12 | Verification team | Not Started / TBD |
| 10 | Importance of emerging technologies (intro copy) | AB-01 | Content / Research | Not Started / TBD |
| 11 | AI/ML, Cloud Computing, Microservices, DevOps tech entries | AB-02, AB-03, AB-04, AB-05 | Technical / Academic | Not Started / TBD |
| 12 | Industry skill gap content | AB-06 | Content / Research | Not Started / TBD |
| 13 | Infographic / visual assets for Emerging Technology section | AB-07 | Design / Visual team | Not Started / TBD |
| 14 | Final CTA copy + verified phone, email, WhatsApp details | GL-06, GL-15, GL-16, GL-17 | Management / Admin | Not Started / TBD |

---

## 6. Design Requirements

- Follow the SPRINT design system (typography, spacing, buttons, cards) — **GL-05**.
- Mobile-first layouts for all section types (cards, split blocks, infographic) — **GL-02, GL-03**.
- Vision and Mission get a distinct visual treatment (two separate cards/blocks) — **AB-21**.
- Emerging Technology section presented via infographic/visual cards rather than plain text — **AB-07**.
- Profile cards: photo, name, designation, short bio — **AB-13 – AB-17**.
- Accessible color contrast and readable typography — **GL-08**; keyboard-accessible components — **GL-09**; alt text on photos/infographics — **GL-10**.
- Compressed/optimized images for fast loading — **GL-07**.
- Clear CTA hierarchy with a single dominant conversion action — **GL-06**.

---

## 7. Technical / QA Requirements

| Area | Checklist | Mapped Requirement |
|---|---|---|
| Responsive | Test 360px, 768px, 1024px, 1440px+ for all sections | GL-02, GL-03 |
| SEO | SEO-friendly URL (`/about`), unique title + meta description, sitemap entry | GL-11, GL-12, GL-13 |
| Performance | Optimized images/assets, page speed target per hosting baseline | GL-07 |
| Security | HTTPS on all About assets/requests | GL-04 |
| Accessibility | Keyboard navigation, contrast, alt text audit | GL-08, GL-09, GL-10 |
| Analytics | Event tracking on About CTAs and contact strip | GL-19 |
| Contact | Tap-to-call (mobile), `mailto:` email, WhatsApp deep link verified | GL-15, GL-16, GL-17 |
| AI Assistant | Bot answers About questions from approved content; fallback & escalation tested | GL-47 – GL-56 |
| Error handling | No broken links; 404 page covers missing routes | GL-20 |

---

## 8. Dependencies & Open Items

| # | Open Item | Blocks | Suggested Owner | Status |
|---|---|---|---|---|
| 1 | Verified leadership & faculty profiles (photos, designations, bios) | AB-13 – AB-18 (Who We Are section) | Leadership / HR | Open |
| 2 | Approved Vision & Mission statements | AB-19, AB-20, AB-21 | Management | Open |
| 3 | Approved institutional content (why SPRINT exists, job-ready approach) | AB-08 – AB-11 | Management / Content | Open |
| 4 | Verified statistics (if required) | AB-12 | Verification team | Open |
| 5 | Approved emerging-technology content | AB-01 – AB-07 | Academic / Technical | Open |
| 6 | Design system tokens & components | GL-05, AB-21 | Design | Open |
| 7 | Sitemap / information architecture incl. About Us URL | GL-01, GL-11, GL-37 | IA / SEO | Open |
| 8 | Verified contact details (phone, email, WhatsApp, socials) | GL-15, GL-16, GL-17, GL-18 | Admin | Open |
| 9 | Legal pages (Privacy Policy, Terms & Conditions) available for footer links | GL-21, GL-22 | Legal | Open |
| 10 | AI assistant setup & approved knowledge content | GL-47 – GL-56 | AI / Content | Open |

---

## 9. Status Summary (as of 09-09-2026)

| Group | Requirements | P0 | P1 | P2 | Status |
|---|---|---|---|---|---|
| About / Who We Are | AB-13 – AB-18 (6) | 1 (AB-18) | 4 | 1 (AB-15)* | Not Started / TBD |
| About / Vision & Mission | AB-19 – AB-21 (3) | 0 | 2 | 1 (AB-21) | Not Started / TBD |
| About / Why We Exist | AB-08 – AB-12 (5) | 0 | 4 | 1 (AB-12) | Not Started / TBD |
| About / Emerging Technology | AB-01 – AB-07 (7) | 0 | 6 | 1 (AB-07) | Not Started / TBD |
| Global (applicable subset) | GL-01…GL-56 (38 unique IDs in 39 rows) | 7 (GL-01, GL-02, GL-03, GL-04, GL-21, GL-37, GL-41) | 22 | 10 | Not Started / TBD |
| **Total** | **All About + applicable Global** | **8** | **38** | **14** | **Not Started / TBD** |

\* AB-15 (Profile photographs) is listed as P2 in the source sheet; AB-18 (Only verified
credentials) is the sole P0 among About-specific requirements.

**Overall page status:** Not Started / TBD — all requirements pending content approval,
design system alignment and sprint scheduling.

---

## 10. Review & Sign-off

| Reviewer | Role | Date | Comments / Sign-off |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

*Document prepared by: **Ujjwal, Ayush** (Authors)*
