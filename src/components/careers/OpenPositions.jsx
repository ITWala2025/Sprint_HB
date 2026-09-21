"use client";

import { useState } from "react";
import { careerRoles } from "@/data/careers";

const typeOptions = [
  { value: "all", label: "All Roles" },
  { value: "internship", label: "Internships" },
  { value: "full-time", label: "Full-time" },
];

const EMAIL = "info@sprint.naturalelements.co.in";

/**
 * Open Positions — Light section with filter tabs and role cards.
 * Apply buttons trigger mailto with pre-filled subject.
 */
export default function OpenPositions() {
  const [selectedType, setSelectedType] = useState("all");

  const filteredRoles = careerRoles.filter((role) => {
    if (selectedType === "all") return true;
    return role.type === selectedType;
  });

  const createMailtoLink = (roleTitle) => {
    const subject = `Application for ${roleTitle}`;
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <section id="open-positions" className="bg-brand-white py-24" aria-labelledby="open-positions-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full bg-brand-red-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Open Positions
          </p>
          <h2 id="open-positions-heading" className="mt-4 font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            Roles We're Hiring For
          </h2>
          <p className="mt-4 text-lg text-brand-text-secondary">
            Filter by type to find the right fit. All roles include mentorship, real projects,
            and a clear path to growth.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Filter by role type">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selectedType === option.value}
              aria-controls="positions-panel"
              id={`tab-${option.value}`}
              onClick={() => setSelectedType(option.value)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                selectedType === option.value
                  ? "bg-brand-red text-white shadow-brand-cta"
                  : "text-brand-navy hover:bg-brand-surface"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Roles Grid */}
        <div id="positions-panel" role="tabpanel" aria-labelledby={`tab-${selectedType}`} className="mt-10">
          {filteredRoles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRoles.map((role) => (
                <article
                  key={role.id}
                  className="relative flex flex-col rounded-2xl border border-brand-border bg-brand-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-brand-red"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-brand-navy">
                        {role.title}
                      </h3>
                      <p className="mt-1 text-sm text-brand-text-secondary">
                        {role.location}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                        role.type === "internship"
                          ? "bg-sky-500/15 text-sky-700"
                          : "bg-violet-500/15 text-violet-700"
                      }`}
                    >
                      {role.type === "internship" ? "Internship" : "Full-time"}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-brand-text-secondary leading-relaxed line-clamp-3">
                    {role.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-brand-text-muted">
                    <span className="flex items-center gap-1">
                      <span className="size-1 rounded-full bg-brand-border" aria-hidden="true" />
                      {role.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-1 rounded-full bg-brand-border" aria-hidden="true" />
                      {role.stipend}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-brand-text-muted">
                      Posted {new Date(role.postedDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <a
                      href={createMailtoLink(role.title)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
                    >
                      Apply
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-brand-text-secondary">No roles match the selected filter.</p>
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className="mt-4 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
              >
                Show all roles
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}