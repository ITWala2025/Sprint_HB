import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CareerHero from "@/components/careers/CareerHero";

vi.mock("next/link", () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

describe("CareerHero", () => {
  it("keeps the hero content aligned to the shared left container edge", () => {
    render(<CareerHero />);

    const heading = screen.getByRole("heading", {
      name: /build the future of\s*tech education/i,
    });
    const content = heading.parentElement;
    const actions = screen.getByRole("link", {
      name: /view open roles/i,
    }).parentElement;

    expect(screen.getByText("Careers & Internships")).toBeInTheDocument();
    expect(content).toHaveClass("mx-auto", "max-w-[1200px]", "text-left");
    expect(actions).toHaveClass("items-start", "justify-start");
    expect(
      screen.getByRole("link", { name: /view open roles/i }),
    ).toHaveAttribute("href", "#open-positions");
    expect(screen.getByRole("link", { name: /apply now/i })).toHaveAttribute(
      "href",
      "#application-form",
    );
  });
});
