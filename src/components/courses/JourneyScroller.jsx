"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Sub-pixel tolerance so fractional card widths do not flip the arrow state.
 */
const OVERFLOW_TOLERANCE = 2;

/**
 * JourneyScroller — horizontal journey row with chevron controls.
 *
 * Wraps the signature-program milestone list so the SPRINT RISE and Career
 * Accelerator journeys share one implementation:
 * - keeps native overflow-x scrolling (touch swipe / trackpad) while the
 *   visible scrollbar is hidden by the `courses-signature-programs__milestones`
 *   styles,
 * - renders previous/next chevron buttons on each side of the row (never on
 *   top of card content) that scroll by exactly one card plus gap,
 * - shows the buttons only when the row actually overflows, and disables
 *   (fades) the button for the direction that has nowhere left to go,
 * - updates that state on scroll, window resize and container resizes.
 */
export default function JourneyScroller({
  label,
  listClassName = "",
  children,
}) {
  const trackRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const overflowing = maxScroll > OVERFLOW_TOLERANCE;
    const currentScroll = track.scrollLeft;

    setHasOverflow(overflowing);
    setCanScrollPrev(overflowing && currentScroll > OVERFLOW_TOLERANCE);
    setCanScrollNext(
      overflowing && currentScroll < maxScroll - OVERFLOW_TOLERANCE,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    updateControls();

    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateControls)
        : null;
    observer?.observe(track);

    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
      observer?.disconnect();
    };
  }, [updateControls]);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.firstElementChild;
    const trackStyles = window.getComputedStyle(track);
    const gap =
      Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : track.clientWidth;
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof track.scrollBy === "function") {
      track.scrollBy({
        left: direction * cardWidth,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    } else {
      track.scrollLeft += direction * cardWidth;
    }
  };

  const buttonClassName =
    "sprint-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-white text-brand-navy shadow-sm transition-colors hover:border-brand-navy disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex items-center gap-2">
      {hasOverflow ? (
        <button
          type="button"
          aria-label="Previous step"
          disabled={!canScrollPrev}
          onClick={() => scrollByCard(-1)}
          className={buttonClassName}
        >
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
      ) : null}

      <ol
        ref={trackRef}
        className={`courses-signature-programs__milestones min-w-0 flex-1 ${listClassName}`.trim()}
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </ol>

      {hasOverflow ? (
        <button
          type="button"
          aria-label="Next step"
          disabled={!canScrollNext}
          onClick={() => scrollByCard(1)}
          className={buttonClassName}
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      ) : null}
    </div>
  );
}
