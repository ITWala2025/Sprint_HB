"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import { sanitizeStudentId } from "@/lib/id-utils";
import { getStudentOpsServiceClient } from "@/app/admin/students/action-auth";

export type StudentCourseBadge = {
    kind: "course" | "bundle";
    title: string;
};

export type StudentDirectoryEntry = {
    id: string;
    studentId: string;
    registrationNumber: string;
    name: string;
    email: string;
    phone: string;
    profiles: {
        phone: string | null;
        mobile_number: string | null;
    } | null;
    courseEnrolled: string;
    activeCourses: StudentCourseBadge[];
    status: string;
    created_at: string;
    dateOfEnrollment: string;
    college: string;
    degree: string;
    specialization: string;
    semester: string;
    city: string;
    state: string;
    employmentStatus: string;
    organization: string;
};

export type StudentStatusActionResult =
    | { success: true; message: string }
    | { success: false; error: string };

const PAGE_SIZE = 1000;

function requireServiceClient() {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
        throw new Error("Server-side Supabase service role is not configured.");
    }
    return serviceClient;
}

function text(...values: unknown[]): string {
    return values.find((value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )?.trim() ?? "";
}

function isStudentId(id: unknown): id is string {
    return typeof id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function escapeIlike(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
}

async function fetchAllRows<T>(
    queryPage: (from: number, to: number) => PromiseLike<{
        data: T[] | null;
        error: { message: string } | null;
    }>,
    resource: string,
): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await queryPage(from, from + PAGE_SIZE - 1);
        if (error) throw new Error(`Could not load ${resource}: ${error.message}`);
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE_SIZE) return rows;
    }
}

function formatEnrollmentDate(value?: string | null): string {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export async function getStudentDirectory(): Promise<StudentDirectoryEntry[]> {
    await assertModuleAccess("student_ops");
    const supabase = requireServiceClient();

    const [students, enrollments, registrations, courses, bundles] = await Promise.all([
        fetchAllRows(
            (from, to) => supabase.from("students").select("*").order("created_at", { ascending: false }).range(from, to),
            "students",
        ),
        fetchAllRows(
            (from, to) => supabase.from("enrollments").select("*").order("created_at", { ascending: false }).range(from, to),
            "enrollment applications",
        ),
        fetchAllRows(
            (from, to) => supabase.from("registrations").select("*").order("created_at", { ascending: false }).range(from, to),
            "registrations",
        ),
        fetchAllRows(
            (from, to) => supabase.from("courses").select("id, title").range(from, to),
            "courses",
        ),
        fetchAllRows(
            (from, to) => supabase.from("course_bundles").select("id, title").range(from, to),
            "course bundles",
        ),
    ]);

    const studentIds = students.map((student) => student.id);
    const [profiles, studentCourses, legacyCourseEnrollments] = studentIds.length > 0
        ? await Promise.all([
            fetchAllRows(
                (from, to) => supabase.from("profiles").select("*").in("id", studentIds).range(from, to),
                "student profiles",
            ),
            fetchAllRows(
                (from, to) => supabase.from("student_courses").select("student_id, course_id, bundle_id, status, enrolled_at").in("student_id", studentIds).range(from, to),
                "student course links",
            ),
            fetchAllRows(
                (from, to) => supabase.from("student_course_enrollments").select("student_id, course_id, batch_id, status, enrolled_at, created_at").in("student_id", studentIds).range(from, to),
                "student course enrollments",
            ),
        ])
        : [[], [], []];

    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const courseTitles = new Map(courses.map((course) => [course.id, course.title]));
    const bundleTitles = new Map(bundles.map((bundle) => [bundle.id, bundle.title]));

    return students.map((student) => {
        const profile = profilesById.get(student.id);
        const studentEmail = text(profile?.email, student.email).toLowerCase();
        const matchingEnrollments = enrollments.filter((enrollment) =>
            enrollment.student_id === student.id ||
            enrollment.applicant_user_id === student.id ||
            (studentEmail && text(enrollment.email).toLowerCase() === studentEmail),
        );
        const matchingRegistrations = registrations.filter((registration) =>
            registration.user_id === student.id ||
            (studentEmail && text(registration.email).toLowerCase() === studentEmail),
        );
        const approvedEnrollments = matchingEnrollments.filter(
            (enrollment) => enrollment.status === "approved" || enrollment.status === "enrolled",
        );
        const approvedRegistrations = matchingRegistrations.filter(
            (registration) => registration.status === "approved" || registration.status === "enrolled",
        );

        const badges: StudentCourseBadge[] = [];
        const addCourse = (id: string | null | undefined) => {
            const title = id ? courseTitles.get(id) : null;
            if (title) badges.push({ kind: "course", title });
        };
        const addBundle = (id: string | null | undefined) => {
            const title = id ? bundleTitles.get(id) : null;
            if (title) badges.push({ kind: "bundle", title });
        };

        studentCourses
            .filter((link) => link.student_id === student.id && link.status === "active")
            .forEach((link) => {
                addCourse(link.course_id);
                addBundle(link.bundle_id);
            });
        legacyCourseEnrollments
            .filter((link) => link.student_id === student.id && link.status === "active")
            .forEach((link) => addCourse(link.course_id));
        approvedEnrollments.forEach((enrollment) => {
            addCourse(enrollment.course_id);
            addBundle(enrollment.bundle_id);
        });
        approvedRegistrations.forEach((registration) => {
            addCourse(registration.course_id);
            addBundle(registration.bundle_id);
        });

        const uniqueBadges = [...new Map(
            badges.map((badge) => [`${badge.kind}:${badge.title}`, badge]),
        ).values()];
        const courseEnrolled = uniqueBadges.length > 0
            ? uniqueBadges.map((badge) => badge.title).join(", ")
            : "Not enrolled";

        const timestamps = [
            student.created_at,
            ...studentCourses
                .filter((link) => link.student_id === student.id)
                .map((link) => link.enrolled_at),
            ...legacyCourseEnrollments
                .filter((link) => link.student_id === student.id)
                .map((link) => link.enrolled_at || link.created_at),
            ...matchingEnrollments.map((enrollment) => enrollment.reviewed_at || enrollment.created_at),
            ...matchingRegistrations.map((registration) => registration.created_at),
        ].filter((value): value is string =>
            typeof value === "string" && !Number.isNaN(new Date(value).getTime()),
        );
        timestamps.sort((left, right) => new Date(left).getTime() - new Date(right).getTime());

        const registrationNumber = sanitizeStudentId(
            text(student.registration_number, ...matchingRegistrations.map((row) => row.registration_number)) || null,
            "Not provided",
        );
        const enrollment = matchingEnrollments[0];
        const registration = matchingRegistrations[0];

        return {
            id: student.id,
            studentId: registrationNumber,
            registrationNumber,
            name: text(student.full_name, enrollment?.full_name, registration?.full_name, profile?.full_name) || "Not provided",
            email: text(profile?.email, student.email, enrollment?.email, registration?.email) || "Not provided",
            phone: text(student.phone, enrollment?.phone, registration?.phone, profile?.phone, profile?.mobile_number) || "Not provided",
            profiles: profile ? {
                phone: profile.phone ?? null,
                mobile_number: profile.mobile_number ?? null,
            } : null,
            courseEnrolled,
            activeCourses: uniqueBadges,
            status: student.status?.toLowerCase() === "deactivated" || profile?.is_active === false
                ? "deactivated"
                : text(student.status, profile?.status, enrollment?.status, registration?.status) || "Not provided",
            created_at: text(student.created_at),
            dateOfEnrollment: formatEnrollmentDate(timestamps[0]),
            college: text(student.college_institution, enrollment?.college_institution, registration?.college_institution, profile?.college_institution) || "Not provided",
            degree: text(student.course_degree, enrollment?.course_degree, registration?.course_degree, profile?.course_degree) || "Not provided",
            specialization: text(student.specialization_branch, enrollment?.specialization_branch, registration?.specialization_branch, profile?.specialization_branch) || "Not provided",
            semester: text(student.current_semester, enrollment?.year_semester, registration?.year_semester, profile?.current_semester, profile?.year_semester) || "Not provided",
            city: text(student.city, enrollment?.city, registration?.city, profile?.city) || "Not provided",
            state: text(student.state, enrollment?.state, registration?.state, profile?.state) || "Not provided",
            employmentStatus: text(student.employment_status, enrollment?.employment_status, registration?.employment_status, profile?.employment_status) || "Not provided",
            organization: text(student.organization_name, enrollment?.organization_name, registration?.organization_name, profile?.organization_name) || "Not provided",
        };
    });
}

async function setStudentStatus(
    studentId: string,
    status: "active" | "deactivated",
): Promise<StudentStatusActionResult> {
    if (!isStudentId(studentId)) {
        return { success: false, error: "Select a valid student." };
    }

    const authorization = await getStudentOpsServiceClient();
    if ("error" in authorization) return authorization;
    const supabase = authorization.client;

    const [{ data: student, error: studentLookupError }, { data: profile, error: profileLookupError }] = await Promise.all([
        supabase.from("students").select("id, email").eq("id", studentId).maybeSingle(),
        supabase.from("profiles").select("id, email").eq("id", studentId).maybeSingle(),
    ]);

    if (studentLookupError) {
        return { success: false, error: `Could not find the student account: ${studentLookupError.message}` };
    }
    if (profileLookupError) {
        return { success: false, error: `Could not find the student profile: ${profileLookupError.message}` };
    }
    if (!student) {
        return { success: false, error: "This student no longer exists." };
    }

    const email = text(profile?.email, student.email);
    const updates = await Promise.all([
        supabase.from("students").update({ status }).eq("id", studentId),
        supabase.from("profiles").update({ is_active: status === "active" }).eq("id", studentId),
        supabase.from("registrations").update({ status }).eq("user_id", studentId),
        ...(email
            ? [supabase.from("registrations").update({ status }).ilike("email", escapeIlike(email))]
            : []),
    ]);
    const updateError = updates.find((result) => result.error)?.error;
    if (updateError) {
        return { success: false, error: `Could not ${status === "active" ? "activate" : "deactivate"} the student: ${updateError.message}` };
    }

    revalidatePath("/admin/students/list");
    revalidatePath("/admin/students/registrations");
    return {
        success: true,
        message: status === "active" ? "Student account activated." : "Student account deactivated.",
    };
}

export async function deactivateStudent(studentId: string): Promise<StudentStatusActionResult> {
    return setStudentStatus(studentId, "deactivated");
}

export async function activateStudent(studentId: string): Promise<StudentStatusActionResult> {
    return setStudentStatus(studentId, "active");
}
