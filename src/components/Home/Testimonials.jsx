"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { testimonials } from "@/data/data";
function StudentAvatar({ name, photoUrl }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy text-sm font-bold text-white ring-1 ring-slate-200">
      {photoUrl && !failed ? (
        <Image
          src={photoUrl}
          alt=""
          fill
          sizes="48px"
          draggable={false}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
export default function Testimonials() {
  const headingId = useId();
  const trackId = useId();
  const trackRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const dragRef = useRef(null);
  const autoPauseRef = useRef({
    hovered: false,
    focused: false,
    touching: false,
  });
  const lastInteractionRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [navigation, setNavigation] = useState({
    page: 0,
    pages: 1,
    canPrevious: false,
    canNext: false,
  });
  // Calculate navigation using actual card sizes and viewport width.
  const getMetrics = useCallback(() => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    if (step <= 0) return null;
    const visible = Math.max(
      1,
      Math.round((track.clientWidth + gap) / step),
    );
    return {
      track,
      step,
      visible,
      maxScroll: Math.max(0, track.scrollWidth - track.clientWidth),
      pages: Math.max(1, testimonials.length - visible + 1),
    };
  }, []);
  const syncNavigation = useCallback(() => {
    const metrics = getMetrics();
    if (!metrics) return;
    const { track, step, maxScroll, pages } = metrics;
    const left = Math.max(0, Math.min(track.scrollLeft, maxScroll));
    const next = {
      page:
        maxScroll - left <= 2
          ? pages - 1
          : Math.min(pages - 1, Math.round(left / step)),
      pages,
      canPrevious: left > 2,
      canNext: left < maxScroll - 2,
    };
    setNavigation((current) =>
      current.page === next.page &&
      current.pages === next.pages &&
      current.canPrevious === next.canPrevious &&
      current.canNext === next.canNext
        ? current
        : next,
    );
  }, [getMetrics]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = query.matches;
    };
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => {
      query.removeEventListener("change", updatePreference);
    };
  }, []);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncNavigation);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(track);
    if (track.firstElementChild) {
      observer.observe(track.firstElementChild);
    }
    track.addEventListener("scroll", scheduleUpdate, { passive: true });
    syncNavigation();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("scroll", scheduleUpdate);
    };
  }, [syncNavigation]);
  const goToPage = useCallback(
    (requestedPage) => {
      const metrics = getMetrics();
      if (!metrics) return;
      const { track, step, maxScroll, pages } = metrics;
      const page = Math.max(0, Math.min(requestedPage, pages - 1));
      track.scrollTo({
        left: Math.min(page * step, maxScroll),
        behavior: reducedMotionRef.current ? "auto" : "smooth",
      });
    },
    [getMetrics],
  );
  // Poll the pause flags, but advance only after six uninterrupted seconds.
  useEffect(() => {
    if (navigation.pages <= 1) return;
    let nextAdvanceAt = Date.now() + 6000;
    const interval = window.setInterval(() => {
      const now = Date.now();
      const paused = autoPauseRef.current;
      if (
        reducedMotionRef.current || document.hidden || paused.hovered ||
        paused.focused || paused.touching || dragRef.current
      ) {
        nextAdvanceAt = now + 6000;
        return;
      }
      const readyAt = Math.max(nextAdvanceAt, lastInteractionRef.current + 6000);
      if (now < readyAt) return;
      const metrics = getMetrics();
      if (!metrics || metrics.maxScroll <= 2) return;
      const atEnd = metrics.track.scrollLeft >= metrics.maxScroll - 2;
      const currentPage = Math.round(metrics.track.scrollLeft / metrics.step);
      goToPage(atEnd ? 0 : currentPage + 1);
      nextAdvanceAt = now + 6000;
    }, 100);
    return () => window.clearInterval(interval);
  }, [navigation.pages, getMetrics, goToPage]);
  const handleKeyDown = (event) => {
    lastInteractionRef.current = Date.now();
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        goToPage(navigation.page - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        goToPage(navigation.page + 1);
        break;
      case "Home":
        event.preventDefault();
        goToPage(0);
        break;
      case "End":
        event.preventDefault();
        goToPage(navigation.pages - 1);
        break;
      default:
        break;
    }
  };
  const handlePointerDown = (event) => {
    lastInteractionRef.current = Date.now();
    // Touch users keep native swipe and vertical page scrolling.
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    track.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || event.pointerId !== drag.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(distance) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      track.style.scrollSnapType = "none";
      setIsDragging(true);
    }
    track.scrollLeft = drag.startScrollLeft - distance;
  };
  const finishDrag = (event) => {
    lastInteractionRef.current = Date.now();
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    track.style.removeProperty("scroll-snap-type");
    setIsDragging(false);
    if (drag.moved) {
      const metrics = getMetrics();
      if (metrics) {
        goToPage(Math.round(track.scrollLeft / metrics.step));
      }
    }
  };
  if (testimonials.length === 0) return null;
  const arrowClassName =
    "sprint-focus flex h-11 w-11 shrink-0 items-center justify-center " +
    "rounded-full border border-slate-200 bg-white text-brand-navy " +
    "transition-colors hover:border-brand-navy hover:bg-slate-50 " +
    "disabled:cursor-not-allowed disabled:opacity-35 " +
    "disabled:hover:border-slate-200 disabled:hover:bg-white";
  return (
    <section
      aria-labelledby={headingId}
      onMouseEnter={() => {
        autoPauseRef.current.hovered = true;
      }}
      onMouseLeave={() => {
        autoPauseRef.current.hovered = false;
        lastInteractionRef.current = Date.now();
      }}
      onPointerDownCapture={() => {
        autoPauseRef.current.focused = false;
        lastInteractionRef.current = Date.now();
      }}
      onKeyDownCapture={(event) => {
        if (event.key === "Tab" || event.key.startsWith("Arrow")) {
          autoPauseRef.current.focused = true;
        }
      }}
      onFocusCapture={(event) => {
        autoPauseRef.current.focused = event.target.matches(":focus-visible");
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          autoPauseRef.current.focused = false;
          lastInteractionRef.current = Date.now();
        }
      }}
      className="bg-[linear-gradient(145deg,var(--color-brand-blue-light)_0%,#f5faff_48%,#dcecff_100%)] py-[2.1rem] md:py-[3.5rem] lg:py-[4.375rem]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red-accessible">
            Learner stories
          </p>
          <h2
            id={headingId}
            className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl"
          >
            What our students say
          </h2>
        </div>
        <div className="relative mt-9 flex items-center gap-2 sm:gap-4">
          {navigation.pages > 1 && (
            <button
              type="button"
              onClick={() => goToPage(navigation.page - 1)}
              disabled={!navigation.canPrevious}
              aria-label="Previous testimonials"
              aria-controls={trackId}
              className={`${arrowClassName} min-[1280px]:absolute min-[1280px]:-left-14 min-[1280px]:top-1/2 min-[1280px]:-translate-y-1/2`}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}
        <div
          id={trackId}
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Student testimonials"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onTouchStart={() => { autoPauseRef.current.touching = true; }}
          onTouchEnd={() => {
            autoPauseRef.current.touching = false;
            lastInteractionRef.current = Date.now();
          }}
          onTouchCancel={() => { autoPauseRef.current.touching = false; }}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onLostPointerCapture={finishDrag}
          className={`sprint-focus min-w-0 flex-1 flex snap-x snap-mandatory
            items-stretch gap-6 overflow-x-auto overscroll-x-contain
            rounded-2xl pb-3 [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.id}
              aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
              className="flex w-full shrink-0 snap-start select-none flex-col
                rounded-2xl border border-slate-200 bg-white p-6 text-left
                shadow-sm transition-shadow hover:shadow-md
                motion-reduce:transition-none sm:p-7
                md:w-[calc((100%_-_24px)/2)]
                lg:w-[calc((100%_-_48px)/3)]"
            >
              <Quote
                size={28}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0 text-brand-red"
              />
              <blockquote className="mt-5 flex-1">
                <p className="text-base font-medium leading-7 text-brand-navy lg:text-lg lg:leading-8">
                  {testimonial.quote}
                </p>
              </blockquote>
              {testimonial.course && (
                <div className="mt-6">
                  <span className="inline-block rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {testimonial.course}
                  </span>
                </div>
              )}
              <div className="mt-6 flex items-start gap-3 border-t border-slate-100 pt-5">
                <StudentAvatar
                  name={testimonial.name}
                  photoUrl={testimonial.photoUrl}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-navy sm:text-base">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
          {navigation.pages > 1 && (
            <button
              type="button"
              onClick={() => goToPage(navigation.page + 1)}
              disabled={!navigation.canNext}
              aria-label="Next testimonials"
              aria-controls={trackId}
              className={`${arrowClassName} min-[1280px]:absolute min-[1280px]:-right-14 min-[1280px]:top-1/2 min-[1280px]:-translate-y-1/2`}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

