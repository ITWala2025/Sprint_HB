"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { audienceCopy, audienceOptions, categories } from "@/data/courses";

const itemHref = (item) => `/${item.kind === "bundle" ? "bundles" : "courses"}/${item.slug}`;
const matchesAudience = (item, audienceValue) => {
  if (!item || !item.audience) return false;
  return Array.isArray(item.audience)
    ? item.audience.includes(audienceValue)
    : item.audience === audienceValue;
};

function CourseTile({ item }) {
  return (
    <article className="course-tile">
      <div className="course-tile__art">
        <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
        <span className="course-tile__type">{item.kind === "bundle" ? "Learning package" : "Course"}</span>
      </div>
      <div className="course-tile__body">
        <p className="course-tile__category">{item.category}</p>
        <h2>{item.title}</h2>
        <p className="course-tile__description">{item.description}</p>
        <div className="course-tile__chips">
          <span>{item.duration}</span><span>{item.level}</span>{item.certificate ? <span>Certificate</span> : null}
        </div>
        <div className="course-tile__footer">
          <span>{item.role}</span>
          <Link href={itemHref(item)} aria-label={`Explore ${item.title}`} className="course-tile__link"><ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}

function FilterContent({ selectedCategories, setSelectedCategories, selectedLevel, setSelectedLevel, onClose }) {
  const toggle = (category) => setSelectedCategories((current) => current.includes(category) ? current.filter((entry) => entry !== category) : [...current, category]);
  return <>
    <div className="course-filter__heading"><h2>Filter courses</h2>{onClose ? <button type="button" onClick={onClose} aria-label="Close filters"><X size={20} /></button> : null}</div>
    <fieldset><legend>Area</legend>{categories.map((category) => <label key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggle(category)} />{category}</label>)}</fieldset>
    <fieldset><legend>Level</legend>{["Beginner", "Intermediate", "Advanced"].map((level) => <label key={level}><input type="radio" name="course-level" checked={selectedLevel === level} onChange={() => setSelectedLevel(level)} />{level}</label>)}<label><input type="radio" name="course-level" checked={!selectedLevel} onChange={() => setSelectedLevel("")} />Any level</label></fieldset>
  </>;
}

export default function CourseCatalogue({ items }) {
  const [audience, setAudience] = useState("student");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("audience");
    if (audienceOptions.some((option) => option.value === value)) setAudience(value);
  }, []);

  const changeAudience = (value) => {
    setAudience(value);
    const url = new URL(window.location.href);
    url.searchParams.set("audience", value);
    window.history.replaceState({}, "", url);
  };
  const visibleItems = useMemo(() => items.filter((item) => {
    const haystack = `${item.title} ${item.description} ${item.category} ${item.tools.join(" ")}`.toLowerCase();
    return matchesAudience(item, audience) && (!query || haystack.includes(query.toLowerCase())) && (!selectedCategories.length || selectedCategories.includes(item.category)) && (!selectedLevel || item.level === selectedLevel);
  }), [audience, items, query, selectedCategories, selectedLevel]);
  const suggestions = useMemo(() => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [items, query]);
  const activeAudience = audienceCopy[audience];

  return <div className="courses-page">
    <section className="courses-hero">
      <div className="courses-hero__inner">
        <p className="courses-eyebrow">SPRINT learning catalogue</p>
        <h1>Tailored engineering and digital pathways for every career stage.</h1>
        <p>Explore 20+ practical courses, specialization packages, and guided pathways designed to turn learning into confident action.</p>
        {/*<div className="course-search">
          <Search 
            size={20} 
            aria-hidden="true" 
          />
          
          <input 
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
                      key={item.slug} 
                      href={itemHref(item)}
                    >
                      {item.title}
                      <ArrowRight size={15} />
                    </Link>
                  ))
                )  : (
                  <p>No matching courses yet.</p>
                )}
              </div> 
            )  : null}
        </div> */}
      </div> 
    </section>

    <section className="course-audience" aria-label="Choose your audience">
      <div className="course-audience__inner">
        <div className="course-audience__desktop" role="tablist" aria-label="Choose your audience">{audienceOptions.map((option) => <button key={option.value} type="button" role="tab" aria-selected={audience === option.value} className={audience === option.value ? "is-active" : ""} onClick={() => changeAudience(option.value)}>{option.label}</button>)}</div>
        <label className="course-audience__mobile"><span>Learning for</span><select value={audience} onChange={(event) => changeAudience(event.target.value)}>{audienceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={18} aria-hidden="true" /></label>
      </div>
    </section>

    <main className="courses-content">
      <aside className="course-filter"><FilterContent {...{ selectedCategories, setSelectedCategories, selectedLevel, setSelectedLevel }} /></aside>
      <div className="courses-results">
        <div className="courses-results__heading"><div> {/* <p className="courses-eyebrow">{audienceOptions.find((option) => option.value === audience).label}</p> */} <h2>{activeAudience.title}</h2> {/* <p>{activeAudience.description}</p> */}</div><button type="button" className="course-filter-trigger" onClick={() => setDrawerOpen(true)}><SlidersHorizontal size={17} /> Filter &amp; sort</button></div>
        <div className="courses-results__meta"><span>{visibleItems.length} learning options</span><button type="button" onClick={() => { setQuery(""); setSelectedCategories([]); setSelectedLevel(""); }}>Clear filters</button></div>
        {visibleItems.length ? <div className="course-grid">{visibleItems.map((item) => <CourseTile key={`${item.kind}-${item.slug}`} item={item} />)}</div> : <div className="courses-empty"><h2>No matching learning options</h2><p>Try clearing a filter or searching with a broader term.</p></div>}
      </div>
    </main>
    {drawerOpen ? <div className="course-filter-drawer" role="dialog" aria-modal="true" aria-label="Course filters"><div className="course-filter-drawer__panel"><FilterContent {...{ selectedCategories, setSelectedCategories, selectedLevel, setSelectedLevel }} onClose={() => setDrawerOpen(false)} /><button className="course-filter-drawer__apply" type="button" onClick={() => setDrawerOpen(false)}>Show learning options</button></div></div> : null}
    <section className="courses-cta"><div><p className="courses-eyebrow">Not sure where to start?</p><h2>Choose a pathway with room to grow.</h2><p>Explore a course today and sign up when the next suitable batch opens.</p></div><Link href="/register">Sign up for SPRINT <ArrowRight size={18} /></Link></section>
  </div>;
}
