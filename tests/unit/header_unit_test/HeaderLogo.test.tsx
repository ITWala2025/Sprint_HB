import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HeaderLogo from "@/components/header/HeaderLogo";

describe("HeaderLogo", () => {
  afterEach(() => cleanup());

  it("renders a link pointing to the homepage", () => {
    render(<HeaderLogo />);
    const link = screen.getByLabelText(/SPRINT Institutional Hub Home/i);
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders the logo image with correct src and alt", () => {
    render(<HeaderLogo />);
    const image = screen.getByAltText("SPRINT Institutional Hub Logo");
    expect(image).toHaveAttribute("src");
  });

  it("renders the SPRINT text", () => {
    render(<HeaderLogo />);
    expect(screen.getByText("SPRINT")).toBeInTheDocument();
  });

  it("renders the Institutional Hub text", () => {
    render(<HeaderLogo />);
    expect(screen.getByText("Institutional Hub")).toBeInTheDocument();
  });

  it("renders the logo text and subtext within the link", () => {
    render(<HeaderLogo />);
    const link = screen.getByLabelText(/SPRINT Institutional Hub Home/i);
    expect(link).toHaveTextContent("SPRINT");
    expect(link).toHaveTextContent("Institutional Hub");
  });

  it("uses the correct font family and letter spacing on SPRINT text", () => {
    render(<HeaderLogo />);
    const sprintText = screen.getByText("SPRINT");
    expect(sprintText.style.fontFamily).toContain("Trebuchet MS");
    expect(sprintText.style.fontFamily).toContain("Segoe UI");
    expect(sprintText.style.letterSpacing).toBe("0.32em");
  });

  it("uses correct letter spacing on Institutional Hub text", () => {
    render(<HeaderLogo />);
    const hubText = screen.getByText("Institutional Hub");
    expect(hubText.style.letterSpacing).toBe("0.18em");
  });
});
