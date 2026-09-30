import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import navigation from "@/config/student-navigation.json";
import { mockQuickActions } from "@/data/student";

/**
 * Guard for the portal information architecture:
 * 1. every sidebar entry resolves to a real page under src/app/student/(portal)
 * 2. every route folder under (portal) is reachable (sidebar or allow-listed)
 * 3. nothing inside the portal source links to a removed section
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PORTAL_DIR = path.join(ROOT, "src", "app", "student", "(portal)");
/**
 * The auth screens (login, forgot-password, check-email, reset-password,
 * password-reset-success) are full-screen routes that sit outside the (portal)
 * group, so `/student/*` links may resolve to either directory.
 */
const STUDENT_DIR = path.join(ROOT, "src", "app", "student");
const PORTAL_COMPONENT_DIR = path.join(ROOT, "src", "components", "student");
const STUDENT_DATA_FILE = path.join(ROOT, "src", "data", "student.js");

/**
 * Portal routes that intentionally stay off the sidebar because they are
 * dashboard destinations only. Keep in sync with the nav config.
 */
const OFF_SIDEBAR_ROUTES = ["resources"];

const routeFolders = () =>
  readdirSync(PORTAL_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const hasPage = (href) => {
  const segment = href.replace("/student/", "");
  return (
    existsSync(path.join(PORTAL_DIR, segment, "page.jsx")) ||
    existsSync(path.join(STUDENT_DIR, segment, "page.jsx"))
  );
};


const collectJsxFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectJsxFiles(full);
    return entry.name.endsWith(".jsx") ? [full] : [];
  });

/** Every quoted "/student/<segment>" string inside the portal source. */
const portalStudentLinks = () => {
  const sources = [
    ...collectJsxFiles(PORTAL_DIR),
    ...collectJsxFiles(PORTAL_COMPONENT_DIR),
    STUDENT_DATA_FILE,
  ];

  const links = new Set();
  sources.forEach((file) => {
    const code = readFileSync(file, "utf8");
    const matches = code.matchAll(/["']\/student\/([a-z0-9-]+)["']/g);
    for (const match of matches) links.add(`/student/${match[1]}`);
  });

  return [...links].sort();
};

describe("Student portal navigation integrity", () => {
  it("keeps the sidebar at the nine agreed sections with unique targets", () => {
    expect(navigation).toHaveLength(9);
    expect(new Set(navigation.map((item) => item.label)).size).toBe(navigation.length);
    expect(new Set(navigation.map((item) => item.href)).size).toBe(navigation.length);
  });

  it("resolves every sidebar entry to an existing page", () => {
    navigation.forEach((item) => {
      expect(item.href.startsWith("/student/"), item.label).toBe(true);
      expect(hasPage(item.href), `${item.label} → ${item.href}`).toBe(true);
    });
  });

  it("keeps every portal route reachable from the sidebar or the dashboard", () => {
    routeFolders().forEach((folder) => {
      if (OFF_SIDEBAR_ROUTES.includes(folder)) return;
      const inSidebar = navigation.some((item) => item.href === `/student/${folder}`);
      const inQuickActions = mockQuickActions.some((action) => action.href === `/student/${folder}`);
      expect(inSidebar || inQuickActions, folder).toBe(true);
    });
  });

  it("leaves no portal link pointing at a removed section", () => {
    const links = portalStudentLinks();

    expect(links.length).toBeGreaterThan(0);
    links.forEach((href) => {
      expect(hasPage(href), `dangling link: ${href}`).toBe(true);
    });
  });

  it("drops the retired sections from both config and source", () => {
    const retired = [
      "applications",
      "exams",
      "cohort",
      "attendance",
      "permissions",
      "placements",
    ];

    const folders = routeFolders();
    const links = portalStudentLinks();

    retired.forEach((segment) => {
      expect(folders, `folder /student/${segment}`).not.toContain(segment);
      expect(links, `link /student/${segment}`).not.toContain(`/student/${segment}`);
    });
  });
});