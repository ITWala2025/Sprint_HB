"use client";

import { useEffect, useRef, useState } from "react";
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
  const profileCount = profiles.length;
  const containerRef = useRef(null);
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
      <div className={styles.stage} aria-label="Select a faculty card to browse">
        <p className={styles.srOnly}>
          Select a faculty portrait or use the arrow keys to browse.
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
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <button
                key={profile.name}
                type="button"
                className={styles.card}
                style={cardStyle}
                aria-label={`Select ${profile.name}, ${profile.designation}`}
                aria-current={index === activeIndex ? "true" : "false"}
                aria-pressed={index === activeIndex}
                onClick={() => {
                  setActiveIndex(index);
                  pauseAndRestart();
                }}
              >
                <span className={styles.portrait}>
                  {profile.image ? (
                    <img src={profile.image} alt={`${profile.name} portrait`} />
                  ) : (
                    <span className={styles.initials} aria-hidden="true">
                      {initials}
                    </span>
                  )}
                </span>
                <span className={styles.footer}>
                  <span className={styles.index}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.name}>{profile.name}</span>
                    <span className={styles.role}>{profile.designation}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
