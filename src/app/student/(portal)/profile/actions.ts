"use server";

import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/service";

export type StudentProfileData = {
  id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  registration_number?: string;
  college?: string;
  degree?: string;
  semester?: string;
  github?: string;
  linkedin?: string;
  leetcode?: string;
};

export type StudentProfileResult =
  | { success: true; profile: StudentProfileData }
  | { success: false; error: string };

function parseSocialsFromBio(bioText: string | null | undefined): {
  github: string;
  linkedin: string;
  leetcode: string;
} {
  if (!bioText) return { github: "", linkedin: "", leetcode: "" };
  try {
    const parsed = JSON.parse(bioText);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        github: typeof parsed.github === "string" ? parsed.github : "",
        linkedin: typeof parsed.linkedin === "string" ? parsed.linkedin : "",
        leetcode: typeof parsed.leetcode === "string" ? parsed.leetcode : "",
      };
    }
  } catch {
    // bio was regular plain text
  }
  return { github: "", linkedin: "", leetcode: "" };
}

async function getAuthenticatedUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) return null;

  const cookieStore = await cookies();
  const authClient = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write refreshed auth cookies.
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getStudentProfileAction(): Promise<StudentProfileResult> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated." };
    }

    const db = createServiceClient();
    if (!db) {
      return { success: false, error: "Database service unavailable." };
    }

    const userId = user.id;
    const userEmail = user.email ?? "";

    const [profileRes, studentRes] = await Promise.all([
      db
        .from("profiles")
        .select(
          "id, full_name, first_name, last_name, email, phone, mobile_number, bio, avatar_url, role, status",
        )
        .eq("id", userId)
        .maybeSingle(),
      db
        .from("students")
        .select(
          "id, registration_number, college_institution, course_degree, current_semester, phone",
        )
        .eq("id", userId)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const student = studentRes.data;

    let fallbackCollege = "";
    let fallbackDegree = "";
    let fallbackSemester = "";

    if (!student?.college_institution) {
      const filter = userEmail
        ? `applicant_user_id.eq.${userId},student_id.eq.${userId},email.ilike.${userEmail}`
        : `applicant_user_id.eq.${userId},student_id.eq.${userId}`;

      const [enrRes, regRes] = await Promise.all([
        db
          .from("enrollments")
          .select("college_institution, course_degree, year_semester")
          .or(filter)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        db
          .from("registrations")
          .select("college_institution, course_degree, year_semester")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      fallbackCollege =
        enrRes.data?.college_institution ||
        regRes.data?.college_institution ||
        "";
      fallbackDegree =
        enrRes.data?.course_degree || regRes.data?.course_degree || "";
      fallbackSemester =
        enrRes.data?.year_semester || regRes.data?.year_semester || "";
    }

    const socials = parseSocialsFromBio(profile?.bio);

    return {
      success: true,
      profile: {
        id: userId,
        full_name: profile?.full_name || "",
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        email: profile?.email || userEmail,
        phone: profile?.mobile_number || profile?.phone || student?.phone || "",
        registration_number: student?.registration_number || "",
        college: student?.college_institution || fallbackCollege,
        degree: student?.course_degree || fallbackDegree,
        semester: student?.current_semester || fallbackSemester,
        github: socials.github,
        linkedin: socials.linkedin,
        leetcode: socials.leetcode,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load student profile.",
    };
  }
}

export async function saveStudentProfileAction(
  form: StudentProfileData,
): Promise<StudentProfileResult> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated." };
    }

    const urlFields = ["github", "linkedin", "leetcode"] as const;
    for (const f of urlFields) {
      const v = form[f];
      if (v && !/^https?:\/\//.test(v)) {
        return {
          success: false,
          error: `${f} must be a valid URL starting with http:// or https://`,
        };
      }
    }

    const db = createServiceClient();
    if (!db) {
      return { success: false, error: "Database service unavailable." };
    }

    const userId = user.id;

    // 1. Update profiles table
    const bioObj = {
      github: form.github?.trim() || "",
      linkedin: form.linkedin?.trim() || "",
      leetcode: form.leetcode?.trim() || "",
    };

    const profileUpdates: Record<string, unknown> = {
      bio: JSON.stringify(bioObj),
      updated_at: new Date().toISOString(),
    };

    if (form.phone?.trim()) {
      profileUpdates.phone = form.phone.trim();
      profileUpdates.mobile_number = form.phone.trim();
    }
    if (form.full_name?.trim()) {
      profileUpdates.full_name = form.full_name.trim();
    }

    const { error: profileError } = await db
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (profileError) {
      throw new Error(`Profile update failed: ${profileError.message}`);
    }

    // 2. Update or insert students table
    const { data: existingStudent } = await db
      .from("students")
      .select("id, registration_number")
      .eq("id", userId)
      .maybeSingle();

    const collegeClean = form.college?.trim() || null;
    const degreeClean = form.degree?.trim() || null;
    const semesterClean = form.semester?.trim() || null;

    if (existingStudent) {
      const { error: studentError } = await db
        .from("students")
        .update({
          college_institution: collegeClean,
          course_degree: degreeClean,
          current_semester: semesterClean,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (studentError) {
        throw new Error(`Student record update failed: ${studentError.message}`);
      }
    } else {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const regNumber = `SPR-${new Date().getFullYear()}-${randomDigits}`;

      const { error: studentInsertError } = await db.from("students").insert({
        id: userId,
        registration_number: regNumber,
        college_institution: collegeClean,
        course_degree: degreeClean,
        current_semester: semesterClean,
        status: "active",
      });

      if (studentInsertError) {
        throw new Error(
          `Student record creation failed: ${studentInsertError.message}`,
        );
      }
    }

    return {
      success: true,
      profile: {
        ...form,
        id: userId,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to save student profile.",
    };
  }
}
