import { describe, it, expect } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import HeaderActions from "@/components/header/HeaderActions";

describe("HeaderActions", () => {
  afterEach(() => cleanup());

  it("renders the Student Portal link", () => {
    render(<HeaderActions />);
    const studentLink = screen.getByRole("link", { name: /Student Portal/i });
    expect(studentLink).toHaveAttribute("href", "/student/login");
  });

  it("renders the Enroll Now link", () => {
    render(<HeaderActions />);
    const enrollLink = screen.getByRole("link", { name: /Enroll Now/i });
    expect(enrollLink).toHaveAttribute("href", "/register");
  });

  it("renders the UserRound icon with aria-hidden", () => {
    render(<HeaderActions />);
    const link = screen.getByRole("link", { name: /Student Portal/i });
    const svg = link.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders both links", () => {
    render(<HeaderActions />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  it("hides the container on small screens via className", () => {
    const { container } = render(<HeaderActions />);
    const wrapper = container.querySelector(".hidden");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("lg:flex");
  });
});
