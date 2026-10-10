import type { ReactNode } from "react";
import { assertModuleAccess } from "@/app/admin/authorization";

export default async function CoursesLayout({ children }: { children: ReactNode }) {
    await assertModuleAccess("courses");
    return children;
}
