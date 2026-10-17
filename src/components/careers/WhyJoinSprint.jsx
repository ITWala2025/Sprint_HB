
import { whyJoinContent } from "@/data/careers";

const images = [
  {
    src: "/images/careers/sprint-careers-team-collaboration.png",
    alt: "SPRINT team collaborating on a technology project",
    className:
      "left-[5%] top-0 z-10 w-[70%] aspect-[1.12/1]",
  },
  {
    src: "/images/careers/sprint-careers-workplace-discussion.png",
    alt: "SPRINT colleagues discussing a project",
    className:
      "right-0 top-[34%] z-20 w-[67%] aspect-[1.2/1]",
  },
  {
    src: "/images/careers/sprint-careers-team.png",
    alt: "SPRINT team learning and working together",
    className:
      "bottom-0 left-[5%] z-30 w-[65%] aspect-[1.2/1]",
  },
];

export default function WhyJoinSprint() {
  return (
    <section
      aria-labelledby="why-join-heading"
      className="overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: heading and all existing content */}
          <div>
            <span className="inline-flex rounded-full bg-rose-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef3e43]">
              Why Join SPRINT
            </span>

            <h2
              id="why-join-heading"
              className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-tight text-[#10264b] sm:text-4xl lg:text-[42px]"
            >
              Where Learning Meets Impact
            </h2>

            <div className="mt-3 max-w-xl space-y-5 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              {whyJoinContent.map((item) => (
                <div
                  key={item.id}
                  dangerouslySetInnerHTML={{
                    __html: item.content,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: three overlapping image cards */}
          <div className="relative mx-auto mt-2 h-[440px] w-full max-w-[540px] sm:h-[540px] lg:mt-0 lg:h-[560px]">
            {/* Decorative shapes */}
            <div
              aria-hidden="true"
              className="absolute right-[3%] top-[4%] h-[40%] w-[48%] rounded-3xl bg-rose-50"
            />

            <div
              aria-hidden="true"
              className="absolute bottom-[10%] left-[27%] h-[30%] w-[40%] rounded-3xl bg-blue-50"
            />

            {/* Image cards */}
            {images.map((image) => (
              <div
                key={image.src}
                className={`absolute overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ${image.className}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
