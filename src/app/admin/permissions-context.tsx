"use client";

import { createContext, useContext, type ReactNode } from "react";
import { roleHasPermission, type AdminPermissionMap } from "@/app/admin/auth-types";

type AdminPermissionsContextValue = {
    hasPermission: (moduleKeys: string | string[], capability: string) => boolean;
};

const AdminPermissionsContext = createContext<AdminPermissionsContextValue>({
    hasPermission: () => false,
});

export function AdminPermissionsProvider({
    children,
    permissions,
    isSuperAdmin,
}: {
    children: ReactNode;
    permissions: AdminPermissionMap | null;
    isSuperAdmin: boolean;
}) {
    const value = {
        hasPermission: (moduleKeys: string | string[], capability: string) =>
            isSuperAdmin ||
            (Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys])
                .some((moduleKey) => roleHasPermission(permissions, moduleKey, capability)),
    };

    return <AdminPermissionsContext.Provider value={value}>{children}</AdminPermissionsContext.Provider>;
}

export function useAdminPermissions() {
    return useContext(AdminPermissionsContext);
}
