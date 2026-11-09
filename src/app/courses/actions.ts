"use server";

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

type CourseApplicationState = {
  error?: string;
  redirectTo?: string;
};

function isUniqueViolation(error: { code?: string }) {
  return error.code === "23505";
}

export async function applyForCourseAction(
  _previousState: CourseApplicationState,
  formData: FormData,
): Promise<CourseApplicationState> {
  const rawSlug = formData.get("slug");
  if (
    typeof rawSlug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(rawSlug)
  ) {
    return { error: "Select a valid course and try again." };
  }
  const slug = rawSlug;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publishableKey) {
    return { error: "Course applications are temporarily unavailable." };
  }

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
    error: authError,
  } = await authClient.auth.getUser();
  if (authError) {
    console.error("[CourseApplication] Could not verify student session:", authError.message);
    return { error: "We couldn't verify your sign-in. Please try again." };
  }
  if (!user) {
    return {
      redirectTo: `/student/login?next=${encodeURIComponent(`/courses/${slug}`)}`,
    };
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return { error: "Course applications are temporarily unavailable." };
  }

  const [profileResult, courseResult] = await Promise.all([
    authClient
      .from("profiles")
      .select("id, full_name, email, phone, role, status")
      .eq("id", user.id)
      .maybeSingle(),
    serviceClient
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle(),
  ]);
  const { data: profile, error: profileError } = profileResult;
  if (profileError) {
    console.error("[CourseApplication] Could not load student profile:", profileError.message);
    return { error: "We couldn't verify your student profile. Please try again." };
  }
  if (!profile || profile.role !== "student" || profile.status !== "active") {
    return { error: "An active Student Portal account is required to apply for a course." };
  }

  const { data: course, error: courseError } = courseResult;
  if (courseError) {
    console.error("[CourseApplication] Could not load course:", courseError.message);
    return { error: "We couldn't verify this course. Please try again." };
  }
  if (!course) {
    return { error: "This course is no longer available." };
  }

  const { data: existingApplication, error: existingError } = await serviceClient
    .from("enrollments")
    .select("id, status")
    .eq("course_id", course.id)
    .in("status", ["pending", "approved"])
    .or(`applicant_user_id.eq.${user.id},student_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();
  if (existingError) {
    console.error("[CourseApplication] Could not check existing application:", existingError.message);
    return { error: "We couldn't check your existing applications. Please try again." };
  }

  if (!existingApplication) {
    const { error: insertError } = await serviceClient.from("enrollments").insert({
      applicant_user_id: user.id,
      full_name: profile.full_name || user.email || "Student",
      email: profile.email || user.email || "",
      phone: profile.phone || user.phone || "",
      course_id: course.id,
      status: "pending",
    });

    if (insertError) {
      if (isUniqueViolation(insertError)) {
        const { data: concurrentApplication, error: lookupError } = await serviceClient
          .from("enrollments")
          .select("id")
          .eq("course_id", course.id)
          .in("status", ["pending", "approved"])
          .or(`applicant_user_id.eq.${user.id},student_id.eq.${user.id}`)
          .limit(1)
          .maybeSingle();

        if (lookupError) {
          console.error("[CourseApplication] Could not verify concurrent application:", lookupError.message);
        } else if (concurrentApplication) {
          revalidatePath("/admin/students/enrollments");
          revalidatePath("/student/dashboard");
          revalidatePath("/student/my-course");
          return {
            redirectTo: "/student/my-course?success=course-application&existing=1",
          };
        }
      }

      console.error("[CourseApplication] Could not create application:", insertError.message);
      return { error: "Your course application could not be saved. Please try again." };
    }
  }

  revalidatePath("/admin/students/enrollments");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/my-course");
  return {
    redirectTo: existingApplication
      ? "/student/my-course?success=course-application&existing=1"
      : "/student/my-course?success=course-application",
  };
}
