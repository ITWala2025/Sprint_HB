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
        <div className="flex w-max animate-marquee gap-16">
          {track.map((partner, i) => (
            <div
              key={`${partner.id}-${i}`}
              className="flex shrink-0 items-center opacity-80"
            >
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={128}
                height={128}
                className="size-32 object-contain"
              />
              {/* <span className="whitespace-nowrap text-sm font-medium text-brand-text-secondary">
                {partner.name}
              </span> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
