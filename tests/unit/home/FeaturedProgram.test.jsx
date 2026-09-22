import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FeaturedProgram from "@/components/Home/FeaturedProgram";
import { featuredCourse, featuredProgramStages } from "@/data/data";

describe("FeaturedProgram", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the complete stages timeline collapsed until the single toggle is activated", () => {
    render(<FeaturedProgram />);

    const stages = document.getElementById("featured-program-stages");
    const toggle = screen.getByRole("button", { name: /view program stages/i });

    expect(
      screen.getByRole("heading", { name: featuredCourse.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(featuredCourse.shortDescription),
    ).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(stages).toHaveAttribute("aria-hidden", "true");

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    fireEvent.click(toggle);

    expect(
      screen.getByRole("button", { name: /hide program stages/i }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(stages).toHaveAttribute("aria-hidden", "false");

    featuredProgramStages.forEach((stage) => {
      expect(screen.getByText(stage.title)).toBeInTheDocument();
      expect(screen.getByText(stage.description)).toBeInTheDocument();
    });
  });
});
