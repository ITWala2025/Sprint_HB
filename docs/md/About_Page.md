# SPRINT Website - About Page (About Us)

## Document Control

| Field | Value |
|---|---|
| Page Title | About Us |
| File | `About_Page.md` |
| Authors | Ujjwal, Ayush |
| Source Document | `sprint_websit_markdown.md` - SPRINT Website Requirements |
| Document Date | 10-09-2026 |
| Version | 1.2 (Enterprise Specification) |
| Status / Sprint | Not Started / TBD |
| Target Platform | Web (responsive, all public pages) |

### Purpose

This document is the **single source of truth** for building the SPRINT **About Us** page. It
defines the page structure, every section, the **functional behavior** (how each component
should work), the **component specifications** (including the Vision & Mission card system),
interaction states, responsive behavior, accessibility, performance, SEO, analytics, and the
QA / acceptance criteria required for enterprise-grade delivery.

### Scope

- Covered: Global header/footer behavior on the About page, Hero, Our Story, Vision & Mission,
  Leadership, Faculty, Industry / Academic Connection, Our Impact stats, final CTA.
- Out of scope: Course catalogue pages, student portal, admin console, checkout/enrollment flow
  (referenced only where links are required).

### Document Conventions

| Term | Meaning |
|---|---|
| MUST | Mandatory requirement; non-compliance blocks release |
| SHOULD | Recommended requirement; deviation requires sign-off |
| MAY | Optional enhancement |
| AB-xx / GL-xx | Requirement IDs traced to `sprint_websit_markdown.md` |

### Version History

| Version | Date | Author | Change Summary |
|---|---|---|---|
| 1.0 | 09-09-2026 | Ujjwal, Ayush | Baseline About page requirements |
| 1.1 | 10-09-2026 | Ujjwal, Ayush | 14-section structure drafted per review |
| 1.2 | 10-09-2026 | Ujjwal, Ayush | Final 10-section structure approved; enterprise functional & component specification added |

---

## 1. Page Overview

The **About Us** page introduces visitors to SPRINT, establishing trust and institutional
credibility. It explains SPRINT's origins, leadership, mission, and focus on bridging the
academic-industry gap through emerging technologies.

### 1.1 Page Goals

| # | Goal | Success Measure (KPI) |
|---|---|---|
| 1 | Establish trust and institutional credibility | Engagement time on Leadership/Faculty/Impact sections > 10s |
| 2 | Communicate why SPRINT exists and its job-ready impact | Scroll depth >= 70% on desktop, >= 60% on mobile |
| 3 | Present Vision and Mission clearly | Vision/Mission card dwell time > 4s average |
| 4 | Position SPRINT as an industry-connected leader in emerging tech | CTA click-through from About >= 3% of page visitors |
| 5 | Drive user conversion through clear CTAs | Combined CTA events (call, email, WhatsApp, register) tracked and >= 2% |

### 1.2 Target Audience / Users

- Prospective students (undergraduate, graduate and above) evaluating SPRINT.
- Working professionals considering up-skilling (AI/ML, Cloud, DevOps, software).
- Parents / guardians researching institutional credibility.
- Hiring partners and industry stakeholders assessing SPRINT's approach.

### 1.3 Page Type & Content Loading Model

| Property | Specification |
|---|---|
| Page type | Static, public, SEO-crawlable HTML (server-rendered or prerendered) |
| Dynamic content | Stats counters, scroll animations (progressive enhancement, JS) |
| Fallback | All content fully readable with JavaScript disabled (no content behind JS-only gating) |
| Data dependency | No backend required at launch; content shipped in markup/JSON |

---

## 2. Page Structure (Approved Section Order)

Stacking order of the About Us page, top to bottom. This order is **the agreed final
architecture** and MUST NOT be reordered without a new sign-off.

| # | Section | Primary Mapped Requirements | Purpose |
|---|---|---|---|
| 1 | Global Header | GL-01, GL-37, GL-39, GL-40, GL-41 | Global navigation & primary CTA |
| 2 | Hero - "Who is SPRINT?" - Title & Intro | GL-12, GL-11 | Immediate identity & value statement |
| 3 | Our Story - Why SPRINT was established | AB-08 | Founding purpose narrative |
| 4 | Vision & Mission (Distinct visual cards) | AB-19, AB-20, AB-21 | Institutional direction |
| 5 | Leadership / Founders | AB-13, AB-15, AB-16, AB-17, AB-18 | Credibility through people |
| 6 | Faculty / Experts | AB-14, AB-15, AB-16, AB-17, AB-18 | Teaching credibility |
| 7 | Industry / Academic Connection | AB-01 to AB-07, AB-09, AB-10, AB-11 | Skills gap + job-ready approach |
| 8 | Our Impact / Verified Stats | AB-12 | Proof via verified outcomes |
| 9 | CTA - Connect With SPRINT | GL-06, GL-15, GL-16, GL-17 | Conversion |
| 10 | Global Footer | GL-14, GL-18, GL-21, GL-22 | Site-wide orientation & legal |

### 2.1 Visual Wireframe (ASCII Sketch)

```
+--------------------------------------------------------------+
| 1. GLOBAL HEADER (Logo | Navigation | Primary CTA)           |
+--------------------------------------------------------------+
| 2. HERO: "Who is SPRINT?" - Title & Intro                    |
+--------------------------------------------------------------+
| 3. OUR STORY: Why SPRINT was established                     |
+--------------------------------------------------------------+
| 4. VISION & MISSION (Distinct visual cards)                  |
+--------------------------------------------------------------+
| 5. LEADERSHIP / FOUNDERS (Profiles: Photo, Bio, Title)       |
+--------------------------------------------------------------+
| 6. FACULTY / EXPERTS (Profiles: Photo, Bio, Title)           |
+--------------------------------------------------------------+
| 7. INDUSTRY / ACADEMIC CONNECTION (Skill gap like AI, Cloud, |
|    DevOps cards & approach)                                  |
+--------------------------------------------------------------+
| 8. OUR IMPACT / VERIFIED STATS (Placement & outcome figures) |
+--------------------------------------------------------------+
| 9. CTA: Connect With SPRINT (Call, Email, WhatsApp)          |
+--------------------------------------------------------------+
| 10. GLOBAL FOOTER (Links, Legal, Socials)                    |
+--------------------------------------------------------------+
```

### 2.2 Page Flow Narrative (user journey)

1. User lands via navigation, search, or referral link (`/about`).
2. Header confirms current section (About) and exposes primary CTA at all scroll positions.
3. Hero establishes identity in under 5 seconds (title, one-line intro, primary CTA).
4. Story section converts curiosity into context (founding rationale).
5. Vision & Mission cards anchor institutional direction (scroll dwell expected).
6. Leadership then Faculty build trust through verified, real people.
7. Industry/Academic section connects the dots between programs and careers (skill cards).
8. Verified Impact stats deliver quantitative proof.
9. Final CTA strip converts (call / email / WhatsApp / register).
10. Footer offers escape hatches (all courses, login, legal, social).

### 2.3 Section Anchors & Navigation

| Section | Anchor ID | In-page link | Cross-page link |
|---|---|---|---|
| Hero | `#who-is-sprint` | - | - |
| Story | `#our-story` | - | - |
| Vision & Mission | `#vision-mission` | - | - |
| Leadership | `#leadership` | - | - |
| Faculty | `#faculty` | - | - |
| Industry Connection | `#industry-connection` | - | `/courses` |
| Impact | `#impact` | - | - |
| CTA | `#connect` | - | `/contact`, `tel:`, `mailto:`, WhatsApp |

---

## 3. Functional Specifications (How Each Section Works)

Each subsection states the behavior requirements for one page section. Component-level
behavior (states, animations, breakpoints) is defined in Section 4 and Section 5.

### 3.1 Global Header (Section 1)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| HDR-01 | Sticky header | Header sticks to top on scroll (`position: sticky/fixed`); MUST NOT cause layout shift (CLS). Top-of-page padding relaxed; scrolled state compact. | GL-01, GL-40 |
| HDR-02 | Scroll state transition | On `scrollY > 20px`, header compresses, gains backdrop blur + shadow; transition animated. | GL-40 |
| HDR-03 | Active navigation state | "About" (`/about`) marked active with animated sliding indicator; updates on navigation. | GL-01 |
| HDR-04 | Primary CTA | "Enroll Now" always visible (desktop); secondary "Student Login" link available. | GL-39 |
| HDR-05 | Mobile drawer | Hamburger toggles accordion drawer (max-height / grid-rows animation). `aria-expanded` toggled; drawer closes on link click, ESC, or focus move to desktop width. | GL-01, GL-09 |
| HDR-06 | Keyboard & focus | Full tab order (skip link first), visible focus rings, no focus trap in drawer. | GL-09 |
| HDR-07 | Reduced motion | Under `prefers-reduced-motion`, drawer opens instantly (no slide), indicator slide disabled. | GL-40 |
| HDR-08 | Brand | Logo monogram ("S") with gradient ring; accessible text label "SPRINT". | GL-01 |

### 3.2 Hero - "Who is SPRINT?" (Section 2)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| HR-01 | Content display | H1 "Who is SPRINT?", one supporting sentence, primary CTA ("Explore Courses"), secondary link ("Our Story" smooth-scroll to `#our-story`). | GL-12, GL-11 |
| HR-02 | Background | Ambient gradient/mesh background matching brand palette plus a full-bleed decorative photo layer (desktop/mobile WebP via `<picture>` + `next/image`, like the Contact hero) under a light glass overlay so the navy text stays readable; decorative only (`aria-hidden`). | GL-05 |
| HR-03 | CTA behavior | Primary CTA links to `/courses` (or configured URL); opens in same tab; tracked event `hero_cta_click`. | GL-06 |
| HR-04 | Performance | Background static/pre-rendered image or CSS; hero content fully readable with JS off. | GL-07 |
| HR-05 | Responsive | Text scales via clamp; CTA remains tappable (min 44x44px hit area) on all widths. | GL-02 |
| HR-06 | SEO | H1 unique per page; meta title "About Us | SPRINT"; meta description from approved copy. | GL-11, GL-12 |

### 3.3 Our Story - Why SPRINT Was Established (Section 3)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| ST-01 | Narrative block | Approved 2-3 paragraph founding story; optional supporting image; subheading "Why SPRINT was established". | AB-08 |
| ST-02 | Fact callouts | 2-3 short statistics/callouts (e.g., founding year) inline with narrative; static text, no animation required. | AB-08 |
| ST-03 | Scroll reveal | Content MAY fade/slide in on first scroll into view (50% visibility); disabled under reduced motion; content visible without JS. | GL-05 |
| ST-04 | Accessibility | Headings hierarchy respected (H2 for section, H3 for callouts); emphasis not conveyed by color alone. | GL-08, GL-10 |
### 3.4 Vision & Mission - Card System (Section 4)

The Vision & Mission section MUST render as **two visually distinct cards** (AB-21) so the
two statements read as independent, scannable units. All properties below form the card
system specification.

#### 3.4.1 Shared Card Container (both cards)

| Property | Specification |
|---|---|
| Container | Glassmorphism surface: `rgba(255,255,255,0.85)` with backdrop blur; 1px border `rgba(93,49,64,0.12)` |
| Radius | 20px (large); inner content padded with 24px minimum gutters |
| Height | Equal height within the row (grid stretch); aligned in row on desktop, stacked on mobile |
| Semantics | Rendered as `<section>` with `aria-labelledby` pointing to the card heading |
| Decorative accent | 6px gradient accent bar (rose -> plum), position unique per card - provides the visual differentiation |

#### 3.4.2 Card Type A - VISION (Inspirational Statement Card)

| Property | Specification |
|---|---|
| Purpose | One bold, aspirational sentence defining SPRINT's long-term direction |
| Layout | Kicker "VISION" (eyebrow), H2 quote-style statement, supporting line, footer context chip |
| Visual | Gradient accent (left edge), icon tile (eye/compass) on brand gradient, warm peach type accent |
| Icon | Decorative glyph in 48px rounded tile; `aria-hidden=true` |
| Content fields | `kicker`, `title`, `statement`, `supportingLine`, `footerChip` |
| Anchor | `#vision` (sub-anchor of `#vision-mission`) |
| Interaction | Hover/focus: soft glow + icon scale 1.05; text MUST stay static |
| Reduced motion | Rendered static, no animation |

#### 3.4.3 Card Type B - MISSION (Pillar List Card)

| Property | Specification |
|---|---|
| Purpose | State what SPRINT does today to achieve the vision: primary statement + 3 pillars |
| Layout | Kicker "MISSION", mission statement paragraph, 3 pillars each with small icon + short phrase |
| Visual | Different layout from Vision (list not quote); accent on opposite edge (plum); target/flag icon tile |
| Icon | Decorative glyph in 48px tile; `aria-hidden=true` |
| Content fields | `kicker`, `title`, `statement`, `pillars[]` (each: `icon`, `text`) |
| Anchor | `#mission` |
| Interaction | Hover/focus: pillar rows get subtle background tint; static text |
| Reduced motion | No background tint animation |

#### 3.4.4 Card Variants (SHOULD support)

| Variant | When used |
|---|---|
| `statement` | Vision (default); single-quote brand moments |
| `pillar-list` | Mission (default); "how we work" lists |
| `split` (MAY) | Both cards side-by-side with center divider at `>=1024px` |
| `stacked` | Both cards full-width stacked vertically (`<768px`) |
| `compact` (MAY) | Reduced padding variant for reuse on landing pages |

#### 3.4.5 Sizing & Breakpoint Behavior

| Breakpoint | Layout |
|---|---|
| >= 1024px | Two cards side-by-side (2-col grid), equal height |
| 768 - 1023px | 2-col grid may persist or stack (min column width 340px) |
| < 768px | Stacked full-width; type scales down one step |

#### 3.4.6 States

| State | Behavior |
|---|---|
| Default | Glass surface, static content |
| Hover / Focus-visible | Glow shadow + icon scale (Vision); pillar tint (Mission); focus ring visible |
| Active / Clicked | No navigation (anchor target); card not clickable unless "Learn more" link present |
| Reduced motion | All animated states rendered static |

#### 3.4.7 Vision & Mission Accessibility / QA

- Heading order: H2 (section), card headings as H3 (readable as list).
- Body text on glass surfaces MUST meet WCAG AA (4.5:1); accents are decorative only.
- No interaction may depend on hover alone; all states testable via keyboard focus.
#### 3.4.8 Vision ⇄ Mission Swap Controls

The two cards live on a single shared surface (`sprint-story-scroll`) that automatically crossfades between VISION and MISSION every 4 seconds.

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| VM-SW-01 | Auto-rotate | Cards auto-advance every 4s; the timer restarts after any manual switch; pauses on hover, touch, keyboard focus and when the surface is mostly off-screen. Switching translates the horizontal track (`translateX` by index × 100%), so cards genuinely move left/right. | AB-19, AB-20 |
| VM-SW-02 | Clean surface | No hint text or counter is rendered above the cards; interaction state is communicated only by the dot pagination at the bottom of the card. | GL-10 |
| VM-SW-03 | Dot pagination | Two pagination dots at the bottom of the card indicate the active pane; each dot is a `<button>` with an accessible label ("Show Vision" / "Show Mission") and `aria-current` on the active dot; clicking a dot jumps to that card. | GL-09 |
| VM-SW-04 | Swipe | On touch devices a horizontal swipe (horizontal travel > 48px and clearly dominant over vertical travel) switches to the adjacent card (swipe left = next, right = previous). | GL-09 |
| VM-SW-05 | Keyboard | `ArrowLeft` / `ArrowRight` on the focused surface moves between cards (no arrow buttons are rendered). | GL-09 |
| VM-SW-06 | Reduced motion | Auto-rotate is disabled under `prefers-reduced-motion`; dots, keyboard and swipe still switch manually; crossfade transitions are removed. | GL-40 |
| VM-SW-07 | No-JS fallback | Both cards always remain in the DOM; the inactive card is hidden with `aria-hidden` + `.sprint-swap-pane.is-hidden` so content stays crawlable without JS. | - |

### 3.5 Leadership / Founders (Section 5)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| LDR-01 | Profile card grid | 3x1 / 2x2 responsive grid of leadership cards. Each card: photo, name, verified designation, short bio. | AB-13 |
| LDR-02 | Verification badge | "Verified" badge (ShieldCheck icon) on every profile; only verified credentials published (P0). | AB-18 |
| LDR-03 | Card interaction | Hover/focus: card lifts (elevation + translateY), photo slight zoom (1.03 max); no content change. | AB-15 |
| LDR-04 | Socials | Optional linked icon buttons (LinkedIn etc.) per profile; `rel=noopener` external, aria-labels. | AB-16 |
| LDR-05 | Image handling | `loading=lazy` below fold; width/height set to avoid CLS; alt text = full name + role. | GL-07, GL-10 |
| LDR-06 | No-JS fallback | Cards are plain HTML; text readable and complete without JS. | - |

### 3.6 Faculty / Experts (Section 6)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| FAC-01 | Profile card grid | Same card component as Leadership, distinguishable by section heading "Faculty / Experts". | AB-14 |
| FAC-02 | Expertise tags | Each card shows 2-3 domain tags (e.g., AI/ML, Cloud, DevOps) as chips; static text. | AB-01 |
| FAC-03 | Credential verification | Same P0 "verified only" governance as Leadership (AB-18). | AB-18 |
| FAC-04 | Interaction | Identical hover/focus states as Leadership card (shared component, DRY). | AB-15 |
| FAC-05 | Consistency | Card anatomy MUST match Leadership cards (photo, name, designation, bio, tags). | AB-17 |

### 3.7 Industry / Academic Connection (Section 7)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| IND-01 | Split layout | Left: narrative on the academic-industry skill gap; Right: skill cards (AI, Cloud, DevOps). | AB-09 |
| IND-02 | Skill cards | 3 skill cards (AI/ML, Cloud, DevOps) each: icon, title, 2-line description, "industry demand" tag. Rendered via the `pillar-list`/`stat` card variant. | AB-01 to AB-05 |
| IND-03 | Approach block | Supporting copy on SPRINT's job-ready approach and practical execution skills. | AB-10, AB-11 |
| IND-04 | CTA linkage | Secondary link "View Courses" -> `/courses` to move from consideration to discovery. | GL-06 |
| IND-05 | Accessibility | Skill icons decorative (`aria-hidden`); text adjacent explains meaning. | GL-10 |
| IND-06 | No-JS fallback | Skill cards static HTML; no JS required to view content. | - |

### 3.8 Our Impact / Verified Stats (Section 8)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| IMP-01 | Stat data model | Stats array: `{value, suffix, label, context, verified:true}` (e.g., `{92%, "", "Placement rate", "of 2025 cohort", true}`). | AB-12 |
| IMP-02 | Count-up animation | On first scroll into view (60% visibility), numeric values count up over ~1.2s with easing; triggered once per session. | AB-12 |
| IMP-03 | Reduced motion | With `prefers-reduced-motion`, final values displayed statically (no count-up). | GL-40 |
| IMP-04 | Screen readers | `aria-live=polite` region announces final value; `aria-hidden` on animated span if announced separately. | GL-09 |
| IMP-05 | No-JS fallback | Values in HTML at final state; JS only animates from extracted final value (never re-writes wrong data). | - |
| IMP-06 | Verification note | "Verified" badge + source note (e.g., "MediCAB verified, 2025" or placeholder "Source: <to be supplied>"). | AB-18 |
| IMP-07 | Layout | 2x2 / 4-col stat cards, equal height, icons optional; static borders (no hover requirement). | AB-12 |

### 3.9 CTA - Connect With SPRINT (Section 9)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| CTA-01 | Channel trio | Three contact actions shown as cards/buttons: Call, Email, WhatsApp. | GL-15, GL-16, GL-17 |
| CTA-02 | Tap-to-call | Call button uses `tel:` deep link configured from `CONTACT_PHONE`; on mobile opens dialer. | GL-15 |
| CTA-03 | Email | Email button uses `mailto:`, prefilled subject from approved copy. | GL-16 |
| CTA-04 | WhatsApp | WhatsApp deep link `https://wa.me/<number>?text=<intent>`; opens app/browser chat with pre-filled message. | GL-17 |
| CTA-05 | Primary fallback | "Request a Callback" / "Enroll" primary button -> `/register` when available, else `/contact`. | GL-06 |
| CTA-06 | Tracking | All CTA events tracked (`cta_call`, `cta_email`, `cta_whatsapp`, `cta_contact`) with section id `about`. | GL-19 |
| CTA-07 | Accessibility | All links real anchors (no JS-only); visible focus; hit area >= 44px. | GL-09 |
| CTA-08 | No-JS fallback | All actions work without JS. | - |

### 3.10 Global Footer (Section 10)

| Id | Functionality | Behavior Specification | Mapped Req |
|---|---|---|---|
| FTR-01 | 5-column grid | Brand/identity (2 col), Explore links, Portals (Student/Admin), Center coordinates & contact. | GL-14 |
| FTR-02 | Compliance bar | Dynamic year (JS sets `2026` at load, falls back to static year without JS); legal links (Privacy, Terms, Support). | GL-21, GL-22 |
| FTR-03 | Internal links | High-density crawlable links (Home, Courses, About, Updates, Careers, Contact, Login, Register). | GL-14, GL-18 |
| FTR-04 | Social links | Official social profiles as linked icons with accessible labels. | GL-18 |
| FTR-05 | Contact | Campus address, `tel:` and `mailto:` facts rendered as links. | GL-15, GL-16 |
| FTR-06 | No-JS behavior | Footer content complete without JS; only the year is enhanced. | - |

---

## 4. Component & Interaction State Catalog

Shared across all sections unless overridden above.

### 4.1 Interaction States

| State | Trigger | Behavior | Duration |
|---|---|---|---|
| Default | On load | Static rendering | - |
| Hover | Pointer over component | Elevation/inner glow, icon scale <= 1.05, cursor pointer when interactive | 150ms ease |
| Focus-visible | Keyboard focus | 3px rose outline offset 2px; visible on all interactive elements | immediate |
| Active / Pressed | Mouse/touch press | Scale 0.98 on press for buttons | 100ms |
| Disabled (MAY) | Data/state gate | 50% opacity, `aria-disabled=true` (avoid real-disable) | - |

### 4.2 Scroll-Driven Behavior

| Component | Trigger | Behavior | Reduced-motion fallback |
|---|---|---|---|
| Stats count-up | 60% into viewport, once | Count up 1.2s ease-out | Show final value |
| Story reveal | 50% into viewport, once | Fade + 12px rise | No animation |
| Card hover lifts | Pointer hover | translateY -4px + shadow | Static |
| Header scroll state | scrollY > 20px | Compact + blur | Static (blur may remain) |

### 4.3 Motion Policy

- All motion: 150-300ms, cubic-bezier ease, CSS transforms/opacity only (no layout animations).
- `prefers-reduced-motion` request MUST disable non-essential motion (count-up, reveals, drawer slide).
- Absolute minimum motion with reduced motion: sticky header state change is allowed (utility).

### 4.4 Error / Edge Behaviors

| Condition | Required behavior |
|---|---|
| Image fails to load | `alt` text visible; reserved aspect-ratio box prevents layout shift |
| WhatsApp/call not supported (desktop) | Button still navigates to wa.me / shows number as fallback text |
| JS fails / blocked | Page fully readable; CTA links native; counters show final values |
| Anchor target missing | Smooth scroll silently ignored; default jump behavior remains |
| Very long bios/media | Card text truncated with `-webkit-line-clamp` (Line Clamp 3) + "Read more" expands inline (SHOULD) |

---

## 5. Responsive Behavior & Breakpoint Matrix

| Breakpoint | Range | Layout applied |
|---|---|---|
| Mobile | < 768px | Single column; header condensed + drawer; cards stacked; CTA buttons full-width |
| Tablet | 768-1023px | 2-col grids where allowed (min 340px); drawer persists; stat grid 2x2 |
| Desktop | >= 1024px | Full 12-col grid; Vision/Mission side-by-side; profile cards 3-col; stats 4-col |
| Wide | >= 1440px | Max container 1200px centered; whitespace balanced; no stretched full-width text |

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header nav | Drawer | Drawer | Inline pill nav |
| Vision/Mission | Stacked | Stacked or 2-col | 2-col equal height |
| Profile cards | 1-col | 2-col | 3-col |
| Skill cards | 1-col | 1-col (or 3-across) | 3-across |
| Stats | 2x2 | 2x2 / 4 | 4-across |
| CTA strip | Stacked | Stacked | 3-across |
---

## 6. Accessibility Requirements (WCAG 2.1 AA)

| # | Area | Requirement | Mapped Req |
|---|---|---|---|
| 1 | Landmarks | One `<header>`, one `<main>`, one `<footer>`; section landmarks for each content block. | GL-08 |
| 2 | Heading hierarchy | Single H1 ("Who is SPRINT?"), H2 per section, H3 for cards/pillars; no skipped levels. | GL-08 |
| 3 | Focus order | Logical top-down; skip link ("Skip to main content") first in tab order. | GL-09 |
| 4 | Color contrast | Text 4.5:1, large text 3:1, UI components 3:1 on all brand surfaces. | GL-08 |
| 5 | Alt text | Every meaningful image has descriptive alt; decorative images `alt=""` + `aria-hidden`. | GL-10 |
| 6 | Keyboard | All interactions operable by keyboard; no keyboard traps (drawer included). | GL-09 |
| 7 | Screen reader | Count-up stats announced as final value (`aria-live=polite`); icons ignored. | GL-09 |
| 8 | Touch | Interactive elements min 44x44px; adequate spacing between links. | GL-09 |
| 9 | Motion | `prefers-reduced-motion` respected (see 4.3). | GL-40 |
| 10 | Forms (if used) | Visible labels, error messages linked via `aria-describedby`, not color-only. | GL-09 |

---

## 7. Performance, SEO & Security

### 7.1 Performance

| Metric | Target |
|---|---|
| LCP | <= 1.8s (mobile 4G emulation) |
| CLS | 0 (header sticky, images sized) |
| INP / FID | <= 200ms (no heavy JS on load path) |
| Total page weight | <= 1.2MB (images lazy-loaded, compressed, WebP/AVIF where supported) |
| No-JS page weight | Same content, no JS dependency |

### 7.2 SEO

| Item | Specification |
|---|---|
| URL | `/about` (SEO-friendly, existing in sitemap) |
| Meta title | "About Us | SPRINT" (<= 60 chars) |
| Meta description | Approved 150-160 char description including keywords (training, emerging technologies, placement) |
| Canonical | Self-referencing canonical tag |
| Structured data | `Organization` schema with `name`, `url`, `logo`, `contactPoint`, `sameAs` (social) |
| Open Graph | `og:title`, `og:description`, `og:image` (About hero/OG image), `og:type=website` |
| Sitemap | Entry present in `sitemap.xml`; robots allows `/about` |
| Internal links | At least 3 internal links to `/about` (header nav, footer, home page section) |

### 7.3 Security

| Item | Specification | Mapped Req |
|---|---|---|
| HTTPS | All assets & links served over HTTPS | GL-04 |
| External links | `rel="noopener noreferrer"` on `target=_blank` links | GL-04 |
| Contact deep links | No user input echoed without encoding (no injection points on this page) | GL-04 |
| Dependencies | No third-party JS beyond approved analytics/vendor libs | GL-04 |

---

## 8. Analytics & Event Tracking

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page=/about`, `referrer` |
| `section_visible` | Each section enters viewport (10% threshold) | `section=<id>` |
| `hero_cta_click` | Hero CTA click | `cta=explore_courses` |
| `story_reveal` | Story section 50% visibility (info only) | `section=our-story` |
| `vm_card_view` | Vision/Mission in view | `card=vision|mission` |
| `profile_card_click` | Profile card click/expand | `profile=<id>` |
| `skill_card_click` | Skill card click (if linked) | `skill=<ai|cloud|devops>` |
| `cta_call` / `cta_email` / `cta_whatsapp` / `cta_contact` | CTA actions | `page=/about`, `section=cta` |
| `footer_link_click` | Footer link click | `link=<href>` |

Consent: events comply with privacy policy; no PII collected on this page.
---

## 9. Global Requirement Mapping

(Inherits all GL-01 through GL-56 requirements from `sprint_websit_markdown.md`, specifically
applying to navigation, responsive design, SEO, and AI Chatbot integrations.)

| Group | Applicable IDs | Applied on About page |
|---|---|---|
| Design & Accessibility | GL-02, GL-05, GL-08, GL-09, GL-10 | Responsive, design system, contrast, keyboard, alt text |
| Performance & Security | GL-04, GL-07 | HTTPS, optimized assets |
| Navigation | GL-01, GL-37, GL-39, GL-40, GL-41 | Header/nav, active states, CTA, scroll behavior |
| SEO & Analytics | GL-11, GL-12, GL-13, GL-19 | URL, title/meta, sitemap, event tracking |
| Contact | GL-15, GL-16, GL-17 | Call, email, WhatsApp |
| Legal | GL-21, GL-22 | Privacy / Terms links in footer |
| AI Assistant | GL-47 to GL-56 | Context-aware bot answers About questions from approved content only; fallback & escalation tested |

---

## 10. Technical / QA Requirements

| Area | Checklist | Mapped Req |
|---|---|---|
| Responsive | Test 360, 768, 1024, 1440px+ for all 10 sections; no horizontal scroll (except tables) | GL-02, GL-03 |
| Mobile-first | Verify drawer, stacked cards, touch targets on 360px | GL-03 |
| Cross-browser | Latest Chrome, Edge, Firefox, Safari (macOS/iOS), Android Chrome | GL-02 |
| Accessibility | Keyboard-only pass, screen reader (NVDA/VoiceOver) spot test, contrast audit, no-hover-dependent states | GL-08, GL-09, GL-10 |
| Reduced motion | Verify OS-level reduced-motion: counters static, drawer no slide | GL-40 |
| No-JS | Disable JS: all content readable, counters final, CTAs native, no console errors | GL-07 |
| Performance | LCP/CLS/INP measured in Lighthouse; page weight in budget | GL-07 |
| SEO | Meta, canonical, OG, schema valid; sitemap updated; no duplicate title | GL-11, GL-12, GL-13 |
| Analytics | All events fire once, correct properties; no double-fire on anchors | GL-19 |
| Contact | `tel:`, `mailto:`, `wa.me` deep links validated on mobile + desktop | GL-15, GL-16, GL-17 |
| Security | HTTPS only, external `rel`, no PII logged | GL-04 |
| Content accuracy | Every credential/stat verified per AB-18 (P0) before release | AB-18 |

---

## 11. Content Checklist & Dependencies

| # | Required Content | Mapped Requirement | Owner | Status |
|---|---|---|---|---|
| 1 | Hero intro copy ("Who is SPRINT?") | GL-12 | Content Team | Open |
| 2 | "Our Story" narrative | AB-08 | Management | Open |
| 3 | Vision statement + supporting line + footer chip | AB-19, AB-21 | Management | Open |
| 4 | Mission statement + 3 pillars | AB-20, AB-21 | Management | Open |
| 5 | Verified Leadership profiles (photo, designation, bio) | AB-13, AB-15 - AB-18 | HR / Leadership | Open |
| 6 | Verified Faculty profiles + expertise tags | AB-14 - AB-18 | HR / Academic | Open |
| 7 | Industry gap copy + AI/Cloud/DevOps skill card content | AB-01 to AB-07, AB-09 - AB-11 | Academic Team | Open |
| 8 | Verified stats & impact data + source notes | AB-12 | Verification Team | Open |
| 9 | Contact details (phone, email, WhatsApp number, socials) | GL-15 to GL-18 | Admin | Open |

---

## 12. Dependencies & Open Items

| # | Open Item | Blocks | Suggested Owner | Status |
|---|---|---|---|---|
| 1 | Approved Vision & Mission final copy | Section 4 (cards) | Management | Open |
| 2 | Verified profile data (photos, bios, titles) | Sections 5-6 | HR / Leadership | Open |
| 3 | Verified statistics + source documentation | Section 8 | Verification Team | Open |
| 4 | Contact channels (phone, WhatsApp business, email, socials) | Section 9, footer | Admin | Open |
| 5 | Design tokens & card component in design system | Section 3.4 | Design | Open |
| 6 | Sitemap/IA sign-off for `/about` + anchors | Section 2.3 | IA / SEO | Open |
| 7 | Legal pages for footer links | Footer | Legal | Open |
| 8 | AI assistant knowledge content (About Q&A) | A11y + GL-47-56 | AI / Content | Open |

---

## 13. Acceptance Criteria (Definition of Done)

| # | Criterion | Verification |
|---|---|---|
| 1 | All 10 sections render in approved order on all breakpoints | Visual + responsive pass |
| 2 | Vision & Mission render as two distinct cards per 3.4 spec | Code review + visual QA |
| 3 | Header sticky without CLS; drawer accessible & keyboard-safe | Lighthouse + manual |
| 4 | Counters animate once, final values correct, static with reduced-motion/no-JS | Manual + AT |
| 5 | All CTAs (call/email/WhatsApp/register) function and fire tracking events | Manual + analytics |
| 6 | WCAG 2.1 AA audit passes (contrast, focus, alt, landmarks) | Audit report |
| 7 | Lighthouse performance budgets passed for mobile | Lighthouse CI |
| 8 | All published credentials & stats are verified (AB-18) | Content sign-off |
| 9 | No-JS audit green (content readable, native links) | Manual |
| 10 | Final content/copy approved by Management | Sign-off in section 14 |

---

## 14. Review & Sign-off

| Reviewer | Role | Date | Comments / Sign-off |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

*Document prepared by: **Ujjwal, Ayush** (Authors)*