export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export interface BaseEmailTemplateData {
  fullName?: string;
  actionUrl: string;
  expiresInMinutes?: number;
}

export interface VerificationEmailData extends BaseEmailTemplateData {
  token?: string;
}

export interface PasswordSetupEmailData extends BaseEmailTemplateData {
  courseName?: string;
  isEnrollment?: boolean;
  applicationId?: string;
}

export interface PasswordResetEmailData extends BaseEmailTemplateData {
  userRole?: "student" | "staff" | "admin";
}

export interface StaffInviteEmailData extends BaseEmailTemplateData {
  roleName: string;
  tempPassword?: string;
}

export interface EnrollmentApprovedEmailData {
  fullName: string;
  courseName?: string;
  studentId?: string;
  applicationId?: string;
  portalUrl: string;
}

