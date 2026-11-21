import type { Metadata } from "next";
import { assertModuleAccess } from "@/app/admin/authorization";
import { getAssessmentCourseCatalogAction, getAssessmentsAction } from "./actions";
import AssessmentAssignmentsClient from "./AssessmentAssignmentsClient";

export const metadata: Metadata = {
    title: "Assign Assessments | Admin",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AssessmentAssignmentsPage() {
    await assertModuleAccess(["academic_ops", "academics"], "view");
    const [result, catalog] = await Promise.all([
        getAssessmentsAction(),
        getAssessmentCourseCatalogAction(),
    ]);
    const errors = [result.error, catalog.error].filter(Boolean).join("; ");
    return (
        <AssessmentAssignmentsClient
            initialAssessments={result.assessments}
            initialCourses={catalog.courses}
            initialCourseBundles={catalog.courseBundles}
            initialFlagshipPrograms={catalog.flagshipPrograms}
            initialError={errors || undefined}
        />
    );
}
