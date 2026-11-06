"use server";

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { isSmtpConfigured, sendPasswordSetupEmail } from "@/lib/email/mailer";
import { generateNextApplicationId } from "@/lib/id-utils";

export type StudentEnrollmentInput = {
  personal?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dob?: string;
    country?: string;
    state?: string;
    phone?: string;
  };
  education?: {
    courseDegree?: string;
    semesterYear?: string;
    currentRole?: string;
    course?: string;
  };
};

export type StudentEnrollmentResult =
  | {
    success: true;
    applicationId: string;
    message: string;
    passwordSetupEmailSent: boolean;
  }
  | { success: false; error: string };

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D+/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;

  const maxDayInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > maxDayInMonth) return false;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getTime() <= today.getTime();
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isPendingEmailDuplicateInsertError(
  error: { code?: string; message?: string; details?: string; constraint?: string } | null | undefined,
): boolean {
  if (!error || error.code !== "23505") return false;

  const haystack = [error.message ?? "", error.details ?? "", error.constraint ?? ""]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("enrollments_one_pending_per_email_idx") ||
    haystack.includes("pending_per_email") ||
    haystack.includes("one_pending_per_email")
  );
}

export async function submitStudentEnrollmentAction(
  input: StudentEnrollmentInput,
): Promise<StudentEnrollmentResult> {
  try {
    const personal = input?.personal ?? {};
    const education = input?.education ?? {};

    const firstName = asText(personal.firstName);
    const lastName = asText(personal.lastName);
    const email = asText(personal.email).toLowerCase();
    const dob = asText(personal.dob);
    const state = asText(personal.state);
    const phone = normalizePhone(asText(personal.phone));
    const country = asText(personal.country);

    const courseDegree = asText(education.courseDegree);
    const semesterYear = asText(education.semesterYear);
    const currentRole = asText(education.currentRole);
    const rawCourseId = asText(education.course);

    if (!firstName || !NAME_PATTERN.test(firstName)) {
      return { success: false, error: "Please enter a valid first name." };
    }

    if (!lastName || !NAME_PATTERN.test(lastName)) {
      return { success: false, error: "Please enter a valid last name." };
    }

    if (!email || !EMAIL_PATTERN.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
      return {
        success: false,
        error: "Email verification is temporarily unavailable. Please try again later.",
      };
    }

    const cookieStore = await cookies();
    const authClient = createServerClient(supabaseUrl, publishableKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError) {
      return {
        success: false,
        error: "Your email verification could not be confirmed. Please open the latest verification link and try again.",
      };
    }
    if (
      !authData.user?.email_confirmed_at ||
      authData.user.email?.toLowerCase() !== email
    ) {
      return {
        success: false,
        error: "Please verify the same email address you entered before submitting your enrollment.",
      };
    }

    if (!dob || !isValidDate(dob)) {
      return { success: false, error: "Please enter your date of birth." };
    }

    if (!country) {
      return { success: false, error: "Please select your country." };
    }

    if (!state) {
      return { success: false, error: "Please select your state." };
    }

    if (!phone || phone.length !== 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." };
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
      return { success: false, error: "Server-side Supabase is not configured." };
    }

    let resolvedCourseId: string | null = null;
    let resolvedBundleId: string | null = null;

    if (rawCourseId) {
      if (isUuid(rawCourseId)) {
        const { data: course, error: courseError } = await serviceClient
          .from("courses")
          .select("id")
          .eq("id", rawCourseId)
          .maybeSingle();

        if (courseError) {
          return {
            success: false,
            error: `The selected course could not be verified: ${courseError.message}`,
          };
        }

        if (course) {
          resolvedCourseId = course.id;
        } else {
          const { data: bundle } = await serviceClient
            .from("course_bundles")
            .select("id")
            .eq("id", rawCourseId)
            .maybeSingle();

          if (bundle) {
            resolvedBundleId = bundle.id;
          } else {
            return { success: false, error: "The selected course is no longer available." };
          }
        }
      } else {
        // Resolve slug against courses and bundles
        const { data: courseBySlug } = await serviceClient
          .from("courses")
          .select("id")
          .eq("slug", rawCourseId)
          .maybeSingle();

        if (courseBySlug) {
          resolvedCourseId = courseBySlug.id;
        } else {
          const { data: bundleBySlug } = await serviceClient
            .from("course_bundles")
            .select("id")
            .eq("slug", rawCourseId)
            .maybeSingle();

          if (bundleBySlug) {
            resolvedBundleId = bundleBySlug.id;
          } else {
            return { success: false, error: "The selected course is invalid." };
          }
        }
      }
    }

    const { data: existingPending, error: duplicateCheckError } = await serviceClient
      .from("enrollments")
      .select("id")
      .eq("email", email)
      .eq("status", "pending")
      .limit(1);

    if (duplicateCheckError) {
      return {
        success: false,
        error: `Could not verify a duplicate submission: ${duplicateCheckError.message}`,
      };
    }

    if (existingPending && existingPending.length > 0) {
      return {
        success: false,
        error: "A pending registration for this email already exists. Please review your earlier submission.",
      };
    }

    const applicationNumber = await generateNextApplicationId(serviceClient);

    const payload = {
      application_number: applicationNumber,
      course_id: resolvedCourseId,
      bundle_id: resolvedBundleId,
      batch_id: null,
      full_name: `${firstName} ${lastName}`,
      email,
      phone,
      college_institution: null,
      course_degree: courseDegree || null,
      specialization_branch: null,
      year_semester: semesterYear || null,
      city: null,
      state: state || null,
      employment_status: currentRole || null,
      organization_name: null,
      source_of_info: null,
      terms_accepted: false,
      communication_consent: false,
      applicant_user_id: authData.user.id,
      status: "pending",
      admin_notes: null,
    };

    const { data: inserted, error: insertError } = await serviceClient
      .from("enrollments")
      .insert(payload)
      .select("id, application_number")
      .single();

    if (insertError) {
      if (isPendingEmailDuplicateInsertError(insertError)) {
        return {
          success: false,
          error: "A pending registration for this email already exists. Please review your earlier submission.",
        };
      }

      return {
        success: false,
        error: insertError.message ?? "The enrollment could not be saved right now.",
      };
    }

    if (!inserted?.id) {
      return {
        success: false,
        error: "The enrollment could not be saved right now.",
      };
    }

    const confirmedApplicationId = inserted.application_number || applicationNumber;

    let passwordSetupEmailSent = false;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      console.error("Password setup email was not sent: NEXT_PUBLIC_SITE_URL is not configured.");
    } else {
      const redirectTo = new URL("/set-password", siteUrl).toString();

      // If custom SMTP is configured, attempt immediate direct sending via Nodemailer & Supabase generateLink
      if (isSmtpConfigured() && serviceClient?.auth?.admin?.generateLink) {
        try {
          const { data: linkData, error: linkError } =
            await serviceClient.auth.admin.generateLink({
              type: "recovery",
              email,
              options: { redirectTo },
            });

          if (!linkError && linkData?.properties?.action_link) {
            const sendResult = await sendPasswordSetupEmail(
              { email, name: `${firstName} ${lastName}`.trim() },
              {
                actionUrl: linkData.properties.action_link,
                fullName: `${firstName} ${lastName}`.trim(),
                courseName: (resolvedCourseId || resolvedBundleId) ? "SPRINT Applied Program" : undefined,
                applicationId: confirmedApplicationId,
              }
            );

            if (sendResult.success) {
              passwordSetupEmailSent = true;
            }
          }
        } catch (immediateSendError) {
          console.warn(
            "[Enrollment] Direct immediate email dispatch failed, falling back to authClient:",
            immediateSendError,
          );
        }
      }

      // Fallback to Supabase GoTrue mailer if not sent directly
      if (!passwordSetupEmailSent) {
        try {
          const { error: passwordSetupError } =
            await authClient.auth.resetPasswordForEmail(email, {
              redirectTo,
            });

          if (passwordSetupError) {
            console.error("Password setup email could not be sent:", passwordSetupError.message);
          } else {
            passwordSetupEmailSent = true;
          }
        } catch (passwordSetupError) {
          console.error("Password setup email could not be sent:", passwordSetupError);
        }
      }
    }

    return {
      success: true,
      applicationId: confirmedApplicationId,
      passwordSetupEmailSent,
      message: passwordSetupEmailSent
        ? "Your enrollment has been received. Check your email to set your password and sign in to view your application status."
        : "Your enrollment has been received, but we couldn't send the password setup email. Use Forgot Password on the student sign-in page to set your password.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your enrollment.",
    };
  }
}
