import { redirect } from "next/navigation";
import { assertModuleAccess } from "@/app/admin/authorization";

export default async function AdminEnquiriesPage(): Promise<never> {
    await assertModuleAccess("enquiries");
    redirect("/admin/admissions/students");
}