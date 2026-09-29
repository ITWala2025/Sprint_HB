import StudentLayout from "@/components/student/StudentLayout";

/**
 * Shared layout for every portal page under /student/(portal).
 *
 * The `(portal)` route group keeps this shell off /student/login (auth is a
 * separate, later task). The public SPRINT header/ticker/footer still come from
 * the root layout — this only adds the sidebar + content area.
 */
export const metadata = {
  robots: { index: false, follow: false },
};

export default function StudentPortalLayout({ children }) {
  return <StudentLayout>{children}</StudentLayout>;
}
