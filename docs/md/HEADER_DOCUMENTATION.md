# SPRINT Header Component — Detailed Architecture & Technical Specification

## 1. Overview & Purpose

The **Header** (`components/layout/Header.tsx`) is the primary global navigation interface of the SPRINT platform.

It provides:

* Global navigation across the platform
* Responsive desktop and mobile layouts
* Student and administrative access points
* Enrollment access
* Route-aware navigation states
* Accessible keyboard and screen-reader support

The global navigation structure is:

`Home → Courses → About Us → Updates → Contact`

---

## 2. Component Structure

The Header should be implemented as a reusable global layout component:

```text
components/
└── layout/
    └── Header.tsx
```

The component should be included at the global layout level so that it remains consistent across the application.

### Recommended Responsibilities

The Header component should handle:

* Primary navigation
* Active route detection
* Student Portal access
* Enrollment CTA
* Mobile menu state
* Mobile navigation
* Route-based mobile menu closing
* Accessibility attributes
* Responsive behavior

---

## 3. Desktop Navigation

Desktop navigation should be displayed from the `md` breakpoint and above.

```text
md:flex
```

### 3.1 Primary Navigation

The primary navigation should contain the following routes in the specified order:

| Label    | Route      |
| -------- | ---------- |
| Home     | `/`        |
| Courses  | `/courses` |
| About Us | `/about`   |
| Updates  | `/updates` |
| Contact  | `/contact` |

The navigation should clearly indicate which route is currently active.

### Active Route Requirements

The active navigation item should:

* Be visually distinguishable from inactive links
* Use the current Next.js route to determine its state
* Remain consistent across page navigation
* Provide sufficient contrast and accessibility feedback

---

## 4. Desktop Actions

The right side of the desktop Header should contain the primary user actions.

### 4.1 Student Portal

Provide a secondary navigation action for students.

**Route:**

```text
/student/login
```

The Student Portal should be easily accessible without competing with the primary enrollment CTA.

### 4.2 Enroll Now

Provide a prominent primary CTA for enrollment.

The CTA should navigate users to the appropriate enrollment/cohort registration flow.

Recommended label:

```text
Enroll Now
```

The CTA should remain clearly distinguishable from secondary navigation actions.

---

## 5. Mobile Navigation

Mobile navigation should be displayed below the `md` breakpoint.

```text
md:hidden
```

The mobile Header should provide:

* Brand/logo area
* Enrollment quick action
* Menu toggle
* Navigation drawer/menu
* Student Login
* Admin Console
* Enrollment CTA

---

## 6. Mobile Menu Trigger

The mobile Header should contain a menu toggle button.

The button must support two states:

```text
Closed → Open
Open → Closed
```

The toggle should provide an accessible label such as:

```text
aria-label="Toggle navigation menu"
```

The accessible state should also communicate whether the menu is currently open.

Recommended attribute:

```text
aria-expanded
```

---

## 7. Mobile Navigation Routes

The mobile navigation should provide access to all primary routes:

1. Home
2. Courses
3. About Us
4. Updates
5. Contact

It should also provide quick-access links for:

* Student Login
* Admin Console
* Enrollment

### Recommended Routes

```text
Home            → /
Courses         → /courses
About Us        → /about
Updates         → /updates
Contact         → /contact
Student Login   → /student/login
Admin Console   → /admin
```

The exact Admin Console route should be updated if the project uses a different route.

---

## 8. Route-Aware Behavior

The Header should use Next.js route information to determine the current page.

Recommended API:

```tsx
usePathname()
```

The current pathname should be used for:

* Determining the active navigation item
* Maintaining navigation consistency
* Closing the mobile menu after navigation

### Mobile Auto-Close

When the user selects a navigation item and the route changes, the mobile menu should automatically close.

Expected behavior:

```text
User opens menu
      ↓
User selects a route
      ↓
Next.js changes pathname
      ↓
Header detects pathname change
      ↓
Mobile menu closes
```

---

## 9. Responsive Behavior

The Header must work correctly across:

* Desktop
* Tablet
* Mobile

### Desktop

At `md` breakpoint and above:

* Desktop navigation is displayed
* Desktop actions are displayed
* Mobile menu is hidden

### Mobile

Below the `md` breakpoint:

* Desktop navigation is hidden
* Mobile menu trigger is displayed
* Mobile navigation is available
* Mobile-specific actions are displayed

---

## 10. Accessibility

The Header should follow semantic HTML and accessibility best practices.

### 10.1 Semantic Structure

Use semantic elements:

```html
<header>
  <nav>
    ...
  </nav>
</header>
```

The navigation should have an appropriate accessible label.

Example:

```tsx
<nav aria-label="Main navigation">
```

### 10.2 Menu Button

The mobile menu button should include:

```tsx
aria-label="Toggle navigation menu"
aria-expanded={isMenuOpen}
```

Where appropriate, use:

```tsx
aria-controls="mobile-navigation"
```

### 10.3 Keyboard Navigation

All interactive elements should be accessible using the keyboard.

Users should be able to:

* Tab through navigation links
* Focus buttons
* Activate links using Enter
* Operate the mobile menu using the keyboard
* Clearly identify the focused element

### 10.4 Focus States

Interactive elements must provide a visible focus state.

Avoid removing browser focus indicators unless they are replaced with an equally accessible custom focus style.

---

## 11. Performance Requirements

The Header is a global component and appears throughout the application. It should therefore remain lightweight and efficient.

### Requirements

* Avoid unnecessary re-renders
* Avoid unnecessary client-side state
* Keep navigation logic simple
* Use Next.js optimized navigation
* Avoid unnecessary dependencies
* Prevent layout shifts
* Keep Header dimensions predictable

### Core Web Vitals

The Header should not introduce unnecessary:

* Cumulative Layout Shift (CLS)
* Large JavaScript execution costs
* Excessive DOM elements
* Unnecessary client-side calculations

---

## 12. Next.js Implementation Requirements

The Header should be compatible with the Next.js App Router.

If the component uses:

* `usePathname()`
* React state
* Browser APIs

it should be implemented as a Client Component.

Example:

```tsx
"use client";
```

Navigation should preferably use:

```tsx
import Link from "next/link";
```

instead of manually manipulating browser URLs.

---

## 13. Recommended Component Logic

The overall Header logic should follow this structure:

```text
Header
│
├── Brand / Logo
│
├── Desktop Navigation
│   ├── Home
│   ├── Courses
│   ├── About Us
│   ├── Updates
│   └── Contact
│
├── Desktop Actions
│   ├── Student Portal
│   └── Enroll Now
│
└── Mobile Navigation
    ├── Menu Trigger
    ├── Home
    ├── Courses
    ├── About Us
    ├── Updates
    ├── Contact
    ├── Student Login
    ├── Admin Console
    └── Enroll Now
```

---

## 14. Functional Requirements

The Header must satisfy the following requirements:

* [ ] Header is available globally
* [ ] Home navigation works
* [ ] Courses navigation works
* [ ] About Us navigation works
* [ ] Updates navigation works
* [ ] Contact navigation works
* [ ] Student Portal navigation works
* [ ] Enrollment CTA works
* [ ] Admin Console link works
* [ ] Active route is correctly identified
* [ ] Mobile menu opens correctly
* [ ] Mobile menu closes correctly
* [ ] Mobile menu closes after route navigation
* [ ] Header works across responsive breakpoints
* [ ] Keyboard navigation works
* [ ] Screen readers can identify navigation correctly
* [ ] Focus states are visible
* [ ] No unnecessary layout shifts occur

---

## 15. Technical Acceptance Criteria

### Navigation

* All primary navigation links point to the correct routes.
* Navigation order remains consistent across desktop and mobile.
* Active route state is correctly determined from the current pathname.

### Responsive Design

* Desktop navigation is displayed at `md` and above.
* Mobile navigation is displayed below `md`.
* No navigation elements overlap or become inaccessible on smaller screens.

### Mobile Menu

* Menu opens when the trigger is activated.
* Menu closes when the trigger is activated again.
* Menu closes automatically after route navigation.
* Menu state is correctly represented through accessibility attributes.

### Accessibility

* Header uses semantic HTML.
* Navigation has an accessible label.
* Menu controls have accessible names.
* Keyboard navigation works correctly.
* Focus states remain visible.

### Performance

* Header does not cause unnecessary layout shifts.
* Navigation remains lightweight.
* Client-side functionality is limited to functionality that requires it.

---

## 16. File Reference

Primary implementation:

```text
components/layout/Header.tsx
```

Recommended supporting files, if required:

```text
components/
├── layout/
│   ├── Header.tsx
│   └── ...
```

The Header should remain modular and maintainable so that future navigation items or user actions can be added without restructuring the entire component.
