"use server";

import "server-only";
import { assertModuleAccess } from "@/app/admin/authorization";
import { createServiceClient } from "@/lib/supabase/service";

export type StudentDirectoryRegistration = {
    id: string;
    registration_number: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    course_degree: string | null;
    college_institution: string | null;
    specialization_branch: string | null;
    year_semester: string | null;
    status: string;
    created_at: string;
    course: string | null;
    bundle: string | null;
};

export type StudentDirectoryEntry = {
    id: string;
    registration_number: string;
    status: string;
    college_institution: string | null;
    course_degree: string | null;
    specialization_branch: string | null;
    current_semester: string | null;
    employment_status: string | null;
    organization_name: string | null;
    city: string | null;
    state: string | null;
    profile: {
        full_name: string;
        email: string;
        phone: string | null;
        is_active: boolean;
    };
    registrations: StudentDirectoryRegistration[];
};

export async function getStudentDirectory(): Promise<StudentDirectoryEntry[]> {
    await assertModuleAccess("student_ops");
    try {
        const supabase = createServiceClient();
        if (!supabase) {
            console.error("[student-directory] Service-role Supabase client is not configured.");
            return [];
        }

        const { data: students, error } = await supabase
            .from("students")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase students query error details:", error.message, error.details);
            return [];
        }
        return (students ?? []).map((student) => {
            const registrationNumber = student.registration_number || "SPR-2026-0000";
            const status = student.status || "active";

            return {
                id: student.id,
                registration_number: registrationNumber,
                status,
                college_institution: student.college_institution || "SPRINT Campus Institute",
                course_degree: student.course_degree || "General Technology Track",
                specialization_branch: student.specialization_branch || null,
                current_semester: student.current_semester || student.semester_year || null,
                employment_status: student.employment_status || null,
                organization_name: student.organization_name || null,
                city: student.city || null,
                state: student.state || null,
                profile: {
                    full_name: student.full_name || student.registration_number || "Enrolled Student",
                    email: student.email || "student@sprint.institute",
                    phone: student.phone || null,
                    is_active: status.toLowerCase() === "active",
                },
                registrations: [],
            };
        });
    } catch (error) {
        console.error("Student Directory Error:", error);
        return [];
    }
}
