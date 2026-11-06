/**
 * SPRINT Go-Template strings for Supabase Auth Dashboard
 * These templates are compatible with the Go template parser in Supabase GoTrue.
 */

export interface SupabaseDashboardTemplate {
  name: string;
  type: "magic_link" | "recovery" | "invite" | "confirmation" | "email_change";
  subject: string;
  filename: string;
}

export const SUPABASE_EMAIL_TEMPLATES_CATALOG: SupabaseDashboardTemplate[] = [
  {
    name: "Magic Link",
    type: "magic_link",
    subject: "Sign in to SPRINT Institutional Training Hub",
    filename: "magic-link.html",
  },
  {
    name: "Reset Password",
    type: "recovery",
    subject: "Reset your SPRINT Account password",
    filename: "reset-password.html",
  },
  {
    name: "Invite User",
    type: "invite",
    subject: "You have been invited to SPRINT Institutional Training Hub",
    filename: "invite-user.html",
  },
  {
    name: "Confirm Signup",
    type: "confirmation",
    subject: "Confirm your SPRINT registration",
    filename: "confirm-signup.html",
  },
  {
    name: "Change Email Address",
    type: "email_change",
    subject: "Confirm your new email address for SPRINT",
    filename: "change-email.html",
  },
];

