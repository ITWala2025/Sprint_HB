import { whyJoinContent } from "@/data/careers";

/**
 * Why Join SPRINT — Editorial introduction with an asymmetric
 * culture-image collage. Images are placeholders for now.
 */
export default function WhyJoinSprint() {
  return (
    <section
      className="bg-brand-white py-24 sm:py-28 lg:py-32"
      aria-labelledby="why-join-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Editorial introduction */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Left column */}
          <div>
            <p className="inline-flex items-center rounded-full bg-brand-red-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
              Why Join SPRINT
            </p>

            <h2
              id="why-join-heading"
              className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.08] text-brand-navy sm:text-5xl"
            >
              Where Learning Meets Impact
            </h2>

            <div
              className="mt-8 max-w-xl text-base leading-relaxed text-brand-text-secondary sm:text-lg"
              dangerouslySetInnerHTML={{
                __html: whyJoinContent[0]?.content ?? "",
              }}
            />
          </div>

          {/* Right column */}
          <div className="space-y-8 lg:pt-14">
            {whyJoinContent.slice(1).map((item) => (
              <p
                key={item.id}
                className="max-w-xl text-base leading-relaxed text-brand-text-secondary sm:text-lg"
                dangerouslySetInnerHTML={{
                  __html: item.content,
                }}
              />
            ))}
          </div>
        </div>

        {/* Culture image collage — placeholders for now */}
        <div className="relative mt-20 h-[620px] sm:h-[700px] lg:mt-24 lg:h-[760px]">
          {/* Main image placeholder */}
          <div className="absolute left-0 top-20 w-[72%] overflow-hidden rounded-2xl">
            <div
              className="aspect-[4/3] w-full bg-slate-200"
              aria-hidden="true"
            />
          </div>

          {/* Top floating image placeholder */}
          <div className="absolute left-[9%] top-0 z-10 w-[30%] overflow-hidden rounded-2xl">
            <div
              className="aspect-square w-full bg-slate-300"
              aria-hidden="true"
            />
          </div>

          {/* Bottom-right image placeholder */}
          <div className="absolute bottom-0 right-0 z-10 w-[38%] overflow-hidden rounded-2xl">
            <div
              className="aspect-square w-full bg-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}