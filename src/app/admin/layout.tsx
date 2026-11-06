import type { ReactNode } from "react";
import { roleHasPermission, type AdminPermissionMap } from "@/app/admin/authorization";
import AdminLayoutClient from "@/app/admin/AdminLayoutClient";
import { getPendingRegistrationCount } from "@/app/admin/students/enrollments/actions";
import { getAdminSession } from "@/app/admin/session";

type InitialProfile = {
    role: string | null;
    is_active: boolean;
    must_change_password: boolean;
    role_name: string | null;
    permissions: AdminPermissionMap | null;
    full_name: string | null;
    email: string | null;
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getAdminSession();

    let initialProfile: InitialProfile | null = null;
    if (session) {
        initialProfile = {
            role: session.role,
            is_active: session.isActive,
            must_change_password: session.mustChangePassword,
            role_name: session.roleName,
            permissions: session.permissions,
            full_name: session.fullName,
            email: session.email,
        };
    }

    const canViewEnrollmentApplications = Boolean(
        initialProfile?.role === "admin" ||
        initialProfile?.permissions?.full_access === true ||
        roleHasPermission(initialProfile?.permissions, "student_ops", "view"),
    );
    let pendingRegistrationCount: number | null = null;
    if (canViewEnrollmentApplications) {
        try {
            pendingRegistrationCount = await getPendingRegistrationCount();
        } catch (error) {
            console.warn("[SPRINT Admin Layout] Failed to load pending registration count badge:", error);
        }
    }

    return (
        <AdminLayoutClient
            initialProfile={initialProfile}
            pendingRegistrationCount={pendingRegistrationCount}
        >
            {children}
        </AdminLayoutClient>
    );
}
