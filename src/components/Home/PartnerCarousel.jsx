"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { partners } from "@/data/data";

const NODES = [
  { x: 90, y: 90, size: "small", mobile: true },
  { x: 290, y: 125, size: "medium", mobile: false },
  { x: 140, y: 240, size: "large", mobile: true },
  { x: 350, y: 245, size: "small", mobile: false },
  { x: 295, y: 365, size: "medium", mobile: true },
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
const ROTATE_MS = 6200;

const logoSizes = {
  small: "h-[52px] w-[58px] sm:h-[62px] sm:w-[74px] lg:h-[70px] lg:w-[86px]",
  medium: "h-[56px] w-[64px] sm:h-[68px] sm:w-[82px] lg:h-[76px] lg:w-[96px]",
  large: "h-[62px] w-[70px] sm:h-[74px] sm:w-[90px] lg:h-[84px] lg:w-[104px]",
};

function usePartnerPage(count, pageSize, paused, revealed) {
  const [page, setPage] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    setPage(0);
    setPageVisible(true);
  }, [count, pageSize]);

  useEffect(() => {
    const pageCount = Math.ceil(count / pageSize);
    if (paused) {
      setPageVisible(true);
      return undefined;
    }
    if (!revealed || pageCount <= 1) return undefined;

    let swapTimer;
    const interval = window.setInterval(() => {
      setPageVisible(false);
      swapTimer = window.setTimeout(() => {
        setPage((current) => (current + 1) % pageCount);
        setPageVisible(true);
      }, 240);
    }, ROTATE_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(swapTimer);
    };
  }, [count, pageSize, paused, revealed]);

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
        className={`relative overflow-hidden rounded-2xl border border-[#e7ebef] bg-white shadow-[0_20px_45px_-28px_rgba(0,0,0,0.32)] transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-1 group-hover:scale-[1.05] group-hover:border-[#2585c6]/35 group-hover:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.35)] ${logoSizes[node.size]}`}
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
            key={`${side}-${item.id}`}
            d={`M 500 300 C ${controlX} 300 ${controlX} ${controlY} ${node.x} ${node.y}`}
            pathLength="1"
            fill="none"
            stroke="#2585c6"
            strokeWidth="1.25"
            strokeOpacity={isVisible ? 0.34 : 0}
            strokeDasharray="1"
            strokeDashoffset={isVisible ? 0 : 1}
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
      key={`${side}-${item.id}`}
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
  const [paused, setPaused] = useState(false);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);

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

  const splitIndex = Math.ceil(partners.length / 2);
  const leftItems = partners.slice(0, splitIndex);
  const rightItems = partners.slice(splitIndex);
  const activeNodes = pageSize === MOBILE_PAGE_SIZE ? MOBILE_NODES : NODES;
  const activeRightNodes = pageSize === MOBILE_PAGE_SIZE ? MOBILE_RIGHT_NODES : RIGHT_NODES;
  const leftPage = usePartnerPage(leftItems.length, pageSize, paused, revealed);
  const rightPage = usePartnerPage(rightItems.length, pageSize, paused, revealed);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="sprint-partners-title"
      className="relative overflow-hidden border-y border-[#e9f2f9] bg-white px-4 py-10 text-[#161d2a] sm:px-6 sm:py-12 lg:py-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-5 max-w-7xl text-center sm:mb-6">

          <h2
            id="sprint-partners-title"
            className="font-display text-3xl font-semibold leading-[1.12] text-[#0a0a0a] sm:text-4xl lg:whitespace-nowrap"
          >
            Connections That Create Opportunities.
          </h2>
          {/* <p className="mx-auto mt-4 max-w-155 text-[15px] leading-6 text-[#5a6472] sm:text-base">
            Connecting learners with the companies and organizations that create career opportunities.
          </p> */}
        </header>

        <div
          className="relative isolate mx-auto max-w-310 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_40%_54%_at_50%_50%,rgba(95,175,224,0.14)_0%,rgba(233,242,249,0.62)_40%,rgba(255,255,255,0)_78%)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
          aria-label="Interactive network of SPRINT partners"
          role="group"
        >
          <div className="relative aspect-[1.1] min-h-80 w-full sm:aspect-[1.55] sm:min-h-105 lg:aspect-[2.05] lg:min-h-125">
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
                pageVisible={leftPage.pageVisible}
                revealed={revealed}
                side="partner-left"
              />
              <PartnerSide
                items={rightItems}
                nodes={activeRightNodes}
                page={rightPage.page}
                pageSize={pageSize}
                pageVisible={rightPage.pageVisible}
                revealed={revealed}
                side="partner-right"
              />
            </svg>

            <ul className="pointer-events-none absolute inset-0 z-10 m-0 list-none p-0" aria-label="Partner logos">
              <PartnerSideCards
                items={leftItems}
                nodes={activeNodes}
                page={leftPage.page}
                pageSize={pageSize}
                pageVisible={leftPage.pageVisible}
                revealed={revealed}
                side="partner-left"
              />
              <PartnerSideCards
                items={rightItems}
                nodes={activeRightNodes}
                page={rightPage.page}
                pageSize={pageSize}
                pageVisible={rightPage.pageVisible}
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
