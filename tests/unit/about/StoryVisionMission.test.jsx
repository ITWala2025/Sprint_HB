import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import StoryVisionMission from "@/components/sections/StoryVisionMission";
import about from "@/data/about.json";

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

describe("StoryVisionMission", () => {
  const props = { story: about.story, visionMission: about.visionMission };

  it("does not render prev/next arrow buttons", () => {
    render(<StoryVisionMission {...props} />);

    expect(
      screen.queryByRole("button", { name: /previous:|next:/i }),
    ).not.toBeInTheDocument();
  });

  it("renders dot pagination at the bottom with Vision active first", () => {
    render(<StoryVisionMission {...props} />);

    const visionDot = screen.getByRole("button", { name: /show vision/i });
    const missionDot = screen.getByRole("button", { name: /show mission/i });

    expect(visionDot).toHaveAttribute("aria-current", "true");
    expect(missionDot).not.toHaveAttribute("aria-current");
  });

  it("renders no hint text or slide counter above the cards", () => {
    render(<StoryVisionMission {...props} />);

    expect(screen.queryByText(/auto-advances/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/swipe to switch/i)).not.toBeInTheDocument();
  });

  it("switches cards when a dot is clicked", () => {
    render(<StoryVisionMission {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /show mission/i }));

    expect(screen.getByRole("button", { name: /show mission/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("button", { name: /show vision/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("moves to the next card on a horizontal swipe", () => {
    render(<StoryVisionMission {...props} />);
    const surface = screen.getByRole("region", { name: /vision and mission/i });

    fireEvent.touchStart(surface, {
      touches: [{ clientX: 200, clientY: 100 }],
    });
    fireEvent.touchEnd(surface, {
      changedTouches: [{ clientX: 100, clientY: 110 }],
    });

    expect(screen.getByRole("button", { name: /show mission/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("ignores vertical drags that should scroll the page", () => {
    render(<StoryVisionMission {...props} />);

    const surface = screen.getByRole("region", { name: /vision and mission/i });

    fireEvent.touchStart(surface, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(surface, {
      changedTouches: [{ clientX: 110, clientY: 320 }],
    });

    expect(screen.getByRole("button", { name: /show vision/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});