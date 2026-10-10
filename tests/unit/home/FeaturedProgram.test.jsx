import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FeaturedProgram from "@/components/Home/FeaturedProgram";
import { featuredCourse, featuredProgramStages } from "@/data/data";

describe("FeaturedProgram", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders every stage and staggers cards with their timeline connectors", () => {
    const { container } = render(<FeaturedProgram />);

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

    const stages = container.querySelectorAll("[data-index]");
    const timelineSegments = container.querySelectorAll("[data-timeline-segment]");

    expect(stages).toHaveLength(featuredProgramStages.length);
    expect(timelineSegments).toHaveLength(featuredProgramStages.length - 1);
    stages.forEach((stage, index) => {
      expect(stage).toHaveStyle({ transitionDelay: `${index * 600}ms` });
      expect(stage.className).toContain("duration-[600ms]");
    });
    timelineSegments.forEach((segment, index) => {
      expect(segment.querySelector("path")).toHaveStyle({
        transitionDelay: `${300 + index * 600}ms`,
      });
    });
  });
});
