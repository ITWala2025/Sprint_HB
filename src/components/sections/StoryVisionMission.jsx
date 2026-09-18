"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
 * focus, or the surface being mostly off-screen.
 *
 * Reduced motion: the auto-swap never starts — the arrows still
 * switch manually, and the crossfade transition is disabled.
 *
 * Props:
 *  - `story`        : about.json `story` object
 *  - `visionMission`: about.json `visionMission` object
 */

const TOTAL_PANES = 2; // vision + mission
const AUTO_SWAP_MS = 4000; // pause between card swaps

export default function StoryVisionMission({ story, visionMission }) {
  const surfaceRef = useRef(null);
  const [index, setIndex] = useState(0);

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

  const pad = (value) => String(value).padStart(2, "0");

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
        className="sprint-story-scroll flex flex-col"
      >
        {/* Control row: hint + live counter + prev/next arrows */}
        <div className="sprint-story-head">
          <div className="flex items-center gap-3">
            <p className="sprint-story-hint">Auto-advances — pause on hover</p>
            <p className="sprint-story-counter" aria-live="polite">
              <span className="text-brand-navy font-bold tabular-nums">
                {pad(index + 1)}
              </span>
              <span className="text-brand-text-muted">
                {" "}/ {pad(TOTAL_PANES)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label={`Previous: show ${index === 0 ? "Mission" : "Vision"}`}
              aria-controls="vision-mission-swap"
              className="sprint-focus sprint-story-arrow"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={`Next: show ${index === 0 ? "Mission" : "Vision"}`}
              aria-controls="vision-mission-swap"
              className="sprint-focus sprint-story-arrow"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Both cards share ONE grid cell so the surface height stays stable
            while VISION and MISSION crossfade (the inactive one is hidden). */}
        <div className="mt-4 grid grid-cols-1 grid-rows-1">
          <div
            className={`sprint-swap-pane col-start-1 row-start-1 ${index === 0 ? "" : "is-hidden"}`}
            aria-hidden={index === 0 ? undefined : "true"}
          >
            <VisionMissionCard variant="vision" data={visionMission.vision} />
          </div>
          <div
            className={`sprint-swap-pane col-start-1 row-start-1 ${index === 1 ? "" : "is-hidden"}`}
            aria-hidden={index === 1 ? undefined : "true"}
          >
            <VisionMissionCard variant="mission" data={visionMission.mission} />
          </div>
        </div>
      </div>
    </div>
  );
}