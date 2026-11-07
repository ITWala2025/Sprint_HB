"use server";

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { formatApplicationId, isUuid } from "@/lib/id-utils";

type ProductSelection = {
  course_id: string | null;
  bundle_id: string | null;
};

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
    collegeInstitution?: string;
    courseDegree?: string;
    semesterYear?: string;
    currentRole?: string;
    course?: string;
    courseIds?: string[];
    bundleIds?: string[];
  };
};

export type StudentEnrollmentResult =
  | {
      success: true;
      applicationId: string;
      message: string;
      hasCourseEnrollment: boolean;
    }
  | { success: false; error: string };

export type EnrollmentEmailCheckResult =
  | { success: true; exists: boolean }
  | { success: false; error: string };

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SELECTED_PRODUCTS = 10;

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
  return new Date(Date.UTC(year, month - 1, day)).getTime() <= today.getTime();
}

function readSelections(values: StudentEnrollmentInput["education"]): {
  courseIds: string[];
  bundleIds: string[];
} {
  const rawCourseIds = values?.courseIds;
  const rawBundleIds = values?.bundleIds;
  if (
    (rawCourseIds !== undefined && !Array.isArray(rawCourseIds)) ||
    (rawBundleIds !== undefined && !Array.isArray(rawBundleIds)) ||
    rawCourseIds?.some((value) => typeof value !== "string") ||
    rawBundleIds?.some((value) => typeof value !== "string")
  ) {
    throw new Error("The selected course information is invalid.");
  }

  const courseIds = (rawCourseIds ?? []).map(asText).filter(Boolean);
  const bundleIds = (rawBundleIds ?? []).map(asText).filter(Boolean);
  if (courseIds.length === 0 && bundleIds.length === 0 && asText(values?.course)) {
    courseIds.push(asText(values?.course));
  }

  if (courseIds.length + bundleIds.length > MAX_SELECTED_PRODUCTS) {
    throw new Error(`Please select no more than ${MAX_SELECTED_PRODUCTS} courses or bundles.`);
  }

  const allIds = [...courseIds, ...bundleIds];
  if (new Set(allIds).size !== allIds.length) {
    throw new Error("The same course or bundle cannot be selected more than once.");
  }

  return { courseIds, bundleIds };
}

async function resolveProducts(
  serviceClient: NonNullable<ReturnType<typeof createServiceClient>>,
  courseIds: string[],
  bundleIds: string[],
): Promise<ProductSelection[]> {
  const products: ProductSelection[] = [];

  for (const [table, selections, key] of [
    ["courses", courseIds, "course_id"],
    ["course_bundles", bundleIds, "bundle_id"],
  ] as const) {
    for (const selection of selections) {
      const field = isUuid(selection) ? "id" : "slug";
      const { data, error } = await serviceClient
        .from(table)
        .select("id")
        .eq(field, selection)
        .eq("is_published", true)
        .maybeSingle();

      if (error) {
        throw new Error(`The selected ${key === "course_id" ? "course" : "bundle"} could not be verified: ${error.message}`);
      }
      if (!data?.id) {
        throw new Error("A selected course or bundle is no longer available.");
      }

      products.push({
        course_id: key === "course_id" ? data.id : null,
        bundle_id: key === "bundle_id" ? data.id : null,
      });
    }
  }

  return products;
}

export async function checkEnrollmentEmailAction(
  rawEmail: string,
): Promise<EnrollmentEmailCheckResult> {
  const email = asText(rawEmail).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return { success: false, error: "Email verification is temporarily unavailable." };
  }

  const { data, error } = await serviceClient.rpc("check_auth_email_exists", {
    p_email: email,
  });
  if (error) {
    console.error("Enrollment email lookup failed:", error.message);
    return { success: false, error: "We couldn't check this email. Please try again." };
  }

  return { success: true, exists: data === true };
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
    const country = asText(personal.country);
    const state = asText(personal.state);
    const phone = normalizePhone(asText(personal.phone));
    const courseDegree = asText(education.courseDegree);
    const semesterYear = asText(education.semesterYear);
    const currentRole = asText(education.currentRole);

    if (!firstName || !NAME_PATTERN.test(firstName)) {
      return { success: false, error: "Please enter a valid first name." };
    }
    if (!lastName || !NAME_PATTERN.test(lastName)) {
      return { success: false, error: "Please enter a valid last name." };
    }
    if (!email || !EMAIL_PATTERN.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!dob || !isValidDate(dob)) {
      return { success: false, error: "Please enter a valid date of birth." };
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

    const { courseIds, bundleIds } = readSelections(education);
    const collegeInstitution = asText(education.collegeInstitution);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publishableKey) {
      return { success: false, error: "Email verification is temporarily unavailable." };
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
    if (
      authError ||
      !authData.user?.email_confirmed_at ||
      authData.user.email?.toLowerCase() !== email
    ) {
      return {
        success: false,
        error: "Verify the same email address you entered before submitting your registration.",
      };
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
      return { success: false, error: "Server-side Supabase is not configured." };
    }
    const products = await resolveProducts(serviceClient, courseIds, bundleIds);

    const { data, error } = await serviceClient.rpc("submit_student_intake", {
      p_user_id: authData.user.id,
      p_full_name: `${firstName} ${lastName}`,
      p_email: email,
      p_phone: phone,
      p_college_institution: collegeInstitution || null,
      p_date_of_birth: dob,
      p_country: country,
      p_state: state,
      p_course_degree: courseDegree || null,
      p_year_semester: semesterYear || null,
      p_employment_status: currentRole || null,
      p_products: products,
    });

    if (error) {
      console.error("Student intake submission failed:", error.message);
      if (error.message.toLowerCase().includes("pending course application")) {
        return {
          success: false,
          error: "A pending application already exists for one of these courses. Please review your earlier submission.",
        };
      }
      return {
        success: false,
        error: "Your registration could not be saved. Please try again.",
      };
    }
    if (!data?.registration_id) {
      return { success: false, error: "The registration could not be saved right now." };
    }

    const hasCourseEnrollment = Number(data.enrollment_count) > 0;
    return {
      success: true,
      applicationId:
        data.application_id ||
        formatApplicationId(null, data.registration_id),
      hasCourseEnrollment,
      message: hasCourseEnrollment
        ? "Your registration and course enrollment have been submitted for review."
        : "Your registration has been saved. You can apply for a course later.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your registration.",
    };
  }
}
