# SPRINT Institutional Training Hub — Project Delivery Document

**Version:** 1.2  
**Date:** 2026-11-25  
**Prepared for:** SPRINT Institutional Training Hub, Hazaribagh, Jharkhand  
**Repository:** `sprint-hb` (Next.js 16, React 19, Supabase)

---

## 1. Executive Summary

This document describes the complete, production-ready codebase for the SPRINT Institutional Training Hub web platform (`https://sprintai.in`). The application is a full-featured Next.js 16 application using the App Router, React 19, and Supabase (PostgreSQL) for authentication, database, and storage. It serves as the public marketing site, student enrollment portal, student dashboard, admin console, and staff workspace for SPRINT's training programs in AI/ML, Cloud, DevOps, and Full-Stack engineering.

The codebase implements:

- **Public marketing site** with SEO-optimized pages, structured data, dynamic sitemap, and crawler rules; new video components (BrandVideo, SmeVideo) for campus tours and industry expert insights
- **Multi-audience contact/enquiry system** with server-side email delivery via Nodemailer; full CRUD admin enquiry management with category-specific pages (students, institutes, professionals, companies)
- **Student enrollment wizard** with streamlined multi-step form (personal details + password setup), OTP verification, and Supabase-backed persistence; profile completion tracking and onboarding state management
- **Student portal** with authenticated dashboard, assignments, progress tracking, and profile management; profile completion card with dynamic visibility
- **Admin console** with RBAC (Role-Based Access Control), course/bundle/learning-path management, student operations, announcements CMS, staff provisioning, and enhanced staff directory management with role-based user accounts
- **Staff workspace** with first-time setup, invitation flow, password management, and new staff service client for directory records
- **AI chatbot** with enhanced intent routing, verified Q&A datasets, local Ollama integration, and fallback deterministic responses; aligned office hours with contact methods
- **Transactional email system** with branded templates for verification, password setup/reset, staff invites, and enrollment approvals
- **Three-role authentication system** (Student, Admin, Staff) with Supabase Auth, profile-based authorization, middleware session protection, and cryptographic session cookies; 8-second admin auth timeout guard
- **Comprehensive test suite** (200+ unit tests) and CI-ready build configuration

All code has been validated: `npx tsc --noEmit` passes with zero errors; `npm run build` succeeds generating 65 routes (static + dynamic); `git diff --check` passes.

---

## 2. Solution Architecture & Network Topology

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router (React 19)                                           │
│  ├── Public Marketing Pages (Server Components)                             │
│  ├── Student Auth/Enrollment (Client Components)                            │
│  ├── Student Portal (Server + Client Components, protected by middleware)   │
│  ├── Admin Console (Server + Client Components, protected by middleware)    │
│  ├── Staff Workspace (Server + Client Components, protected by middleware)  │
│  ├── API Routes: /api/contact, /api/chat, /api/ai-chat                     │
│  └── Middleware: Session verification, role-based redirects                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    HTTPS (Vercel Edge Network / Custom Domain)
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE BACKEND                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL 15+ Database                                                    │
│  ├── Tables: profiles, students, courses, course_bundles, learning_paths,  │
│  │          batches, enrollments, student_courses, student_course_enroll-  │
│  │          ments, assessments, assessment_submissions, enquiries,        │
│  │          career_openings, job_applications, campus_updates,            │
│  │          announcements, instructors, testimonials, partners,           │
│  │          roles, staff_invitations, live_classes, notification_logs     │
│  ├── Custom Enums: user_role, audience_type, training_mode, batch_status, │
│  │          registration_status, enrollment_status, assessment_type,       │
│  │          ticker_category, job_type, application_status                 │
│  ├── Row Level Security (RLS) policies on all core tables                 │
│  ├── Helper Functions: is_admin(), is_staff(), handle_updated_at()        │
│  ├── RPCs: current_user_has_permission, verify_and_approve_enrollment,   │
│  │         complete_staff_password_reset                                  │
│  ├── Auth: Supabase Auth (email/password, magic links, password recovery) │
│  ├── Storage Buckets: assessment-uploads (private), announcement-assets  │
│  └── Realtime: Available for live updates (not currently consumed)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                         SMTP (Resend / SES / Brevo / SendGrid / Google Workspace)
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Ollama (local LLM for chatbot) — optional, falls back to deterministic  │
│  • Google Maps Embed (contact page)                                         │
│  • Supabase Storage CDN (images, posters, uploads)                         │
│  • Zoho WorkDrive / Google Drive preview (announcement modal)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow Summary

| Entry Point | Auth Check | Data Access | Rendering |
|-------------|------------|-------------|-----------|
| `/`, `/home`, `/about`, `/courses`, `/contact`, etc. | None (public) | Supabase (public read) or static fallback | Static (ISR 1h) or Server Components |
| `/student/login`, `/student/forgot-password`, etc. | None (public auth) | Supabase Auth | Server Components + Client hydration |
| `/student/dashboard`, `/student/*` (portal) | Middleware → verified student session cookie → Supabase `getUser()` → `profiles.role='student'` + `students.status='active'` | Server Components (server-side data fetch) + Client Components | Server Components |
| `/admin/*` | Middleware → verified admin session cookie → Supabase `getUser()` → `profiles.role='admin'` OR custom role with `full_access` | Service-role client (after authorization) + session client | Server Components + Client Components |
| `/staff/*` | Middleware → verified staff session → rewritten to `/admin/*` | Same as admin | Same as admin |
| `/api/contact` | None | Nodemailer SMTP → Supabase not used | Serverless function (Node.js runtime) |
| `/api/chat` | None | Local deterministic logic + optional Ollama | Serverless function |

### 2.3 Middleware Protection Strategy

The middleware (`src/lib/supabase/middleware.ts`) implements a **dual fast-path** strategy:

1. **Cryptographic session cookies** (JWT-signed, HttpOnly, Secure in production) for zero-latency subsequent navigations
2. **Supabase Auth `getUser()`** fallback for first visit or expired cookies

Session cookies are issued/validated for:
- **Admin/Staff**: `sprint_admin_session` (includes role, permissions, `must_change_password` flag)
- **Student**: `sprint_student_session` (includes registration number, active status)

Route prefixes protected:
- Admin: `/admin/`, `/admin/dashboard`, all subroutes
- Staff: `/staff/` (rewritten to `/admin/` via `next.config.mjs`)
- Student Portal: 9 routes under `/student/(portal)/` per `PORTAL_ROUTE_PREFIXES`

---

## 3. Components & Modules Delivered

### 3.1 Public Marketing Module

| File/Directory | Purpose |
|----------------|---------|
| `src/app/page.jsx` | Root redirect to `/home` with `robots: { index: false }`, canonical `/` |
| `src/app/home/page.jsx` | Hero, partner marquee (22 logos), featured program (zigzag timeline), course paths, **BrandVideo** (campus tour with interactive pillars), **SmeVideo** (industry expert insights with playback & stats), faculty filmstrip, testimonials carousel, FAQ, contact CTA |
| `src/app/about/page.jsx` | 10-section spec: hero with dark overlay + impact band, story/vision/mission swap, leadership, faculty, industry connections, verified stats, CTA |
| `src/app/courses/page.jsx` | Filterable catalogue (audience tabs, category/level filters), Supabase-backed with static fallback, ISR 1m |
| `src/app/courses/[slug]/page.jsx` | Dynamic course detail with `generateMetadata`, JSON-LD Course schema, curriculum, enrollment CTA |
| `src/app/bundles/[slug]/page.jsx` | Bundle/flagship detail with one-click enrollment |
| `src/app/learning-paths/[slug]/page.jsx` | Role-based learning path detail |
| `src/app/programs/sprint-rise/page.jsx` | SPRINT RISE signature program page |
| `src/app/programs/career-accelerator/page.jsx` | Career Accelerator signature program page |
| `src/app/careers/page.jsx` | Job listings with role detail modal, application form, JSON-LD JobPosting schema |
| `src/app/contact/page.jsx` | 4-audience tabbed enquiry form, contact cards, map, FAQ accordion |
| `src/app/terms/page.jsx`, `src/app/privacy/page.jsx` | Compact single-column legal layout |
| `src/components/Home/*` | Reusable sections: Hero, PartnerCarousel, FeaturedProgram, **BrandVideo**, **SmeVideo**, Testimonials, FacultyFilmstrip, MoreCourses, ContactCTA, FAQSection |
| `src/components/sections/*` | Shared sections: FacultyExperts, StoryVisionMission, WhyChooseSprint, ImpactWeCreate, IndustryAcademicConnection |

**SEO & Structured Data (all public pages):**
- `metadataBase: https://sprintai.in` in root layout
- Per-page `metadata` with title, description (≤155 chars), Open Graph, Twitter card, canonical URL
- Dynamic `generateMetadata` for `[slug]` routes with Supabase fallback
- JSON-LD: Organization (`/about`), EducationalOrganization+FAQPage (`/home`, `/contact`), Course (`/courses/[slug]`, `/bundles/[slug]`), JobPosting array (`/careers`)
- `src/app/sitemap.ts`: Static + dynamic routes (courses, bundles, learning paths) with deduplication, Supabase + static fallback
- `src/app/robots.ts`: Allow `/`; disallow `/admin/`, `/staff/`, `/student/`, `/api/`, auth routes; sitemap reference

**Video Components Added (2026-11-25):**
- `BrandVideo` (`src/components/Home/BrandVideo.jsx`): Campus tour showcase with 4 interactive pillars (campus, lab, library, sports), responsive video modal, keyboard accessible
- `SmeVideo` (`src/components/Home/SmeVideo.jsx`): Industry expert video insights with playback controls, statistics overlay, hover effects
- Enhanced `FacultyFilmstrip` with improved layout, dynamic height adjustments, and CSS modules
- Updated `Testimonials` and `FAQSection` for consistent styling and responsiveness

### 3.2 Contact & Enquiry Module

| File | Purpose |
|------|---------|
| `src/app/api/contact/route.js` | Serverless POST handler: validates payload, sends email via Nodemailer, returns generic success/error (no raw error leakage); handles enquiry submissions with email notifications |
| `src/components/contact/EnquirySection.jsx` | Tabbed form for 4 audiences (Student, Working Professional, Institute, Company) |
| `src/components/contact/*Form.jsx` | Audience-specific form components with validation |
| `src/components/contact/ContactMethods.jsx` | Click-to-call, mailto, WhatsApp (from `site.config.json`), address; **updated office hours alignment with chatbot** |
| `src/components/contact/FAQSection.jsx` | Accordion with data from `src/data/contactFaqs.js` |
| `src/lib/contact-phone.js` | Phone validation utility (Indian format) |
| `src/app/admin/enquiries/actions.ts` | Server actions for enquiry CRUD: fetch, update status, delete; revalidation paths for dashboard sync |
| `src/app/admin/enquiries/page.tsx` | Main enquiries dashboard with redirect to student enquiries |
| `src/app/admin/enquiries/students/page.tsx` | Student enquiries category view |
| `src/app/admin/enquiries/institutes/page.tsx` | Institute enquiries category view |
| `src/app/admin/enquiries/professionals/page.tsx` | Professional enquiries category view |
| `src/app/admin/enquiries/companies/page.tsx` | Company enquiries category view |
| `src/components/admin/EnquiriesCategoryView.tsx` | Reusable category view component: table, status badges, actions (update/delete), pagination |
| `src/components/admin/enquiries-types.ts` | Type definitions for enquiry audiences, statuses, and table columns |
| `src/Supabase/Enquiries Dashboard Migration.sql` | Database migration for enquiries dashboard tables and indexes |

**Security fixes applied (2026-11-23):**
- Error responses return generic message: `"Failed to send enquiry. Please try again."` (raw `error.message` logged server-side only)
- TLS `rejectUnauthorized: false` only in non-production environments

**Admin Enquiry Management (added 2026-11-23):**
- Full CRUD operations for enquiries across 4 audience categories
- Category-specific pages with consistent UI via `EnquiriesCategoryView`
- Status management (new, in-progress, resolved, closed)
- Email notification integration on enquiry submission
- Dashboard revalidation for real-time updates

### 3.3 Student Authentication & Enrollment Module

| File/Directory | Purpose |
|----------------|---------|
| `src/app/student/login/page.jsx` | Sign-in form, mock-delay backend seam (replaceable with Supabase), redirects to dashboard; handles `deactivated=1` query param |
| `src/app/student/forgot-password/page.jsx` | Email entry → `/student/check-email?email=` |
| `src/app/student/check-email/page.jsx` | Resend cooldown, client-side query param read |
| `src/app/student/reset-password/page.jsx` | 6-box OTP input + password requirements live validation |
| `src/app/student/password-reset-success/page.jsx` | Confirmation screen |
| `src/app/student/enroll/page.jsx` | **Streamlined 3-step wizard shell** (Personal Information → Specialization → Account), reads `?course=` / `?bundle=` for pre-selection |
| `src/app/student/enroll/actions.ts` | Server actions: `applyForCourseAction` (course/bundle), enrollment insert, magic link generation, password-recovery email dispatch |
| `src/components/student/enrollment/EnrollmentWizard.jsx` | Wizard state machine: controlled steps, validation, focus management, **optional steps removed**, progress bar |
| `src/components/student/enrollment/steps/*` | **PersonalInformation** (OTP), **Specialization**, **Account** (password setup) — Education step removed |
| `src/components/student/enrollment/enrollment-steps.js` | Single source of truth for step registry (labels, components, validation, `isScaffolded`, `isOptional`) |
| `src/components/student/auth/*` | Shared primitives: AuthButton, AuthField, AuthCard, PasswordInput, PasswordRequirements, auth-validation.js |
| `src/app/student/auth-types.ts` | Type definitions: `StudentProfile`, `onboarding_completed` flag |
| `src/app/student/session.ts` | Student session utilities with onboarding completion check |
| `src/lib/student-login-redirect.js` | Resolves `?next=` course path for student post-login redirect |

**Key flows:**
1. **Enrollment**: Streamlined 3-step wizard (Personal Info → Specialization → Account) → server action validates → inserts into `public.enrollments` with `application_number` (`SPR-APP-YYMM-XXXX`) → generates Supabase magic link (`/student/enroll?token=`) → sends password-recovery email via custom SMTP mailer → applicant checks status on dashboard
2. **Admin Approval**: RPC `verify_and_approve_enrollment` creates/updates `public.students`, `public.profiles`, `public.student_courses`, generates registration number `SPR-<year>-<uuid>`
3. **Password Setup**: Applicant clicks magic link → `/set-password` → sets password → auto-sign-in → `/student/dashboard`
4. **Profile Completion Tracking**: Dashboard displays profile completion card with dynamic visibility based on `onboarding_completed` flag and completion percentage; `StudentPortalSessionGuard` handles onboarding completion status for active students

**Student Onboarding Enhancements (2026-11-25):**
- Removed Education step from enrollment wizard (was optional, cross-slice write to specialization)
- Reduced wizard from 5 steps to 3 core steps for faster onboarding
- Added `onboarding_completed` field to `public.profiles` table via `Student Onboarding State Migration.sql`
- `StudentPortalSessionGuard` now checks onboarding completion and redirects appropriately
- `DashboardBento` includes profile completion card with progress percentage
- Updated `EnrollmentProgress`, `EnrollmentStepFooter`, `EnrollmentSuccessPanel` for new step count and clearer post-registration actions

### 3.4 Student Portal Module

| File/Directory | Purpose |
|----------------|---------|
| `src/app/student/(portal)/layout.jsx` | Authenticated shell with `StudentLayout` (sidebar + main) |
| `src/components/student/StudentLayout.jsx` | Responsive: desktop collapsible sidebar, mobile slide-out drawer (backdrop dismiss, Escape, scroll lock) |
| `src/components/student/StudentSidebar.jsx` | Navigation rail from `student-navigation.json` (9 items), active `aria-current`, identity block with avatar dropdown |
| `src/components/student/StudentDataProvider.jsx` | Client context: assessment access scope, pending badge count, refresh after submission |
| `src/app/student/(portal)/dashboard/page.jsx` | Server-side data fetch → `DashboardBento.jsx` (12-col grid: welcome/progress, **profile completion card**, KPIs, assignments/applications, live classes/announcements, quick actions) |
| `src/app/student/(portal)/assignments/page.jsx` | `AssignmentsClient.jsx`: KPIs, tabs/search/course filters, submission drawer (GitHub/live URLs, notes, file upload to `assessment-uploads` bucket, 10 MB max) |
| `src/app/student/(portal)/profile/page.jsx` | Supabase profile fetch + edit form (personal, education, social, URL validation) |
| `src/components/student/LogoutButton.jsx` + `student-session.js` | Sign-out: `supabase.auth.signOut()`, clears storage keys, hard navigation to `/student/login` |
| `src/lib/student-assessment-access.ts` | Authorization scope: approved enrollments + active student_courses + active student_course_enrollments, bundle expansion via `bundle_courses` |
| `src/components/student/dashboard/DashboardBento.jsx` | **Profile completion card** with dynamic visibility based on `onboarding_completed` flag and completion percentage; 12-col responsive grid layout |
| `src/lib/student-portal-session-guard.ts` | **StudentPortalSessionGuard**: handles onboarding completion status for active students, redirects to profile completion if needed |

### 3.5 Admin Console Module

| File/Directory | Purpose |
|----------------|---------|
| `src/app/admin/layout.tsx` | Server-side session/profile load, permission check, renders `AdminLayoutClient` |
| `src/app/admin/AdminLayoutClient.tsx` | Responsive client shell: sidebar (collapsible), header (avatar, sign-out), permission-gated navigation groups |
| `src/app/admin/auth-types.ts` | Type definitions: `AdminSession`, `AdminProfile`, `ModulePermission`, `ModuleKey` |
| `src/app/admin/authorization.ts` | Server helpers: `assertModuleAccess`, `getCurrentUserPermissions` (RPC `current_user_has_permission`) |
| `src/app/admin/dashboard/page.tsx` | Metrics cards, quick links |
| `src/app/admin/courses/page.tsx` | Course manager: search, filters (category/level/audience), metrics, detail/edit dialogs, module/tag editors, publish/featured toggles, Supabase CRUD |
| `src/app/admin/courses/actions.ts` | Server actions for course/bundle/learning-path CRUD, uses service-role client after authorization |
| `src/app/admin/roles/page.tsx` | RBAC console: role metrics, catalog, user assignments, access matrix, create/edit modal, staff provisioning modal |
| `src/app/admin/roles/actions.ts` | Role CRUD, permission management, profile role assignment |
| `src/app/admin/users/actions.ts` | Staff provisioning (service-role), invitation token, temp password, magic login URL, revalidation |
| `src/app/admin/updates/page.tsx` | Announcements CMS: create/update/delete, poster upload to `announcement-assets` bucket |
| `src/app/admin/updates/actions.ts` | Server actions with `revalidateTag("announcements", { expire: 0 })` for instant cache invalidation |
| `src/app/admin/enquiries/page.tsx` | Enquiry dashboard with category tabs (students, institutes, professionals, companies) |
| `src/app/admin/students/registrations/page.tsx` | Course-free registrations table, edit contact/admin notes, delete |
| `src/app/admin/students/enrollments/page.tsx` | Enrollment applications table, verify & approve (RPC), reject, detail modal with progress |
| `src/app/admin/students/list/page.tsx` | Student directory: ID, name, contact, enrolled courses (multi-table resolution), status, enrollment date |
| `src/app/admin/academics/assessments/assign/page.tsx` | Assessment assignment: KPI/filter, grouped course selector (flagship/bundle/course), draft/active/closed, grading with signed URLs |
| `src/app/admin/academics/live-classes/page.tsx` | Live class CRUD: Google Meet/Zoom/other, status actions, permission checks |
| `src/app/admin/dashboard/page.tsx` | **Refactored dashboard** with streamlined shortcut links, improved layout, metrics cards |
| `src/app/admin/session.ts` | Admin session utilities with permission loading and validation |
| `src/lib/supabase/staff.ts` | **Staff service client**: `getStaffDirectoryRecords()`, `getUserAccountRecords()` with role metadata for directory management |
| `src/components/admin/roles/CreateUserModal.tsx` | Enhanced modal for creating users with role assignment and email sending |
| `src/components/admin/users/UserDirectoryTable.tsx` | Staff directory table with role metadata display and user account record selection |
| `src/components/admin/auth/ForcePasswordChangeModal.tsx` | Improved password change modal with session handling alignment |

**RBAC Model:**
- Legacy: `profiles.role = 'admin'` → full access
- Custom: `profiles.role_id` → `public.roles` (name, permissions JSONB, `is_active`, `full_access` flag)
- Module permissions: `user_management`, `access_control`, `academic`, `admissions`, `cms`, `careers`, `partners`, `trainers`, `scholarships`
- Capabilities: `create`, `read`, `update`, `delete`
- Admin layout loads permissions via RPC; submodule routes call `assertModuleAccess(module, capability)`

**Admin Console Enhancements (2026-11-25):**
- **Staff Service Client** (`src/lib/supabase/staff.ts`): Centralized staff directory management with `StaffDirectoryRecord` and `UserAccountRecord` types; includes `onboarding_completed` field for tracking
- **Enhanced User Directory**: `UserDirectoryTable` displays staff records with role metadata; `CreateUserModal` handles email sending scenarios
- **Refactored Admin Dashboard**: Streamlined shortcut links, improved layout for better usability
- **Improved ForcePasswordChangeModal**: Aligned with new session handling patterns
- **Updated AdminLayoutClient**: Enhanced sidebar navigation and permission-gated groups
- **Comprehensive test coverage**: New tests for staff directory data, user directory table, admin layout sign-out, create user modal, force password change modal, staff login actions and flow

### 3.6 Staff Workspace Module

| File | Purpose |
|------|---------|
| `src/app/staff/login/page.tsx` | Staff sign-in (email/password) |
| `src/app/staff/login/actions.ts` | First-time setup: verifies user, clears `must_change_password`/`first_login`, activates profile, revalidates `/staff/dashboard` |
| `src/app/staff/invitation/[token]/page.tsx` | Invitation acceptance: sets password, confirms email, redirects to setup |
| `src/components/staff/auth/FirstTimePasswordModal.tsx` | Modal for initial password change |
| `src/app/staff/dashboard/SignOutButton.tsx` | Staff sign-out button with session cleanup |
| `src/app/staff/login/StaffLoginForm.tsx` | Staff login form with session recovery and error handling |
| `src/app/staff/login/actions.ts` | `completeFirstTimeStaffSetupAction`: verifies session, updates profile flags, marks invitation as used, revalidates dashboard |
| `src/lib/supabase/staff.ts` | **Staff service client**: `getStaffDirectoryRecords()`, `getUserAccountRecords()` with role metadata for directory management |

**Flow:** Admin provisions staff via `/admin/users` → `auth.admin.inviteUserByEmail` + temp password + magic URL → staff clicks URL → `/staff/invitation/[token]` → sets password → `/staff/login` → first-time setup modal → `/staff/dashboard` (rewritten to `/admin/dashboard`)

**Staff Workspace Enhancements (2026-11-25):**
- **Staff Service Client** (`src/lib/supabase/staff.ts`): Shared with admin console for consistent staff directory management; provides `StaffDirectoryRecord` (with `onboarding_completed` field) and `UserAccountRecord` types
- **Enhanced Staff Login**: `StaffLoginForm` with improved session recovery, error handling, and 8-second timeout guard alignment
- **First-Time Setup Improvements**: `FirstTimePasswordModal` and `completeFirstTimeStaffSetupAction` aligned with new session handling patterns
- **Sign-Out Button**: Dedicated `SignOutButton` component for staff dashboard with proper session cleanup
- **Comprehensive test coverage**: Staff login actions, staff login flow, session recovery, error handling

### 3.7 Chatbot Module

| File | Purpose |
|------|---------|
| `src/components/ai/AiAssistant.tsx` | Floating chat widget: suggestions chips, similar questions, markdown rendering, copy-to-clipboard, auto-scroll; **updated contextual suggestions for better user guidance** |
| `src/app/api/chat/route.ts` | POST/GET/OPTIONS: validates message (1-500 chars), history (last 12), calls `getLocalChatbotReply` |
| `src/app/chatbot/chatbot-service.server.js` | Server-only: deterministic reply selection + optional Ollama call (timeout 8s); **enhanced intent routing** |
| `src/app/chatbot/chatbot-core.js` | Deterministic rules: greetings, career guidance, fees (hands off to admissions), eligibility, **internships (enhanced)**, duration, contact, courses; **updated regex patterns for office hours and internship queries** |
| `src/app/chatbot/chatbot-qa-datasets.js` | Loads verified Q&A from `data/chatbot/sprint-qa-master.json` |
| `data/chatbot/*.json` | Topic datasets: about_sprint, admission, career, courses, payment, accommodation, support, dashboard, scholarship, etc. |
| `scripts/build/build-chatbot-qa-master.js` | Builds consolidated `sprint-qa-master.json` from source topics |
| `data/chatbot/sprint-qa-master.json` | **Consolidated verified Q&A master dataset** (updated 2026-11-25) |

**Behavior:** Exact match → verified Q&A → Ollama (if configured) → deterministic rules → fallback suggestions. No fees/policy invention; hands off to `/contact`.

**Chatbot Enhancements (2026-11-25):**
- **Enhanced Intent Routing**: Improved keyword detection and regex patterns for internships and office hours queries
- **Verified Q&A Updates**: Updated `about_sprint_QA_dataset.json`, `admission_QA_dataset.json`, `career_QA_dataset.json`, `courses_QA_dataset.json`, `payment_QA_dataset.json` with latest information
- **Office Hours Alignment**: Chatbot office hours responses now synchronized with `ContactMethods.jsx` component (single source of truth)
- **Contextual Suggestions**: Updated `AiAssistant.tsx` suggestion chips for better user guidance
- **Comprehensive Test Coverage**: Added unit tests for office hours and internship query responses in `chatbot-service.test.js`

### 3.8 Transactional Email Module

| File | Purpose |
|------|---------|
| `src/lib/email/mailer.ts` | Pooled Nodemailer transporter (5 connections, 100 messages/connection), `sendEmail()` with graceful fallback when SMTP not configured |
| `src/lib/email/templates/*.ts` | Programmatic renderers: verification, password-setup, password-reset, staff-invite, enrollment-approved |
| `src/lib/email/templates/base-layout.ts` | Shared brand wrapper (navy `#011f3e`, red `#f81529`, surfaces `#f8fafc`/`#ffffff`) |
| `src/Supabase/email-templates/*.html` | Supabase Go-templates for Auth emails: magic-link, reset-password, invite-user, confirm-signup, change-email |
| `src/app/student/enroll/actions.ts` | Integration: `generateLink({ type: "recovery" })` + `sendEmail(renderPasswordSetupEmail(...))` |

**Dual-tier delivery:** Custom SMTP (instant, <1-2s) + GoTrue fallback. Branded templates for all Auth and custom flows.

### 3.9 Data & Configuration Layer

| File | Purpose |
|------|---------|
| `src/config/site.config.json` | **Single source of truth** for contact (phone, email, WhatsApp, address), socials, legal name, tagline, domain (`https://sprintai.in`) |
| `src/config/navigation.json` | Public nav: Home, Courses, About, Updates, Contact |
| `src/config/student-navigation.json` | Student portal rail (9 items with icons) |
| `src/data/courses.js` | Course catalogue (static fallback), normalization utilities, category images |
| `src/data/programs.js` | Signature programs & bundles |
| `src/data/learningPaths.js` | Role-based learning paths |
| `src/data/careers.js` | Job openings with responsibilities/requirements |
| `src/data/about.json` | About page content (leadership, faculty, stats, hero highlight) |
| `src/data/contactFaqs.js` | Contact FAQ data (shared server/client import) |
| `src/data/student.js` | Mock student data for dashboard widgets (identity, enrollment, schedule, mentors, announcements, progress, offers) |
| `src/lib/course-utils.ts` | Shared interfaces: `CourseItem`, `BundleItem`, `LearningPathItem`, `generateSlug`, `normalizeBundle`, `normalizeLearningPath` |
| `src/lib/id-utils.ts` | `formatApplicationId` (`SPR-APP-YYMM-XXXX`), `generateNextApplicationId`, `isUuid`, `sanitizeStudentId` |
| `src/utils/dates.js` | `formatShortDate` (en-IN) |

### 3.10 Database Migrations (27 SQL files in `src/Supabase/`)

| Migration | Purpose |
|-----------|---------|
| `Initial Schema.sql` | Base schema: enums, core tables, RLS, helper functions, **table-level GRANTs** (added 2026-11-07) |
| `Admin Auth Schema.sql` | Admin profiles, roles, permissions |
| `RBAC Schema.sql` | `public.roles`, `profiles.role_id`, granular permissions, seed roles |
| `Course Audience and Duration Migration.sql` | Audience enum migration, text duration, constrained columns |
| `Learning Paths and Program Management Migration.sql` | `public.learning_paths`, bundle metadata extensions, seed data |
| `Student Auth Migration.sql` | Student profiles, RLS, triggers |
| `Staff_Auth_And_RBAC_Migration.sql` | Staff profiles, invitations, RBAC integration |
| `Staff Invitations Migration.sql` | `staff_invitations` table, token, expiry, status |
| `Staff First-Time Setup Migration.sql` | `must_change_password`, `first_login` flags |
| `Staff Password Reset Migration.sql` | Password reset workflow for staff |
| `Enrolment Applicant Account Link Migration.sql` | `enrollments.applicant_user_id`, RLS for applicant self-read |
| `Student Enrollment Approval and Courses Migration.sql` | Student profile fields, `student_courses` junction, approval RPC |
| `Application ID and Student Directory Format Migration.sql` | `application_number` trigger, backfill |
| `Student Dashboard Access Migration.sql` | `GRANT SELECT` on dashboard tables, RLS policy on `batches` |
| `Enquiries Dashboard Migration.sql` | Enquiry tables, admin assignment |
| `Careers Jobs Migration.sql` | `career_openings`, `job_applications` |
| `Course Granular Permissions Migration.sql` | Permission-scoped course management |
| `Course Management Migration.sql` | Course admin schema |
| `Course IT and Non-IT Audience Migration.sql` | Audience split |
| `Flagship Programs and Dynamic Course Details Migration.sql` | Program/bundle metadata |
| `Enrollment Optional Course Selection Migration.sql` | Optional course field in enrollment |
| `Enrollment Approval Preflight.sql` | Pre-approval checks |
| `Enrollment Approval and Student Directory Migration.sql` | Directory query support |
| `Unified Registration Enrollment OTP Migration.sql` | OTP field for enrollment |
| `Student Onboarding State Migration.sql` | **Adds `onboarding_completed` boolean field to `public.profiles` table for tracking student onboarding completion status** |

**Note:** Tables `assessment_submissions`, `live_classes`, `notification_logs`, `announcements`, and bucket `assessment-uploads` are provisioned in Supabase but **not defined by tracked SQL migrations** — deployment schema setup must be documented separately.

---

## 4. Authentication & Login Flows

### 4.1 Overview

The platform supports three distinct login flows: **Student**, **Admin**, and **Staff**. All use Supabase Auth (`signInWithPassword`) as the identity provider, followed by profile-based role and authorization checks against `public.profiles` and related tables. Edge middleware (`src/lib/supabase/middleware.ts`) enforces route protection and issues cryptographically signed session cookies for fast subsequent navigations.

### 4.2 Student Login — `/student/login`

**Entry points:** Header "Student Portal" action, direct URL, or middleware redirect from portal routes when unauthenticated.

**Flow:**

1. **Page loads** — `StudentLoginPage` (client component). Checks `window.location.search` for `deactivated=1`; if present, signs the user out and shows "Your account is deactivated."
2. **Pre-existing session check** — Calls `supabase.auth.getUser()` to detect an already-signed-in user:
   - Active student profile (`role = "student"`, `status = "active"`, `is_active = true`) → hard redirect to `/student/dashboard` (or `/student/enroll?next=/courses/<slug>` if arriving from course pre-selection).
   - Deactivated account → signs out and shows deactivation message.
   - Wrong role or inactive → signs out and shows error.
3. **Form submission** — User enters email + password → `supabase.auth.signInWithPassword()`.
4. **Post-auth validation** (sequential; any failure signs the user out and returns an error):
   - Fetch `public.profiles` row for the user.
   - If `profile.is_active === false` → sign out, show "Your account is deactivated."
   - Fetch `public.students` row; if `student.status === "deactivated"` → sign out, show deactivated message.
   - If no student record exists, check `public.registrations` for a deactivated registration matching `user_id` or email → sign out if found.
   - Require `profile.role === "student"` → otherwise sign out ("This account does not have Student Portal access").
   - Require `profile.status === "active"` and `profile.is_active !== false` → otherwise sign out ("account is currently inactive").
5. **Redirect** — On success, hard navigate (`window.location.href`) to `/student/dashboard` (or the `?next=` course path).

**Session management:** Middleware issues a signed `sprint_student_session` cookie (HMAC-SHA256, 7-day max age) for zero-latency subsequent navigations. Logout (`LogoutButton` + `student-session.js`) calls `supabase.auth.signOut()`, clears `student_recovery_email` from storage, writes a one-shot `student_signed_out` flag, and hard-navigates to `/student/login` where `consumeStudentSignOutFlag()` displays "You have been signed out."

**Registration:** "Don't have an account?" links to `/student/enroll` (multi-step wizard).

### 4.3 Admin Login — `/admin` (rewritten from `/admin/login`)

**Entry points:** Header "Admin Dashboard" action (when signed in as admin), direct URL, or middleware redirect from `/admin/*` when unauthenticated.

**Flow:**

1. **Page loads** — `AdminLoginPage` (client component). Listens to `supabase.auth.onAuthStateChange` for `PASSWORD_RECOVERY` events and checks query params:
   - `?password_reset=success` → shows success notice.
   - `?reset=true` → verifies recovery session via `supabase.auth.getSession()` and opens password reset modal.
2. **Form submission** — User enters admin email + password → `supabase.auth.signInWithPassword()` wrapped in an **8-second timeout** (`Promise.race`).
3. **Validation** (3 steps):
   - Step 1: Authenticate via Supabase Auth. On error → sign out, show "Invalid Admin ID or Password" or specific message (email not confirmed, rate limit).
   - Step 2: Fetch `public.profiles` (`role`, `is_active`, `roles(name, is_active)`).
   - Step 3: Authorize — access granted if `profile.role === "admin"` OR (`profile.is_active` AND assigned role `name` exists AND `assignedRole.is_active !== false`). On denial → sign out, show "Access denied."
4. **Redirect** — Hard navigate (`window.location.assign`) to `/admin/dashboard` so edge middleware refreshes Supabase SSR cookies.

**Forgot password:** `supabase.auth.resetPasswordForEmail()` sends a reset link redirecting to `/admin?reset=true`, which opens `ForcePasswordChangeModal` (mode: `password_reset`).

**Session cookie:** Middleware issues `sprint_admin_session` (HMAC-SHA256, 8-hour max age) containing role, permissions, `must_change_password`, etc., for fast-path admin routes.

### 4.4 Staff Login — `/staff/login` (rewritten from `/staff/*` except login/invitation)

**Entry points:** Staff invitation email link (`/staff/invitation/[token]`), direct URL, or middleware redirect from `/staff/*` when unauthenticated.

**Flow:**

1. **Page loads** — `StaffLoginPage` (server component) reads `?email` and `?invitation` search params, passes them to `StaffLoginForm` (client component).
2. **Form submission** — User enters email + password → `supabase.auth.signInWithPassword()`.
3. **Validation:**
   - Fetch `public.profiles` (`first_login`, `must_change_password`, `is_active`).
   - If `is_active !== true` → sign out, show "inactive or unavailable."
   - If `must_change_password || first_login` → open `FirstTimePasswordModal` instead of dashboard.
   - Otherwise → hard navigate to `/staff/dashboard` (rewritten to `/admin/dashboard` by `next.config.mjs`).
4. **First-time setup** — `completeFirstTimeStaffSetupAction` (server action): verifies session via `supabase.auth.getUser()`, updates `public.profiles` (`must_change_password: false`, `first_login: false`, `is_active: true`) using the service-role client, optionally marks the invitation token as "used", and revalidates `/staff/dashboard`.

### 4.5 Comparison Table

| Aspect | Student | Admin | Staff |
|--------|---------|-------|-------|
| Auth provider | Supabase Auth (`signInWithPassword`) | Supabase Auth (`signInWithPassword`) | Supabase Auth (`signInWithPassword`) |
| Profile table | `public.profiles` + `public.students` | `public.profiles` + `public.roles` | `public.profiles` |
| Required state | `role='student'`, `status='active'`, `is_active=true` | `role='admin'` OR active custom role | `is_active=true` |
| Session cookie | `sprint_student_session` (7 days) | `sprint_admin_session` (8 hours) | Supabase SSR cookies |
| Middleware guard | Yes (`PORTAL_ROUTE_PREFIXES`) | Yes (`isAdminSubRoute`) | Yes (`isStaffWorkspaceRoute`) |
| Timeout guard | No | 8-second auth timeout | No |
| Forgot password | `/student/forgot-password` → check-email | Inline reset dialog (`resetPasswordForEmail`) | Not implemented in UI |

### 4.6 Key Files

| File | Purpose |
|------|---------|
| `src/app/student/login/page.jsx` | Student login form + validation |
| `src/app/admin/page.tsx` | Admin login + 8s timeout + 3-step validation |
| `src/app/staff/login/page.tsx` / `StaffLoginForm.tsx` | Staff login + first-time setup modal |
| `src/app/staff/login/actions.ts` | `completeFirstTimeStaffSetupAction` (server action) |
| `src/lib/supabase/middleware.ts` | Edge middleware for all three role families |
| `src/lib/auth/student-session.ts` / `admin-session.ts` | HMAC-SHA256 signed session tokens |
| `src/lib/student-login-redirect.js` | Resolves `?next=` course path for student post-login redirect |

---

## 5. Environment & Configuration Requirements

### 4.1 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (e.g., `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable (anon) key for browser/client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service-role key (server-only, never exposed to client) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production site URL (`https://sprintai.in`) — used for magic links, redirects |
| `SMTP_HOST` | For email | SMTP server hostname (e.g., `smtp.resend.com`) |
| `SMTP_PORT` | For email | SMTP port (465 for SSL, 587 for STARTTLS) |
| `SMTP_SECURE` | For email | `true` for port 465, `false` for 587 |
| `SMTP_USER` | For email | SMTP username |
| `SMTP_PASS` | For email | SMTP password / API key |
| `SMTP_FROM` | For email | From address (e.g., `"SPRINT Enquiries <noreply@sprintai.in>"`) |
| `SMTP_TO` | For contact form | Recipient for contact form submissions |
| `OLLAMA_URL` | Optional | Local Ollama endpoint (default `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | Optional | Model name (default `llama3.2:3b`) |
| `NEXT_PUBLIC_CHATBOT_API_URL` | Optional | Chat endpoint (default `/api/chat`) |

**Example `.env.local` (production):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://sprintai.in
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_...
SMTP_FROM="SPRINT Enquiries <noreply@sprintai.in>"
SMTP_TO=admissions@sprintai.in
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

### 4.2 Supabase Project Setup Checklist

1. **Run all 26 migrations in dependency order** (see `src/Supabase/` filenames; staff invitations depends on staff auth/RBAC)
2. **Enable Auth providers**: Email/password (required), optionally Magic Link
3. **Configure Custom SMTP** in Dashboard → Authentication → SMTP Settings (Resend/SES/Brevo/SendGrid/Google Workspace) for instant delivery
4. **Paste Go-templates** from `src/Supabase/email-templates/` into Auth → Email Templates
5. **Create Storage Buckets**:
   - `assessment-uploads` (private) — policies for student upload / admin signed URL
   - `announcement-assets` (public) — poster/PDF links for ticker
6. **Apply RLS policies** from migrations; verify `GRANT SELECT` on all tables for `anon`/`authenticated` as defined
7. **Configure Redirect URLs** in Auth → URL Configuration:
   - Site URL: `https://sprintai.in`
   - Additional Redirect URLs: `https://sprintai.in/student/enroll`, `https://sprintai.in/set-password`, `https://sprintai.in/staff/invitation/*`
8. **Seed reference data**: roles, courses, bundles, learning paths, careers (via admin console or SQL)

### 4.3 Next.js Configuration Highlights (`next.config.mjs`)

- `reactStrictMode: true`
- `devIndicators: false` (disables black "N" badge)
- `images.remotePatterns`: Supabase Storage domains, Zoho, Unsplash
- `rewrites()`: `/admin/login` → `/admin`; `/staff/:path*` → `/admin/:path*` (excludes login/invitation)
- Build command: `next build --webpack` (Turbopack disabled via experimental flag)

---

## 6. Setup & Deployment Steps

### 5.1 Local Development

```bash
# 1. Clone & install
git clone <repo-url>
cd sprint-hb
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase + SMTP credentials

# 3. Run Supabase locally (optional) or use hosted project
# npx supabase start

# 4. Start dev server
npm run dev
# Opens http://localhost:3000
```

### 5.2 Running Tests

```bash
# Full test suite (single-threaded for Supabase mock stability)
npm test
# or
npx vitest run --config vitest.config.mjs --pool=threads --maxWorkers=1

# With UI
npm run test:ui
```

**Current test status:** 200+ tests; 9 pre-existing failures in CareerHero/ContactHero/ContactMethods/HeaderLogo (unrelated to recent changes); all enrollment, auth, admin, chatbot, email tests pass.

### 5.3 Production Build

```bash
npm run build
# Output: .next/ (65 routes: static + dynamic)
# Verifies: TypeScript (tsc --noEmit), sitemap.xml, robots.txt generation
```

### 5.4 Deployment (Vercel Recommended)

1. **Connect repository** to Vercel
2. **Configure Environment Variables** in Vercel Project Settings (all from §4.1)
3. **Build Command**: `npm run build` (auto-detected from `package.json`)
4. **Output Directory**: `.next` (auto-detected)
5. **Deploy** — Vercel handles Edge middleware, ISR, serverless functions automatically

**Alternative: Docker/Node.js**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 5.5 Post-Deployment Verification

| Check | Method |
|-------|--------|
| Public pages load | Visit `/`, `/home`, `/about`, `/courses`, `/contact`, `/careers`, `/terms`, `/privacy` |
| SEO metadata | View source → verify `<title>`, `<meta property="og:*">`, `<link rel="canonical">`, JSON-LD `<script type="application/ld+json">` |
| Sitemap | `https://sprintai.in/sitemap.xml` — 65+ URLs, dynamic routes present |
| Robots | `https://sprintai.in/robots.txt` — disallow rules correct |
| Contact form | Submit test enquiry → verify email received at `SMTP_TO` |
| Student auth | `/student/login` → sign in → `/student/dashboard` loads data |
| Admin auth | `/admin` → sign in as admin → `/admin/dashboard`, `/admin/courses`, `/admin/users` accessible |
| Staff auth | `/staff/login` → sign in → `/staff/dashboard` (rewritten to `/admin/dashboard`) |
| Chatbot | Floating widget → type "courses" → suggestions + reply |
| Announcements | `/admin/updates` → create announcement → public ticker shows within seconds (cache invalidation) |

---

## 7. External Dependencies

### 6.1 Runtime Dependencies (Production)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.4.6 | Framework (App Router, Server Components, Middleware, ISR) |
| `react` / `react-dom` | ^19.3.1 | UI library |
| `@supabase/ssr` | ^0.12.7 | Supabase Auth integration for Server Components & Middleware |
| `@supabase/supabase-js` | ^2.119.0 | Supabase client (browser, server, service-role) |
| `nodemailer` | ^10.3.1 | SMTP email delivery (contact form, transactional emails) |
| `lucide-react` | ^0.525.0 | Icon system |
| `react-icons` | ^5.7.0 | Additional icons (social, UI) |
| `framer-motion` | ^14.2.0 | Animations (hero, testimonials, modals) |
| `clsx` / `tailwind-merge` | ^2.1.1 / ^3.7.0 | Class name utilities |
| `@designcodeio/threeui` | ^1.2.0 | 3D background (used in hero sections) |

### 6.2 Development Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` 7.0.2 | Type checking (`tsc --noEmit`) |
| `vitest` 5.0.1 | Unit test runner |
| `@testing-library/react` 16.3.3 | Component testing |
| `@testing-library/jest-dom` 7.0.1 | DOM matchers |
| `@testing-library/user-event` 14.6.7 | User interaction simulation |
| `happy-dom` / `jsdom` | Test environments |
| `tailwindcss` 4.1.0 + `@tailwindcss/postcss` | Styling (v4 with `@theme`) |
| `@vitejs/plugin-react` 6.1.1 | Vite plugin for Vitest |

### 6.3 External Services (Runtime)

| Service | Purpose | Fallback |
|---------|---------|----------|
| Supabase (PostgreSQL, Auth, Storage, Realtime) | Primary backend | None — required |
| SMTP Provider (Resend/SES/Brevo/SendGrid/Google Workspace) | Instant transactional email | GoTrue built-in mailer (3 emails/hour limit, queued) |
| Ollama (local LLM) | Chatbot enhanced responses | Deterministic rule-based replies (always available) |
| Google Maps Embed | Contact page map | Static image fallback |
| Zoho/Google Drive Preview | Announcement modal file preview | Direct link / download |

---

## 8. Known Limitations & Outstanding Items

### 7.1 Pre-Existing Test Failures (Not Blocking)

| Component | Failure | Root Cause | Status |
|-----------|---------|------------|--------|
| `CareerHero` | 1 test | Link change in commit `8ac3457` not reflected in test | Known, documented in `Test.md` §26 |
| `ContactHero` | 2 tests | Same as above | Known |
| `ContactMethods` | 2 tests | Same as above | Known |
| `HeaderLogo` | 4 tests | Font family change in commit `a20a122` | Known |

**Impact:** None on production functionality. All new code passes tests.

### 7.2 Database Schema Gaps (Supabase-Provisioned, Not in Tracked Migrations)

The following are **provisioned in the live Supabase project but lack tracked SQL migrations** in `src/Supabase/`:

| Table / Resource | Purpose | Risk |
|------------------|---------|------|
| `assessment_submissions` | Student assignment submissions (files, URLs, notes) | Deployment requires manual setup or undocumented migration |
| `live_classes` | Admin live class schedule (Google Meet, Zoom, other) | Same |
| `notification_logs` | Notification audit trail (no current consumer found) | Low — unused |
| `announcements` | Public ticker announcements (separate from `campus_updates`) | Medium — CMS depends on it |
| `assessment-uploads` bucket (private) | Student submission files | Medium — upload/download flows depend on policies |
| `announcement-assets` bucket (public) | Announcement posters/PDFs | Medium — CMS upload depends on it |

**Recommendation:** Document these in a `DEPLOYMENT_NOTES.md` or generate migration SQL from Supabase CLI (`supabase db dump --schema public --data-only=false`) before production deployment.

### 7.3 Incomplete Student Portal Pages

Several `/student/(portal)/*` routes use `StudentPlaceholderPage` (shared component with "Coming Soon" notice):

- `/student/my-course` — placeholder
- `/student/certificates` — placeholder
- `/student/result` — placeholder
- `/student/help-support` — placeholder
- `/student/resources` — placeholder (but linked from dashboard Quick Actions)
- `/student/settings` — placeholder

**Functional pages:** Dashboard, Profile, Apply Course, Assignments.

### 7.4 Admin Sidebar Destinations Without Pages

The admin navigation (`AdminLayoutClient.tsx`) lists these groups/items that **do not have route files**:

- **Admissions & Enquiries** → Students, Institutes, Professionals, Companies — **NOW RESOLVED**: `/admin/enquiries` exists with category tabs AND dedicated pages at `/admin/enquiries/students`, `/admin/enquiries/institutes`, `/admin/enquiries/professionals`, `/admin/enquiries/companies` (added 2026-11-23)
- **Website CMS** → Updates (exists), Scholarships, Partners, Trainers, Results (`.gitkeep` only)
- **Academic & Curriculum** → Assessments (exists), Live Classes (exists), but no "Results" page
- **Access Management** → Roles (exists), Users (exists)

### 7.5 Authentication Flow Gaps

| Gap | Description |
|-----|-------------|
| **Email verification on signup** | Student auth uses magic link / password recovery; no explicit email confirmation flow for new signups (relies on `email_confirm: true` in admin invite) |
| **MFA / 2FA** | Not implemented |
| **Session revocation on password change** | Only sign-out clears session cookies; password change does not invalidate other sessions |
| **Rate limiting on auth endpoints** | Relies on Supabase Auth defaults; no custom middleware rate limiting |

### 7.6 Accessibility & Internationalization

- **i18n**: Hardcoded English only (`en_IN` locale in metadata). No routing or translation infrastructure.
- **WCAG**: Skip link, ARIA on interactive components, focus rings present. No formal audit performed.
- **Reduced motion**: Handled in `FeaturedProgram`, `PartnerCarousel`, `FacultyFilmstrip`, `CampusNewsTicker` via `prefers-reduced-motion`.

### 7.7 Performance Considerations

| Area | Current State | Recommendation |
|------|---------------|----------------|
| **Dashboard queries** | 5 queries parallelized via `Promise.all` (2026-11-09) | Monitor Supabase dashboard for slow queries; add indexes if needed |
| **Ticker caching** | `unstable_cache` 1h + tag invalidation (2026-11-11) | Good — instant invalidation on CMS change |
| **Course catalogue** | ISR 1m + Supabase fallback | Good |
| **Image optimization** | `next/image` with Supabase Storage domains, AVIF/WebP | Good |
| **Bundle size** | Not analyzed | Run `@next/bundle-analyzer` before launch |

---

## 9. Recommended Next Steps

### 8.1 Immediate (Pre-Launch)

1. **Document Supabase-provisioned resources** (`assessment_submissions`, `live_classes`, `announcements`, buckets) — generate migration SQL or create `DEPLOYMENT_NOTES.md` with manual setup steps.
2. **Run full Supabase migration suite** on staging project; verify all 26 migrations apply cleanly.
3. **Configure Custom SMTP** in Supabase Dashboard + Vercel environment variables; test contact form + enrollment magic link delivery end-to-end.
4. **Paste Go-templates** from `src/Supabase/email-templates/` into Supabase Auth Email Templates.
5. **Seed reference data**: roles (admin, staff, instructor, student), courses, bundles, learning paths, career openings via admin console or SQL.
6. **Verify redirect URLs** in Supabase Auth → URL Configuration match production domain.
7. **Load test** `/api/contact` and `/api/chat` under expected traffic.

### 8.2 Short-Term (Post-Launch, 1-4 Weeks)

1. **Complete placeholder student portal pages**: My Course, Certificates, Result, Help & Support, Settings — prioritize based on user feedback.
2. **Implement missing admin pages**: Scholarships, Partners, Trainers, Results CMS (per sidebar navigation).
3. **Add rate limiting** to `/api/contact` and auth endpoints (middleware or edge function).
4. **Set up monitoring**: Vercel Analytics + Supabase Logs + custom error tracking (Sentry/LogRocket).
5. **Accessibility audit**: Run axe-core / Lighthouse; fix any AA violations.
6. **Bundle analysis**: `@next/bundle-analyzer` to identify optimization opportunities.

### 8.3 Medium-Term (1-3 Months)

1. **Student portal enhancements**:
   - Course content viewer (video, PDF, embedded)
   - Progress tracking per module/assessment
   - Certificate generation (PDF) on course completion
   - Discussion forum / Q&A per course
2. **Admin analytics dashboard**: Enrollment funnel, conversion rates, revenue (if pricing added), student engagement.
3. **Automated communications**: Enrollment confirmation, reminder emails, certificate issuance via Supabase Edge Functions + custom SMTP.
4. **Chatbot improvements**: Expand verified Q&A corpus; add intent classification; integrate with course catalogue API for dynamic suggestions.
5. **Internationalization**: Add `next-intl` or similar for Hindi/English support (key for Jharkhand audience).

### 8.4 Technical Debt & Maintenance

| Item | Effort | Priority |
|------|--------|----------|
| Convert remaining `.jsx` Server Components to `.tsx` for full type safety | Medium | Low |
| Replace `happy-dom` with `jsdom` or `happy-dom` latest for better React 19 compat | Low | Low |
| Add ESLint + Prettier config (currently `next lint` broken in Next 16) | Low | Medium |
| Generate OpenAPI spec for `/api/*` routes | Medium | Low |
| Document Supabase RPC contracts (`current_user_has_permission`, `verify_and_approve_enrollment`, `complete_staff_password_reset`) | Low | Medium |

---

## 10. Support & Handover Notes

### 9.1 Key Files for Ongoing Maintenance

| Area | Primary Files |
|------|---------------|
| **Public SEO changes** | `src/app/layout.jsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/config/site.config.json` |
| **Contact form / SMTP** | `src/app/api/contact/route.js`, `src/lib/email/mailer.ts` |
| **Student auth flows** | `src/app/student/*/page.jsx`, `src/app/student/enroll/actions.ts`, `src/components/student/enrollment/*` |
| **Login flows (all roles)** | `src/app/student/login/page.jsx`, `src/app/admin/page.tsx`, `src/app/staff/login/page.tsx`, `src/app/staff/login/StaffLoginForm.tsx`, `src/app/staff/login/actions.ts`, `src/lib/supabase/middleware.ts`, `src/lib/auth/student-session.ts`, `src/lib/auth/admin-session.ts`, `src/lib/student-login-redirect.js`, `src/components/student/student-session.js` |
| **Student portal data** | `src/app/student/(portal)/dashboard/page.jsx`, `src/lib/student-assessment-access.ts`, `src/components/student/dashboard/DashboardBento.jsx`, `src/lib/student-portal-session-guard.ts` |
| **Admin RBAC / permissions** | `src/app/admin/auth-types.ts`, `src/app/admin/authorization.ts`, `src/app/admin/roles/*`, `src/app/admin/session.ts` |
| **Course/bundle/learning path admin** | `src/app/admin/courses/*`, `src/lib/course-utils.ts` |
| **Announcements / ticker** | `src/app/admin/updates/*`, `src/components/layout/CampusNewsTicker.tsx` |
| **Chatbot logic** | `src/app/chatbot/chatbot-core.js`, `src/app/chatbot/chatbot-service.server.js`, `data/chatbot/*.json` |
| **Transactional emails** | `src/lib/email/templates/*.ts`, `src/Supabase/email-templates/*.html` |
| **Database schema** | `src/Supabase/*.sql` (apply in filename order) |
| **Staff directory management** | `src/lib/supabase/staff.ts`, `src/components/admin/users/UserDirectoryTable.tsx`, `src/components/admin/roles/CreateUserModal.tsx` |
| **Enquiry management** | `src/app/admin/enquiries/*`, `src/components/admin/EnquiriesCategoryView.tsx`, `src/components/admin/enquiries-types.ts` |
| **Video components** | `src/components/Home/BrandVideo.jsx`, `src/components/Home/SmeVideo.jsx` |

### 9.2 Common Operational Tasks

| Task | How To |
|------|--------|
| **Add a new course** | `/admin/courses` → "Create Course" → fill form (audience, delivery, difficulty, duration, curriculum JSON, tools, outcomes) → Save |
| **Create a signature program** | `/admin/courses` → "Flagship Programs" tab → Create → type "signature" → appears on `/home` featured + `/programs/*` |
| **Add learning path** | `/admin/courses` → "Learning Paths" tab → Create → add stages (title, hours, courses/bundles) |
| **Post an announcement** | `/admin/updates` → Create → title, content, optional poster upload, link URL, expiry → Save (invalidates public ticker cache instantly) |
| **Provision staff** | `/admin/users` → "Add Staff" → fill name, email, role, temp password → generates magic URL → share with staff |
| **Approve enrollment** | `/admin/students/enrollments` → "Verify & Approve" on pending row → RPC creates student + registration number + course mapping |
| **Update contact info** | Edit `src/config/site.config.json` → redeploy (all components read from this single source) |
| **Rebuild chatbot Q&A** | Edit `data/chatbot/*.json` → `npm run chatbot:qa:build` → regenerates `sprint-qa-master.json` |

### 9.3 Escalation Contacts (Internal)

| Domain | Contact |
|--------|---------|
| Supabase / Database | [Internal DevOps] |
| SMTP / Email Delivery | [Internal DevOps] |
| Vercel Deployment | [Internal DevOps] |
| Chatbot / Ollama | [AI/ML Team] |
| Content / Marketing | [Marketing Team] |

---

## 11. Appendix: Route Inventory (Current as of 2026-11-25)

### Public Routes (65 total at build)

| Route | Type | Revalidate | Notes |
|-------|------|------------|-------|
| `/` | Static | 1h | Redirect to `/home`, noindex |
| `/home` | Static | 1m | Hero, marquee, featured, courses, faculty, testimonials, FAQ, CTA |
| `/about` | Static | 1h | 10-section spec, JSON-LD Organization |
| `/courses` | Static | 1m | Catalogue with filters, ISR |
| `/courses/[slug]` | Dynamic | 1h | Course detail, JSON-LD Course |
| `/bundles/[slug]` | Dynamic | 1h | Bundle/flagship detail, JSON-LD Course |
| `/learning-paths/[slug]` | Dynamic | 1h | Learning path detail |
| `/programs/sprint-rise` | Static | 1h | Signature program |
| `/programs/career-accelerator` | Static | 1h | Signature program |
| `/careers` | Static | 1h | Jobs + modal, JSON-LD JobPosting[] |
| `/contact` | Static | 1h | 4-audience form, map, FAQ, JSON-LD FAQPage |
| `/terms` | Static | 1h | Compact legal |
| `/privacy` | Static | 1h | Compact legal |
| `/login` | Static | 1h | Public auth |
| `/forgot-password` | Static | 1h | Public auth |
| `/set-password` | Static | 1h | Public auth callback |
| `/sitemap.xml` | Static | — | Auto-generated |
| `/robots.txt` | Static | — | Auto-generated |

### Student Auth & Enrollment

| Route | Type | Notes |
|-------|------|-------|
| `/student/login` | Static | Sign in |
| `/student/forgot-password` | Static | Email entry |
| `/student/check-email` | Static | Resend cooldown |
| `/student/reset-password` | Static | OTP + password |
| `/student/password-reset-success` | Static | Confirmation |
| `/student/enroll` | Static | **3-step wizard** (Personal Info → Specialization → Account), pre-select via `?course=`/`?bundle=` |

### Student Portal (Protected)

| Route | Status |
|-------|--------|
| `/student/dashboard` | **Functional** — server data, DashboardBento |
| `/student/profile` | **Functional** — Supabase profile + edit |
| `/student/apply-course` | Placeholder |
| `/student/my-course` | Placeholder |
| `/student/assignments` | **Functional** — submissions, file upload |
| `/student/certificates` | Placeholder |
| `/student/result` | Placeholder |
| `/student/help-support` | Placeholder |
| `/student/resources` | Placeholder (linked from dashboard) |
| `/student/settings` | Placeholder |

### Admin (Protected)

| Route | Status |
|-------|--------|
| `/admin` | Login / redirect |
| `/admin/dashboard` | **Functional** |
| `/admin/courses` | **Functional** — CRUD, filters, dialogs |
| `/admin/roles` | **Functional** — RBAC, staff provisioning |
| `/admin/users` | **Functional** — staff list, invite, delete |
| `/admin/updates` | **Functional** — CMS + instant cache invalidation |
| `/admin/enquiries` | **Functional** — category tabs |
| `/admin/enquiries/students` | **Functional** — student enquiries category |
| `/admin/enquiries/institutes` | **Functional** — institute enquiries category |
| `/admin/enquiries/professionals` | **Functional** — professional enquiries category |
| `/admin/enquiries/companies` | **Functional** — company enquiries category |
| `/admin/students/registrations` | **Functional** — course-free only |
| `/admin/students/enrollments` | **Functional** — approve/reject via RPC |
| `/admin/students/list` | **Functional** — multi-table course resolution |
| `/admin/academics/assessments/assign` | **Functional** — KPI, grouped selector, grading |
| `/admin/academics/live-classes` | **Functional** — CRUD, status |

### Staff (Rewritten to Admin)

| Route | Notes |
|-------|-------|
| `/staff/login` | Staff sign-in |
| `/staff/invitation/[token]` | Invitation acceptance |
| `/staff/dashboard` | Rewritten to `/admin/dashboard` |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/contact` | POST | Contact form → email |
| `/api/chat` | POST, GET, OPTIONS | Chatbot |
| `/api/ai-chat` | POST | Compatibility endpoint |

---

**End of Delivery Document**  
*This document reflects the codebase state as of commit dated 2026-11-25. All statements are based on actual project files; items marked as missing, incomplete, or ambiguous are explicitly flagged.*

**Related Documentation:**
- `docs/md/SPRINT_SUPABASE_DATABASE_MIGRATION_REFERENCE.md` — Complete database migration reference
- `docs/md/STUDENT_DASHBOARD_ACCESS_FIX.md` — Student dashboard access fix details
- `docs/md/Staff_User_and_Roles_Flow.md` — Staff user provisioning and role assignment flow documentation