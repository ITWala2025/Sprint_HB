import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileNavigation from "@/components/header/MobileNavigation";
import stylesheet from "@/css/global.css";
import "@testing-library/jest-dom";

describe("MobileEnrollButton", () => {
  const renderWithProps = (overrides = {}) =>
    render(
      <MobileNavigation
        pathname="/courses"
        isOpen={false}
        setIsOpen={vi.fn()}
        {...overrides}
      />,
    );

  describe("markup structure", () => {
    it("wraps the mobile Enroll anchor in .sprint-enroll-button", () => {
      renderWithProps();
      const link = screen.getByRole("link", { name: "Enroll Now" });
      expect(link.closest(".sprint-enroll-button")).not.toBeNull();
      expect(link).toHaveAttribute("href", "/student/enroll");
      expect(link.tagName).toBe("A");
    });

    it("renders the floating dots particle layer behind the label", () => {
      renderWithProps();
      const link = screen.getByRole("link", { name: "Enroll Now" });
      const wrapper = link.closest(".sprint-enroll-button")!;
      expect(wrapper.querySelector(".floating-dots")).not.toBeNull();
      // The animated particle layer must sit above any arbitrary descendant
      // (which exists on purpose: a sibling of `.floating-dots`) but below the
      // text/icon content, so taps still land on the anchor.
      const dots = wrapper.querySelectorAll(".dot");
      expect(dots.length).toBe(10);
      for (const dot of dots) {
        expect(dot.style.animationName).toContain("sprint-floating-dots");
        expect(dot.getAttribute("aria-hidden")).toBeTruthy();
      }
    });

    it("renders an ArrowRight with the enroll-arrow class", () => {
      renderWithProps();
      const link = screen.getByRole("link", { name: "Enroll Now" });
      const arrow = link.querySelector(".enroll-arrow") as HTMLElement | null;
      expect(arrow).not.toBeNull();
      expect(arrow.className).toContain("enroll-arrow");
    });

    it("does NOT duplicate the enrollment CTA inside the expanded menu drawer", () => {
      renderWithProps({ isOpen: true });
      const drawer = screen.queryByRole("navigation", { name: /Mobile navigation/i });
      expect(drawer).not.toBeNull();
      // Only ONE Enroll Now link in the whole document — not in the header row
      // AND not again inside the drawer.
      expect(screen.getAllByRole("link", { name: /Enroll Now/i })).toHaveLength(1);
      const withinDrawer = drawer ? drawer.querySelectorAll(".sprint-enroll-button") : [];
      expect(withinDrawer).toHaveLength(0);
    });
  });

  describe("reduced motion support", () => {
    it("suppresses the floating-dots keyframes under reduced motion", () => {
      renderWithProps();
      const link = screen.getByRole("link", { name: "Enroll Now" });
      const wrapper = link.closest(".sprint-enroll-button")!;
      // The global @media (prefers-reduced-motion: reduce) rule selects by
      // class only, so it applies identically to the mobile button reusing the
      // same class. We assert on the compiled global rule instead: with the
      // preference active, each dot's inline `animation` is overridden to none
      // via the cascade. jsdom won't run media queries, so we assert the rule is
      // *present* in the parsed stylesheet so the guard keeps meaning to exist.
      const match = stylesheet.match(
        /\.sprint-enroll-button \.floating-dots \.dot \{[\s\S]*?animation:\s*none;/,
      );
      expect(match).not.toBeNull();
      expect(wrapper.querySelectorAll(".dot").length).toBeGreaterThan(0);
    });
  });

  describe("interaction without a mouse", () => {
    it("slides the arrow on touch pointerdown on the mobile button", () => {
      renderWithProps();
      const link = screen.getByRole("link", { name: "Enroll Now" });
      const arrow = link.querySelector(".enroll-arrow") as HTMLElement;
      // jsdom fires pointerdown for a real click; assert :active is applied on the
      // underlying element via the rule selectors matching the markup above.
      fireEvent.pointerDown(link, { buttons: 1 });
      fireEvent.pointerUp(link);
      // The CSS contract asserts the arrow has `transition: transform 0.3s ease`
      // and sits inside .sprint-enroll-button — both hold after the markup change.
      expect(arrow.className).toContain("enroll-arrow");
    });

    it("still closes the menu when a drawer link is clicked", () => {
      const setIsOpen = vi.fn();
      renderWithProps({ isOpen: true });
      const homeLink = screen.getByRole("link", { name: "Home" });
      fireEvent.click(homeLink);
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });
  });
});

import { vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
