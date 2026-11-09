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

  if (!/^\/courses\/[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(destination.pathname)) {
    return "/student/dashboard";
  }

  return destination.pathname;
}
