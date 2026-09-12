# SPRINT Header Component — Detailed Architecture & Technical Specification

## 1. Overview & Purpose
The **Header** (`components/layout/Header.tsx`) is the primary global navigation interface of the SPRINT platform. It is engineered with high-end glassmorphism, responsive drawer transitions, and strict adherence to the global SPRINT requirements:
`Home → Courses → About Us → Updates → Contact`.

---

## 2. Visual Hierarchy & Brand Aesthetic
- **Color Palette & Glassmorphism:**
  - **Base Canvas:** `bg-white/85` with `backdrop-blur-2xl` on scroll and `border-b border-[#5D3140]/10`.
  - **Logo Badge:** Dynamic gradient border (`from-[#5D3140] via-[#CF4173] to-[#F39399]`) surrounding an inner `#5D3140` plum tile featuring an off-white/peach (`#F6D8BD`) monogram `"S"`.
  - **Live Indicator:** Micro-pulsing `#CF4173` magenta beacon signifying active real-time status.
- **Dynamic Scroll States:**
  - **Top of Page (`scrollY <= 20px`):** Expanded padding (`py-5`), completely transparent background, integrating seamlessly with ambient mesh backgrounds.
  - **Scrolled (`scrollY > 20px`):** Compact height (`py-3.5`), ultra-high-definition backdrop blur (`backdrop-blur-2xl`), subtle drop shadow (`shadow-lg shadow-[#5D3140]/[0.04]`).

---

## 3. Desktop Navigation (`md:flex`)
1. **Primary Navigation Bar:**
   - Enclosed within an ergonomic floating glass pill (`rounded-full`, `bg-white/80`, `border border-[#5D3140]/12`).
   - Sequence:
     1. `Home` (`/`)
     2. `Courses` (`/courses`)
     3. `About Us` (`/about`)
     4. `Updates` (`/updates`)
     5. `Contact` (`/contact`)
   - **Active State:** Powered by **Framer Motion (`layoutId="activeNavIndicatorPalette"`)** with physical spring physics (`stiffness: 400, damping: 32`), sliding smoothly beneath the active route.
2. **Action CTAs:**
   - **Student Portal Link:** Subtle secondary glass pill button (`border border-[#5D3140]/15`, `hover:border-[#CF4173]/30`) leading directly to `/student/login`.
   - **Enroll Now Primary CTA:** High-conversion gradient button (`bg-gradient-to-r from-[#CF4173] to-[#5D3140]`) with micro-hover scale (`hover:scale-[1.02]`) and animated arrow icon.

---

## 4. Mobile Navigation & Drawer (`md:hidden`)
- **Compact Trigger:** Features a quick-action "Enroll" pill next to a hamburger/close toggle icon.
- **Drawer Animation:** Controlled by **Framer Motion (`AnimatePresence`)** providing smooth accordion slide-down/fade transitions.
- **Full Route Access:** Contains all 5 primary links with route indicators, quick links to Student Login, Admin Console, and a full-width cohort enrollment CTA.
- **Auto-Close Behavior:** Automatically listens to Next.js `usePathname()` to collapse the drawer upon route navigation.

---

## 5. Accessibility & Performance
- **Semantic Structure:** Wrapped in `<header>` and `<nav>` with appropriate ARIA tags (`aria-label="Toggle navigation menu"`).
- **Keyboard Navigation:** Full tab indexing and visible outline focus rings.
- **Zero Layout Shifts:** Fixed layout metrics prevent Core Web Vitals CLS during scrolling.
