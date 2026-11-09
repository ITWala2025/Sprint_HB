import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatApplicationId } from "@/lib/id-utils";

export const metadata = { title: "My Course" };

const statusLabels = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export default async function StudentMyCoursePage({ searchParams }) {
  const query = await searchParams;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(`Could not verify the student session: ${authError.message}`);
  }
  if (!authData.user) {
    redirect("/student/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Could not verify the student account: ${profileError.message}`);
  }
  if (profile?.role !== "student" || profile.status !== "active") {
    redirect("/student/login");
  }

  const [applicationsResult, accessResult] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, application_number, status, created_at, course_id, bundle_id")
      .or(
        `applicant_user_id.eq.${authData.user.id},student_id.eq.${authData.user.id}`,
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("student_courses")
      .select("id, status, enrolled_at, course_id, bundle_id")
      .eq("student_id", authData.user.id)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false }),
  ]);

  if (applicationsResult.error) {
    throw new Error(
      `Could not load your course applications: ${applicationsResult.error.message}`,
    );
  }
  if (accessResult.error) {
    throw new Error(
      `Could not load your active courses: ${accessResult.error.message}`,
    );
  }

  const applications = applicationsResult.data ?? [];
  const activeCourses = accessResult.data ?? [];
  const courseIds = [
    ...new Set(
      [...applications, ...activeCourses].flatMap((record) =>
        record.course_id ? [record.course_id] : [],
      ),
    ),
  ];
  const bundleIds = [
    ...new Set(
      [...applications, ...activeCourses].flatMap((record) =>
        record.bundle_id ? [record.bundle_id] : [],
      ),
    ),
  ];
  const [coursesResult, bundlesResult] = await Promise.all([
    courseIds.length
      ? supabase.from("courses").select("id, title, slug").in("id", courseIds)
      : Promise.resolve({ data: [], error: null }),
    bundleIds.length
      ? supabase
          .from("course_bundles")
          .select("id, title, slug")
          .in("id", bundleIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (coursesResult.error || bundlesResult.error) {
    throw new Error(
      `Could not load course names: ${[
        coursesResult.error?.message,
        bundlesResult.error?.message,
      ]
        .filter(Boolean)
        .join("; ")}`,
    );
  }

  const courseById = new Map(
    (coursesResult.data ?? []).map((course) => [course.id, course]),
  );
  const bundleById = new Map(
    (bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle]),
  );
  const getProduct = (record) =>
    (record.course_id && courseById.get(record.course_id)) ||
    (record.bundle_id && bundleById.get(record.bundle_id));
  const successNotice =
    query?.success === "course-application"
      ? query.existing === "1"
        ? "You already have an application for this course. Its latest status is shown below."
        : "Your course application was submitted and is pending admin review."
      : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="courses-eyebrow">Student Portal</p>
        <h1 className="font-display text-3xl font-bold text-brand-navy">
          My Courses
        </h1>
        <p className="mt-2 text-sm text-brand-text-secondary">
          Track application decisions and access courses approved for your account.
        </p>
      </header>

      {successNotice ? (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
          aria-live="polite"
        >
          {successNotice}
        </p>
      ) : null}

      <section
        aria-labelledby="student-active-courses-heading"
        className="rounded-2xl border border-brand-border bg-brand-white p-5 shadow-brand-card sm:p-6"
      >
        <h2
          id="student-active-courses-heading"
          className="font-display text-xl font-bold text-brand-navy"
        >
          Available courses
        </h2>
        {activeCourses.length ? (
          <ul className="mt-4 divide-y divide-brand-border">
            {activeCourses.map((record) => {
              const product = getProduct(record);
              const href = product?.slug
                ? `/${record.course_id ? "courses" : "bundles"}/${product.slug}`
                : null;
              return (
                <li
                  key={record.id}
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-brand-navy">
                      {product?.title ?? "Approved course"}
                    </p>
                    <p className="mt-1 text-xs text-brand-text-secondary">
                      Access granted {formatDate(record.enrolled_at)}
                    </p>
                  </div>
                  {href ? (
                    <Link
                      className="sprint-focus inline-flex min-h-10 items-center justify-center rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
                      href={href}
                    >
                      Open course
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-brand-text-secondary">
            No approved courses are available yet.
          </p>
        )}
      </section>

      <section
        aria-labelledby="student-applications-heading"
        className="rounded-2xl border border-brand-border bg-brand-white p-5 shadow-brand-card sm:p-6"
      >
        <h2
          id="student-applications-heading"
          className="font-display text-xl font-bold text-brand-navy"
        >
          Enrollment applications
        </h2>
        {applications.length ? (
          <ul className="mt-4 divide-y divide-brand-border">
            {applications.map((application) => {
              const product = getProduct(application);
              return (
                <li
                  key={application.id}
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-brand-navy">
                      {product?.title ?? "Course not selected"}
                    </p>
                    <p className="mt-1 text-xs text-brand-text-secondary">
                      Application{" "}
                      {formatApplicationId(
                        application.application_number,
                        application.id,
                        application.created_at,
                      )}{" "}
                      · Submitted {formatDate(application.created_at)}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      application.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : application.status === "rejected"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-brand-red-light text-brand-red"
                    }`}
                  >
                    {statusLabels[application.status] ?? "Status unavailable"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-brand-text-secondary">
              You have not submitted any enrollment applications yet.
            </p>
            <Link
              href="/student/apply-course"
              className="sprint-focus mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
            >
              Explore courses
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
