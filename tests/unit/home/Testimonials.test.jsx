import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Testimonials from "@/components/Home/Testimonials";
import { testimonials } from "@/data/data";

describe("Testimonials", () => {
  it("renders all testimonials in a horizontal snap track", () => {
    render(<Testimonials />);

    const track = screen.getByRole("region", {
      name: /student testimonials/i,
    });

    expect(
      screen.getByRole("heading", { name: /what our students say/i }),
    ).toBeInTheDocument();
    expect(track).toHaveClass("snap-x", "snap-mandatory", "overflow-x-auto");
    expect(track.querySelectorAll("article")).toHaveLength(testimonials.length);
    expect(track.querySelectorAll("img")).toHaveLength(0);
    testimonials.forEach((testimonial) => {
      expect(screen.getByText(testimonial.name)).toBeInTheDocument();
      const article = screen.getByText(testimonial.name).closest("article");
      expect(article.lastElementChild.querySelectorAll("p")[1]).toHaveTextContent(
        testimonial.role.trim(),
      );
      if (testimonial.type === "video") {
        const video = article.querySelector("video");
        expect(testimonial).not.toHaveProperty("quote");
        expect(article.querySelector("svg")).toBeNull();
        expect(video).toHaveAttribute("src", testimonial.videoUrl);
        expect(video).toHaveAttribute("preload", "metadata");
        expect(video).toHaveAttribute("playsinline");
        expect(video).toHaveAttribute("controls");
        expect(video).not.toHaveAttribute("poster");
        return;
      }
      expect(within(article).getByText(testimonial.quote)).toBeInTheDocument();
      expect(article.querySelector("svg")).not.toBeNull();
      const initials = testimonial.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");
      expect(article.querySelector(".rounded-full")).toHaveTextContent(initials);
    });
  });

  it("pauses the previous video when another video starts", () => {
    const secondVideoTestimonial = {
      ...testimonials.find((testimonial) => testimonial.type === "video"),
      id: "t7-video-example",
      name: "Second example student",
    };
    testimonials.push(secondVideoTestimonial);
    const { unmount } = render(<Testimonials />);
    const videos = document.querySelectorAll("video");
    const pauseFirst = vi.spyOn(videos[0], "pause").mockImplementation(() => {});

    try {
      fireEvent.play(videos[0]);
      fireEvent.play(videos[1]);
      expect(pauseFirst).toHaveBeenCalledOnce();
    } finally {
      unmount();
      testimonials.pop();
    }
  });

  it("pauses a playing video after its card scrolls out of view", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Testimonials />);
    const track = screen.getByRole("region", { name: /student testimonials/i });
    const video = track.querySelector("video");
    const card = video.closest("article");
    track.getBoundingClientRect = () => ({
      left: 0, right: 320, top: 0, bottom: 400, width: 320, height: 400,
    });
    card.getBoundingClientRect = () => ({
      left: -320, right: -24, top: 0, bottom: 400, width: 296, height: 400,
    });
    const pauseVideo = vi.spyOn(video, "pause").mockImplementation(() => {});

    fireEvent.play(video);
    fireEvent.scroll(track);
    act(() => vi.advanceTimersByTime(20));

    expect(pauseVideo).toHaveBeenCalledOnce();
    unmount();
  });

  it("does not auto-scroll while a video is playing", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const { unmount } = render(<Testimonials />);
    const track = screen.getByRole("region", { name: /student testimonials/i });
    const video = track.querySelector("video");
    const firstCard = track.querySelector("article");
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 320 });
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: 1800 });
    track.getBoundingClientRect = () => ({
      left: 0, right: 320, top: 0, bottom: 400, width: 320, height: 400,
    });
    firstCard.getBoundingClientRect = () => ({
      left: 0, right: 296, top: 0, bottom: 400, width: 296, height: 400,
    });
    track.scrollTo = vi.fn();
    fireEvent.scroll(track);
    act(() => vi.advanceTimersByTime(20));

    fireEvent.play(video);
    act(() => vi.advanceTimersByTime(7000));

    expect(track.scrollTo).not.toHaveBeenCalled();
    fireEvent.pause(video);
    act(() => vi.advanceTimersByTime(6100));
    expect(track.scrollTo).toHaveBeenCalledOnce();
    unmount();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
