import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ApplicationStatusCard from "@/components/student/dashboard/ApplicationStatusCard";

describe("ApplicationStatusCard", () => {
  it("shows a student's selected course and its pending review status", () => {
    render(
      <ApplicationStatusCard
        applications={[
          {
            id: "application-1",
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
    expect(screen.getByText("Under review")).toBeInTheDocument();
  });

  it("does not render a card when the student has no applications", () => {
    const { container } = render(<ApplicationStatusCard applications={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
