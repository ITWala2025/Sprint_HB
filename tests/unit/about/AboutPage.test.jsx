import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import AboutPage from "@/app/about/page.jsx";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }) => <img {...props} />,
}));

beforeAll(() => {
  // jsdom does not implement matchMedia or IntersectionObserver, both of
  // which StoryVisionMission relies on during mount.
  if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (typeof window !== "undefined" && typeof window.IntersectionObserver !== "function") {
    window.IntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  }
});

describe("AboutPage", () => {
  it("renders the Connect With SPRINT CTA section", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: /let's talk about your career/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /request a callback/i }),
    ).toBeInTheDocument();
  });

  it("renders a decorative full-bleed hero image like the contact page", () => {
    render(<AboutPage />);

    // Decorative background media (alt="" + aria-hidden), so we query the
    // picture wrapper rather than an accessible role.
    const media = document.querySelector("picture.sprint-hero-media");
    expect(media).not.toBeNull();

    const heroImage = media.querySelector("img.sprint-hero-image");
    expect(heroImage).not.toBeNull();
    expect(heroImage).toHaveAttribute("alt", "");
    expect(heroImage.getAttribute("src")).toContain("about-hero-desktop.webp");
  });

  it("lays the verified impact stats out in a horizontal band", () => {
    render(<AboutPage />);

    const stats = document.querySelector(".sprint-hero-stats");
    expect(stats).not.toBeNull();
    expect(stats.getAttribute("role")).toBe("list");
    expect(stats.getAttribute("aria-label")).toMatch(/verified impact at a glance/i);
    expect(stats.querySelectorAll('[role="listitem"]')).toHaveLength(4);

    expect(
      screen.getByText(/all figures source-verified/i),
    ).toBeInTheDocument();
  });

  it("redirects the Request a Callback CTA to the contact page", () => {
    render(<AboutPage />);

    const cta = screen.getByRole("link", { name: /request a callback/i });

    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta).toHaveAttribute("data-track", "cta_contact");
  });
});