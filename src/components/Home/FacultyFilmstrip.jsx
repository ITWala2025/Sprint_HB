"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FacultyFilmstrip.module.css";

function wrappedDelta(index, activeIndex, count) {
  let delta = index - activeIndex;
  while (delta > count / 2) delta -= count;
  while (delta < -count / 2) delta += count;
  return delta;
}

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
    setPause();
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
  }, [profileCount]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      moveBy(1);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [profileCount]);

  function handleKeyDown(event) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveBy(1);
      setPause();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveBy(-1);
      setPause();
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.root}
      role="region"
      aria-label="Faculty filmstrip carousel"
      onKeyDown={handleKeyDown}
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
                  setPause();
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
