import about from "@/data/about.json";
import ProfileCard from "@/components/cards/ProfileCard";

export default function FacultyExperts({
  sectionClassName = "sprint-section sprint-anchor bg-white",
  contentClassName = "mx-auto max-w-[1200px] px-6 py-[1.4rem] md:py-[1.925rem] lg:py-[2.45rem]",
  eyebrow,
  accessibleBrandRed = false,
  profilesContent,
}) {
  return (
    <section id="faculty" className={sectionClassName}>
      <div className={contentClassName}>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E11D48]">
            {eyebrow ?? "INDUSTRY MENTORS"}
          </p>
          <h2
            className="mt-2 text-3xl font-bold tracking-tight text-[#0B1D3A] md:text-4xl"
          >
            {about.faculty.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
            {about.faculty.subtitle}
          </p>
        </div>
        {profilesContent ?? (
          <div className="mt-8 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.faculty.profiles.map((profile) => (
              <ProfileCard
                key={profile.name}
                profile={profile}
                showTags
                accessibleBrandRed={accessibleBrandRed}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
