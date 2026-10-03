import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";

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
  redirect: vi.fn(),
}));

describe("Student portal placeholder routes", () => {
  it.each([
    ["Profile", StudentProfilePage],
    ["Apply Courses", StudentApplyCoursesPage],
    ["My Course", StudentMyCoursePage],
    ["Certificate", StudentCertificatesPage],
    ["Result", StudentResultPage],
    ["Help & Support", StudentHelpSupportPage],
  ])(
    "renders the %s section shell with a way back to the dashboard",
    (title, Page) => {
      render(<Page />);

      expect(
        screen.getByRole("heading", { level: 1, name: title }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("This section is being built"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /back to dashboard/i }),
      ).toHaveAttribute("href", "/student/dashboard");
    },
  );

  it("includes account settings inside the Profile page", () => {
    render(<StudentProfilePage />);

    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /account preferences, notification channels, password and privacy controls/i,
      ),
    ).toBeInTheDocument();
  });

  it("redirects the old Settings route to the embedded Profile section", () => {
    StudentSettingsPage();

    expect(redirect).toHaveBeenCalledWith("/student/profile#settings");
  });
});
