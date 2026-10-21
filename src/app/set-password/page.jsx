import StudentRouteModal from "@/components/student/StudentRouteModal";
import ResetPasswordPage from "@/app/student/reset-password/page";

/**
 * Canonical Set Password route. Supabase detects the recovery session fragment
 * on this URL, while the shared modal presents the same reset form as student
 * portal recovery routes.
 */
export default function SetPasswordPage() {
  return (
    <StudentRouteModal
      title="Create a new password"
      fallbackHref="/student/login"
      contentClassName="student-route-modal-content student-route-modal-content--auth"
    >
      <ResetPasswordPage isModal />
    </StudentRouteModal>
  );
}