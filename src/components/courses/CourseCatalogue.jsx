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
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import JourneyScroller from "@/components/courses/JourneyScroller";
import { createClient } from "@/lib/supabase/client";
import {
  audienceOptions,
} from "@/data/courses";

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

function normalizeDatabaseCourse(course) {
  const rawAudience = course.audience_type || course.audience || "undergraduate";
  const audienceValue = String(rawAudience).toLowerCase().replaceAll(" ", "_");
  const audience = Array.isArray(rawAudience)
    ? rawAudience
    : audienceValue === "undergraduate" || audienceValue === "student"
      ? ["student"]
      : audienceValue === "working_professional"
        ? ["it-pro", "non-it"]
        : [audienceValue];

  return {
    ...course,
    kind: "course",
    audience,
    category: course.category || "Software Engineering",
    level: course.difficulty_level || course.difficulty || "Beginner",
    difficulty_level: course.difficulty_level || course.difficulty || "Beginner",
    delivery_method: course.delivery_method || course.mode || "Hybrid",
    duration: course.duration || "Duration to be announced",
    description: course.description || "A practical SPRINT technology pathway.",
    tools: Array.isArray(course.tools) ? course.tools : [],
    certificate: course.certificate_included ?? true,
    image: course.thumbnail_url || course.image || null,
  };
}

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
    <article className="course-tile">
      <div className="course-tile__art">
        {item.image?.startsWith("/") ? <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 100vw" className="object-cover" /> : item.image ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg, rgba(1,31,62,.18), rgba(1,31,62,.04)), url("${item.image}")` }} /> : <CourseArt category={item.category} />}

        <span className="course-tile__type">
          {item.kind === "bundle" ? "Career Package" : "Course"}
        </span>
      </div>

      <div className="course-tile__body">
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

        <div className="course-tile__footer">
          <span>Know More</span>

          <Link
            href={itemHref(item, audience)}
            aria-label={`Know more about ${item.title}`}
            className="course-tile__link"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
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

function FeaturedPrograms() {
  const milestones = [
    {
      title: "Day One",
      description: "An introduction to SPRINT RISE and the six-month program.",
      image: "/images/courses/abstract-people.svg",
    },
    {
      title: "Technical Sessions (124 hours)",
      description: "Build in-demand skills across Cloud, AI, and DevOps.",
      image: "/images/courses/abstract-code.svg",
    },
    {
      title: "Personality Development (46 hours)",
      description: "A dedicated 46-hour personality development track.",
      image: "/images/courses/abstract-people.svg",
    },
    {
      title: "Industry Ways of Working (40 hours)",
      description: "A focused 40-hour module on industry ways of working.",
      image: "/images/courses/abstract-devops.svg",
    },
    {
      title: "Internship (90 hours)",
      description: "A 90-hour internship component in the program.",
      image: "/images/courses/abstract-web.svg",
    },
    {
      title: "Industry-Ready",
      description:
        "Bring together in-demand skills and hands-on project experience.",
      image: "/images/courses/abstract-security.svg",
    },
  ];
  const careerAcceleratorPhases = [
    {
      title: "Foundations",
      phase: "Phase 1",
      image: "/images/courses/abstract-code.svg",
    },
    {
      title: "Ignite",
      phase: "Phase 2",
      image: "/images/courses/abstract-data.svg",
    },
    {
      title: "Outperform",
      phase: "Phase 3",
      image: "/images/courses/abstract-web.svg",
    },
  ];

  return (
    <section
      className="courses-signature-programs"
      aria-labelledby="signature-programs-heading"
    >
      <div className="courses-signature-programs__heading">
        <h2 id="signature-programs-heading">Our Signature Programs</h2>
        <p>
          Immersive, structured learning experiences for long-term career
          growth.
        </p>
      </div>

      <div className="courses-signature-programs__panel courses-signature-programs__panel--rise">
        <div className="courses-signature-programs__overview">
          <p className="courses-signature-programs__name">SPRINT RISE</p>
          <h3>Campus to Corporate in 6 Months</h3>
          <p className="courses-signature-programs__description">
            An intensive, industry-focused program to build in-demand skills in
            Cloud, AI, DevOps and more with hands-on projects and expert
            mentorship.
          </p>

          <ul className="courses-signature-programs__metadata">
            <li>
              <BarChart3 size={19} aria-hidden="true" />
              <span>Beginner to Intermediate</span>
            </li>
            <li>
              <Laptop size={19} aria-hidden="true" />
              <span>Online + In Campus</span>
            </li>
            <li>
              <BadgeCheck size={19} aria-hidden="true" />
              <span>Certification</span>
            </li>
          </ul>

          <Link
            href="/programs/sprint-rise"
            className="courses-signature-programs__cta"
          >
            Explore Program
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <section
          className="courses-signature-programs__journey"
          aria-labelledby="signature-programs-journey-heading"
        >
          <h3
            id="signature-programs-journey-heading"
            className="courses-signature-programs__journey-heading"
          >
            Program Journey
          </h3>
          <JourneyScroller label="Program milestones">
            {milestones.map((milestone) => (
              <li
                className="courses-signature-programs__milestone"
                key={milestone.title}
              >
                <div className="courses-signature-programs__milestone-image">
                  <Image
                    src={milestone.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 74vw, (max-width: 1023px) 168px, 190px"
                    className="object-cover"
                  />
                </div>
                <div className="courses-signature-programs__milestone-content">
                  <h4>{milestone.title}</h4>
                  <p>{milestone.description}</p>
                </div>
              </li>
            ))}
          </JourneyScroller>
        </section>
      </div>

      <div
        className="courses-signature-programs__panel courses-signature-programs__panel--three-year"
      >
        <div className="courses-signature-programs__overview">
          <p className="courses-signature-programs__name">
            SPRINT Career Accelerator
          </p>
          <h3>From campus to corporate, with confidence.</h3>
          <p className="courses-signature-programs__description">
            A career-development program for B.Tech and MCA students, progressing
            through Foundations, Ignite, and Outperform.
          </p>
          <Link
            href="/programs/career-accelerator"
            className="courses-signature-programs__cta"
          >
            Explore Program
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <section
          className="courses-signature-programs__journey"
          aria-labelledby="career-accelerator-journey-heading"
        >
          <h3
            id="career-accelerator-journey-heading"
            className="courses-signature-programs__journey-heading"
          >
            Career Accelerator Journey
          </h3>
          <JourneyScroller
            label="SPRINT Career Accelerator phases"
            listClassName="courses-signature-programs__milestones--three-year"
          >
            {careerAcceleratorPhases.map((stage) => (
              <li
                className="courses-signature-programs__milestone courses-signature-programs__milestone--three-year"
                key={stage.phase}
              >
                <div className="courses-signature-programs__milestone-image">
                  <Image
                    src={stage.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 74vw, (max-width: 1023px) 168px, 220px"
                    className="object-cover"
                  />
                </div>
                <div className="courses-signature-programs__milestone-content courses-signature-programs__milestone-content--stage">
                  <span className="courses-signature-programs__stage-label">
                    {stage.phase} — {stage.title}
                  </span>
                </div>
              </li>
            ))}
          </JourneyScroller>
        </section>
      </div>
    </section>
  );
}

export default function CourseCatalogue({ items }) {
  const supabase = useMemo(() => createClient(), []);
  const [catalogueItems, setCatalogueItems] = useState(items);
  const [audience, setAudience] = useState("student");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const filterCategories = useMemo(
    () => [...new Set(catalogueItems.filter((item) => item.kind === "course").map((item) => item.category).filter(Boolean))].sort(),
    [catalogueItems]
  );

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      const { data: dbCourses, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error || !dbCourses?.length) {
        setCatalogueItems(items);
        return;
      }

      const localPackages = items.filter((item) => item.kind === "bundle");
      setCatalogueItems([...dbCourses.map(normalizeDatabaseCourse), ...localPackages]);
    }

    void loadCourses();
    return () => { active = false; };
  }, [items, supabase]);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const updateMotionPreference = () =>
      setPrefersReducedMotion(motionPreference.matches);

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);

    return () =>
      motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (heroPaused || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setHeroSlide((currentSlide) => (currentSlide === 0 ? 1 : 0));
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [heroPaused, prefersReducedMotion]);

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
    <div className="courses-page">
      <section
        className="courses-hero"
        role="region"
        aria-label="Courses featured content"
        aria-roledescription="carousel"
      >
        <div
          className={`courses-hero__inner courses-hero__slide--content${heroSlide === 0 ? " is-active" : ""}`}
          role="group"
          aria-roledescription="slide"
          aria-label="1 of 2: Courses catalogue"
          aria-hidden={heroSlide !== 0}
        >
          {/*<p className="courses-eyebrow">
            SPRINT learning catalogue
          </p> */}

          <h1>
            Tailored pathways for every
            career stage
          </h1>

          <p>
            Explore 20+ practical courses, specialization packages,
            and guided pathways designed to turn learning into
            confident action.
          </p>

          <div className="course-search">
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses, skills, or tools"
              aria-label="Search courses"
              onFocus={() => setHeroPaused(true)}
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
          className={`courses-hero__slide--pathway${heroSlide === 1 ? " is-active" : ""}`}
          role="group"
          aria-roledescription="slide"
          aria-label="2 of 2: Learning pathways"
          aria-hidden={heroSlide !== 1}
        >
          <Image
            src="/images/courses/courses-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>

        <div className="courses-hero__controls" role="group" aria-label="Carousel controls">
          <button
            type="button"
            className={heroSlide === 0 ? "is-active" : ""}
            aria-label="Show courses catalogue slide"
            aria-pressed={heroSlide === 0}
            onClick={() => {
              setHeroSlide(0);
              setHeroPaused(true);
            }}
          />
          <button
            type="button"
            className={heroSlide === 1 ? "is-active" : ""}
            aria-label="Show learning pathways slide"
            aria-pressed={heroSlide === 1}
            onClick={() => {
              setHeroSlide(1);
              setHeroPaused(true);
            }}
          />
          {!prefersReducedMotion ? (
            <button
              type="button"
              className="courses-hero__toggle"
              aria-label={heroPaused ? "Resume slide rotation" : "Pause slide rotation"}
              onClick={() => setHeroPaused((isPaused) => !isPaused)}
            >
              {heroPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          ) : null}
        </div>
      </section>

      <section
        className="course-audience"
        aria-label="Choose your audience"
      >
        <div className="course-audience__inner">
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

          <label className="course-audience__mobile">
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

          <button
            type="button"
            className="course-filter-trigger"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal size={17} />
            Filter &amp; sort
          </button>
        </div>
      </section>

      <FeaturedPrograms />

      <main id="individual-modular-courses" className="courses-content">
        <div className="courses-results">
          <div className="courses-results__meta">
            <span>
              {visibleItems.length} learning options
            </span>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCategories([]);
                setSelectedLevel("");
              }}
            >
              Clear filters
            </button>
          </div>

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
        <div>
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
