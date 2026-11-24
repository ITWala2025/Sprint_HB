"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./FacultyFilmstrip.module.css";

function wrappedDelta(index, activeIndex, count) {
  let delta = index - activeIndex;
  while (delta > count / 2) delta -= count;
  while (delta < -count / 2) delta += count;
  return delta;
}

const SWIPE_THRESHOLD = 40;
const SWIPE_DIRECTION_RATIO = 1.5;
const SWIPE_MAX_DURATION = 300;

/**
 * SPRINT-local Filmstrip-style fallback. It does not import the unverified
 * ThreeUI stylesheet or the registered source's demo-only faculty identities.
 */
export default function FacultyFilmstrip({ profiles }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCardHeight, setActiveCardHeight] = useState(360);
  const profileCount = profiles.length;
  const containerRef = useRef(null);
  const activeCardRef = useRef(null);
  const accumulatorRef = useRef(0);
  const cooldownRef = useRef(false);

  const pauseUntilRef = useRef(0);
  const setPause = (duration = 5000) => {
    pauseUntilRef.current = Date.now() + duration;
  };

  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);
  const horizontalLockedRef = useRef(false);

  function startAutoplay() {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      moveBy(1);
    }, 5000);
  }

  function pauseAndRestart() {
    setPause();
    startAutoplay();
  }

  function moveBy(amount) {
    setActiveIndex((current) => (current + amount + profileCount) % profileCount);
  }

  function normalizeDelta(event) {
    let factor = 1;
    if (event.deltaMode === 1) factor = 16;
    if (event.deltaMode === 2) factor = window.innerHeight;
    const dx = event.deltaX * factor;
    const dy = event.deltaY * factor;
    return { dx, dy };
  }

  const commitMove = (direction) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    moveBy(direction);
    pauseAndRestart();
    window.setTimeout(() => {
      cooldownRef.current = false;
    }, 250);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(event) {
      if (event.ctrlKey || event.metaKey) return;

      const { dx, dy } = normalizeDelta(event);
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      let dominant = 0;
      if (absX > absY && absX >= 20) dominant = dx > 0 ? 1 : -1;
      else if (absY >= 20) dominant = dy > 0 ? 1 : -1;
      if (dominant === 0) return;

      commitMove(dominant);
    }

    container.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [profileCount, commitMove]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [profileCount]);

  useEffect(() => {
    const activeCard = activeCardRef.current;
    if (!activeCard) return;

    const updateHeight = () => setActiveCardHeight(activeCard.offsetHeight);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(activeCard);
    return () => observer.disconnect();
  }, [activeIndex, profileCount]);

  const handlePointerDown = (event) => {
    // Only touch/pen drives swipes; mouse drags are intentionally ignored.
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    touchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };
    horizontalLockedRef.current = false;
  };

  const handlePointerMove = (event) => {
    const start = touchStartRef.current;
    if (!start || (event.pointerType !== "touch" && event.pointerType !== "pen"))
      return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!horizontalLockedRef.current) {
      if (absX > SWIPE_THRESHOLD && absX > absY * SWIPE_DIRECTION_RATIO) {
        horizontalLockedRef.current = true;
      } else if (
        absY > SWIPE_THRESHOLD &&
        absY > absX * SWIPE_DIRECTION_RATIO
      ) {
        // Vertical scroll intent: abandon swipe tracking so the page scrolls.
        touchStartRef.current = null;
        return;
      }
    }

    if (horizontalLockedRef.current) {
      event.preventDefault();
    }
  };

  const handlePointerUp = (event) => {
    const start = touchStartRef.current;
    if (!start || (event.pointerType !== "touch" && event.pointerType !== "pen"))
      return;

    touchStartRef.current = null;
    horizontalLockedRef.current = false;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsed = Date.now() - start.time;

    // Ignore slow gestures, tiny movements/taps, and non-horizontal swipes.
    if (elapsed > SWIPE_MAX_DURATION) return;
    if (absX < SWIPE_THRESHOLD) return;
    if (absX <= absY * SWIPE_DIRECTION_RATIO) return;

    // Swipe left advances; swipe right moves backward.
    commitMove(dx > 0 ? -1 : 1);
  };

  const handlePointerCancel = () => {
    touchStartRef.current = null;
    horizontalLockedRef.current = false;
  };

  function handleKeyDown(event) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveBy(1);
      pauseAndRestart();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveBy(-1);
      pauseAndRestart();
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.root}
      role="region"
      aria-label="Faculty filmstrip carousel"
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className={styles.stage}
        aria-label="Select a faculty card to browse"
        style={{ "--active-card-height": `${activeCardHeight}px` }}
      >
        <p className={styles.srOnly}>
          Select a faculty card or use the arrow keys to browse.
        </p>
        <div className={styles.deck}>
          {profiles.map((profile, index) => {
            const delta = wrappedDelta(index, activeIndex, profileCount);
            const distance = Math.abs(delta);
            const focus = Math.exp(-distance * distance * 1.28);
            const side = Math.max(0, 1 - distance / 5);
            const rotateY =
              distance > 0.2
                ? -Math.sign(delta) * (14 + Math.min(distance, 3) * 5)
                : 0;
            const cardStyle = {
              "--delta": delta,
              "--distance": distance,
              "--focus": focus.toFixed(4),
              "--side": side,
              "--rotate-y": `${rotateY}deg`,
              zIndex: Math.round(1000 - distance * 100),
              opacity: Math.max(0.13, side * 0.76 + focus * 0.24),
              filter: `blur(${Math.max(0, distance - 1.5) * 0.38}px)`,
            };
            const initials = profile.name
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const skills = profile.skills?.length ? profile.skills : profile.tags ?? [];

            return (
              <button
                key={profile.name}
                type="button"
                ref={index === activeIndex ? activeCardRef : undefined}
                className={`${styles.card} ${index === activeIndex ? styles.activeCard : styles.sideCard}`}
                style={cardStyle}
                aria-label={`Select ${profile.name}, ${profile.designation}`}
                aria-current={index === activeIndex ? "true" : "false"}
                aria-pressed={index === activeIndex}
                onClick={() => {
                  setActiveIndex(index);
                  pauseAndRestart();
                }}
              >
                <span className={styles.cardContent}>
                  <span className={styles.topRow}>
                    <span className={styles.monogram} aria-hidden="true">
                      {initials}
                    </span>
                    <span className={styles.experience}>
                      {profile.experience || "Industry Mentor"}
                    </span>
                  </span>
                  <span className={styles.identity}>
                    <span className={styles.name}>{profile.name}</span>
                    <span className={styles.verified}>
                      <BadgeCheck className={styles.verifiedIcon} aria-hidden="true" />
                      Verified Industry Mentor
                    </span>
                  </span>
                  <span className={styles.role}>{profile.designation}</span>
                  <span className={styles.skills} aria-label="Domains and skills">
                    {skills.slice(0, 4).map((skill) => (
                      <span className={styles.skill} key={skill}>{skill}</span>
                    ))}
                  </span>
                  <span className={styles.bio}>{profile.bio}</span>
                </span>
              </button>
            );
          })}
        </div>
        <span className={styles.edgeFadeLeft} aria-hidden="true" />
        <span className={styles.edgeFadeRight} aria-hidden="true" />
      </div>

      {profileCount > 0 && (
        <nav
          aria-label="Faculty carousel controls"
          className="mt-6 flex items-center justify-center gap-3"
        >
          <button
            type="button"
            aria-label="Previous faculty mentor"
            onClick={() => {
              moveBy(-1);
              pauseAndRestart();
            }}
            className="sprint-focus flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-navy shadow-xs transition-all hover:border-brand-navy hover:bg-brand-navy hover:text-white"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <div className="flex items-center justify-center gap-2" aria-label="Select a faculty mentor">
            {profiles.map((profile, index) => (
              <button
                key={profile.name}
                type="button"
                aria-label={`Show ${profile.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => {
                  setActiveIndex(index);
                  pauseAndRestart();
                }}
                className={`sprint-focus h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                  index === activeIndex
                    ? "w-6 bg-brand-navy"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next faculty mentor"
            onClick={() => {
              moveBy(1);
              pauseAndRestart();
            }}
            className="sprint-focus flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-navy shadow-xs transition-all hover:border-brand-navy hover:bg-brand-navy hover:text-white"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
