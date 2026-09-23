import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Testimonials from "@/components/Home/Testimonials";
import { testimonials } from "@/data/data";

describe("Testimonials", () => {
  it("renders all testimonials in a horizontal snap track", () => {
    render(<Testimonials />);

    const track = screen.getByRole("region", {
      name: /learner testimonials/i,
    });

    expect(
      screen.getByRole("heading", { name: /what our students say/i }),
    ).toBeInTheDocument();
    expect(track).toHaveClass("snap-x", "snap-mandatory", "overflow-x-auto");
    expect(track.querySelectorAll("article")).toHaveLength(testimonials.length);
    expect(
      screen.getByRole("button", { name: /previous testimonial/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /next testimonial/i }),
    ).toBeInTheDocument();

    testimonials.forEach((testimonial) => {
      expect(screen.getByText(testimonial.name)).toBeInTheDocument();
      expect(screen.getByText(testimonial.role)).toBeInTheDocument();
      expect(screen.getByText(`“${testimonial.quote}”`)).toBeInTheDocument();
    });
  });
});
