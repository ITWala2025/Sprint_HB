# SPRINT Branded Supabase Auth Email Templates

This directory contains the production-ready, responsive, brand-aligned HTML email templates for all Supabase Auth (GoTrue) workflows in the **SPRINT Institutional Training Hub**.

---

## 🎨 Brand Design Tokens Applied

- **Primary Brand Navy:** `#011f3e` (Header background & headings)
- **Brand Navy Dark:** `#001831` (Footer background)
- **Accent Brand Red:** `#f81529` (Primary CTA buttons, badges & accent rules)
- **Surfaces:** `#ffffff` (Container card), `#f8fafc` (Body canvas), `#e2e8f0` (Borders)
- **Text:** `#0f172a` (Headings), `#334155` (Body copy), `#64748b` (Muted/disclaimers)
- **Compatibility:** Responsive table layout tested across Gmail, Outlook (desktop/web/mobile), Apple Mail, and mobile inboxes.

---

## 📋 Template Mapping

| Template File | Supabase Dashboard Location | Go Template Variables | Purpose |
| :--- | :--- | :--- | :--- |
| `magic-link.html` | **Authentication → Email Templates → Magic Link** | `{{ .ConfirmationURL }}`, `{{ .Token }}` | Student email verification (Step 3) & passwordless login |
| `reset-password.html` | **Authentication → Email Templates → Reset Password** | `{{ .ConfirmationURL }}`, `{{ .Token }}` | Student enrollment password setup & password recovery |
| `invite-user.html` | **Authentication → Email Templates → Invite User** | `{{ .ConfirmationURL }}`, `{{ .Email }}` | Staff/instructor account invite & student admission invite |
| `confirm-signup.html` | **Authentication → Email Templates → Confirm Signup** | `{{ .ConfirmationURL }}`, `{{ .Token }}` | Standard account registration confirmation |
| `change-email.html` | **Authentication → Email Templates → Change Email Address** | `{{ .ConfirmationURL }}`, `{{ .NewEmail }}` | Profile email update verification |

---

## ⚡ How to Eliminate Email Lag & Send Immediately

### Why Default Supabase Auth Emails Have Lag:
1. **Shared Email Queue**: Default Supabase projects use a shared internal pool that throttles delivery and experiences queuing delays (2 to 15+ minutes).
2. **Strict Rate Limiting**: Supabase imposes a limit of **3 emails per hour** on default projects.
3. **Spam Filtering / Greylisting**: Default emails come from shared Supabase IPs without your domain SPF/DKIM authentication.

### How to Fix It (Instant Sub-Second Delivery):
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: `vrapmahhtmhflaqbubux`.
3. Navigate to **Project Settings** → **Authentication** → **SMTP Settings**.
4. Toggle **"Enable Custom SMTP"** to **ON**.
5. Enter your SMTP details (e.g., **Hostinger Email**, **Resend**, or **Amazon SES**):

   **Hostinger Email Configuration:**
   - **Sender Email**: `info@sprint.naturalelements.co.in` (or your domain mailbox)
   - **Sender Name**: `SPRINT Institutional Training Hub`
   - **Host**: `smtp.hostinger.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **User**: `info@sprint.naturalelements.co.in` (your full Hostinger email)
   - **Password**: `<YOUR_HOSTINGER_EMAIL_PASSWORD>`

   *(Or use Resend: `smtp.resend.com` on port 587 with user `resend` and API key as password)*
6. Click **Save Changes**.

Once enabled, every auth trigger (magic link, password recovery, invite) bypasses the Supabase queue and is dispatched **immediately (< 1-2 seconds)**!

---

## 🚀 How to Apply the Templates in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **Email Templates**.
2. Select each template tab (e.g., **Magic Link**).
3. Set the **Subject** according to the table above.
4. Open the corresponding `.html` file from this folder, copy its complete contents, and paste into the **Message Body (HTML)** editor.
5. Click **Save**.

