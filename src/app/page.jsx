import { redirect } from "next/navigation";

/**
 * Temporary root route — the only page built in this sprint is /about,
 * so the site root forwards visitors straight to it.
 * Replace this file with the real Home page (see Home_Page_Requirements.md).
 */
export default function Home() {
  redirect("/about");
}
