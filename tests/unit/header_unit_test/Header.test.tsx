import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Header from "@/components/header/Header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/courses",
}));

describe("Header", () => {
  afterEach(() => cleanup());

  it("renders the header element with correct structure", () => {
    render(<Header />);
    const header = document.querySelector(".sprint-site-header");
    expect(header).toBeInTheDocument();
  });

  it("renders HeaderLogo, DesktopNavigation, HeaderActions, and MobileNavigation", () => {
    render(<Header />);
    expect(screen.getByLabelText(/SPRINT Institutional Hub Home/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText("Student Portal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
  });

  it("does not apply scrolled class on initial render", () => {
    render(<Header />);
    const header = document.querySelector(".sprint-site-header");
    expect(header).not.toHaveClass("is-scrolled");
  });

  it("applies scrolled class when window scrollY exceeds threshold", () => {
    render(<Header />);
    const header = document.querySelector(".sprint-site-header");
    expect(header).not.toHaveClass("is-scrolled");

    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 100,
    });
    fireEvent.scroll(window);

    expect(header).toHaveClass("is-scrolled");
  });

  it("removes scrolled class when scrollY drops below threshold", () => {
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 100,
    });
    render(<Header />);
    const header = document.querySelector(".sprint-site-header");
    expect(header).toHaveClass("is-scrolled");

    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 10,
    });
    fireEvent.scroll(window);

    expect(header).not.toHaveClass("is-scrolled");
  });

  it("does not apply scrolled class when scrollY is exactly at threshold (20)", () => {
    render(<Header />);
    const header = document.querySelector(".sprint-site-header");

    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 20,
    });
    fireEvent.scroll(window);

    expect(header).not.toHaveClass("is-scrolled");
  });

  it("toggles mobile menu open state when toggle button is clicked", () => {
    render(<Header />);
    const toggleButton = screen.getByRole("button", { name: "Open navigation menu" });

    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: "Close navigation menu" })).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
  });
});
