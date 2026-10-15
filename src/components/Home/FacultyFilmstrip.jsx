"use client";

import { useState } from "react";
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

  function moveBy(amount) {
    setActiveIndex((current) => (current + amount + profileCount) % profileCount);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveBy(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveBy(-1);
    }
  }

  return (
    <div
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
                onClick={() => setActiveIndex(index)}
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
