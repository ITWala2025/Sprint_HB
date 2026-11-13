// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import VideoTestimonials from "@/components/Home/VideoTestimonials";
import { videoTestimonials } from "@/data/data";

describe("VideoTestimonials", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      }),
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    delete window.matchMedia;
    vi.unstubAllGlobals();
  });

  it("loads a YouTube iframe only after its play button is clicked", () => {
    render(<VideoTestimonials />);

    expect(document.querySelectorAll("iframe")).toHaveLength(0);
    const thumbnails = document.querySelectorAll("img");
    expect(thumbnails).toHaveLength(videoTestimonials.length);
    videoTestimonials.forEach((testimonial, index) => {
      expect(thumbnails[index]).toHaveAttribute(
        "src",
        `https://img.youtube.com/vi/${testimonial.youtubeVideoId}/hqdefault.jpg`,
      );
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: `Play ${videoTestimonials[0].name}'s testimonial`,
      }),
    );

    expect(
      screen.getByTitle(`${videoTestimonials[0].name}'s testimonial`),
    ).toHaveAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${videoTestimonials[0].youtubeVideoId}?autoplay=1`,
    );
    expect(document.querySelectorAll("iframe")).toHaveLength(1);
  });
});
