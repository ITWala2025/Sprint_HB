"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/header/Header";
import ConditionalCampusNewsTicker from "@/components/layout/ConditionalCampusNewsTicker";
import Footer from "@/components/footer/Footer";
import AiAssistant from "@/components/ai/AiAssistant";
import HeaderLogo from "@/components/header/HeaderLogo";
import siteConfig from "@/config/site.config.json";

/**
 * Routes with focused layouts that omit the public site chrome.
 */
const FOCUSED_ROUTES = [
  "/login",
  "/forgot-password",
  "/set-password",
  "/student/login",
  "/student/enroll",
  "/student/forgot-password",
  "/student/check-email",
  "/student/reset-password",
  "/student/password-reset-success",
  "/staff",
];

const STUDENT_AUTH_ROUTES = [
  "/student/login",
  "/student/enroll",
  "/student/forgot-password",
  "/student/check-email",
  "/student/reset-password",
  "/student/password-reset-success",
];

const matchesRoute = (pathname, routes) =>
  routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

function StudentAuthContextualLink({ pathname }) {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const enrollmentHref = requestedNext
    ? `/student/enroll?${new URLSearchParams({ next: requestedNext })}`
    : "/student/enroll";
  const loginHref = requestedNext
    ? `/student/login?${new URLSearchParams({ next: requestedNext })}`
    : "/student/login";
  const authLink = pathname === "/student/login"
    ? { href: enrollmentHref, label: "Don't have an account? Enroll Now →" }
    : pathname === "/student/enroll"
      ? { href: loginHref, label: "Already enrolled? Sign in" }
      : { href: loginHref, label: "Back to Sign in" };

  return (
    <Link
      href={authLink.href}
      className="sprint-focus rounded-lg text-right text-xs font-semibold text-brand-navy hover:text-brand-red sm:text-sm"
    >
      {authLink.label}
    </Link>
  );
}

export default function PublicSiteShell({ children, ticker }) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");
  const isFocusedRoute = matchesRoute(pathname, FOCUSED_ROUTES);
  const isStudentAuthRoute = matchesRoute(pathname, STUDENT_AUTH_ROUTES);
  const showPublicChrome = !isAdminRoute && !isFocusedRoute;

  return (
    <>
      {isStudentAuthRoute && (
        <header className="border-b border-brand-border bg-brand-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <HeaderLogo />
            <Suspense fallback={<span className="w-32" aria-hidden="true" />}>
              <StudentAuthContextualLink pathname={pathname} />
            </Suspense>
          </div>
        </header>
      )}
      {showPublicChrome && <Header />}

      {showPublicChrome && (
        <ConditionalCampusNewsTicker>{ticker}</ConditionalCampusNewsTicker>
      )}
      <main id="main">
        {children}
      </main>
      {showPublicChrome && (
        <Footer />
      )}
      {showPublicChrome && (
        <a
          href={siteConfig.contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="whatsapp-float"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M20.52 3.48A11.82 11.82 0 0 0 12.03 0C5.5 0 .14 5.36.14 11.9c0 2.1.55 4.15 1.6 5.96L.02 24l6.3-1.65a11.92 11.92 0 0 0 5.72 1.74h.01c6.53 0 11.9-5.36 11.9-11.9 0-3.18-1.24-6.17-3.43-8.71ZM12.04 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.82 9.82 0 0 1-1.5-5.27c0-5.46 4.44-9.9 9.9-9.9a9.78 9.78 0 0 1 6.97 2.9 9.8 9.8 0 0 1 2.9 6.98c0 5.46-4.44 9.9-9.9 9.9Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.66.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.51-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.52-.07-.15-.66-1.58-.9-2.17-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.38-.27.3-1.03 1-1.03 2.44 0 1.44 1.06 2.82 1.2 3.02.15.2 2.06 3.14 4.98 4.44.7.3 1.25.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z"
              fill="currentColor"
            />
          </svg>
        </a>
      )}
      {showPublicChrome && <AiAssistant />}
    </>
  );
}
