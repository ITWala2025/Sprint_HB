import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudentApplyCoursesPage from "@/app/student/(portal)/apply-course/page";
import StudentCertificatesPage from "@/app/student/(portal)/certificates/page";
import StudentHelpSupportPage from "@/app/student/(portal)/help-support/page";
import StudentMyCoursePage from "@/app/student/(portal)/my-course/page";
import StudentProfilePage from "@/app/student/(portal)/profile/page";
import StudentResultPage from "@/app/student/(portal)/result/page";
import StudentSettingsPage from "@/app/student/(portal)/settings/page";

vi.mock("next/link", () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/student/profile",
}));

describe("Student portal placeholder routes", () => {
  it.each([
    ["Profile", StudentProfilePage],
    ["Apply Courses", StudentApplyCoursesPage],
    ["My Course", StudentMyCoursePage],
    ["Certificate", StudentCertificatesPage],
    ["Result", StudentResultPage],
    ["Help & Support", StudentHelpSupportPage],
    ["Settings", StudentSettingsPage],
  ])("renders the %s section shell with a way back to the dashboard", (title, Page) => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeInTheDocument();
    expect(screen.getByText("This section is being built")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to dashboard/i }),
    ).toHaveAttribute("href", "/student/dashboard");
  });
});
