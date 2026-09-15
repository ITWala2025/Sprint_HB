import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import about from "@/data/about.json";
import siteConfig from "@/config/site.config.json";
import VisionMissionCard from "@/components/cards/VisionMissionCard";
import ProfileCard from "@/components/cards/ProfileCard";
import SkillCard from "@/components/cards/SkillCard";
import StatCounter from "@/components/cards/StatCounter";
import Reveal from "@/components/cards/Reveal";

// About Us — "/about". Spec: docs/md/About_Page.md (10 approved sections).
// Sections 1 (Header) and 10 (Footer) render via the root layout; this page
// implements sections 2–9 in the approved stacking order.

export const metadata = {
  title: "About Us",
  description:
    "Learn about SPRINT — a job-ready training hub in Hazaribagh bridging the academic-industry gap with hands-on programs in AI/ML, Cloud and DevOps.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us | SPRINT",
    description:
      "Who is SPRINT? Discover our story, vision, mission, leadership, faculty and verified impact.",
    url: "/about",
    type: "website",
  },
};

/* Organization structured data (SEO §7.2) */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.logo}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hazaribagh",
    addressRegion: "Jharkhand",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.contact.telHref.replace("tel:", ""),
    email: siteConfig.contact.email,
    contactType: "admissions",
    availableLanguage: ["en", "hi"],
  },
  sameAs: siteConfig.socials.map((social) => social.href),
};

/* CTA channel trio icons (§3.9) */
const ctaIcons = {
  phone: Phone,
  mail: Mail,
  message: MessageCircle,
};

function SectionHeader({ heading, subtitle, center = false, id }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 id={id} className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
        {heading}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-lg leading-relaxed text-brand-text-secondary">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Structured data: Organization schema (SEO §7.2) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ============ 2. HERO — Who is SPRINT? (§3.2) ============ */}
      <section
        id="who-is-sprint"
        className="sprint-hero-bg sprint-anchor relative overflow-hidden"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
          <p className="inline-flex items-center rounded-full bg-brand-red-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            {about.hero.kicker}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-brand-navy sm:text-5xl md:text-6xl">
            {about.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
            {about.hero.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={about.hero.primaryCta.href}
              data-track="hero_cta_click"
              className="sprint-focus group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-red px-7 py-3 text-base font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark"
            >
              {about.hero.primaryCta.label}
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href={about.hero.secondaryCta.href}
              className="sprint-focus inline-flex min-h-[48px] items-center rounded-full border border-brand-border bg-white px-7 py-3 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy"
            >
              {about.hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </section>

      {/* ============ 3. OUR STORY — Why SPRINT was established (§3.3) ============ */}
      <section id="our-story" className="sprint-anchor bg-brand-off-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <SectionHeader
            heading={about.story.heading}
            subtitle={about.story.subtitle}
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:items-start">
            <div className="space-y-5 text-lg leading-relaxed text-brand-text-secondary">
              {about.story.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <Reveal>
              <ul className="space-y-4">
                {about.story.callouts.map((callout) => (
                  <li
                    key={callout.label}
                    className="flex items-center gap-4 rounded-3xl border border-brand-border bg-white p-5 shadow-sm"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-navy text-lg font-black text-white">
                      {callout.value}
                    </span>
                    <span className="text-sm font-medium leading-snug text-brand-text">
                      {callout.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 4. VISION & MISSION — §3.4 card system ============ */}
      <section
        id="vision-mission"
        aria-labelledby="vision-mission-heading"
        className="sprint-anchor bg-white"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <SectionHeader
            heading={about.visionMission.heading}
            subtitle={about.visionMission.subtitle}
            id="vision-mission-heading"
            center
          />
          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
            <VisionMissionCard variant="vision" data={about.visionMission.vision} />
            <VisionMissionCard variant="mission" data={about.visionMission.mission} />
          </div>
        </div>
      </section>

      {/* ============ 5. LEADERSHIP / FOUNDERS (§3.5) ============ */}
      <section id="leadership" className="sprint-anchor bg-brand-off-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <SectionHeader
            heading={about.leadership.heading}
            subtitle={about.leadership.subtitle}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.leadership.profiles.map((profile) => (
              <ProfileCard key={profile.name} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6. FACULTY / EXPERTS (§3.6) ============ */}
      <section id="faculty" className="sprint-anchor bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <SectionHeader
            heading={about.faculty.heading}
            subtitle={about.faculty.subtitle}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.faculty.profiles.map((profile) => (
              <ProfileCard key={profile.name} profile={profile} showTags />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. INDUSTRY / ACADEMIC CONNECTION (§3.7) ============ */}
      <section id="industry-connection" className="sprint-anchor bg-brand-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left: narrative on the academic–industry skill gap */}
            <div>
              <SectionHeader
                heading={about.industry.heading}
                subtitle={about.industry.subtitle}
              />
              <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-text-secondary">
                {about.industry.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-6 rounded-3xl border-l-4 border-brand-red bg-white p-5 font-medium text-brand-text shadow-sm">
                {about.industry.approach}
              </p>
              <Link
                href={about.industry.cta.href}
                data-track="industry_courses_link"
                className="sprint-focus group mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-brand-navy px-7 py-3 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
              >
                {about.industry.cta.label}
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {/* Right: skill cards (IND-02) */}
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
              {about.industry.skills.map((skill) => (
                <SkillCard key={skill.title} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. OUR IMPACT / VERIFIED STATS (§3.8) ============ */}
      <section id="impact" className="sprint-anchor bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <SectionHeader
            heading={about.impact.heading}
            subtitle={about.impact.subtitle}
            center
          />
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {about.impact.stats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-brand-text-muted">
            {about.impact.sourceNote}
          </p>
        </div>
      </section>

      {/* ============ 9. CTA — Connect With SPRINT (§3.9) ============ */}
      <section id="connect" className="sprint-anchor relative overflow-hidden bg-brand-navy">
        <div className="mx-auto max-w-[1200px] px-6 py-16 text-center md:py-24">
          <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light">
            {about.cta.kicker}
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {about.cta.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-off-white/80">
            {about.cta.description}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {about.cta.channels.map((channel) => {
              const Icon = ctaIcons[channel.icon] ?? Phone;
              return (
                <a
                  key={channel.href}
                  href={channel.href}
                  data-track={`cta_${channel.icon}`}
                  className="sprint-focus group flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-3xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-brand-red hover:bg-white/10"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-red to-brand-purple text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-base font-semibold text-white">
                    {channel.label}
                  </span>
                  <span className="text-sm text-brand-off-white/70">
                    {channel.detail}
                  </span>
                </a>
              );
            })}
          </div>

          <Link
            href={about.cta.primaryCta.href}
            data-track="cta_register"
            className="sprint-focus group mt-10 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-red px-8 py-3 text-base font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark"
          >
            {about.cta.primaryCta.label}
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
