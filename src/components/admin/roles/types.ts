export const capabilityNames = ["view", "create", "edit", "delete", "export"] as const;
export type Capability = (typeof capabilityNames)[number];
export type Permission = Partial<Record<Capability, boolean>>;
export type PermissionMap = Record<string, Permission> & { full_access?: boolean };

export type Role = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    permissions: PermissionMap;
    is_active: boolean;
    is_system: boolean;
    color: string;
    assigned_count?: number;
    created_at?: string;
};

export type StaffProfile = {
    id: string;
    full_name: string;
    email: string;
    role_id: string | null;
    is_active?: boolean;
    roles?: Pick<Role, "id" | "name" | "color"> | null;
};

export const moduleCategories = [
    {
        title: "Website CMS & Content",
        modules: [
            ["cms_home", "Homepage CMS", "Manage the SPRINT homepage content and sections."],
            ["cms_about", "About Us CMS", "Update the institutional story and leadership content."],
            ["cms_courses", "Course & Bundle CMS", "Manage course catalogue and bundle presentation."],
            ["cms_contact", "Contact & Center CMS", "Maintain contact details and center information."],
            ["cms_careers", "Careers & Openings CMS", "Publish vacancies and hiring information."],
            ["cms_announcements", "Announcements", "Publish ticker messages and campus updates."],
            ["cms_legal", "Legal & Compliance CMS", "Maintain privacy and terms content."],
        ],
    },
    {
        title: "Student & Academic Operations",
        modules: [
            ["admissions", "Admissions", "Review enquiries and enrollment applications."],
            ["student_ops", "Student Operations", "Manage student records, attendance, and workflows."],
            ["academics", "Academics", "Manage courses, assessments, and results."],
            ["trainers", "Trainer Management", "Manage trainer profiles, batches, and assignments."],
            ["partners", "Partners", "Manage partner companies and institutes."],
        ],
    },
    {
        title: "System & Administration",
        modules: [["access_control", "Access Control", "Manage roles, permissions, and staff access."]],
    },
] as const;

export const colors = [
    { name: "Navy", value: "navy", className: "bg-brand-navy" },
    { name: "Red", value: "red", className: "bg-brand-red" },
    { name: "Blue", value: "blue", className: "bg-brand-blue" },
    { name: "Emerald", value: "emerald", className: "bg-emerald-600" },
    { name: "Amber", value: "amber", className: "bg-amber-500" },
] as const;

export const emptyPermissions = (): PermissionMap =>
    Object.fromEntries(moduleCategories.flatMap((category) => category.modules.map((module) => [module[0], {}]))) as PermissionMap;

export function countPermissions(permissions: PermissionMap) {
    const total = moduleCategories.reduce((sum, category) => sum + category.modules.length * capabilityNames.length, 0);
    const active = moduleCategories.reduce((sum, category) => sum + category.modules.reduce((moduleSum, [key]) => moduleSum + capabilityNames.filter((capability) => permissions[key]?.[capability]).length, 0), 0);
    return { active, total, percentage: total ? Math.round((active / total) * 100) : 0 };
}