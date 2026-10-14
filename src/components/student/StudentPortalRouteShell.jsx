"use client";

import { usePathname } from "next/navigation";
import StudentRouteModal from "@/components/student/StudentRouteModal";

const ROUTE_TITLES = {
  login: "Student Portal",
  "forgot-password": "Reset your password",
  "check-email": "Check your email",
  "reset-password": "Create a new password",
  enroll: "Student enrollment",
  "password-reset-success": "Password updated",
  "apply-course": "Apply for a course",
  assignments: "Assignments",
  certificates: "Certificates",
  dashboard: "Student dashboard",
  "help-support": "Help and support",
  "my-course": "My course",
  profile: "My profile",
  resources: "Learning resources",
  result: "Results",
  settings: "Settings",
};

export default function StudentPortalRouteShell({ children }) {
  const pathname = usePathname() ?? "";
  const routeKey = pathname.split("/").filter(Boolean).slice(1).join("/");
  if (["/student/dashboard", "/student/enroll"].includes(pathname)) {
    return children;
  }

  const title = ROUTE_TITLES[routeKey] ?? "Student Portal";
  const isLoginRoute = routeKey === "login";
  const isAuthRoute = [
    "forgot-password",
    "check-email",
    "reset-password",
    "password-reset-success",
  ].includes(routeKey);

  return (
    <StudentRouteModal
      title={title}
      contentClassName={
        isLoginRoute
          ? "student-route-modal-content student-route-modal-content--login"
          : isAuthRoute
            ? "student-route-modal-content student-route-modal-content--auth"
            : "student-route-modal-content"
      }
    >
      {children}
    </StudentRouteModal>
  );
}
