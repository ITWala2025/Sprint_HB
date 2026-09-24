import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import about from "@/data/about.json";
import siteConfig from "@/config/site.config.json";
import StoryVisionMission from "@/components/sections/StoryVisionMission";
import FacultyExperts from "@/components/sections/FacultyExperts";
import ProfileCard from "@/components/cards/ProfileCard";
import SkillCard from "@/components/cards/SkillCard";

// About Us — "/about". Spec: docs/md/About_Page.md (10 approved sections).
// Sections 1 (Header) and 10 (Footer) render via the root layout; this page
// implements sections 2–7 and the final CTA in the approved stacking order.

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

/* Indian-locale number formatting for impact stats (IMP-05) */
const formatStatValue = (value) => Math.round(value).toLocaleString("en-IN");

/* Hero title accent — wraps the highlighted brand word (e.g. "SPRINT") so the
   heading matches the Contact hero's red-accent anatomy (§3.2 HR-02). */
function HighlightHeroTitle({ text, highlight }) {
  if (!highlight) return text;
  const parts = text.split(highlight);
  if (parts.length < 2) return text;
  return (
    <>
      {parts[0]}
      <span className="sprint-hero-title-accent">{highlight}</span>
      {parts.slice(1).join(highlight)}
    </>
  );
}

function SectionHeader({ heading, subtitle, center = false, id }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2
        id={id}
        className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl"
      >
        {heading}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-lg leading-relaxed text-brand-text-secondary">
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
        <picture className="sprint-hero-media" aria-hidden="true">
          <source
            media="(max-width: 767px)"
            srcSet="/images/about_page/about-hero-mobile.webp"
          />
          <Image
            src="/images/about_page/about-hero-desktop.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="sprint-hero-image"
          />
        </picture>
        <div className="sprint-hero-overlay" aria-hidden="true" />

        <div className="sprint-hero-content mx-auto max-w-[1200px] px-6">
          <nav className="sprint-hero-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">About Us</span>
          </nav>

          <div className="sprint-hero-copy">
            <p className="sprint-hero-eyebrow">
              <span aria-hidden="true">›</span>
              {about.hero.kicker}
            </p>

            <h1 className="sprint-hero-title">
              <HighlightHeroTitle
                text={about.hero.title}
                highlight={about.hero.titleHighlight}
              />
            </h1>

            <p className="sprint-hero-description">{about.hero.description}</p>

            <div className="sprint-hero-ctas">
              <Link
                href={about.hero.primaryCta.href}
                data-track="hero_cta_click"
                className="sprint-focus group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-2.5 text-base font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark sm:w-auto"
              >
                {about.hero.primaryCta.label}
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a
                href={about.hero.secondaryCta.href}
                className="sprint-focus inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/20 sm:w-auto"
              >
                {about.hero.secondaryCta.label}
              </a>
            </div>
          </div>

          {/* Verified impact — horizontal stat band */}
          <div
            className="sprint-hero-stats"
            role="list"
            aria-label="SPRINT verified impact at a glance"
          >
            {about.impact.stats.map((stat) => (
              <div
                key={stat.label}
                role="listitem"
                className="sprint-hero-stat"
              >
                <p className="sprint-hero-stat-value tabular-nums">
                  {formatStatValue(stat.value)}
                  {stat.suffix}
                </p>
                <p className="sprint-hero-stat-label">{stat.label}</p>
                <p className="sprint-hero-stat-context">{stat.context}</p>
              </div>
            ))}
          </div>

          <p className="sprint-hero-verified">
            <CheckCircle2
              className="size-4 shrink-0 text-brand-success"
              aria-hidden="true"
            />
            All figures source-verified
          </p>
        </div>
      </section>

      {/* ============ 3 + 4. OUR STORY · VISION · MISSION (§3.3 + §3.4) ============ */}
      <section
        id="our-story"
        aria-labelledby="our-story-heading"
        className="sprint-section sprint-anchor bg-brand-off-white"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-8 md:py-11 lg:py-14">
          <SectionHeader
            heading={`${about.story.heading}, ${about.visionMission.heading}`}
            subtitle="Why SPRINT was established, and what drives everything we build"
            id="our-story-heading"
          />
          <div className="mt-6 md:mt-8">
            <StoryVisionMission
              story={about.story}
              visionMission={about.visionMission}
            />
          </div>
        </div>
      </section>

      {/* ============ 5. LEADERSHIP / FOUNDERS (§3.5) ============ */}
      <section
        id="leadership"
        className="sprint-section sprint-anchor bg-brand-off-white"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-8 md:py-11 lg:py-14">
          <SectionHeader
            heading={about.leadership.heading}
            subtitle={about.leadership.subtitle}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.leadership.profiles.map((profile) => (
              <ProfileCard key={profile.name} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6. FACULTY / EXPERTS (§3.6) ============ */}
      <FacultyExperts />

      {/* ============ 7. INDUSTRY / ACADEMIC CONNECTION (§3.7) ============ */}
      <section
        id="industry-connection"
        className="sprint-section sprint-anchor bg-brand-surface"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-8 md:py-11 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Left: narrative */}
            <div>
              <SectionHeader
                heading={about.industry.heading}
                subtitle={about.industry.subtitle}
              />
              <div className="mt-4 space-y-3 text-base leading-relaxed text-brand-text-secondary">
                {about.industry.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border-l-4 border-brand-red bg-white p-4 font-medium text-brand-text shadow-sm">
                {about.industry.approach}
              </p>
              <Link
                href={about.industry.cta.href}
                data-track="industry_courses_link"
                className="sprint-focus group mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border-2 border-brand-navy px-6 py-2.5 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white sm:w-auto"
              >
                {about.industry.cta.label}
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {/* Right: skill cards */}
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {about.industry.skills.map((skill) => (
                <SkillCard key={skill.title} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. CTA — Connect With SPRINT (§3.9) ============ */}
      <section
        id="connect"
        className="sprint-cta-bg sprint-anchor relative overflow-hidden"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-8 text-center md:py-11 lg:py-14">
          <p className="inline-flex items-center rounded-full bg-brand-red-light px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            {about.cta.kicker}
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            {about.cta.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-brand-text-secondary">
            {about.cta.description}
          </p>

          <Link
            href={about.cta.primaryCta.href}
            data-track="cta_contact"
            className="sprint-focus group mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-red to-brand-purple px-7 py-2.5 text-base font-bold text-white shadow-brand-cta transition hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
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
