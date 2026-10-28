"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { textTestimonials } from "@/data/data";

// ========================================
// Student Avatar Component
// ========================================
function StudentAvatar({ name = "", photoUrl, initials, isCenter }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const fallbackInitials =
    initials ||
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-xs text-white transition-all duration-500 ${
        isCenter
          ? "bg-gradient-to-tr from-blue-600 to-indigo-600 ring-4 ring-blue-100 shadow-md scale-105"
          : "bg-slate-600 ring-2 ring-slate-100"
      }`}
    >
      {photoUrl && !failed ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="40px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{fallbackInitials}</span>
      )}
    </div>
  );
}

// ========================================
// Main Animated 3D Carousel Component
// ========================================
export default function TextTestimonials() {
  const testimonials =
    textTestimonials && textTestimonials.length > 0 ? textTestimonials : [];
  const total = testimonials.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  // Auto-slide every 5.5 seconds
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(handleNext, 5500);
    return () => clearInterval(timer);
  }, [isPaused, handleNext, total]);

  if (total === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden py-20 px-4 sm:px-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Enterprise Keyframe Animations */}
      <style jsx>{`
        @keyframes borderGlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes floatQuote {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes progressFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-border-glow {
          background-size: 200% 200%;
          animation: borderGlow 4s ease infinite;
        }
        .animate-float-quote {
          animation: floatQuote 3s ease-in-out infinite;
        }
        .animate-progress {
          animation: progressFill 5.5s linear infinite;
        }
        .paused .animate-progress {
          animation-play-state: paused;
        }
      `}</style>

      {/* Ambient Moving Background Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-r from-blue-100/60 via-indigo-100/50 to-red-100/40 blur-[120px] rounded-full transition-all duration-1000" />

      {/* Section Header */}
      <div className="relative z-10 mx-auto max-w-3xl text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase border border-red-200 bg-red-50 text-red-600 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
          TESTIMONIALS
        </span>

        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          Words from our{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-red-500 bg-clip-text text-transparent">
            learners
          </span>
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Real stories. Real growth. Hear from our learners who have built new skills and achieved their goals with us.
        </p>
      </div>

      {/* =====================================================================
          STAGE WRAPPER:
          Max-width 1280px (`max-w-7xl`).
          Center Card = 410px, Side Cards = 300px pushed out by 375px.
          Total Card Span = 375 + 150 + 375 + 150 = 1050px.
          Arrows sit at the far edges of 1240px container -> 0% Overlap!
          ===================================================================== */}
      <div className="relative mx-auto max-w-7xl px-12 sm:px-16">
        
        {/* LEFT ARROW BUTTON (Far Left Edge - Never touches Left Card) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Testimonial"
          className="group absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-lg transition-all duration-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:scale-110 hover:shadow-blue-500/25 active:scale-95"
        >
          <ChevronLeft size={20} strokeWidth={2.4} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
        </button>

        {/* RIGHT ARROW BUTTON (Far Right Edge - Never touches Right Card) */}
        <button
          onClick={handleNext}
          aria-label="Next Testimonial"
          className="group absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-lg transition-all duration-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:scale-110 hover:shadow-blue-500/25 active:scale-95"
        >
          <ChevronRight size={20} strokeWidth={2.4} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>

        {/* 3D ANIMATED STAGE CONTAINER */}
        <div
          className="relative mx-auto h-[275px] w-full flex items-center justify-center"
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          {testimonials.map((item, index) => {
            // Calculate circular distance from activeIndex
            let offset = index - activeIndex;
            if (offset < -Math.floor(total / 2)) offset += total;
            if (offset > Math.floor(total / 2)) offset -= total;

            const isCenter = offset === 0;
            const isLeft = offset === -1 || (activeIndex === 0 && index === total - 1 && total > 2);
            const isRight = offset === 1 || (activeIndex === total - 1 && index === 0 && total > 1);

            // Pixel-exact 3D Transform state so cards NEVER collide with each other
            let transformStyle = "translate3d(0px, 0px, -300px) rotateY(0deg) scale(0.6)";
            let zIndex = 0;
            let opacity = 0;
            let pointerEvents = "none";

            if (isCenter) {
              // CENTER CARD: Flat 2D Projection at X = 0px
              transformStyle = "translate3d(0px, 0px, 0px) rotateY(0deg) skewY(0deg) scale(1)";
              zIndex = 30;
              opacity = 1;
              pointerEvents = "auto";
            } else if (isLeft) {
              // LEFT CARD: Pushed -370px Left + 3D Inward Tilt (Leaves 20px clear gap from center card)
              transformStyle = "translate3d(-370px, 0px, -40px) rotateY(24deg) skewY(-2deg) scale(0.92)";
              zIndex = 20;
              opacity = 0.88;
              pointerEvents = "auto";
            } else if (isRight) {
              // RIGHT CARD: Pushed +370px Right + 3D Inward Tilt (Leaves 20px clear gap from center card)
              transformStyle = "translate3d(370px, 0px, -40px) rotateY(-24deg) skewY(2deg) scale(0.92)";
              zIndex = 20;
              opacity = 0.88;
              pointerEvents = "auto";
            } else if (offset < -1) {
              // Hidden Far Left
              transformStyle = "translate3d(-550px, 0px, -180px) rotateY(35deg) scale(0.7)";
              zIndex = 10;
              opacity = 0;
            } else {
              // Hidden Far Right
              transformStyle = "translate3d(550px, 0px, -180px) rotateY(-35deg) scale(0.7)";
              zIndex = 10;
              opacity = 0;
            }

            return (
              <div
                key={item.id || index}
                onClick={() => {
                  if (isLeft) handlePrev();
                  if (isRight) handleNext();
                }}
                style={{
                  transform: transformStyle,
                  zIndex: zIndex,
                  opacity: opacity,
                  pointerEvents: pointerEvents,
                  transition: "all 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className={`
                  absolute rounded-2xl
                  ${
                    isCenter
                      ? "w-full max-w-[400px] sm:max-w-[410px] h-[255px] cursor-default"
                      : "hidden xl:block w-[300px] h-[235px] cursor-pointer hover:!opacity-100"
                  }
                `}
              >
                {/* Outer Glowing Border Wrapper */}
                <div
                  className={`h-full w-full rounded-2xl transition-all duration-700 ${
                    isCenter
                      ? "p-[2.5px] bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 animate-border-glow shadow-[0_20px_45px_rgba(30,58,138,0.15),0_0_25px_rgba(56,189,248,0.25)]"
                      : "p-[1px] bg-slate-300 shadow-[0_10px_25px_rgba(15,23,42,0.07)]"
                  }`}
                >
                  {/* Inner Card Surface */}
                  <div className="h-full w-full rounded-[14px] bg-white p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {/* Top Row: Floating Quote Icon & Staggered Stars */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`font-serif font-black leading-none select-none transition-all duration-500 ${
                            isCenter
                              ? "text-3xl text-blue-600 animate-float-quote"
                              : "text-2xl text-blue-500/75"
                          }`}
                        >
                          “
                        </span>

                        <div className="flex gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={isCenter ? 14 : 11}
                              fill="currentColor"
                              stroke="none"
                              style={{
                                transitionDelay: isCenter ? `${i * 75}ms` : "0ms",
                              }}
                              className={`transition-all duration-500 ${
                                isCenter ? "scale-100 opacity-100" : "scale-90 opacity-80"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quote Text */}
                      <p
                        className={`leading-relaxed line-clamp-4 transition-colors duration-500 ${
                          isCenter
                            ? "text-slate-900 text-sm sm:text-[14.5px] font-medium"
                            : "text-slate-700 text-xs font-normal"
                        }`}
                      >
                        "{item.quote}"
                      </p>
                    </div>

                    {/* Author Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <StudentAvatar
                          name={item.name}
                          photoUrl={item.photoUrl}
                          initials={item.initials}
                          isCenter={isCenter}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3
                              className={`truncate font-bold transition-all duration-500 ${
                                isCenter ? "text-sm text-slate-900" : "text-xs text-slate-800"
                              }`}
                            >
                              {item.name}
                            </h3>
                            {isCenter && (
                              <CheckCircle2
                                size={14}
                                className="text-blue-600 shrink-0"
                              />
                            )}
                          </div>
                          <p className="truncate text-[11px] text-slate-500 font-medium">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      {item.company && (
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold border transition-all duration-500 ${
                            isCenter
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-500 border-slate-200/60"
                          }`}
                        >
                          {item.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animated Pagination Dots with Live Auto-Play Progress Bar */}
      <div className={`flex justify-center items-center gap-2 mt-6 ${isPaused ? "paused" : ""}`}>
        {testimonials.map((_, dotIndex) => {
          const isActive = activeIndex === dotIndex;
          return (
            <button
              key={dotIndex}
              onClick={() => setActiveIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
              className={`relative overflow-hidden transition-all duration-500 rounded-full ${
                isActive ? "w-9 h-2 bg-blue-100" : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
            >
              {isActive && (
                <span
                  key={activeIndex}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-progress"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}