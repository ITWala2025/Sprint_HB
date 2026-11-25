export function resolveStudentLoginNextPath(search) {
  const requestedPath = new URLSearchParams(search).get("next");
  if (!requestedPath || !requestedPath.startsWith("/") || requestedPath.startsWith("//")) {
    return "/student/dashboard";
  }

  let destination;
  try {
    destination = new URL(requestedPath, "https://student-portal.invalid");
  } catch {
    return "/student/dashboard";
  }

  if (destination.origin !== "https://student-portal.invalid") {
    return "/student/dashboard";
  }

  const isProductPage =
    /^\/(?:courses|bundles)\/[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(destination.pathname);
  const studentRoutes = [
    "/student/dashboard",
    "/student/my-course",
    "/student/apply-course",
    "/student/assignments",
    "/student/certificates",
    "/student/profile",
    "/student/resources",
    "/student/result",
    "/student/settings",
    "/student/help-support",
  ];
  const isStudentPortalPage = studentRoutes.some(
    (route) =>
      destination.pathname === route ||
      destination.pathname.startsWith(`${route}/`),
  );

  if (!isProductPage && !isStudentPortalPage) {
    return "/student/dashboard";
  }

  return `${destination.pathname}${destination.search}`;
}
