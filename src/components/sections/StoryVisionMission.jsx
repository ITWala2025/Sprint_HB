"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import VisionMissionCard from "@/components/cards/VisionMissionCard";

/**
 * OUR STORY · VISION · MISSION — horizontal scroller
 * ==================================================
 * Merges About_Page.md §3.3 (Our Story) and §3.4 (Vision & Mission)
 * into ONE scrollable div (`.sprint-story-track`). Panels snap
 * horizontally; the left/right arrows, arrow keys, touch swipe and
 * trackpad all move by one panel. Decorative only — all story /
 * vision / mission content stays in the DOM (SEO + reduced motion).
 *
 * Props:
 *  - `story`        : about.json `story` object
 *  - `visionMission`: about.json `visionMission` object
 */

const TOTAL_PANELS = 3;
const PANEL_GAP = 24; // matches the track's gap-6 (1.5rem)
const AUTO_SCROLL_MS = 4000; // auto-advance interval between panels

export default function StoryVisionMission({ story, visionMission }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [index, setIndex] = useState(1);

  /* Auto-scroll pause sources: pointer (hover/touch), keyboard focus
     and whether the scroller is currently on-screen. */
  const pointerRef = useRef(false);
  const focusRef = useRef(false);
  const visibleRef = useRef(true);
  const pausedRef = useRef(false);
  const resetTimerRef = useRef(() => {});

  const recalcPaused = () => {
    pausedRef.current =
      pointerRef.current || focusRef.current || !visibleRef.current;
  };

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* One panel = one flex-basis unit + the fixed gap between panels. */
  const panelStep = (el) => {
    const first = el.querySelector(".sprint-story-panel");
    const panel = first ? Math.ceil(first.getBoundingClientRect().width) : 0;
    return Math.max(el.clientWidth, panel + PANEL_GAP);
  };

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth - 1);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < maxScroll);

    const step = panelStep(el);
    setIndex(
      Math.min(TOTAL_PANELS, Math.max(1, Math.round(el.scrollLeft / step) + 1))
    );
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByPanel = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * panelStep(el),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  /* Looping auto-advance: one panel per tick, wrap back to the start. */
  const autoAdvance = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth - 1);
    if (el.scrollLeft >= maxScroll) {
      el.scrollTo({ left: 0, behavior: "auto" }); // loop to panel 1
    } else {
      scrollByPanel(1);
    }
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el || prefersReducedMotion()) return;

    /* Pause auto-scroll while the scroller is mostly off-screen. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        visibleRef.current = entry.isIntersecting;
        recalcPaused();
      },
      { threshold: 0.35 }
    );
    observer.observe(el);

    let timer;
    const tick = () => {
      if (!pausedRef.current) autoAdvance();
      timer = setTimeout(tick, AUTO_SCROLL_MS);
    };
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(tick, AUTO_SCROLL_MS);
    };

    resetTimerRef.current = reset;
    timer = setTimeout(tick, AUTO_SCROLL_MS);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      resetTimerRef.current = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrackKeyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      scrollByPanel(-1);
      resetTimerRef.current();
    } else if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      scrollByPanel(1);
      resetTimerRef.current();
    }
  };

  const pad = (value) => String(value).padStart(2, "0");

  return (
    <div
      className="sprint-story-scroll"
      onMouseEnter={() => {
        pointerRef.current = true;
        recalcPaused();
      }}
      onMouseLeave={() => {
        pointerRef.current = false;
        recalcPaused();
      }}
      onTouchStart={() => {
        pointerRef.current = true;
        recalcPaused();
      }}
      onTouchEnd={() => {
        pointerRef.current = false;
        recalcPaused();
      }}
      onFocusCapture={() => {
        focusRef.current = true;
        recalcPaused();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focusRef.current = false;
          recalcPaused();
        }
      }}
    >
      {/* Control row: swipe hint + live counter + left/right arrows */}
      <div className="sprint-story-head">
        <div className="flex items-center gap-3">
          <p className="sprint-story-hint">Swipe to explore</p>
          <p className="sprint-story-counter" aria-live="polite">
            <span className="text-brand-navy font-bold tabular-nums">
              {pad(index)}
            </span>
            <span className="text-brand-text-muted">
              {" "}/ {pad(TOTAL_PANELS)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              scrollByPanel(-1);
              resetTimerRef.current();
            }}
            disabled={!canLeft}
            aria-label="Scroll left: previous panel"
            aria-controls="story-vision-mission-track"
            className="sprint-focus sprint-story-arrow"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              scrollByPanel(1);
              resetTimerRef.current();
            }}
            disabled={!canRight}
            aria-label="Scroll right: next panel"
            aria-controls="story-vision-mission-track"
            className="sprint-focus sprint-story-arrow"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ONE scrollable div holding all three panels */}
      <div
        id="story-vision-mission-track"
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Our Story, Vision and Mission"
        tabIndex={0}
        onKeyDown={handleTrackKeyDown}
        onWheel={() => resetTimerRef.current()}
        className="sprint-story-track"
      >
        {/* Panel 1 — OUR STORY */}
        <div className="sprint-story-panel sprint-glass-card sprint-card-interactive flex flex-col p-6 sm:p-8">
          <span aria-hidden="true" className="sprint-accent left-0" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            {story.heading}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-brand-navy">
            {story.subtitle}
          </h3>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-text-secondary">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-auto grid grid-cols-3 gap-2 pt-5">
            {story.callouts.map((callout) => (
              <li
                key={callout.label}
                className="rounded-2xl border border-brand-border bg-white/70 px-2 py-3 text-center"
              >
                <span className="block text-lg font-black text-brand-navy">
                  {callout.value}
                </span>
                <span className="mt-1 block text-[11px] leading-tight text-brand-text-muted">
                  {callout.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel 2 — VISION (card system §3.4.2) */}
        <div className="sprint-story-panel">
          <VisionMissionCard variant="vision" data={visionMission.vision} />
        </div>

        {/* Panel 3 — MISSION (card system §3.4.3) */}
        <div className="sprint-story-panel">
          <VisionMissionCard variant="mission" data={visionMission.mission} />
        </div>
      </div>
    </div>
  );
}