import type { ReactNode } from "react";
import { assertModuleAccess } from "@/app/admin/authorization";

export default async function RolesLayout({ children }: { children: ReactNode }) {
    await assertModuleAccess("access_control");
    return children;
}
