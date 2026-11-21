import type { SupabaseClient } from "@supabase/supabase-js";

export type StudentCourseAccess = {
    courseIds: Set<string>;
    courseNames: Set<string>;
};

function normalizeCourseName(value: unknown) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function getStudentCourseAccess(
    supabase: SupabaseClient,
    studentId: string,
): Promise<StudentCourseAccess> {
    const [applicationsResult, studentCoursesResult, courseEnrollmentsResult] = await Promise.all([
        supabase
            .from("enrollments")
            .select("course_id, bundle_id")
            .eq("status", "approved")
            .or(`applicant_user_id.eq.${studentId},student_id.eq.${studentId}`),
        supabase
            .from("student_courses")
            .select("course_id, bundle_id")
            .eq("student_id", studentId)
            .eq("status", "active"),
        supabase
            .from("student_course_enrollments")
            .select("course_id")
            .eq("student_id", studentId)
            .eq("status", "active"),
    ]);

    for (const [label, result] of [
        ["approved applications", applicationsResult],
        ["active student courses", studentCoursesResult],
        ["active course enrollments", courseEnrollmentsResult],
    ] as const) {
        if (result.error) {
            throw new Error(`Could not load ${label}: ${result.error.message}`);
        }
    }

    const enrollmentRecords = [
        ...(applicationsResult.data ?? []),
        ...(studentCoursesResult.data ?? []),
    ];
    const bundleIds = [...new Set(
        enrollmentRecords.flatMap((record) => record.bundle_id ? [record.bundle_id] : []),
    )];
    const courseIds = new Set([
        ...enrollmentRecords.flatMap((record) => record.course_id ? [record.course_id] : []),
        ...(courseEnrollmentsResult.data ?? []).map((record) => record.course_id),
    ]);

    const [bundleCoursesResult, bundlesResult] = await Promise.all([
        bundleIds.length
            ? supabase.from("bundle_courses").select("course_id").in("bundle_id", bundleIds)
            : Promise.resolve({ data: [], error: null }),
        bundleIds.length
            ? supabase.from("course_bundles").select("id, title").in("id", bundleIds)
            : Promise.resolve({ data: [], error: null }),
    ]);
    if (bundleCoursesResult.error) {
        throw new Error(`Could not load courses in enrolled bundles: ${bundleCoursesResult.error.message}`);
    }
    if (bundlesResult.error) {
        throw new Error(`Could not load enrolled bundle names: ${bundlesResult.error.message}`);
    }
    for (const record of bundleCoursesResult.data ?? []) {
        courseIds.add(record.course_id);
    }

    const courseIdList = [...courseIds];
    const coursesResult = courseIdList.length
        ? await supabase.from("courses").select("id, title").in("id", courseIdList)
        : { data: [], error: null };
    if (coursesResult.error) {
        throw new Error(`Could not load enrolled course names: ${coursesResult.error.message}`);
    }

    const courseNames = new Set(
        (coursesResult.data ?? [])
            .map((course) => normalizeCourseName(course.title))
            .filter(Boolean),
    );
    for (const bundle of bundlesResult.data ?? []) {
        const name = normalizeCourseName(bundle.title);
        if (name) courseNames.add(name);
    }

    return { courseIds, courseNames };
}

export function filterAssessmentsByCourseAccess<T extends {
    course_id?: string | null;
    course_name?: string | null;
}>(
    assessments: T[],
    access: StudentCourseAccess,
): T[] {
    if (access.courseIds.size === 0 && access.courseNames.size === 0) return [];

    return assessments.filter((assessment) => {
        if (assessment.course_id && access.courseIds.has(assessment.course_id)) return true;
        const name = normalizeCourseName(assessment.course_name);
        return Boolean(name && access.courseNames.has(name));
    });
}
