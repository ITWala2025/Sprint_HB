export type PermissionCapabilityMap = {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    export?: boolean;
    [capability: string]: boolean | undefined;
};

export type AdminPermissionMap = {
    full_access?: boolean;
    [moduleKey: string]: PermissionCapabilityMap | boolean | undefined;
};

export function roleHasPermission(
    permissions: unknown,
    moduleKey: string,
    capability: string,
): boolean {
    if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
        return false;
    }

    const permissionMap = permissions as Record<string, unknown>;
    if (permissionMap.full_access === true) return true;

    const modulePermissions = permissionMap[moduleKey];
    return Boolean(
        modulePermissions &&
        typeof modulePermissions === "object" &&
        !Array.isArray(modulePermissions) &&
        (modulePermissions as Record<string, unknown>)[capability] === true,
    );
}

export const adminRoutePermissions: Record<string, string[]> = {
    "/admin/dashboard": [],
    "/admin/users": ["user_management", "access_control"],
    "/admin/roles": ["access_control"],
    "/admin/courses": ["courses", "course_bundle_cms", "cms_courses", "instructors", "academic_ops", "academics", "trainers"],
    "/admin/enquiries": ["admissions", "marketing", "support"],
    "/admin/admissions": ["admissions", "marketing", "support"],
    "/admin/cms/home": ["cms_home", "marketing"],
    "/admin/cms/about": ["cms_about"],
    "/admin/cms/courses": ["cms_courses", "courses"],
    "/admin/cms/contact": ["cms_contact", "support"],
    "/admin/cms/careers": ["cms_careers", "marketing"],
    "/admin/careers": ["careers", "cms_careers", "admin"],
    "/admin/cms/announcements": ["cms_announcements", "marketing"],
    "/admin/cms/legal": ["cms_legal"],
    "/admin/students": ["student_ops"],
    "/admin/academics": ["academic_ops", "academics"],
    "/admin/scholarships": ["academic_ops", "academics"],
    "/admin/partners": ["partners"],
    "/admin/trainers": ["instructors", "trainers"],
    "/admin/updates": ["cms_announcements", "marketing"],
};

export function canAccessAdminRoute(
    pathname: string,
    permissions: AdminPermissionMap | null,
    profileRole: string | null,
    _roleName?: string | null,
): boolean {
    const normalizedRole = profileRole?.toLowerCase();
    if (normalizedRole === "admin" || permissions?.full_access === true) {
        return true;
    }

    const matchingRoute = Object.keys(adminRoutePermissions)
        .sort((left, right) => right.length - left.length)
        .find((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (!matchingRoute) return false;
    if (matchingRoute === "/admin/dashboard") return normalizedRole === "staff";

    const requiredPermissions = adminRoutePermissions[matchingRoute];
    return requiredPermissions.some(
        (permission) => roleHasPermission(permissions, permission, "view"),
    );
}
