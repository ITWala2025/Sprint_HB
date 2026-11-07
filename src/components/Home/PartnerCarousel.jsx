"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { partners, smeCompanies } from "@/data/data";

const NODES = [
  { x: 90, y: 60, size: "small", mobile: true },
  { x: 290, y: 100, size: "medium", mobile: false },
  { x: 140, y: 220, size: "large", mobile: true },
  { x: 350, y: 225, size: "small", mobile: false },
  { x: 295, y: 355, size: "medium", mobile: true },
  { x: 110, y: 475, size: "small", mobile: false },
  { x: 205, y: 530, size: "medium", mobile: true },
];
const MOBILE_POSITIONS = [
  { x: 90, y: 70 },
  { x: 140, y: 230 },
  { x: 180, y: 370 },
  { x: 205, y: 530 },
];
const MOBILE_NODES = NODES.filter((node) => node.mobile).map((node, index) => ({
  ...node,
  ...MOBILE_POSITIONS[index],
}));
const mirrorNodes = (nodes) => nodes.map((node) => ({ ...node, x: 1000 - node.x }));
const RIGHT_NODES = mirrorNodes(NODES);
const MOBILE_RIGHT_NODES = mirrorNodes(MOBILE_NODES);
const MOBILE_PAGE_SIZE = 4;
const DESKTOP_PAGE_SIZE = NODES.length;
const ROTATE_MS = 5000;
const CATEGORY_DURATION_MS = ROTATE_MS;
const PAGE_TRANSITION_MS = 240;
const CATEGORY_TRANSITION_MS = 1000;
const PARTNER_CATEGORIES = [
  { title: "SME Leading Companies", items: smeCompanies },
  { title: "Our Trusted Industry Partners", items: partners },

];

const logoSizes = {
  small: "h-[52px] w-[58px] sm:h-[62px] sm:w-[74px] lg:h-[70px] lg:w-[86px]",
  medium: "h-[56px] w-[64px] sm:h-[68px] sm:w-[82px] lg:h-[76px] lg:w-[96px]",
  large: "h-[62px] w-[70px] sm:h-[74px] sm:w-[90px] lg:h-[84px] lg:w-[104px]",
};

function usePausableTimeout(callback, delay, paused, enabled, resetKey) {
  const callbackRef = useRef(callback);
  const remainingRef = useRef(delay);
  const startedAtRef = useRef(null);
  callbackRef.current = callback;

  useEffect(() => {
    remainingRef.current = delay;
  }, [delay, resetKey]);

  useEffect(() => {
    if (!enabled || paused) return undefined;

    startedAtRef.current = Date.now();
    const timer = window.setTimeout(() => {
      remainingRef.current = delay;
      startedAtRef.current = null;
      callbackRef.current();
    }, remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      if (startedAtRef.current !== null) {
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - startedAtRef.current),
        );
        startedAtRef.current = null;
      }
    };
  }, [delay, enabled, paused, resetKey]);
}

function usePartnerPage(count, pageSize, paused, revealed, reducedMotion, categoryKey) {
  const pageCount = Math.ceil(count / pageSize);
  const resetKey = `${categoryKey}:${count}:${pageSize}`;
  const [state, setState] = useState({
    resetKey,
    page: 0,
    pageVisible: true,
    swapping: false,
  });
  const stateIsCurrent = state.resetKey === resetKey;
  const page = stateIsCurrent ? state.page : 0;
  const pageVisible = stateIsCurrent ? state.pageVisible : true;
  const swapping = stateIsCurrent && state.swapping;

  useEffect(() => {
    setState({ resetKey, page: 0, pageVisible: true, swapping: false });
  }, [resetKey]);

  usePausableTimeout(
    () => {
      setState((current) =>
        current.resetKey === resetKey
          ? { ...current, pageVisible: false, swapping: true }
          : current,
      );
    },
    ROTATE_MS,
    paused,
    revealed && stateIsCurrent && page < pageCount - 1 && !swapping,
    `${resetKey}:${page}`,
  );
  usePausableTimeout(
    () => {
      setState((current) =>
        current.resetKey === resetKey
          ? {
              ...current,
              page: Math.min(page + 1, pageCount - 1),
              pageVisible: true,
              swapping: false,
            }
          : current,
      );
    },
    reducedMotion ? 0 : PAGE_TRANSITION_MS,
    paused,
    revealed && stateIsCurrent && swapping,
    `${resetKey}:${page}:swap`,
  );

  return { page, pageVisible };
}

function getPageItems(items, page, pageSize) {
  if (items.length === 0) return [];

  return Array.from(
    { length: pageSize },
    (_, index) => items[(page * pageSize + index) % items.length],
  );
}

function PartnerLogo({ item, node, index, visible }) {
  return (
    <li
      style={{
        left: `${(node.x / 1000) * 100}%`,
        top: `${(node.y / 600) * 100}%`,
        transitionDelay: visible ? `${index * 65}ms` : "0ms",
      }}
      className={`pointer-events-auto group absolute z-1 -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-500 ease-out hover:z-30 motion-reduce:transition-none ${
        node.mobile ? "" : "max-[640px]:hidden"
      } ${visible ? "scale-100 opacity-100" : "scale-[0.88] opacity-0"}`}
      title={item.name}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-[#e7ebef] bg-white shadow-[0_20px_45px_-28px_rgba(0,0,0,0.32)] transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:scale-[1.05] group-hover:border-[#2585c6]/35 group-hover:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.35)] ${logoSizes[node.size]}`}
      >
        <Image
          src={item.logoUrl}
          alt={`${item.name} logo`}
          fill
          sizes="(max-width: 639px) 70px, (max-width: 1023px) 90px, 104px"
          className="object-contain p-2.5 sm:p-3"
        />
      </div>
    </li>
  );
}

function PartnerSide({ items, nodes, page, pageSize, pageVisible, revealed, side }) {
  const visibleItems = getPageItems(items, page, pageSize);

  return (
    <>
      {visibleItems.map((item, index) => {
        const node = nodes[index];
        const isVisible = revealed && pageVisible;
        const controlX = (500 + node.x) / 2;
        const controlY = (300 + node.y) / 2;

        return (
          <path
            key={`${side}-${item.id}-${index}`}
            d={`M 500 300 C ${controlX} 300 ${controlX} ${controlY} ${node.x} ${node.y}`}
            pathLength="1"
            fill="none"
            stroke="#2585c6"
            strokeWidth="1.75"
            strokeOpacity={isVisible ? 0.68 : 0}
            strokeDasharray="1"
            strokeDashoffset={isVisible ? 0 : 1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={`transition-[stroke-dashoffset,stroke-opacity] duration-1000 ease-out motion-reduce:transition-none ${
              node.mobile ? "" : "max-[640px]:hidden"
            }`}
            style={{ transitionDelay: isVisible ? `${index * 70}ms` : "0ms" }}
          />
        );
      })}
    </>
  );
}

function PartnerSideCards({ items, nodes, page, pageSize, pageVisible, revealed, side }) {
  const visibleItems = getPageItems(items, page, pageSize);

  return visibleItems.map((item, index) => (
    <PartnerLogo
      key={`${side}-${item.id}-${index}`}
      item={item}
      node={nodes[index]}
      index={index}
      visible={revealed && pageVisible}
    />
  ));
}

export default function PartnerCarousel() {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [categoryVisible, setCategoryVisible] = useState(true);
  const [categoryReady, setCategoryReady] = useState(true);
  const [switchingCategory, setSwitchingCategory] = useState(false);
  const paused = hovered || focused;
  const activeCategory = PARTNER_CATEGORIES[activeCategoryIndex];
  const splitIndex = Math.ceil(activeCategory.items.length / 2);
  const leftItems = activeCategory.items.slice(0, splitIndex);
  const rightItems = activeCategory.items.slice(splitIndex);
  const categoryPageCount = Math.max(
    1,
    Math.ceil(leftItems.length / pageSize),
    Math.ceil(rightItems.length / pageSize),
  );
  const categoryDuration = Math.max(
    CATEGORY_DURATION_MS,
    categoryPageCount * ROTATE_MS + (categoryPageCount - 1) * PAGE_TRANSITION_MS,
  );
  const categoryKey = `${activeCategoryIndex}:${pageSize}`;
  const headingVisible = revealed && categoryVisible;

  useEffect(() => {
    const mobileQuery = window.matchMedia("(width < 640px)");
    const updatePageSize = () => {
      setPageSize(mobileQuery.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    };

    updatePageSize();
    mobileQuery.addEventListener("change", updatePageSize);
    return () => mobileQuery.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(reducedMotionQuery.matches);

    updateReducedMotion();
    reducedMotionQuery.addEventListener("change", updateReducedMotion);
    return () => reducedMotionQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (categoryReady) return undefined;

    const frame = window.requestAnimationFrame(() => {
      setCategoryVisible(true);
      setCategoryReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [categoryReady]);

  usePausableTimeout(
    () => {
      setCategoryVisible(false);
      setSwitchingCategory(true);
    },
    categoryDuration,
    paused,
    revealed && categoryVisible && !switchingCategory,
    categoryKey,
  );
  usePausableTimeout(
    () => {
      setActiveCategoryIndex(
        (current) => (current + 1) % PARTNER_CATEGORIES.length,
      );
      setCategoryVisible(reducedMotion);
      setCategoryReady(reducedMotion);
      setSwitchingCategory(false);
    },
    reducedMotion ? 0 : CATEGORY_TRANSITION_MS,
    paused,
    switchingCategory,
    `category-transition:${activeCategoryIndex}`,
  );

  const activeNodes = pageSize === MOBILE_PAGE_SIZE ? MOBILE_NODES : NODES;
  const activeRightNodes = pageSize === MOBILE_PAGE_SIZE ? MOBILE_RIGHT_NODES : RIGHT_NODES;
  const leftPage = usePartnerPage(
    leftItems.length,
    pageSize,
    paused,
    revealed,
    reducedMotion,
    categoryKey,
  );
  const rightPage = usePartnerPage(
    rightItems.length,
    pageSize,
    paused,
    revealed,
    reducedMotion,
    categoryKey,
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="sprint-partners-title"
      className="relative overflow-hidden border-y border-[#e9f2f9] bg-white px-4 py-6 text-[#161d2a] sm:px-6 md:py-8 lg:py-10"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="mx-auto mb-0 max-w-7xl text-center">

          <h2
            id="sprint-partners-title"
            className="font-display text-3xl font-semibold leading-[1.12] text-[#0a0a0a] sm:text-4xl lg:whitespace-nowrap"
          >
            Connections That Create Opportunities.
          </h2>
          <h3
            aria-live="polite"
            aria-atomic="true"
            className={`mt-2 text-base font-semibold text-[#2585c6] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:text-lg ${
              headingVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {activeCategory.title}
          </h3>
          {/* <p className="mx-auto mt-4 max-w-155 text-[15px] leading-6 text-[#5a6472] sm:text-base">
            Connecting learners with the companies and organizations that create career opportunities.
          </p> */}
        </header>

        <div
          className="relative isolate mx-auto max-w-310 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_40%_54%_at_50%_50%,rgba(95,175,224,0.14)_0%,rgba(233,242,249,0.62)_40%,rgba(255,255,255,0)_78%)]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
          aria-label="Interactive network of SPRINT partners"
          role="group"
          tabIndex={0}
        >
          <div className="relative aspect-[1.1] min-h-80 w-full sm:aspect-[1.8] sm:min-h-105 lg:aspect-[2.4] lg:min-h-125">
            <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(37,133,198,0.18),rgba(37,133,198,0.06)_58%,transparent_100%)] sm:w-[34%] lg:w-[30%]" />

            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <PartnerSide
                items={leftItems}
                nodes={activeNodes}
                page={leftPage.page}
                pageSize={pageSize}
                pageVisible={leftPage.pageVisible && categoryVisible}
                revealed={revealed}
                side="partner-left"
              />
              <PartnerSide
                items={rightItems}
                nodes={activeRightNodes}
                page={rightPage.page}
                pageSize={pageSize}
                pageVisible={rightPage.pageVisible && categoryVisible}
                revealed={revealed}
                side="partner-right"
              />
            </svg>

            <ul
              className="pointer-events-none absolute inset-0 z-10 m-0 list-none p-0"
              aria-label={activeCategory.title}
            >
              <PartnerSideCards
                items={leftItems}
                nodes={activeNodes}
                page={leftPage.page}
                pageSize={pageSize}
                pageVisible={leftPage.pageVisible && categoryVisible}
                revealed={revealed}
                side="partner-left"
              />
              <PartnerSideCards
                items={rightItems}
                nodes={activeRightNodes}
                page={rightPage.page}
                pageSize={pageSize}
                pageVisible={rightPage.pageVisible && categoryVisible}
                revealed={revealed}
                side="partner-right"
              />
            </ul>

            <div
              className={`absolute left-1/2 top-1/2 z-20 flex h-25.5 w-25.5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#dbe8f1] bg-white/95 text-center shadow-[0_22px_55px_-28px_rgba(16,72,112,0.38)] backdrop-blur-sm transition-[opacity,transform] duration-700 ease-out sm:h-31 sm:w-31 lg:h-35.5 lg:w-35.5 motion-reduce:transition-none ${
                revealed ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
            >
              <span className="text-[21px] font-extrabold tracking-[0.08em] text-[#2585c6] sm:text-[25px]">
                SPRINT
              </span>
              <span className="mt-1 text-[8px] font-bold tracking-[0.16em] text-[#8a8f98] sm:text-[9px]">
                 NETWORKS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
