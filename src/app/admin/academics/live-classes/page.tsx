import type { Metadata } from "next";
import { assertModuleAccess } from "@/app/admin/authorization";
import { getLiveClassesAction } from "./actions";
import LiveClassesClient from "./LiveClassesClient";

export const metadata: Metadata = {
    title: "Live Classes | Admin",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LiveClassesPage() {
    await assertModuleAccess(["academic_ops", "academics"], "view");
    const result = await getLiveClassesAction();
    return <LiveClassesClient initialClasses={result.classes} initialError={result.error} />;
}
