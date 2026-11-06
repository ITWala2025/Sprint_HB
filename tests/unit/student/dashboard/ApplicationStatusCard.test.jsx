import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ApplicationStatusCard from "@/components/student/dashboard/ApplicationStatusCard";

describe("ApplicationStatusCard", () => {
  it("shows a student's selected course and its pending review status with application ID", () => {
    const { container } = render(
      <ApplicationStatusCard
        applications={[
          {
            id: "b7e28394-1111-4444-8888-abcdef123456",
            applicationId: "SPR-APP-2610-0008",
            courseTitle: "Cloud Engineering",
            status: "pending",
            createdAt: "2026-10-30T12:00:00.000Z",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "My course applications" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cloud Engineering")).toBeInTheDocument();
    expect(screen.getByText("Application ID: SPR-APP-2610-0008")).toBeInTheDocument();
    expect(screen.getByText("Under review")).toBeInTheDocument();
    // Ensure raw UUID is NOT rendered in the DOM
    expect(container.textContent).not.toContain("b7e28394-1111-4444-8888-abcdef123456");
  });

  it("does not render a card when the student has no applications", () => {
    const { container } = render(<ApplicationStatusCard applications={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
