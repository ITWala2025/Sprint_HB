"use client";

import Image from "next/image";

/**
 * Global Watermark — centered, fixed-position logo watermark.
 * Uses mix-blend-mode: multiply with original dark logo.
 * Visible on light backgrounds, naturally hidden on dark backgrounds.
 * Renders above page content but below header/modals/dropdowns.
 * Non-interactive, hidden from assistive tech, excluded from print.
 *
 * IMPORTANT: Dark sections must use the `.covers-watermark` utility class
 * (defined in src/css/global.css) to visually sit above this watermark.
 * Apply `.covers-watermark` to: Header, Footer, Hero, FeaturedProgram,
 * ContactCTA, CampusNewsTicker, LegalLayout header, LegalTableOfContents,
 * and any future dark-themed sections.
 */
export default function Watermark() {
  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none select-none overflow-hidden print:hidden mix-blend-multiply"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/header&footer/sprintlogo.png"
          alt=""
          width={600}
          height={600}
          priority={false}
          className="w-[70vmin] max-w-[80vw] h-auto object-contain opacity-[0.18]"
          style={{
            maxWidth: "80vw",
            maxHeight: "80vh",
          }}
        />
      </div>
    </div>
  );
}