# SPRINT Footer Component — Detailed Architecture & Technical Specification

## 1. Overview & Purpose
The **Footer** (`components/layout/Footer.tsx`) serves as the institutional foundation of the SPRINT platform. Rendered globally across all public routes, it provides verified campus coordinates, communication channels, direct portal access, and institutional compliance links.

---

## 2. Visual Hierarchy & Brand Aesthetic
- **Color Palette & Contrast:**
  - **Base Canvas:** Deep `#5D3140` plum backdrop with `backdrop-blur-3xl` and `border-t border-[#F6D8BD]/20`.
  - **Typography:** `#F6D8BD` (warm peach) and `#ffffff` headers paired with high-contrast `#F6D8BD]/80` body text for maximum readability.
  - **Icons:** Highlighted with `#F39399` (soft rose) to maintain visual harmony.
- **Section Rhythm:** Provides a bold, stabilizing dark contrast block at the base of every page, balancing the light and glassmorphic upper content.

---

## 3. Structural Column Layout (5-Column Grid)

### Column 1 & 2: Brand Identity & Educational Mission (`lg:col-span-2`)
- **Logo & Title:** Branded monogram with a gradient `#CF4173` border and bold `"SPRINT"` title.
- **Institutional Statement:** Concise summary of SPRINT's hands-on, production-level education philosophy in cloud, AI, and software systems.
- **Verification Seal:** `ShieldCheck` icon with `"Verified Institutional Education Model"` badge confirming authentic data standards.

### Column 3: Explore & Navigation
- Quick access links to:
  - `Home` (`/`)
  - `All Courses` (`/courses`)
  - `About Us & Faculty` (`/about`)
  - `Updates & Workshops` (`/updates`)
  - `Careers & Internships` (`/careers`)
  - `Contact & Directions` (`/contact`)

### Column 4: Student & Admin Portals
- Direct entry points for authenticated users:
  - `Student Login` (`/student/login`) with outbound arrow indicator
  - `New Enrollment` (`/register`)
  - `Admin Dashboard` (`/admin/login`) with outbound arrow indicator
  - `Scholarship Aid` (`/courses#scholarship`)

### Column 5: Center Coordinates & Verified Contact Channels
- **Physical Campus Location:**
  - `SPRINT Institutional Training Center, Hazaribagh, Jharkhand, India` with `MapPin` icon.
- **Click-to-Call Admissions Line:**
  - Clickable `tel:` link (`+91 (Contact Admissions)` / `+91 98765 43210`) with `Phone` icon.
- **Official Institutional Email:**
  - Clickable `mailto:` link (`admissions@sprint.institute`) with `Mail` icon.

---

## 4. Bottom Compliance Bar
- **Copyright:** Dynamic year calculation (`© 2026 SPRINT Institutional Hub. All rights reserved.`).
- **Legal Links:**
  - `Privacy Policy` (`/privacy`)
  - `Terms & Conditions` (`/terms`)
  - `Center Support` (`/contact`)

---

## 5. SEO & Accessibility Standard
- **Semantic Structure:** Wrapped in `<footer>` HTML5 semantic element.
- **Crawlable Internal Links:** High-density, crawlable internal linking matrix supporting search engine page indexing.
- **Click Targets:** Generous padding around touch targets for seamless mobile interactions.
