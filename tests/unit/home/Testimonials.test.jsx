import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Testimonials from "@/components/Home/Testimonials";
import { testimonials } from "@/data/data";

describe("Testimonials", () => {
  it("renders all testimonials in a horizontal snap track", () => {
    render(<Testimonials />);

    const track = screen.getByRole("region", {
      name: /student testimonials/i,
    });

    expect(
      screen.getByRole("heading", { name: /what our students say/i }),
    ).toBeInTheDocument();
    expect(track).toHaveClass("snap-x", "snap-mandatory", "overflow-x-auto");
    expect(track.querySelectorAll("article")).toHaveLength(testimonials.length);
    expect(track.querySelectorAll("img")).toHaveLength(0);
    testimonials.forEach((testimonial) => {
      expect(screen.getByText(testimonial.name)).toBeInTheDocument();
      expect(screen.getByText(testimonial.role)).toBeInTheDocument();
      expect(screen.getByText(testimonial.quote)).toBeInTheDocument();
      const article = screen.getByText(testimonial.name).closest("article");
      const initials = testimonial.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");
      expect(article.querySelector(".rounded-full")).toHaveTextContent(initials);
    });
  });
});
