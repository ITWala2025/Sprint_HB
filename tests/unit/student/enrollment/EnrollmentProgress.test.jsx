import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import EnrollmentProgress from "@/components/student/enrollment/EnrollmentProgress";
import { ENROLLMENT_STEPS } from "@/components/student/enrollment/enrollment-steps";

describe("EnrollmentProgress", () => {
  const renderProgress = (props = {}) =>
    render(<EnrollmentProgress steps={ENROLLMENT_STEPS} currentIndex={0} {...props} />);

  it("announces itself as the enrollment progress landmark", () => {
    renderProgress();

    expect(screen.getByRole("navigation", { name: "Enrollment progress" })).toBeInTheDocument();
  });

  it("shows the compact counter and the active step on small screens", () => {
    renderProgress({ currentIndex: 1 });

    const counter = screen.getByText("Step 2 of 5");
    expect(within(counter.closest("div")).getByText("Education")).toBeInTheDocument();
  });

  it("lists every step in order and marks the active one", () => {
    renderProgress({ currentIndex: 2 });

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Personal"),
      expect.stringContaining("Education"),
      expect.stringContaining("Specialization"),
      expect.stringContaining("Learning Path"),
      expect.stringContaining("Account"),
    ]);

    expect(screen.getByRole("button", { name: /specialization/i })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("names each step's state for screen readers instead of relying on colour", () => {
    renderProgress({ currentIndex: 2 });

    expect(screen.getAllByText(/— completed/)).toHaveLength(2);
    expect(screen.getAllByText(/— current step/)).toHaveLength(1);
    expect(screen.getAllByText(/— not started yet/)).toHaveLength(2);
  });

  it("lets a completed step be revisited but never skips ahead", async () => {
    const user = userEvent.setup();
    const onStepSelect = vi.fn();
    renderProgress({ currentIndex: 2, onStepSelect });

    expect(screen.getByRole("button", { name: /personal/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /education/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /learning path/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /account/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /personal/i }));
    expect(onStepSelect).toHaveBeenCalledWith(0);
  });

  it("stays safe when no step-selection handler is provided", async () => {
    const user = userEvent.setup();
    renderProgress({ currentIndex: 1 });

    const personal = screen.getByRole("button", { name: /personal/i });
    await user.click(personal);

    expect(personal).toBeEnabled();
  });

  it("reports a finished wizard with every step complete", () => {
    renderProgress({ currentIndex: 4, isComplete: true });

    expect(screen.getByText("All 5 steps complete")).toBeInTheDocument();
    ENROLLMENT_STEPS.forEach((step) => {
      expect(screen.getByRole("button", { name: new RegExp(step.label, "i") })).toBeEnabled();
    });
    expect(screen.queryByText(" — not started yet")).not.toBeInTheDocument();
  });
});
