import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/home/page.jsx";

vi.mock("@/components/Home/Hero", () => ({ default: () => null }));
vi.mock("@/components/Home/PartnerCarousel", () => ({ default: () => null }));
vi.mock("@/components/Home/FeaturedProgram", () => ({ default: () => null }));
vi.mock("@/components/Home/MoreCourses", () => ({ default: () => null }));
vi.mock("@/components/Home/Testimonials", () => ({ default: () => null }));
vi.mock("@/components/Home/FAQSection", () => ({ default: () => null }));
vi.mock("@/components/Home/ContactCTA", () => ({ default: () => null }));

describe("Home faculty filmstrip", () => {
  it("renders existing faculty records in the Home page Faculty section", () => {
    render(<HomePage />);

    const section = document.querySelector("#faculty");
    expect(section).not.toBeNull();
    expect(
      within(section).getByRole("region", { name: "Faculty filmstrip carousel" }),
    ).toBeInTheDocument();
    expect(within(section).getByRole("heading", { name: "Faculty & Experts" })).toBeInTheDocument();
    expect(within(section).getByText("INDUSTRY MENTORS")).toBeInTheDocument();
    expect(within(section).getByText("Active practitioners from leading tech enterprises — showcased by verified domains and credentials.")).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: /satish j/i })).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: /ajay k/i })).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: /mukesh d/i })).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: /alisha r/i })).toBeInTheDocument();
    expect(within(section).queryByText(/Faculty 04 \/ 04/)).not.toBeInTheDocument();
    expect(within(section).queryByRole("article", { name: /faculty profile/i })).not.toBeInTheDocument();
    expect(within(section).getAllByText("Verified Industry Mentor")).toHaveLength(12);
    expect(within(section).queryByRole("img")).not.toBeInTheDocument();
    const satish = within(section).getByRole("button", { name: /satish j/i });
    expect(within(satish).getByText("SJ")).toBeInTheDocument();
    expect(within(satish).getByText("30+ Yrs Exp")).toBeInTheDocument();
    expect(within(satish).getByText("Architecture")).toBeInTheDocument();
  });

  it("supports card selection and keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
    const akash = within(carousel).getByRole("button", { name: /ajay k/i });
    await user.click(akash);

    expect(akash).toHaveAttribute("aria-current", "true");

    fireEvent.keyDown(akash, { key: "ArrowRight" });
    expect(within(carousel).getByRole("button", { name: /mukesh d/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
    fireEvent.keyDown(akash, { key: "ArrowLeft" });
    expect(akash).toHaveAttribute("aria-current", "true");
  });

  it("does not navigate from pointer dragging and omits autoplay controls", () => {
    render(<HomePage />);

    const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
    const stage = carousel.querySelector("div[class*='stage']");
    const activeCard = within(carousel).getByRole("button", { name: /satish j/i });
    expect(within(carousel).queryByRole("group", { name: "Carousel controls" })).not.toBeInTheDocument();
    expect(within(carousel).queryByRole("button", { name: /rotation/i })).not.toBeInTheDocument();

    fireEvent.pointerDown(stage, {
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      clientX: 240,
      clientY: 180,
    });
    fireEvent.pointerMove(stage, {
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      clientX: 150,
      clientY: 180,
    });

    fireEvent.pointerUp(stage, {
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      clientX: 150,
      clientY: 180,
    });

    expect(activeCard).toHaveAttribute("aria-current", "true");
    expect(within(carousel).getByRole("button", { name: /ajay k/i })).toHaveAttribute(
      "aria-current",
      "false",
    );
  });

  const touch = (init = {}) => ({
    pointerType: "touch",
    pointerId: 8,
    isPrimary: true,
    ...init,
  });

  const swipeOn = (element, startX, startY, endX, endY) => {
    fireEvent.pointerDown(element, touch({ clientX: startX, clientY: startY }));
    fireEvent.pointerMove(element, touch({ clientX: endX, clientY: endY }));
    fireEvent.pointerUp(element, touch({ clientX: endX, clientY: endY }));
  };

  it("swipe left advances to the next faculty card", () => {
    render(<HomePage />);

    const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
    const stage = carousel.querySelector("div[class*='stage']");
    const sneha = within(carousel).getByRole("button", { name: /satish j/i });

    swipeOn(stage, 300, 400, 200, 400);

    expect(sneha).toHaveAttribute("aria-current", "false");
    expect(
      within(carousel).getByRole("button", { name: /ajay k/i }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("swipe right moves to the previous faculty card", () => {
    render(<HomePage />);

    const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
    const stage = carousel.querySelector("div[class*='stage']");
    const sneha = within(carousel).getByRole("button", { name: /satish j/i });

    swipeOn(stage, 200, 400, 300, 400);

    expect(sneha).toHaveAttribute("aria-current", "false");
    expect(
      within(carousel).getByRole("button", { name: /alisha r, communication/i }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("small movements and taps do not trigger navigation", () => {
    render(<HomePage />);

    const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
    const stage = carousel.querySelector("div[class*='stage']");
    const sneha = within(carousel).getByRole("button", { name: /satish j/i });

    swipeOn(stage, 300, 400, 310, 400);

    expect(sneha).toHaveAttribute("aria-current", "true");
  });

  it("vertical page scrolling remains usable and does not navigate", () => {
    render(<HomePage />);

    const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
    const stage = carousel.querySelector("div[class*='stage']");
    const sneha = within(carousel).getByRole("button", { name: /satish j/i });

    fireEvent.pointerDown(stage, touch({ clientX: 300, clientY: 400 }));
    fireEvent.pointerMove(stage, touch({ clientX: 300, clientY: 300 }));
    fireEvent.pointerUp(stage, touch({ clientX: 300, clientY: 300 }));

    expect(sneha).toHaveAttribute("aria-current", "true");
  });

  it("advances automatically every 5 seconds", () => {
    vi.useFakeTimers();
    try {
      render(<HomePage />);

      const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
      expect(
        within(carousel).getByRole("button", { name: /satish j/i }),
      ).toHaveAttribute("aria-current", "true");

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(
        within(carousel).getByRole("button", { name: /ajay k/i }),
      ).toHaveAttribute("aria-current", "true");

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(
        within(carousel).getByRole("button", { name: /mukesh d/i }),
      ).toHaveAttribute("aria-current", "true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("pauses autoplay on interaction and resumes after about 5 seconds", () => {
    vi.useFakeTimers();
    try {
      render(<HomePage />);

      const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
      const stage = carousel.querySelector("div[class*='stage']");
      const akash = within(carousel).getByRole("button", { name: /ajay k/i });
      const nikhil = within(carousel).getByRole("button", { name: /mukesh d/i });

      swipeOn(stage, 300, 400, 200, 400);
      expect(akash).toHaveAttribute("aria-current", "true");

      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(akash).toHaveAttribute("aria-current", "true");

      act(() => {
        vi.advanceTimersByTime(2);
      });
      expect(nikhil).toHaveAttribute("aria-current", "true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("clears the autoplay timer when the component unmounts", () => {
    vi.useFakeTimers();
    try {
      const clearIntervalSpy = vi.spyOn(window, "clearInterval");
      const { unmount } = render(<HomePage />);
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it("retains desktop vertical and horizontal wheel navigation", () => {
    vi.useFakeTimers();
    try {
      render(<HomePage />);

      const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
      const sneha = within(carousel).getByRole("button", { name: /satish j/i });
      const akash = within(carousel).getByRole("button", { name: /ajay k/i });
      const nikhil = within(carousel).getByRole("button", { name: /mukesh d/i });

      const advanceCooldown = () => {
        act(() => {
          vi.advanceTimersByTime(300);
        });
      };

      fireEvent.wheel(carousel, { deltaY: 100 });
      expect(akash).toHaveAttribute("aria-current", "true");
      advanceCooldown();

      fireEvent.wheel(carousel, { deltaX: 100 });
      expect(nikhil).toHaveAttribute("aria-current", "true");
      advanceCooldown();

      fireEvent.wheel(carousel, { deltaY: -100 });
      expect(akash).toHaveAttribute("aria-current", "true");
      advanceCooldown();

      fireEvent.wheel(carousel, { deltaX: -100 });
      expect(sneha).toHaveAttribute("aria-current", "true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not autoplay when prefers-reduced-motion is enabled", () => {
    const matchMediaSpy = vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    );
    vi.useFakeTimers();
    try {
      render(<HomePage />);

      const carousel = screen.getByRole("region", { name: "Faculty filmstrip carousel" });
      const sneha = within(carousel).getByRole("button", { name: /satish j/i });

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(sneha).toHaveAttribute("aria-current", "true");
    } finally {
      vi.useRealTimers();
      matchMediaSpy.mockRestore();
    }
  });
});
