# SPRINT Technical Guide: Supabase Auth Email Delivery Optimization & Branded Templates

> **Target Audience**: SPRINT Engineering Team, System Administrators  
> **Scope**: Supabase Auth (GoTrue), Instant Delivery Optimization, Nodemailer Dispatcher, Branded Email Workflows  
> **Status**: Production Ready

---

## 1. Executive Summary & Problem Investigation

### 1.1 The Symptom
Transactional emails dispatched by Supabase Auth (student email verification magic links, post-enrollment password setup links, password reset emails, and staff invitations) frequently experience notable delays (ranging from 2 to 15+ minutes) or get intermittently throttled.

### 1.2 Root Cause Analysis: Why Supabase Auth Emails Experience Lag
There are four interconnected reasons why default Supabase authentication emails lag:

1. **Shared Built-in Queue (Inbucket / Internal GoTrue Pool)**:
   By default, Supabase routes all outbound emails through a centralized, shared mail relay pool. Every free/trial project across Supabase shares this outbound infrastructure. During peak hours or high queue congestion, outbound requests are placed into a FIFO queue and delayed.
2. **Aggressive Rate Limiting (3 Emails / Hour Default)**:
   The built-in Supabase mailer strictly caps project throughput to **3 to 4 emails per hour** on standard configurations. When a user submits multiple OTPs or clicks "Resend", subsequent messages are throttled or delayed.
3. **Sender Reputation & Greylisting Delays**:
   Default emails originate from shared IP ranges (e.g., `mail.app.supabase.io`). Major inbox providers (Google Gmail, Microsoft Outlook / Office 365, Yahoo) enforce strict greylisting and rate-limiting heuristics on shared developer IPs that lack custom SPF, DKIM, and DMARC alignment for the recipient's institutional domain, delaying delivery to the inbox by several minutes.
4. **Supabase Official Architecture Requirement**:
   Supabase documentation states explicitly:
   > *"The built-in email service is meant for testing and development only. It has a rate limit of 3 emails per hour and emails may be delayed. For any staging or production application, configuring custom SMTP or an Auth Hook is required."*

---

## 2. Solution: Zero-Lag Instant Delivery

To guarantee that an email is dispatched **immediately (< 1-2 seconds)** after an auth trigger is hit, SPRINT employs a dual-tier strategy:

```
                                  [Auth Event Triggered]
                                             │
             ┌───────────────────────────────┴──────────────────────────────┐
             ▼                                                              ▼
   [Tier 1: Client/Supabase Core]                             [Tier 2: Server Actions & Direct Dispatch]
   e.g. signInWithOtp, resetPassword                          e.g. submitStudentEnrollmentAction, Admin Invite
             │                                                              │
             ▼                                                              ▼
   [Supabase Dashboard SMTP]                                  [isSmtpConfigured() Check]
   Direct TLS socket to Resend / SES / SendGrid                              │
             │                                               ┌──────────────┴──────────────┐
             ▼                                               ▼                             ▼
   Dispatched in < 500ms                                 [Yes: Instant]               [No: Fallback]
   to Recipient Inbox                                 serviceClient.generateLink   Supabase auth.resetPassword
                                                             │                     (Still fast if SMTP set in DB)
                                                             ▼
                                                      Nodemailer SMTP
                                                      Instant < 500ms
```

### 2.1 Tier 1: Configure Custom SMTP in Supabase Dashboard (Primary)
When Custom SMTP is enabled in Supabase, GoTrue replaces its internal queue with a direct, synchronous TLS connection to your dedicated provider:

1. Go to **Supabase Dashboard** → **Project Settings** (`vrapmahhtmhflaqbubux`) → **Authentication** → **SMTP Settings**.
2. Toggle **Enable Custom SMTP** to **ON**.
3. Configure your provider credentials:

#### Recommended Provider Configurations:

* **Option A: Hostinger Email SMTP (Existing Domain Email — No Extra Service Needed)**
  - **Host**: `smtp.hostinger.com`
  - **Port**: `465` (SSL) or `587` (TLS)
  - **Username**: `info@sprint.naturalelements.co.in` (your Hostinger account email)
  - **Password**: `<YOUR_HOSTINGER_EMAIL_PASSWORD>`
  - **Sender Email**: `info@sprint.naturalelements.co.in`
  - **Sender Name**: `SPRINT Institutional Training Hub`

* **Option B: Resend (Developer API / Transactional)**
  - **Host**: `smtp.resend.com`
  - **Port**: `587`
  - **Username**: `resend`
  - **Password**: `re_your_resend_api_key`
  - **Sender Email**: `noreply@sprint.institute` (or verified domain email)
  - **Sender Name**: `SPRINT Institutional Training Hub`

* **Option B: Amazon SES**
  - **Host**: `email-smtp.<region>.amazonaws.com`
  - **Port**: `587`
  - **Username**: `<YOUR_SES_SMTP_USERNAME>`
  - **Password**: `<YOUR_SES_SMTP_PASSWORD>`

* **Option C: Brevo (formerly Sendinblue)**
  - **Host**: `smtp-relay.brevo.com`
  - **Port**: `587`
  - **Username**: `<YOUR_BREVO_LOGIN>`
  - **Password**: `<YOUR_BREVO_SMTP_KEY>`

* **Option D: SendGrid**
  - **Host**: `smtp.sendgrid.com`
  - **Port**: `587`
  - **Username**: `apikey`
  - **Password**: `<YOUR_SENDGRID_API_KEY>`

* **Option E: Google Workspace / Gmail SMTP (Dev/Staging Quickstart)**
  - **Host**: `smtp.gmail.com`
  - **Port**: `587`
  - **Username**: `your-admin-email@gmail.com`
  - **Password**: `<GOOGLE_16_DIGIT_APP_PASSWORD>`

### 2.2 Tier 2: In-App Immediate Dispatching (Nodemailer Transporter)
For server-side workflows (student enrollment completion, staff onboarding, admission approvals), SPRINT includes a built-in mailer (`src/lib/email/mailer.ts`):
- Uses pooled Nodemailer connections (`maxConnections: 5`, `maxMessages: 100`).
- Generates action tokens via `serviceClient.auth.admin.generateLink()`.
- Directly dispatches branded HTML emails immediately upon trigger without waiting on any external GoTrue queuing.
- Automatically falls back to Supabase GoTrue if SMTP variables are not populated.

#### Environment Variables (`.env`):
```env
# SPRINT Instant Outbound Email Configuration (Hostinger SMTP Example)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@sprint.naturalelements.co.in
SMTP_PASS=your_hostinger_email_password
SMTP_FROM="SPRINT Institutional Training Hub" <info@sprint.naturalelements.co.in>
SMTP_SECURE=true
```

---

## 3. Branded Email Templates Catalog

All SPRINT transactional emails use unified design tokens from `src/css/global.css`:
- **Header**: Deep Navy `#011f3e` with SPRINT brand badge and verified indicator.
- **Accent Line & Buttons**: SPRINT Red `#f81529` with `#ffffff` bold text.
- **Surfaces**: Canvas `#f8fafc`, Card `#ffffff`, Border `#e2e8f0`.
- **Typography**: Responsive system typography stack with Space Grotesk / Inter fallback.
- **Footer**: SPRINT Centre Hazaribagh physical address, phone, email, and security advisory.

### Workflows & Template Inventory

| Workflow | Trigger Point | In-App Renderer | Supabase Template File |
| :--- | :--- | :--- | :--- |
| **Student Enrollment Verification** | Step 3 of `/student/enroll` | `renderVerificationEmail` | `src/Supabase/email-templates/magic-link.html` |
| **Student Password Setup** | Form submit in `/student/enroll` | `renderPasswordSetupEmail` | `src/Supabase/email-templates/reset-password.html` |
| **Password Reset (Student & Admin)** | `/student/forgot-password`, `/admin` | `renderPasswordResetEmail` | `src/Supabase/email-templates/reset-password.html` |
| **Staff & Instructor Invitation** | `/admin/users` (Invite Staff) | `renderStaffInviteEmail` | `src/Supabase/email-templates/invite-user.html` |
| **Admission Approval & Welcome** | `/admin/students/enrollments` (Approve) | `renderEnrollmentApprovedEmail` | `src/Supabase/email-templates/invite-user.html` |
| **Confirm Signup** | Standard Supabase user registration | `renderBaseEmailLayout` | `src/Supabase/email-templates/confirm-signup.html` |
| **Change Email Address** | Profile email update | `renderBaseEmailLayout` | `src/Supabase/email-templates/change-email.html` |

---

## 4. Verification Checklist

1. [x] **Investigation**: Documented root causes of email lag (default mailer queue, 3/hour rate limit, lack of SPF/DKIM).
2. [x] **Immediate Delivery**: Implemented pooled Nodemailer service in `src/lib/email/mailer.ts` + Supabase Custom SMTP configuration guide.
3. [x] **Server Integration**: Integrated immediate dispatch into `src/app/student/enroll/actions.ts` with graceful fallback.
4. [x] **Branded Templates**: Created 5 custom HTML templates in `src/Supabase/email-templates/` and corresponding TypeScript renderers in `src/lib/email/templates/`.
5. [x] **Automated Tests**: Added unit tests covering templates, mailer, and Supabase catalog in `tests/unit/email/`.

