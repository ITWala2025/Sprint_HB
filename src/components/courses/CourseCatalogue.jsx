"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  Heart,
  Laptop,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import JourneyScroller from "@/components/courses/JourneyScroller";
import RoleBasedLearningPaths from "@/components/courses/RoleBasedLearningPaths";
import { createClient } from "@/lib/supabase/client";
import {
  audienceOptions,
  normalizeDatabaseCourse,
} from "@/data/courses";
import { rolePaths } from "@/data/learningPaths";
import { programs } from "@/data/programs";
import {
  normalizeBundle,
  normalizeLearningPath,
} from "@/lib/course-utils";

const staticLearningPaths = rolePaths.map(normalizeLearningPath);

function toCatalogueBundle(source) {
  const bundle = normalizeBundle(source);
  return {
    ...bundle,
    kind: "bundle",
    category: source.category || "Career Package",
    audience: bundle.audience === "undergraduate" ? ["student"] : ["it-pro", "non-it"],
    level: bundle.level || "Curated pathway",
    difficulty_level: bundle.level || "Curated pathway",
    delivery_method: bundle.delivery_method || "Hybrid",
    certificate: Boolean(bundle.credential),
    image: bundle.image_url || null,
  };
}

function toCatalogueProgram(program) {
  const roadmap = Array.isArray(program.roadmap)
    ? program.roadmap
    : (program.curriculum || []).map((stage) => ({
        stage: "PROGRAM STAGE",
        title: stage.title,
        hours: "",
        topics: (stage.children || []).flatMap((child) => child.topics || []),
      }));
  return {
    ...program,
    kind: "signature",
    program_type: "signature",
    badge_label: program.badge_label || program.badgeLabel || "Signature Program",
    tagline: program.tagline || program.headline || "",
    audience: program.audience === "working_professional" ? ["it-pro", "non-it"] : ["student"],
    roadmap,
  };
}

const itemHref = (item, audience) => {
  const href = `/${item.kind === "bundle" ? "bundles" : "courses"}/${item.slug}`;

  return item.kind === "bundle"
    ? href
    : `${href}?audience=${encodeURIComponent(audience)}`;
};

const matchesAudience = (item, audienceValue) => {
  if (!item || !item.audience) return false;

  return Array.isArray(item.audience)
    ? item.audience.includes(audienceValue)
    : item.audience === audienceValue;
};

function CourseArt({ category }) {
  const normalized = category.toLowerCase();

  if (normalized.includes("artificial") || normalized.includes("machine learning") || normalized.includes("ai")) {
    return <svg aria-hidden="true" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="240" fill="#101432" /><path d="M-30 205C94 175 109 40 260 54s175 171 318 105S734 17 850 28" fill="none" stroke="#c084fc" strokeWidth="30" strokeLinecap="round" opacity=".72" /><path d="M-40 230C90 206 155 110 256 122s164 119 292 78S721 97 850 100" fill="none" stroke="#fb7185" strokeWidth="13" strokeLinecap="round" opacity=".9" /><circle cx="614" cy="55" r="23" fill="#fda4af" opacity=".9" /><circle cx="685" cy="178" r="9" fill="#e9d5ff" /></svg>;
  }

  if (normalized.includes("cloud") || normalized.includes("devops")) {
    return <svg aria-hidden="true" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="240" fill="#082b4c" /><path d="M122 163 256 83l133 91 150-92 133 75" fill="none" stroke="#67e8f9" strokeWidth="3" opacity=".68" /><path d="M256 83v112m133-21V57m150 25v113" fill="none" stroke="#93c5fd" strokeWidth="2" opacity=".55" />{[[122, 163], [256, 83], [389, 174], [539, 82], [672, 157], [256, 195], [389, 57], [539, 195]].map(([cx, cy]) => <g key={`${cx}-${cy}`}><circle cx={cx} cy={cy} r="18" fill="#0b63b6" stroke="#a5f3fc" strokeWidth="3" /><circle cx={cx} cy={cy} r="5" fill="#fff" /></g>)}</svg>;
  }

  if (normalized.includes("software") || normalized.includes("web") || normalized.includes("engineering")) {
    return <svg aria-hidden="true" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="240" fill="#082b3b" /><path d="m286 64-87 56 87 56m228-112 87 56-87 56m-65-132-67 152" fill="none" stroke="#67e8f9" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" /><circle cx="119" cy="58" r="7" fill="#fda4af" /><circle cx="670" cy="187" r="12" fill="#c4b5fd" /></svg>;
  }

  if (normalized.includes("data")) {
    return <svg aria-hidden="true" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="240" fill="#102c48" /><path d="M110 190h590M145 190V135h75v55m45 0V92h75v98m45 0V119h75v71m45 0V60h75v130m45 0v-42h75v42" fill="none" stroke="#93c5fd" strokeWidth="12" strokeLinejoin="round" /><path d="m125 112 137-35 123 30 125-61 146 19" fill="none" stroke="#fb7185" strokeWidth="5" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="240" fill="#142a45" /><path d="M40 178C178 40 278 226 408 84s243-4 352-68" fill="none" stroke="#38bdf8" strokeWidth="20" opacity=".76" /><path d="M32 222C188 78 292 247 433 127S682 71 797 29" fill="none" stroke="#fb7185" strokeWidth="8" opacity=".92" /><circle cx="646" cy="179" r="27" fill="#fda4af" opacity=".85" /><circle cx="151" cy="58" r="13" fill="#c4b5fd" /></svg>;
}

function CourseTile({ item, audience }) {
  const level = item.difficulty_level || item.difficulty || item.level || "Beginner";
  return (
    <article className="course-tile min-w-0">
      <div className="course-tile__art">
        {item.image?.startsWith("/") ? <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 100vw" className="object-cover" /> : item.image ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg, rgba(1,31,62,.18), rgba(1,31,62,.04)), url("${item.image}")` }} /> : <CourseArt category={item.category} />}

        {item.kind !== "bundle" ? (
          <span className="course-tile__type">Course</span>
        ) : null}
      </div>

      <div className="course-tile__body !min-h-0 md:!min-h-[282px]">
        <p className="course-tile__category">{item.category}</p>

        <h2>{item.title}</h2>

        <p className="course-tile__description">
          {item.description}
        </p>

        <div className="course-tile__chips">
          <span>{item.duration}</span>
          <span>{item.delivery_method || "Hybrid"}</span>
          <span>{level}</span>
          {item.certificate ? <span>Certificate</span> : null}
        </div>

        <Link
          href={itemHref(item, audience)}
          aria-label={`Know more about ${item.title}`}
          className="course-tile__footer course-tile__link"
        >
          <span className="whitespace-nowrap">Know More</span>
          <span className="course-tile__link-icon" aria-hidden="true">
            <ArrowRight className="shrink-0" size={18} />
          </span>
        </Link>
      </div>
    </article>
  );
}

function FilterContent({
  categories,
  selectedCategories,
  setSelectedCategories,
  selectedLevel,
  setSelectedLevel,
  onClose,
}) {
  const toggle = (category) =>
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((entry) => entry !== category)
        : [...current, category]
    );

  return (
    <>
      <div className="course-filter__heading">
        <h2>Filter courses</h2>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        ) : null}
      </div>

      <fieldset>
        <legend>Area</legend>

        {categories.map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => toggle(category)}
            />
            {category}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Level</legend>

        {["Beginner", "Intermediate", "Advanced"].map((level) => (
          <label key={level}>
            <input
              type="radio"
              name="course-level"
              checked={selectedLevel === level}
              onChange={() => setSelectedLevel(level)}
            />
            {level}
          </label>
        ))}

        <label>
          <input
            type="radio"
            name="course-level"
            checked={!selectedLevel}
            onChange={() => setSelectedLevel("")}
          />
          Any level
        </label>
      </fieldset>
    </>
  );
}

function FeaturedPrograms({ programs: signaturePrograms }) {
  const rise = signaturePrograms.find((program) => program.slug === "sprint-rise");
  const careerAccelerator = signaturePrograms.find((program) => program.slug === "career-accelerator");
  const stageImages = [
    "/images/courses/abstract-people.svg",
    "/images/courses/abstract-code.svg",
    "/images/courses/abstract-data.svg",
    "/images/courses/abstract-devops.svg",
    "/images/courses/abstract-web.svg",
    "/images/courses/abstract-security.svg",
  ];
  const toMilestone = (stage, index, description) => ({
    title: stage.hours && !stage.title.toLowerCase().includes(stage.hours.toLowerCase())
      ? `${stage.title} (${stage.hours})`
      : stage.title,
    description: stage.topics?.join(", ") || description,
    image: stageImages[index % stageImages.length],
  });
  const riseStages = rise?.roadmap?.length
    ? rise.roadmap.map((stage, index) => toMilestone(stage, index, rise.description))
    : [];
  const careerStages = careerAccelerator?.roadmap?.map((stage, index) => {
    const match = stage.title.match(/^(Phase\s*\d+)[\s—-]*(.*)$/i);
    return {
      title: match?.[2] || stage.title,
      phase: stage.stage?.match(/^Phase\s*\d+/i)?.[0] || match?.[1] || `Phase ${index + 1}`,
      image: stageImages[index % stageImages.length],
    };
  }) || [];
  const otherPrograms = signaturePrograms.filter(
    (program) => program !== rise && program !== careerAccelerator,
  );

  if (!signaturePrograms.length) return null;

  return (
    <section className="courses-signature-programs" aria-labelledby="signature-programs-heading">
      <div className="courses-signature-programs__heading">
        <h2 id="signature-programs-heading">Our Signature Programs</h2>
        <p>Immersive, structured learning experiences for long-term career growth.</p>
      </div>

      {rise ? <div className="courses-signature-programs__panel courses-signature-programs__panel--rise">
        <div className="courses-signature-programs__overview">
          <p className="courses-signature-programs__name">{rise.title}</p>
          <h3>{rise.tagline}</h3>
          <p className="courses-signature-programs__description">{rise.description}</p>
          <ul className="courses-signature-programs__metadata">
            <li><BarChart3 size={19} aria-hidden="true" /><span>{rise.level || "Program Level"}</span></li>
            <li><Laptop size={19} aria-hidden="true" /><span>{rise.delivery_method || "Delivery details"}</span></li>
            <li><BadgeCheck size={19} aria-hidden="true" /><span>{rise.credential || "Certification"}</span></li>
          </ul>
          <Link href={`/programs/${rise.slug}`} className="courses-signature-programs__cta">Explore Program<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        {riseStages.length ? <section className="courses-signature-programs__journey" aria-labelledby="signature-programs-journey-heading">
          <h3 id="signature-programs-journey-heading" className="courses-signature-programs__journey-heading">{rise.title} Journey</h3>
          <JourneyScroller label="Program milestones">
            {riseStages.map((stage) => <li className="courses-signature-programs__milestone" key={stage.title}>
              <div className="courses-signature-programs__milestone-image"><Image src={stage.image} alt="" fill sizes="(max-width: 767px) 74vw, (max-width: 1023px) 168px, 190px" className="object-cover" /></div>
              <div className="courses-signature-programs__milestone-content"><h4>{stage.title}</h4><p>{stage.description}</p></div>
            </li>)}
          </JourneyScroller>
        </section> : null}
      </div> : null}

      {careerAccelerator ? <div className="courses-signature-programs__panel courses-signature-programs__panel--three-year">
        <div className="courses-signature-programs__overview">
          <p className="courses-signature-programs__name">{careerAccelerator.title}</p>
          <h3>{careerAccelerator.tagline}</h3>
          <p className="courses-signature-programs__description">{careerAccelerator.description}</p>
          <Link href={`/programs/${careerAccelerator.slug}`} className="courses-signature-programs__cta">Explore Program<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        {careerStages.length ? <section className="courses-signature-programs__journey" aria-labelledby="career-accelerator-journey-heading">
          <h3 id="career-accelerator-journey-heading" className="courses-signature-programs__journey-heading">Career Accelerator Journey</h3>
          <JourneyScroller label="SPRINT Career Accelerator phases" listClassName="courses-signature-programs__milestones--three-year">
            {careerStages.map((stage) => <li className="courses-signature-programs__milestone courses-signature-programs__milestone--three-year" key={stage.phase}>
              <div className="courses-signature-programs__milestone-image"><Image src={stage.image} alt="" fill sizes="(max-width: 767px) 74vw, (max-width: 1023px) 168px, 220px" className="object-cover" /></div>
              <div className="courses-signature-programs__milestone-content courses-signature-programs__milestone-content--stage"><span className="courses-signature-programs__stage-label">{stage.phase} — {stage.title}</span></div>
            </li>)}
          </JourneyScroller>
        </section> : null}
      </div> : null}

      {otherPrograms.map((program) => <article key={program.slug} className="courses-signature-programs__panel">
        <div className="courses-signature-programs__overview">
          <p className="courses-signature-programs__name">{program.title}</p>
          <h3>{program.tagline}</h3>
          <p className="courses-signature-programs__description">{program.description}</p>
          <Link href={`/programs/${program.slug}`} className="courses-signature-programs__cta">Explore Program<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </article>)}
    </section>
  );
}

export default function CourseCatalogue({ items }) {
  const supabase = useMemo(() => createClient(), []);
  const [catalogueItems, setCatalogueItems] = useState(items);
  const [learningPaths, setLearningPaths] = useState(staticLearningPaths);
  const [signaturePrograms, setSignaturePrograms] = useState(programs.map(toCatalogueProgram));
  const [audience, setAudience] = useState("student");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filterCategories = useMemo(
    () => [...new Set(catalogueItems.filter((item) => item.kind === "course").map((item) => item.category).filter(Boolean))].sort(),
    [catalogueItems]
  );

  useEffect(() => {
    let active = true;

    async function loadCatalogue() {
      const [courseResult, learningPathResult, bundleResult] = await Promise.all([
        supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("learning_paths").select("*").eq("is_published", true).order("title"),
        supabase.from("course_bundles").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (courseResult.error) console.error("[SPRINT Catalogue] Could not load published courses:", courseResult.error.message);
      if (learningPathResult.error) console.error("[SPRINT Catalogue] Could not load published learning paths:", learningPathResult.error.message);
      if (bundleResult.error) console.error("[SPRINT Catalogue] Could not load published programs and bundles:", bundleResult.error.message);

      const resolvedCourses = courseResult.error || !courseResult.data?.length
        ? items.filter((item) => item.kind === "course")
        : courseResult.data.map(normalizeDatabaseCourse);
      const resolvedPaths = learningPathResult.error || !learningPathResult.data?.length
        ? staticLearningPaths
        : learningPathResult.data.map(normalizeLearningPath);
      const resolvedProgramsAndBundles = bundleResult.error || !bundleResult.data?.length
        ? [...items.filter((item) => item.kind === "bundle"), ...programs.map(toCatalogueProgram)]
        : bundleResult.data.map((row) => {
            const bundle = normalizeBundle(row);
            return bundle.program_type === "signature"
              ? toCatalogueProgram({ ...bundle, kind: "program" })
              : toCatalogueBundle(row);
          });

      setCatalogueItems([
        ...resolvedCourses,
        ...resolvedProgramsAndBundles.filter((item) => item.kind === "bundle"),
      ]);
      setLearningPaths(resolvedPaths);
      setSignaturePrograms(resolvedProgramsAndBundles.filter((item) => item.kind === "signature"));
    }

    void loadCatalogue();
    return () => { active = false; };
  }, [items, supabase]);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get(
      "audience"
    );

    if (
      audienceOptions.some(
        (option) => option.value === value
      )
    ) {
      setAudience(value);
    }
  }, []);

  const changeAudience = (value) => {
    setAudience(value);

    const url = new URL(window.location.href);
    url.searchParams.set("audience", value);

    window.history.replaceState({}, "", url);
  };

  const visibleItems = useMemo(
    () =>
      catalogueItems.filter((item) => {
        const haystack = `${item.title} ${item.slug} ${item.description} ${item.category} ${(item.tools || []).join(
          " "
        )}`.toLowerCase();

        return (
          matchesAudience(item, audience) &&
          (!query ||
            haystack.includes(query.toLowerCase())) &&
          (!selectedCategories.length ||
            selectedCategories.includes(item.category)) &&
          (!selectedLevel || (item.difficulty_level || item.difficulty || item.level) === selectedLevel)
        );
      }),
    [
      audience,
      catalogueItems,
      query,
      selectedCategories,
      selectedLevel,
    ]
  );

  const suggestions = useMemo(
    () =>
      catalogueItems
        .filter((item) =>
          `${item.title} ${item.slug}`.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5),
    [catalogueItems, query]
  );

  return (
    <div className="courses-page min-w-0">
      <section
        className="courses-hero relative min-h-0 overflow-hidden bg-[#061a40] pb-6 md:!min-h-[480px] md:pb-0 lg:!min-h-[540px]"
        role="region"
        aria-label="Courses featured content"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden md:block"
          aria-hidden="true"
        >
          <Image
            src="/images/courses/courses-hero.jpeg"
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none scale-125 object-cover object-center opacity-90 blur-3xl"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden bg-[#061a40]/35 md:block"
          aria-hidden="true"
        />

        <div className="relative z-20 mx-auto w-full max-w-[1400px] px-5 md:flex md:min-h-[480px] md:items-center md:px-6 lg:min-h-[540px] lg:px-12">
          <div className="courses-hero__inner relative !z-20 !m-0 !w-full !max-w-xl !px-0 !py-12 md:!w-[46%] md:!px-0 lg:!py-16">
            <h1 className="!text-3xl !leading-tight md:whitespace-nowrap lg:!text-4xl xl:!text-[2.6rem]">
              <span>Tailored pathways</span>
              <span>for every career stage</span>
            </h1>

            <p className="!max-w-md text-base">
              Explore 20+ practical courses, specialization packages,
              and guided pathways designed to turn learning into
              confident action.
            </p>

            <div className="course-search !w-full !max-w-md">
              <Search className="shrink-0" size={20} aria-hidden="true" />
              <input
                className="min-w-0"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, skills, or tools"
                aria-label="Search courses"
              />
              {query ? (
                <div className="course-search__suggestions">
                  {suggestions.length ? (
                    suggestions.map((item) => (
                      <Link
                        key={`${item.kind}-${item.slug}`}
                        href={itemHref(item, audience)}
                      >
                        {item.title}
                        <ArrowRight size={15} />
                      </Link>
                    ))
                  ) : (
                    <p>No matching courses yet.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className="relative z-10 -mt-4 aspect-[16/9] w-full md:hidden"
            aria-hidden="true"
          >
            <Image
              src="/images/courses/courses-hero.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="!object-contain !object-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%)]"
            />
          </div>
        </div>
        <div
          className="absolute inset-y-0 right-0 z-10 hidden w-[58%] pb-6 md:block"
          aria-hidden="true"
        >
          <Image
            src="/images/courses/courses-hero.jpeg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="!object-contain !object-right"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 35%), linear-gradient(to bottom, transparent 0%, black 14%), linear-gradient(to top, transparent 0%, black 10%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 35%), linear-gradient(to bottom, transparent 0%, black 14%), linear-gradient(to top, transparent 0%, black 10%)",
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          />
        </div>
      </section>

      <section
        className="course-audience"
        aria-label="Choose your audience"
      >
        <div className="course-audience__inner !flex-col !items-stretch !gap-2 md:!flex-row md:!items-center md:!gap-4">
          <div
            className="course-audience__desktop"
            role="tablist"
            aria-label="Choose your audience"
          >
            {audienceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={audience === option.value}
                className={
                  audience === option.value
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  changeAudience(option.value)
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="course-audience__mobile !w-full md:!w-auto">
            <span>Learning for</span>

            <select
              value={audience}
              onChange={(event) =>
                changeAudience(event.target.value)
              }
            >
              {audienceOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              aria-hidden="true"
            />
          </label>

          <div className="course-filter-actions !ml-0 !w-full !justify-between md:!ml-auto md:!w-auto md:!justify-start">
            <button
              type="button"
              className="course-filter-trigger"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal size={17} />
              Filter &amp; sort
            </button>

            <button
              type="button"
              className="course-clear-filters"
              onClick={() => {
                setQuery("");
                setSelectedCategories([]);
                setSelectedLevel("");
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      <FeaturedPrograms programs={signaturePrograms} />

      <main id="individual-modular-courses" className="courses-content min-w-0">
        <div className="courses-results min-w-0">
          <div className="courses-results__meta">
            <span>
              {visibleItems.length} learning options
            </span>
          </div>

          <RoleBasedLearningPaths paths={learningPaths} />

          {visibleItems.length ? (
            <>
              {visibleItems.some((item) => item.kind === "bundle") ? (
                <section
                  className="courses-results__group"
                  aria-labelledby="career-bundles-heading"
                >
                  <h2
                    className="courses-results__group-heading"
                    id="career-bundles-heading"
                  >
                    Career Bundles
                  </h2>
                  <div className="course-grid">
                    {visibleItems
                      .filter((item) => item.kind === "bundle")
                      .map((item) => (
                        <CourseTile
                          key={`${item.kind}-${item.slug}`}
                          item={item}
                          audience={audience}
                        />
                      ))}
                  </div>
                </section>
              ) : null}

              {visibleItems.some((item) => item.kind !== "bundle") ? (
                <section
                  className="courses-results__group"
                  aria-labelledby="individual-courses-heading"
                >
                  <h2
                    className="courses-results__group-heading"
                    id="individual-courses-heading"
                  >
                    Individual &amp; Modular Courses
                  </h2>
                  <div className="course-grid">
                    {visibleItems
                      .filter((item) => item.kind !== "bundle")
                      .map((item) => (
                        <CourseTile
                          key={`${item.kind}-${item.slug}`}
                          item={item}
                          audience={audience}
                        />
                      ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="courses-empty">
              <h2>No matching learning options</h2>
              <p>
                Try clearing a filter or searching with a broader
                term.
              </p>
            </div>
          )}
        </div>
      </main>

      {drawerOpen ? (
        <div
          className="course-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Course filters"
        >
          <div className="course-filter-drawer__panel">
            <FilterContent
              {...{
                categories: filterCategories,
                selectedCategories,
                setSelectedCategories,
                selectedLevel,
                setSelectedLevel,
              }}
              onClose={() => setDrawerOpen(false)}
            />

            <button
              className="course-filter-drawer__apply"
              type="button"
              onClick={() => setDrawerOpen(false)}
            >
              Show learning options
            </button>
          </div>
        </div>
      ) : null}

      <section className="courses-cta">
        <div className="min-w-0">
          {/* <p className="courses-eyebrow">
            Not sure where to start?
          </p> */}

          <h2>Not sure which learning pathway is right for you?</h2>

          <p>
            Our experts can help you identify the right track or course based on your background, and goals.
          </p>
        </div>

        <Link href="/contact">
          Connect With An Expert
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
