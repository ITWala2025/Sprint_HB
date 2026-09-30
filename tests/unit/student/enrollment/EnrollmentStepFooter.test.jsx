import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import EnrollmentStepFooter from "@/components/student/enrollment/EnrollmentStepFooter";

describe("EnrollmentStepFooter", () => {
  const renderFooter = (props = {}) =>
    render(
      <EnrollmentStepFooter
        onBack={vi.fn()}
        isFirst={false}
        isLast={false}
        stepNumber={2}
        totalSteps={5}
        {...props}
      />,
    );

  it("submits the step's form with Continue and never submits with Back", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderFooter({ onBack });

    expect(screen.getByRole("button", { name: /^continue$/i })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("button", { name: /^back$/i })).toHaveAttribute("type", "button");

    await user.click(screen.getByRole("button", { name: /^back$/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("pins the action bar to the bottom on mobile and drops it into the card from md up", () => {
    renderFooter();

    const back = screen.getByRole("button", { name: /^back$/i });
    const row = back.parentElement;
    const bar = row.parentElement;

    expect(row.className).toContain("flex-col-reverse");
    expect(row.className).toContain("md:flex-row");

    expect(bar.className).toContain("fixed");
    expect(bar.className).toContain("bottom-0");
    expect(bar.className).toContain("md:static");

    // 48px tall controls keep the mobile CTA above the 44px touch-target floor.
    expect(back.className).toContain("h-12");
    expect(screen.getByRole("button", { name: /^continue$/i }).className).toContain("h-12");
  });

  it("repeats the step counter in the pinned bar so progress stays visible", () => {
    renderFooter({ stepNumber: 3, totalSteps: 5 });

    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
  });

  it("hides Back on the first step and right-aligns Continue", () => {
    renderFooter({ isFirst: true, stepNumber: 1 });

    expect(screen.queryByRole("button", { name: /^back$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^continue$/i }).parentElement.className).toContain(
      "md:justify-end",
    );
  });

  it("renames the primary action on the last step", () => {
    renderFooter({ isLast: true, stepNumber: 5 });

    expect(screen.getByRole("button", { name: /submit enrollment/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^back$/i })).toBeInTheDocument();
  });

  it("accepts a custom submit label", () => {
    renderFooter({ submitLabel: "Save and continue" });

    expect(screen.getByRole("button", { name: /save and continue/i })).toBeInTheDocument();
  });

  it("adds a Skip for now action for optional steps that never submits the form", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    renderFooter({ onSkip });

    const skip = screen.getByRole("button", { name: /skip for now/i });
    expect(skip).toHaveAttribute("type", "button");
    expect(skip.className).toContain("h-12");

    await user.click(skip);
    expect(onSkip).toHaveBeenCalledTimes(1);

    // Back and Skip share one row on mobile (`md:contents` unwraps it into the
    // desktop toolbar), so the pinned bar stays two rows tall.
    expect(
      screen.getByRole("button", { name: /^back$/i }).parentElement.className,
    ).toContain("md:contents");
  });

  it("shows no skip action on a required step", () => {
    renderFooter();

    expect(screen.queryByRole("button", { name: /skip for now/i })).not.toBeInTheDocument();
    // Without the group wrapper, Back sits directly in the action row.
    expect(screen.getByRole("button", { name: /^back$/i }).parentElement.className).toContain(
      "flex-col-reverse",
    );
  });
});
