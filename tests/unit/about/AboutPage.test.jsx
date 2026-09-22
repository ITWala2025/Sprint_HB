import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import AboutPage from "@/app/about/page.jsx";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
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

  it("redirects the Request a Callback CTA to the contact page", () => {
    render(<AboutPage />);

    const cta = screen.getByRole("link", { name: /request a callback/i });

    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta).toHaveAttribute("data-track", "cta_contact");
  });
});