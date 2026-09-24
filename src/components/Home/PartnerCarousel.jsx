import Image from "next/image";
import { partners } from "@/data/data";

/**
 * Partner Associations — Section 6.3.
 *
 * Implemented as a pure-CSS marquee (see .animate-marquee in globals.css)
 * rather than a JS carousel library: it's a decorative, non-interactive,
 * continuously-moving strip, so a transform-only CSS animation is smoother
 * and cheaper than JS-driven scrolling. The track renders the partner list
 * twice back to back and animates by exactly -50%, so the loop point is
 * invisible ("no noticeable jumps or abrupt resets", per spec).
 *
 * Logos/names are explicitly not clickable per spec — no <a>/<button> here.
 */

/* Height shared by every logo frame, in px (`size-32` / `h-32` = 8rem). It
   doubles as the default frame width, since the default frame is square. */
const LOGO_FRAME_HEIGHT = 128;

/* Space between two logos, in px (`pr-16` = 4rem). It is applied per card
   instead of a flex `gap` so that every logo owns its trailing space: the
   duplicated track then measures exactly twice one loop, which is what makes
   the `-50%` keyframe in global.css land on a seamless seam (a flex `gap` has
   no trailing space, so it drifts by half a gap per loop). */
const LOGO_GAP = 64;

/* The original 8-logo strip covered one loop (8 × (128px + 64px) = 1536px) in
   the 32s default that global.css falls back to — 48px per second. Deriving
   the duration from the loop width below keeps that same visual speed now that
   the track is longer. */
const MARQUEE_SPEED_PX_PER_SECOND = 48;

/**
 * Per-logo frame tweaks. Every logo stays `object-contain` at a consistent
 * height, so a wide wordmark would otherwise be squeezed into a sliver of that
 * height and read as "smaller" than its neighbours, while a square logo mark
 * would fill the whole frame and read as "bigger". Only the frame changes —
 * artwork is never stretched or cropped. `width` mirrors the class so the
 * marquee duration can be derived from the real track width.
 */
const LOGO_FRAMES = {
  Algocirrus: { className: "h-32 w-36", width: 144 },
  "Eyogi Gurukul": { className: "size-24", width: 96 },
  "Global Medtech Solutions": { className: "h-32 w-60", width: 240 },
  "IT-Wala": { className: "size-24", width: 96 },
  Swavlamban: { className: "h-32 w-28", width: 112 },
  "Vishal Creations": { className: "h-32 w-28", width: 112 },
  "Zupharm Laboratories": { className: "h-32 w-48", width: 192 },
};

/* One loop = one copy of the list: every logo frame plus its trailing gap. */
const marqueeLoopWidth = partners.reduce(
  (total, partner) =>
    total + (LOGO_FRAMES[partner.name]?.width ?? LOGO_FRAME_HEIGHT) + LOGO_GAP,
  0,
);

const marqueeDuration = Math.round(marqueeLoopWidth / MARQUEE_SPEED_PX_PER_SECOND);

export default function PartnerCarousel() {
  const track = [...partners, ...partners];

  return (
    <section className="sprint-section overflow-hidden border-y border-brand-border bg-brand-white py-[1.05rem] md:py-[1.4rem] lg:py-[1.75rem]">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
          Trusted by universities and industry partners
        </p>
      </div>

      {/* marquee-track wrapper enables the desktop hover-to-pause rule
          defined in globals.css without affecting touch devices. */}
      <div className="marquee-track mt-4 w-full overflow-hidden md:mt-6">
        <div
          className="flex w-max animate-marquee"
          style={{ "--marquee-duration": `${marqueeDuration}s` }}
        >
          {track.map((partner, i) => {
            const frame = LOGO_FRAMES[partner.name];

            return (
              <div
                key={`${partner.id}-${i}`}
                className="flex shrink-0 items-center pr-16 opacity-80"
              >
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  width={128}
                  height={128}
                  className={`object-contain ${frame ? frame.className : "size-32"}`}
                />
                {/* <span className="whitespace-nowrap text-sm font-medium text-brand-text-secondary">
                {partner.name}
              </span> */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
