import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import DesktopNavigation from "@/components/header/DesktopNavigation";

describe("DesktopNavigation", () => {
  afterEach(() => cleanup());

  it("renders a nav with aria-label Main navigation", () => {
    render(<DesktopNavigation pathname="/courses" />);
    expect(screen.getByRole("navigation", { name: /Main navigation/i })).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<DesktopNavigation pathname="/courses" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
  });

  it("renders correct link labels", () => {
    render(<DesktopNavigation pathname="/courses" />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Courses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About Us" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders links with correct hrefs", () => {
    render(<DesktopNavigation pathname="/courses" />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/courses");
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("marks the active link with aria-current page", () => {
    render(<DesktopNavigation pathname="/courses" />);
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("aria-current", "page");
  });

  it("does not mark non-active links with aria-current", () => {
    render(<DesktopNavigation pathname="/courses" />);
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "About Us" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Contact" })).not.toHaveAttribute("aria-current");
  });

  it("marks Home as active when pathname is exactly /", () => {
    render(<DesktopNavigation pathname="/" />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Courses" })).not.toHaveAttribute("aria-current");
  });

  it("marks Home as active when pathname is / with nested route", () => {
    render(<DesktopNavigation pathname="/nested" />);
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("marks a parent route as active for nested children", () => {
    render(<DesktopNavigation pathname="/about/team" />);
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("aria-current", "page");
  });

  it("marks Contact as active when pathname starts with /contact", () => {
    render(<DesktopNavigation pathname="/contact/info" />);
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("aria-current", "page");
  });

  it("applies active styling class to the active link", () => {
    render(<DesktopNavigation pathname="/courses" />);
    const activeLink = screen.getByRole("link", { name: "Courses" });
    expect(activeLink).toHaveClass("bg-brand-navy");
    expect(activeLink).toHaveClass("text-white");
  });

  it("applies inactive styling class to non-active links", () => {
    render(<DesktopNavigation pathname="/courses" />);
    const inactiveLink = screen.getByRole("link", { name: "Home" });
    expect(inactiveLink).toHaveClass("text-brand-navy");
    expect(inactiveLink).not.toHaveClass("bg-brand-navy");
  });
});
