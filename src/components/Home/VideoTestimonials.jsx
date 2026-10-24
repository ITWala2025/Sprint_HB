"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { videoTestimonials } from "@/data/data";


function VideoTestimonial({ testimonial, onVideoPlay, onVideoPause, registerVideo }) {

  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);

  const setVideoRef = useCallback((node) => {

    videoRef.current = node;

    registerVideo(testimonial.id, node);

  }, [registerVideo, testimonial.id]);

  const toggleVideo = async () => {

    const video = videoRef.current;

    if (!video) return;

    try {

      if (video.paused) await video.play();

      else video.pause();

    } catch (error) {

      console.error("Video playback failed:", error);

    }

  };

  return (

    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#011f3e] shadow-sm">

      <video

        ref={setVideoRef}

        src={testimonial.videoUrl}

        onDragStart={(event) => event.preventDefault()}

        playsInline preload="metadata" controls={hasStarted}



        onPlay={(event) => { setIsPlaying(true); setHasStarted(true); onVideoPlay(event); }}

        onPause={(event) => { setIsPlaying(false); onVideoPause(event); }}

        onEnded={(event) => { setIsPlaying(false); setHasStarted(false); onVideoPause(event); }}

        className={`absolute inset-0 h-full w-full select-none bg-[#011f3e] ${hasStarted ? "object-contain" : "object-cover"}`}

      />

      {!hasStarted && (

        <>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <button type="button" onClick={toggleVideo} aria-label={`Play ${testimonial.name}'s testimonial`}

            className="sprint-focus absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 hover:bg-brand-red">

            <Play size={24} fill="currentColor" className="ml-1" />

          </button>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 sm:p-6">

            <h3 className="text-lg font-bold leading-snug text-white sm:text-xl">{testimonial.name}</h3>

            <p className="mt-2 text-sm leading-relaxed text-white/85">{testimonial.role}</p>

          </div>

        </>

      )}

      {hasStarted && !isPlaying && (

        <button type="button" onClick={toggleVideo} aria-label={`Resume ${testimonial.name}'s testimonial`}

          className="sprint-focus absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">

          <Play size={20} fill="currentColor" className="ml-0.5" />

        </button>

      )}

    </div>

  );

}

export default function VideoTestimonials() {
  const trackId = useId();
  const trackRef = useRef(null);

  const activeVideoRef = useRef(null);

  const videoRefs = useRef(new Map());

  const reducedMotionRef = useRef(false);

  const lastInteractionRef = useRef(0);

  const dragRef = useRef(null);

  const pauseRef = useRef({ hovered: false, focused: false, touching: false, videoPlaying: false });

  const [isDragging, setIsDragging] = useState(false);

  const [navigation, setNavigation] = useState({ page: 0, pages: 1, canPrevious: false, canNext: false });



  const registerVideo = useCallback((id, node) => {

    if (node) videoRefs.current.set(id, node);

    else videoRefs.current.delete(id);

  }, []);

  const handleVideoPlay = useCallback((event) => {

    const currentVideo = event.currentTarget;

    if (activeVideoRef.current && activeVideoRef.current !== currentVideo) activeVideoRef.current.pause();

    activeVideoRef.current = currentVideo;

    pauseRef.current.videoPlaying = true;

    lastInteractionRef.current = Date.now();

  }, []);

  const handleVideoPause = useCallback((event) => {

    if (activeVideoRef.current === event.currentTarget) {

      activeVideoRef.current = null;

      pauseRef.current.videoPlaying = false;

      lastInteractionRef.current = Date.now();

    }

  }, []);



  const getMetrics = useCallback(() => {

    const track = trackRef.current;

    const firstCard = track?.firstElementChild;

    if (!track || !firstCard) return null;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

    const step = firstCard.getBoundingClientRect().width + gap;

    if (step <= 0) return null;

    const visible = Math.max(1, Math.round((track.clientWidth + gap) / step));

    return {

      track, step, visible,

      maxScroll: Math.max(0, track.scrollWidth - track.clientWidth),

      pages: Math.max(1, videoTestimonials.length - visible + 1),

    };

  }, []);



  const syncNavigation = useCallback(() => {

    const metrics = getMetrics();

    if (!metrics) return;

    const { track, step, maxScroll, pages } = metrics;

    const left = Math.max(0, Math.min(track.scrollLeft, maxScroll));

    const next = {

      page: maxScroll - left <= 2 ? pages - 1 : Math.min(pages - 1, Math.round(left / step)),

      pages, canPrevious: left > 2, canNext: left < maxScroll - 2,

    };

    setNavigation((current) => Object.keys(next).every((key) => current[key] === next[key]) ? current : next);

  }, [getMetrics]);



  const pauseOutOfViewVideo = useCallback(() => {

    const video = activeVideoRef.current;

    const track = trackRef.current;

    if (!video || !track) return;

    const cardRect = video.closest("article")?.getBoundingClientRect();

    const trackRect = track.getBoundingClientRect();

    if (cardRect && (cardRect.right <= trackRect.left || cardRect.left >= trackRect.right)) video.pause();

  }, []);



  const goToPage = useCallback((requestedPage) => {

    const metrics = getMetrics();

    if (!metrics) return;

    const { track, step, maxScroll, pages } = metrics;

    const page = Math.max(0, Math.min(requestedPage, pages - 1));

    track.scrollTo({ left: Math.min(page * step, maxScroll), behavior: reducedMotionRef.current ? "auto" : "smooth" });

    lastInteractionRef.current = Date.now();

  }, [getMetrics]);



  const handlePointerDown = (event) => {

    if (event.pointerType !== "mouse" || event.button !== 0) return;

    if (event.target.closest("button,  a, input")) return;

    const track = trackRef.current;

    if (!track) return;

    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: track.scrollLeft, moved: false };

    lastInteractionRef.current = Date.now();

  };

  const handlePointerMove = (event) => {

    const drag = dragRef.current;

    const track = trackRef.current;

    if (!drag || !track || event.pointerId !== drag.pointerId) return;

    const distance = event.clientX - drag.startX;

    if (!drag.moved && Math.abs(distance) < 6) return;

    if (!drag.moved) {

      drag.moved = true;

      track.style.scrollSnapType = "none";

      track.setPointerCapture(event.pointerId);

      setIsDragging(true);

    }

    track.scrollLeft = drag.scrollLeft - distance;

  };

  const finishDrag = (event) => {

    const drag = dragRef.current;

    const track = trackRef.current;

    if (!drag || !track || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;

    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);

    track.style.removeProperty("scroll-snap-type");

    setIsDragging(false);

    lastInteractionRef.current = Date.now();

    if (drag.moved) {

      const metrics = getMetrics();

      if (metrics) goToPage(Math.round(track.scrollLeft / metrics.step));

    }

  };



  useEffect(() => {

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => { reducedMotionRef.current = query.matches; };

    update();

    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);

  }, []);

  useEffect(() => {

    const track = trackRef.current;

    if (!track) return;

    let frame = 0;

    const update = () => {

      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => { syncNavigation(); pauseOutOfViewVideo(); });

    };

    const observer = new ResizeObserver(update);

    observer.observe(track);

    if (track.firstElementChild) observer.observe(track.firstElementChild);

    track.addEventListener("scroll", update, { passive: true });

    update();

    return () => { cancelAnimationFrame(frame); observer.disconnect(); track.removeEventListener("scroll", update); };

  }, [syncNavigation, pauseOutOfViewVideo]);

  useEffect(() => {

    if (navigation.pages <= 1) return;

    let nextAdvanceAt = Date.now() + 6000;

    const interval = window.setInterval(() => {

      const now = Date.now();

      const flags = pauseRef.current;

      if (document.hidden || reducedMotionRef.current || flags.hovered || flags.focused || flags.touching || flags.videoPlaying || dragRef.current) {

        nextAdvanceAt = now + 6000;

        return;

      }

      if (now < Math.max(nextAdvanceAt, lastInteractionRef.current + 6000)) return;

      const metrics = getMetrics();

      if (!metrics || metrics.maxScroll <= 2) return;

      const atEnd = metrics.track.scrollLeft >= metrics.maxScroll - 2;

      const currentPage = Math.round(metrics.track.scrollLeft / metrics.step);

      goToPage(atEnd ? 0 : currentPage + 1);

      nextAdvanceAt = now + 6000;

    }, 100);

    return () => window.clearInterval(interval);

  }, [navigation.pages, getMetrics, goToPage]);

  useEffect(() => () => { videoRefs.current.forEach((video) => video.pause()); videoRefs.current.clear(); }, []);



  const arrowClassName = "sprint-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-navy shadow-sm transition-colors hover:border-brand-navy hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35";

  if (!videoTestimonials.length) return null;

  return (
    <div className="relative mt-9"
      onMouseEnter={() => { pauseRef.current.hovered = true; }}
      onMouseLeave={() => { pauseRef.current.hovered = false; lastInteractionRef.current = Date.now(); }}
      onFocusCapture={(event) => { if (trackRef.current?.contains(event.target) && event.target.matches(":focus-visible")) pauseRef.current.focused = true; }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { pauseRef.current.focused = false; lastInteractionRef.current = Date.now(); } }}
    >
      <div
        id={trackId} ref={trackRef} role="region" aria-roledescription="carousel" aria-label="Video testimonials" tabIndex={0}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft") { event.preventDefault(); goToPage(navigation.page - 1); }
          if (event.key === "ArrowRight") { event.preventDefault(); goToPage(navigation.page + 1); }
        }}
        onTouchStart={() => { pauseRef.current.touching = true; lastInteractionRef.current = Date.now(); }}
        onTouchEnd={() => { pauseRef.current.touching = false; lastInteractionRef.current = Date.now(); }}
        onTouchCancel={() => { pauseRef.current.touching = false; }}
        className={`sprint-focus flex min-w-0 snap-x snap-mandatory items-start gap-8 overflow-x-auto overscroll-x-contain rounded-2xl pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-10 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {videoTestimonials.map((testimonial, index) => (
          <article key={testimonial.id} aria-label={`Video testimonial ${index + 1} of ${videoTestimonials.length}`}
            className="w-full shrink-0 snap-start select-none overflow-hidden rounded-2xl md:w-[calc((100%_-_32px)/2)] lg:w-[calc((100%_-_64px)/3)]">
            <VideoTestimonial testimonial={testimonial} registerVideo={registerVideo} onVideoPlay={handleVideoPlay} onVideoPause={handleVideoPause} />
          </article>
        ))}
      </div>
      {navigation.pages > 1 && (
        <>
          <button type="button" onClick={() => goToPage(navigation.page - 1)} disabled={!navigation.canPrevious}
            aria-label="Previous video testimonials" aria-controls={trackId}
            className={`${arrowClassName} hidden md:absolute md:-left-2 md:top-1/2 md:z-10 md:flex md:-translate-y-1/2 lg:-left-5 min-[1280px]:-left-14`}>
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => goToPage(navigation.page + 1)} disabled={!navigation.canNext}
            aria-label="Next video testimonials" aria-controls={trackId}
            className={`${arrowClassName} hidden md:absolute md:-right-2 md:top-1/2 md:z-10 md:flex md:-translate-y-1/2 lg:-right-5 min-[1280px]:-right-14`}>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <div className="mt-3 flex items-center justify-center gap-4">
            <button type="button" onClick={() => goToPage(navigation.page - 1)} disabled={!navigation.canPrevious}
              aria-label="Previous video testimonials" aria-controls={trackId} className={`${arrowClassName} md:hidden`}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div className="flex items-center justify-center gap-2" aria-label="Video testimonial positions">
              {Array.from({ length: navigation.pages }, (_, index) => (
                <button key={index} type="button" onClick={() => goToPage(index)}
                  aria-label={`Go to video testimonial position ${index + 1}`}
                  aria-current={navigation.page === index ? "step" : undefined}
                  className={`sprint-focus h-2 rounded-full transition-all duration-300 ${navigation.page === index ? "w-6 bg-brand-red" : "w-2 bg-slate-300 hover:bg-slate-400"}`} />
              ))}
            </div>
            <button type="button" onClick={() => goToPage(navigation.page + 1)} disabled={!navigation.canNext}
              aria-label="Next video testimonials" aria-controls={trackId} className={`${arrowClassName} md:hidden`}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
