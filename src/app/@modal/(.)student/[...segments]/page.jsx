import { createElement } from "react";
import { notFound } from "next/navigation";

import StudentRouteModal from "@/components/student/StudentRouteModal";
import StudentLayout from "@/components/student/StudentLayout";

import StudentLoginPage from "@/app/student/login/page";
import StudentForgotPasswordPage from "@/app/student/forgot-password/page";
import StudentCheckEmailPage from "@/app/student/check-email/page";
import StudentResetPasswordPage from "@/app/student/reset-password/page";
import StudentEnrollPage from "@/app/student/enroll/page";
import StudentPasswordResetSuccessPage from "@/app/student/password-reset-success/page";
import StudentApplyCoursePage from "@/app/student/(portal)/apply-course/page";
import StudentAssignmentsPage from "@/app/student/(portal)/assignments/page";
import StudentCertificatesPage from "@/app/student/(portal)/certificates/page";
import StudentDashboardPage from "@/app/student/(portal)/dashboard/page";
import StudentHelpSupportPage from "@/app/student/(portal)/help-support/page";
import StudentMyCoursePage from "@/app/student/(portal)/my-course/page";
import StudentProfilePage from "@/app/student/(portal)/profile/page";
import StudentResourcesPage from "@/app/student/(portal)/resources/page";
import StudentResultPage from "@/app/student/(portal)/result/page";
import StudentSettingsPage from "@/app/student/(portal)/settings/page";

const studentRoutes = {
  login: { component: StudentLoginPage, title: "Student Portal", modalLogin: true },
  "forgot-password": {
    component: StudentForgotPasswordPage,
    title: "Reset your password",
    modalPage: true,
  },
  "check-email": {
    component: StudentCheckEmailPage,
    title: "Check your email",
    modalPage: true,
  },
  "reset-password": {
    component: StudentResetPasswordPage,
    title: "Create a new password",
    modalPage: true,
  },
  enroll: {
    component: StudentEnrollPage,
    title: "Student enrollment",
    fullPage: true,
  },
  "password-reset-success": {
    component: StudentPasswordResetSuccessPage,
    title: "Password updated",
  },
  "apply-course": {
    component: StudentApplyCoursePage,
    title: "Apply for a course",
    portal: true,
  },
  assignments: {
    component: StudentAssignmentsPage,
    title: "Assignments",
    portal: true,
  },
  certificates: {
    component: StudentCertificatesPage,
    title: "Certificates",
    portal: true,
  },
  dashboard: {
    component: StudentDashboardPage,
    title: "Student dashboard",
    portal: true,
    fullPage: true,
  },
  "help-support": {
    component: StudentHelpSupportPage,
    title: "Help and support",
    portal: true,
  },
  "my-course": {
    component: StudentMyCoursePage,
    title: "My course",
    portal: true,
  },
  profile: {
    component: StudentProfilePage,
    title: "My profile",
    portal: true,
  },
  resources: {
    component: StudentResourcesPage,
    title: "Learning resources",
    portal: true,
  },
  result: {
    component: StudentResultPage,
    title: "Results",
    portal: true,
  },
  settings: {
    component: StudentSettingsPage,
    title: "Settings",
    portal: true,
  },
};

export default async function InterceptedStudentPage({ params }) {
  const { segments } = await params;
  const routeKey = segments.join("/");
  const route = studentRoutes[routeKey];

  if (!route) notFound();

  const page = createElement(route.component, {
    isModal: route.modalLogin || route.modalPage,
  });
  const content = route.portal ? (
    <StudentLayout>{page}</StudentLayout>
  ) : (
    page
  );

  if (route.fullPage) return content;

  return (
    <StudentRouteModal
      title={route.title}
      contentClassName={
        route.modalLogin
          ? "student-route-modal-content student-route-modal-content--login"
          : route.modalPage
            ? "student-route-modal-content student-route-modal-content--auth"
            : "student-route-modal-content"
      }
    >
      {content}
    </StudentRouteModal>
  );
}
