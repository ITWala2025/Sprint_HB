import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CareerHero from "@/components/careers/CareerHero";

vi.mock("next/link", () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

// The hero content column is the direct parent of the H1 (the breadcrumb sits
// above it inside the same column).
const getContentColumn = () =>
  screen.getByRole("heading", {
    name: /build the future of\s*tech education/i,
  }).parentElement;

describe("CareerHero", () => {
  it("keeps the hero content aligned to the shared left container edge", () => {
    render(<CareerHero />);

    const content = getContentColumn();
    const actions = screen.getByRole("link", {
      name: /view open roles/i,
    }).parentElement;

    expect(content).toHaveClass("mx-auto", "max-w-[1200px]", "text-left");
    expect(actions).toHaveClass("items-start", "justify-start");
  });

  it("reduces the hero vertical padding by 30% (py-20 -> py-14)", () => {
    render(<CareerHero />);

    const content = getContentColumn();

    expect(content).toHaveClass("py-14");
    expect(content).not.toHaveClass("py-20");
  });

  it("replaces the 'Careers & Internships' eyebrow with a Home > Careers breadcrumb", () => {
    render(<CareerHero />);

    expect(
      screen.queryByText("Careers & Internships"),
    ).not.toBeInTheDocument();

    const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    const home = screen.getByRole("link", { name: "Home" });

    expect(breadcrumb).toContainElement(home);
    expect(home).toHaveAttribute("href", "/");
    expect(breadcrumb).toHaveTextContent(/home\s*›\s*careers/i);

    // "Careers" is the current crumb: rendered, but not clickable.
    expect(
      screen.queryByRole("link", { name: "Careers" }),
    ).not.toBeInTheDocument();
    expect(breadcrumb.querySelector('[aria-current="page"]')).toHaveTextContent(
      "Careers",
    );
  });

  it("keeps only the View Open Roles CTA", () => {
    render(<CareerHero />);

    expect(
      screen.getByRole("link", { name: /view open roles/i }),
    ).toHaveAttribute("href", "#open-positions");
    expect(
      screen.queryByRole("link", { name: /apply now/i }),
    ).not.toBeInTheDocument();
  });
});
