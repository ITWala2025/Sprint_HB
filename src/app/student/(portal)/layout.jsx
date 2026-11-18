import StudentLayout from "@/components/student/StudentLayout";
import { StudentDataProvider } from "@/components/student/StudentDataProvider";

export const metadata = {
  robots: { index: false, follow: false },
};

function StudentPortalLayoutInner({ children }) {
  return (
    <StudentDataProvider>
      <StudentLayout>{children}</StudentLayout>
    </StudentDataProvider>
  );
}

export default function StudentPortalLayout({ children }) {
  return <StudentPortalLayoutInner>{children}</StudentPortalLayoutInner>;
}