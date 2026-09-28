import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FeaturedProgram from "@/components/Home/FeaturedProgram";
import { featuredCourse, featuredProgramStages } from "@/data/data";

describe("FeaturedProgram", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders every program stage immediately without a disclosure control", () => {
    render(<FeaturedProgram />);

    expect(
      screen.getByRole("heading", { name: featuredCourse.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(featuredCourse.shortDescription),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /program stages/i }),
    ).not.toBeInTheDocument();

    featuredProgramStages.forEach((stage) => {
      expect(
        screen.getByRole("heading", { name: stage.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(stage.title)).toBeInTheDocument();
      expect(screen.getByText(stage.description)).toBeInTheDocument();
    });
  });
});
