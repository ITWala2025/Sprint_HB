"use client";

import { useEffect, useRef, useState } from "react";

import VisionMissionCard from "@/components/cards/VisionMissionCard";

/**
 * OUR STORY · VISION · MISSION — two-part grid
 * ==================================================
 * Left column : the OUR STORY glass card (static).
 * Right column: VISION & MISSION on one shared surface that
 * AUTO-SWAPS between the two cards every 4s. Both cards stay
 * in the DOM (SEO + reduced motion); the inactive card is
 * hidden via `.sprint-swap-pane.is-hidden` (opacity 0 +
 * visibility hidden) and `aria-hidden`.
 *
 * Interaction pauses the timer: pointer hover/touch, keyboard
 * focus, or the surface being mostly off-screen. Users can also
 * switch cards with the dot pagination at the bottom or by
 * swiping horizontally on touch devices.
 *
 * Reduced motion: the auto-swap never starts — the dots still
 * switch manually, and the crossfade transition is disabled.
 *
 * Props:
 *  - `story`        : about.json `story` object
 *  - `visionMission`: about.json `visionMission` object
 */

const TOTAL_PANES = 2; // vision + mission
const AUTO_SWAP_MS = 4000; // pause between card swaps
const SWIPE_THRESHOLD = 48; // minimum horizontal px travel for a swipe

export default function StoryVisionMission({ story, visionMission }) {
  const surfaceRef = useRef(null);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  /* Auto-swap pause sources: pointer (hover/touch), keyboard focus
     and whether the surface is currently on-screen. */
  const pointerRef = useRef(false);
  const focusRef = useRef(false);
  const visibleRef = useRef(true);
  const pausedRef = useRef(false);

  const recalcPaused = () => {
    pausedRef.current =
      pointerRef.current || focusRef.current || !visibleRef.current;
  };

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const swap = (next) =>
    setIndex(((next % TOTAL_PANES) + TOTAL_PANES) % TOTAL_PANES);

  const goPrev = () => swap(index - 1);
  const goNext = () => swap(index + 1);

  /* Horizontal swipe to switch cards (touch) */
  const handleTouchStart = (event) => {
    pointerRef.current = true;
    recalcPaused();
    const touch = event.touches[0];
    if (touch) {
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    }
  };

  const handleTouchEnd = (event) => {
    pointerRef.current = false;
    recalcPaused();
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
  };

  /* Looping auto-swap: VISION -> MISSION -> VISION, one step per tick.
     Re-running on [index] also restarts the timer after a manual swap. */
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el || prefersReducedMotion()) return;

    /* Pause the auto-swap while the surface is mostly off-screen. */
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
      if (!pausedRef.current) swap(index + 1);
      timer = setTimeout(tick, AUTO_SWAP_MS);
    };

    timer = setTimeout(tick, AUTO_SWAP_MS);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <div className="mt-12 grid items-stretch gap-10 lg:grid-cols-2">
      {/* ============ LEFT — OUR STORY (§3.3) ============ */}
      <article className="sprint-glass-card sprint-card-interactive flex flex-col p-6 sm:p-8">
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
      </article>

      {/* ============ RIGHT — VISION & MISSION auto-swap (§3.4) ============ */}
      <div
        id="vision-mission-swap"
        ref={surfaceRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Vision and Mission"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          pointerRef.current = true;
          recalcPaused();
        }}
        onMouseLeave={() => {
          pointerRef.current = false;
          recalcPaused();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
        className="sprint-story-scroll flex flex-col"
      >
        {/* Vision/Mission panes on a horizontal track: switching slides the
            track left/right so the cards move like a carousel scroll. Both
            panes stay in the DOM for SEO; the off-screen one is aria-hidden. */}
        <div className="sprint-swap-viewport">
          <div
            className="sprint-swap-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            <div
              className="sprint-swap-pane w-full shrink-0"
              aria-hidden={index === 0 ? undefined : "true"}
            >
              <VisionMissionCard variant="vision" data={visionMission.vision} />
            </div>
            <div
              className="sprint-swap-pane w-full shrink-0"
              aria-hidden={index === 1 ? undefined : "true"}
            >
              <VisionMissionCard variant="mission" data={visionMission.mission} />
            </div>
          </div>
        </div>

        {/* Dot pagination at the bottom of the card */}
        <div
          className="mt-4 flex items-center justify-center gap-2"
          role="group"
          aria-label="Vision and Mission slides"
        >
          {[0, 1].map((dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={dotIndex === 0 ? "Show Vision" : "Show Mission"}
              aria-current={index === dotIndex ? "true" : undefined}
              aria-controls="vision-mission-swap"
              onClick={() => swap(dotIndex)}
              className={`sprint-focus grid cursor-pointer place-items-center rounded-full p-2 transition-colors ${
                index === dotIndex
                  ? "text-brand-red"
                  : "text-brand-border hover:text-brand-text-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`block h-2.5 rounded-full bg-current transition-all duration-200 ${
                  index === dotIndex ? "w-6" : "w-2.5"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}