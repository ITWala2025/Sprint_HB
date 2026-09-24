import about from "@/data/about.json";
import ProfileCard from "@/components/cards/ProfileCard";

export default function FacultyExperts({
  sectionClassName = "sprint-section sprint-anchor bg-white",
  contentClassName = "mx-auto max-w-[1200px] px-6 py-[1.4rem] md:py-[1.925rem] lg:py-[2.45rem]",
  eyebrow,
}) {
  return (
    <section id="faculty" className={sectionClassName}>
      <div className={contentClassName}>
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`${eyebrow ? "mt-2 " : ""}text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl`}
          >
            {about.faculty.heading}
          </h2>
          <p className="mt-2 text-lg leading-relaxed text-brand-text-secondary">
            {about.faculty.subtitle}
          </p>
        </div>
        <div className="mt-8 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.faculty.profiles.map((profile) => (
            <ProfileCard key={profile.name} profile={profile} showTags />
          ))}
        </div>
      </div>
    </section>
  );
}
