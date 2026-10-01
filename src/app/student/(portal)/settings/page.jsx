import { redirect } from "next/navigation";

export const metadata = { title: "Settings" };

export default function StudentSettingsPage() {
  redirect("/student/profile#settings");
}
