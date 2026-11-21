import type { Metadata } from "next";
import { assertModuleAccess } from "@/app/admin/authorization";
import { getAssessmentCourseCatalogAction } from "@/app/admin/academics/assessments/assign/actions";
import { getLiveClassesAction } from "./actions";
import LiveClassesClient from "./LiveClassesClient";

export const metadata: Metadata = {
    title: "Live Classes | Admin",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LiveClassesPage() {
    await assertModuleAccess(["academic_ops", "academics"], "view");
    const [result, catalog] = await Promise.all([
        getLiveClassesAction(),
        getAssessmentCourseCatalogAction(),
    ]);
    const errors = [result.error, catalog.error].filter(Boolean).join("; ");
    return (
        <LiveClassesClient
            initialClasses={result.classes}
            initialCourses={catalog.courses}
            initialCourseBundles={catalog.courseBundles}
            initialFlagshipPrograms={catalog.flagshipPrograms}
            initialError={errors || undefined}
        />
    );
}
