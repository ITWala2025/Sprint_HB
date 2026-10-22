
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Users,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
  Handshake,
  CodeXml,
  Award,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    number: "01",
    title: "100% Corporate Trainers",
    description:
      "Learn from industry professionals with practical corporate experience. Gain real-world insights from people who understand the workplace.",
    link: "Learn from the best",
    badge: "15+ Years",
    badgeDescription: "Average experience",
    badgeIcon: Users,
    icon: GraduationCap,
    accent: "teal",
    image:
    "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/corporate-trainer.png",
    alt: "Professionals collaborating in a workplace",
  },
  {
    number: "02",
    title: "Strong Industry Connect",
    description:
      "Learn from industry experts, explore real-world challenges, and build meaningful professional connections.",
    link: "Industry Meetups",
    badge: "Expert Sessions",
    badgeDescription: "Learn from professionals",
    badgeIcon: CalendarDays,
    icon: Handshake,
    accent: "blue",
    image:
      "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/Strong-Industry-Connect.png",
    alt: "Professionals attending a collaborative business meeting",
  },
  {
    number: "03",
    title: "360° Development",
    description:
      "Develop technical skills, communication, interview confidence, and a professional profile to prepare for your career.",
    link: "Complete Career Support",
    badge: "Skills + Confidence",
    badgeDescription: "Complete development",
    badgeIcon: TrendingUp,
    icon: CodeXml,
    accent: "amber",
    image:
      "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/360-Development.png",
    alt: "Laptop and programming workspace",
  },
  {
    number: "04",
    title: "Real Internship",
    description:
      "Explore practical internship opportunities and gain experience relevant to your professional goals.",
    link: "Explore Opportunities",
    badge: "Career Experience",
    badgeDescription: "Hands-on learning",
    badgeIcon: ShieldCheck,
    icon: Award,
    accent: "violet",
    image:
      "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/Real-Internship.png",
    alt: "Professional reviewing documents at a desk",
  },
];

const colors = {
  teal: {
    text: "text-teal-700",
    border: "border-teal-400",
    badge: "bg-gradient-to-br from-teal-400 to-teal-600",
    soft: "bg-teal-50",
    iconBg: "bg-teal-100",
    glow: "shadow-teal-500/15",
    link: "text-teal-700",
    dot: "bg-teal-500",
  },
  blue: {
    text: "text-blue-700",
    border: "border-blue-400",
    badge: "bg-gradient-to-br from-blue-400 to-blue-600",
    soft: "bg-blue-50",
    iconBg: "bg-blue-100",
    glow: "shadow-blue-500/15",
    link: "text-blue-700",
    dot: "bg-blue-500",
  },
  amber: {
    text: "text-amber-700",
    border: "border-amber-400",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500",
    soft: "bg-amber-50",
    iconBg: "bg-amber-100",
    glow: "shadow-amber-500/15",
    link: "text-amber-700",
    dot: "bg-amber-500",
  },
  violet: {
    text: "text-violet-700",
    border: "border-violet-400",
    badge: "bg-gradient-to-br from-violet-400 to-violet-600",
    soft: "bg-violet-50",
    iconBg: "bg-violet-100",
    glow: "shadow-violet-500/15",
    link: "text-violet-700",
    dot: "bg-violet-500",
  },
};

function FeatureImagePanel({ feature, visible, className = "" }) {
  const BadgeIcon = feature.badgeIcon;
  const style = colors[feature.accent];

  return (
    <div
      className={`relative mx-auto w-full min-w-0 max-w-2xl px-1 py-2 transition-all duration-700 motion-reduce:transition-none md:max-w-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      } ${className}`}
    >
      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400 transition-transform duration-500 motion-reduce:transition-none md:rotate-[-3deg] md:hover:rotate-[-1deg]" />

      <div className="group/image relative aspect-[1.35/1] overflow-hidden rounded-[19px] bg-slate-200 shadow-2xl sm:aspect-[1.3/1] sm:rounded-[24px] md:aspect-[1.18/1] lg:aspect-[1.22/1]">
        <img
          key={feature.image}
          src={feature.image}
          alt={feature.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full animate-[uniqueImageIn_.45s_ease-out_both] object-cover object-center transition-transform duration-700 group-hover/image:scale-105 motion-reduce:transition-none"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06152e]/25 via-transparent to-white/10" />

        <div
          key={`top-${feature.number}`}
          className="absolute left-2 top-3 flex max-w-[85%] animate-[uniqueReveal_.4s_ease-out_both] items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-2.5 py-2 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:left-4 sm:top-6 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 md:-left-5"
        >
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full sm:h-11 sm:w-11 ${styleIconBg(feature.accent)}`}
          >
            <BadgeIcon size={21} aria-hidden="true" />
          </span>

          <span>
            <strong className="block text-xs leading-tight text-[#08143c] sm:text-base">
              {feature.badge}
            </strong>
            <small className="mt-0.5 block text-[10px] leading-tight text-slate-600 sm:text-sm">
              {feature.badgeDescription}
            </small>
          </span>
        </div>

        <div className="absolute bottom-3 left-2 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-2.5 py-2 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:bottom-6 sm:left-4 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 md:-left-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-800 sm:h-11 sm:w-11">
            <CalendarDays size={21} aria-hidden="true" />
          </span>

          <span>
            <strong className="block text-xs leading-tight text-[#08143c] sm:text-base">
              Weekly Expert
            </strong>
            <small className="block text-[10px] leading-tight text-slate-600 sm:text-sm">
              Sessions
            </small>
          </span>
        </div>

      </div>
    </div>
  );
}

export default function WhyChooseSprint() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="unique-heading"
      className="relative isolate overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/70 py-[2.1rem] md:py-[3.5rem] lg:py-[4.375rem]"
    >
      {/* Background decorations */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rotate-45 rounded-[60px] border border-blue-100/80"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-96 w-96 rotate-45 rounded-[60px] border border-teal-100/80"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-16 -z-10 hidden grid-cols-5 gap-4 opacity-50 lg:grid"
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-blue-300"
          />
        ))}
      </div>

      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section heading */}

        <header
          className={`mx-auto mb-8 max-w-4xl text-center transition-all duration-700 motion-reduce:transition-none sm:mb-12 lg:mb-14 ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mb-3 text-[10px] font-extrabold tracking-[0.3em] text-[#405e84] sm:mb-4 sm:text-xs sm:tracking-[0.4em]">
            WHY CHOOSE SPRINT
          </p>

          <h2
            id="unique-heading"
            className="text-[clamp(2rem,4.5vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.045em] text-[#08143c]"
          >
            What Makes Us{" "}
            <span className="relative z-0 inline-block whitespace-nowrap">
              <span
                aria-hidden="true"
                className="absolute -inset-x-1 bottom-[5%] -z-10 h-[60%] -rotate-2 rounded-[45%_20%_40%_20%] bg-gradient-to-r from-teal-200 to-cyan-100"
              />
              Truly Unique
            </span>
          </h2>

          
        </header>

        {/* Main desktop and mobile layout */}

        <div className="grid items-center gap-7 md:grid-cols-2 md:gap-8 lg:gap-14 xl:gap-20">
          {/* LEFT: Interactive benefit accordion */}

          <div className="flex min-w-0 flex-col">
             

            <div className="flex flex-col gap-2.5 sm:gap-3">
              {features.map((feature, index) => {
                const style = colors[feature.accent];
                const FeatureIcon = feature.icon;
                const isActive = activeIndex === index;

                return (
                  <article
                    key={feature.number}
                    className={`group/card relative min-w-0 overflow-hidden rounded-2xl border bg-white/95 transition-all duration-300 motion-reduce:transition-none sm:rounded-[18px] ${
                      isActive
                        ? `${style.border} ${style.glow} shadow-[0_10px_28px_rgba(20,184,166,0.14)]`
                        : "border-slate-200 shadow-[0_4px_14px_rgba(30,55,90,0.06)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                    }`}
                  >
                    {/* Clickable card heading */}

                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={`unique-panel-${feature.number}`}
                      onClick={() => setActiveIndex(index)}
                      className="flex min-h-[58px] w-full items-center gap-2.5 px-3 py-2.5 text-left sm:min-h-[76px] sm:gap-4 sm:px-4 sm:py-3"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white shadow-lg sm:h-12 sm:w-12 sm:rounded-[15px] sm:text-lg ${style.badge}`}
                      >
                        {feature.number}
                      </span>

                      <span className="min-w-0 flex-1 text-[14px] font-extrabold leading-snug tracking-tight text-[#08143c] sm:text-lg lg:text-xl xl:text-[23px]">
                        {feature.title}
                      </span>

                      <FeatureIcon
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 sm:h-7 sm:w-7 ${style.text}`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {/* Expanded content */}

                    <div
                      id={`unique-panel-${feature.number}`}
                      hidden={!isActive}
                      className="animate-[uniqueReveal_.3s_ease-out_both] px-3 pb-4 sm:px-5 sm:pb-5"
                    >
                      <div className="pl-[2.25rem] sm:pl-[3.75rem]">
                        <p className="text-[13px] leading-relaxed text-slate-700 sm:text-base sm:leading-[1.65]">
                          {feature.description}
                        </p>

                        <a
                          href="#sprint-programs"
                          className={`mt-3 inline-flex items-center gap-2 text-xs font-extrabold transition-all duration-200 hover:gap-3 sm:mt-4 sm:text-base ${style.link}`}
                        >
                          {feature.link}

                          <ArrowRight size={17} aria-hidden="true" />
                        </a>
                      </div>

                      {isActive && (
                        <FeatureImagePanel
                          feature={feature}
                          visible={visible}
                          className="mt-4 md:hidden"
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Dynamic image panel */}

          <div className="hidden md:block">
            <FeatureImagePanel
              feature={features[activeIndex]}
              visible={visible}
            />
          </div>
        </div>

        {/* Interactive pagination */}

        <div
          className="mt-7 flex items-center justify-center gap-2.5 sm:mt-10 sm:gap-3"
          aria-label="Choose a SPRINT benefit"
        >
          {features.map((feature, index) => (
            <button
              key={feature.number}
              type="button"
              aria-label={`Show ${feature.title}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transition-none ${
                index === activeIndex
                  ? "w-7 bg-[#08143c]"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animation keyframes */}

      <style>{`
        @keyframes uniqueReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes uniqueImageIn {
          from {
            opacity: 0.5;
            transform: scale(1.025);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sprint-unique-motion,
          section *,
          section *::before,
          section *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}

function styleIconBg(accent) {
  const backgrounds = {
    teal: "bg-teal-100 text-teal-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
  };

  return backgrounds[accent] || backgrounds.teal;
}
