import VideoTestimonials from "./VideoTestimonials";
import TextTestimonials from "./TextTestimonials";

export default function Testimonials() {
  return (
    <section className="bg-[linear-gradient(145deg,var(--color-brand-blue-light)_0%,#f5faff_48%,#dcecff_100%)] py-6 md:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red-accessible">Learner stories</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">What our students say</h2>
        </div>
        <VideoTestimonials />
        <TextTestimonials />
      </div>
    </section>
  );
}
