import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseApplicationForm from "@/components/courses/CourseApplicationForm";

const { applyAction } = vi.hoisted(() => ({
  applyAction: vi.fn(),
}));

vi.mock("@/app/courses/actions", () => ({
  applyForCourseAction: (...args) => applyAction(...args),
}));

describe("CourseApplicationForm", () => {
  beforeEach(() => {
    applyAction.mockReset();
  });

  it("submits the selected course and displays action errors", async () => {
    applyAction.mockResolvedValue({
      error: "Your course application could not be saved. Please try again.",
    });
    const { container } = render(
      <CourseApplicationForm slug="cloud-fundamentals" />,
    );

    expect(container.querySelector('input[name="slug"]')).toHaveAttribute(
      "value",
      "cloud-fundamentals",
    );
    fireEvent.click(screen.getByRole("button", { name: "Sign up for this course" }));

    await waitFor(() => {
      expect(applyAction).toHaveBeenCalled();
      expect(
        screen.getByRole("alert"),
      ).toHaveTextContent("Your course application could not be saved");
    });
  });
});
