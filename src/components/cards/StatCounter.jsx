"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Impact stat counter — About_Page.md §3.8 (IMP-01 … IMP-07).
 * - Data model: { value, suffix, label, context, verified }
 * - SSR / no-JS: renders the FINAL value (values in HTML at final state, IMP-05)
 * - JS: counts up on first scroll into view at 60% visibility, ~1.2s ease-out
 *   (IMP-02), triggers once per session.
 * - prefers-reduced-motion: final value shown statically (IMP-03, GL-40).
 * - aria-live=polite announces the final value; animated digits are aria-hidden.
 */
function formatNumber(value) {
  return Math.round(value).toLocaleString("en-IN");
}

export default function StatCounter({ stat }) {
  const ref = useRef(null);
  const startedRef = useRef(false);
  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: keep the final value static (IMP-03)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(stat.value);
      return;
    }

    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !startedRef.current) {
            startedRef.current = true;
            // Reset then animate up from an extracted final value (IMP-05)
            setDisplay(0);
            const start = performance.now();
            const duration = 1200;
            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
              setDisplay(stat.value * eased);
              if (progress < 1) rafId = requestAnimationFrame(tick);
            };
            rafId = requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: [0.6] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [stat.value]);

  return (
    <div
      ref={ref}
      className="flex h-full flex-col rounded-3xl border border-brand-border bg-white p-6 text-center shadow-sm"
    >
      <div aria-live="polite" aria-atomic="true">
        <p className="text-4xl font-black tracking-tight text-brand-navy sm:text-5xl">
          <span aria-hidden="true" className="tabular-nums">
            {formatNumber(display)}
            {stat.suffix}
          </span>
          <span className="sr-only">
            {stat.label}: {formatNumber(stat.value)}
            {stat.suffix}
          </span>
        </p>
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-text">{stat.label}</p>
      <p className="mt-1 text-xs text-brand-text-muted">{stat.context}</p>
      {stat.verified && (
        <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-brand-success">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Source-verified value (AB-18)
        </p>
      )}
    </div>
  );
}