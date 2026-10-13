"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";

import StudentPortalModal from "@/components/student/StudentPortalModal";

const ROUTES_WITHOUT_PUBLIC_HEADER = [
  "/student/login",
  "/student/forgot-password",
  "/student/check-email",
  "/student/reset-password",
  "/student/password-reset-success",
  "/student/enroll",
];

export default function StudentPortalRouteShell({ children }) {
  const pathname = usePathname() ?? "";
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const openPortal = useCallback(() => setIsPortalOpen(true), []);
  const closePortal = useCallback(() => setIsPortalOpen(false), []);
  const shouldShowLauncher = ROUTES_WITHOUT_PUBLIC_HEADER.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return (
    <>
      {children}
      {shouldShowLauncher ? (
        <button
          type="button"
          className="student-portal-route-launcher"
          onClick={openPortal}
        >
          <UserRound size={17} aria-hidden="true" />
          <span>Student Portal</span>
        </button>
      ) : null}
      {isPortalOpen ? <StudentPortalModal onClose={closePortal} /> : null}
    </>
  );
}
