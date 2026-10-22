
"use client";

import { useState } from "react";
import Link from "next/link";
import { careerRoles } from "@/data/careers";
import RoleDetailModal, {
  formatPostedDate,
  roleTypeBadgeClass,
  roleTypeLabel,
} from "@/components/careers/RoleDetailModal";

const typeOptions = [
  { value: "all", label: "All Roles" },
  { value: "internship", label: "Internships" },
  { value: "full-time", label: "Full-time" },
];

const EMAIL = "info@sprint.naturalelements.co.in";

export default function OpenPositions() {
  const [selectedType, setSelectedType] = useState("all");
  const [activeRole, setActiveRole] = useState(null);

  const filteredRoles = careerRoles.filter((role) => {
    if (selectedType === "all") return true;
    return role.type === selectedType;
  });

  const createMailtoLink = (roleTitle = "") => {
    const subject = roleTitle
      ? `Application for ${roleTitle}`
      : "Career Application - SPRINT";

    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <section
      id="open-positions"
      className="bg-white pt-2 pb-14 sm:pt-4 sm:pb-16 lg:pt-6 lg:pb-16"
      aria-labelledby="open-positions-heading"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-6">
        {/* Section heading */}
        <div className="mb-5 text-center">
          <span className="inline-flex rounded-full bg-rose-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef3e43]">
            Open Positions
          </span>

          <h2
            id="open-positions-heading"
            className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#10264b] sm:text-3xl"
          >
            Roles We’re Hiring For
          </h2>
        </div>

        {/* Filter tabs */}
        <div
          className="mb-5 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filter by role type"
        >
          {typeOptions.map((option) => (
            <button
              key={option.value}
              id={`tab-${option.value}`}
              type="button"
              role="tab"
              aria-selected={selectedType === option.value}
              aria-controls="positions-panel"
              onClick={() => setSelectedType(option.value)}
              className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef3e43] ${
                selectedType === option.value
                  ? "bg-[#ef233c] text-white shadow-sm"
                  : "text-[#10264b] hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Job cards and resume CTA */}
        <div
          id="positions-panel"
          role="tabpanel"
          aria-labelledby={`tab-${selectedType}`}
        >
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <article
                  key={role.id}
                  className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-bold leading-5 text-[#10264b] sm:text-base">
                        <button
                          type="button"
                          onClick={() => setActiveRole(role)}
                          aria-haspopup="dialog"
                          className="text-left focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ef3e43]"
                        >
                          {role.title}
                        </button>
                      </h3>

                      <p className="mt-1.5 text-xs leading-5 text-slate-500">
                        {role.location}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${roleTypeBadgeClass(
                        role.type
                      )}`}
                    >
                      {roleTypeLabel(role.type)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">
                    {role.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-5 text-slate-500">
                    <span>{role.duration}</span>
                    <span>{role.stipend}</span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <span className="text-[10px] leading-4 text-slate-400">
                      Posted {formatPostedDate(role.postedDate)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveRole(role)}
                      aria-haspopup="dialog"
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#ef233c] transition hover:text-[#c91c32] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ef233c]"
                    >
                      Apply
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 p-6 text-center sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-slate-600">
                  No roles match the selected filter.
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className="mt-3 text-sm font-semibold text-[#ef233c] hover:underline"
                >
                  Show all roles
                </button>
              </div>
            )}

            {/* Resume CTA card */}
            <article className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-slate-100 bg-[#f2f5fb] p-6 text-center sm:min-h-0">
              <div
                aria-hidden="true"
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#10264b] shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M3 12h18M10 12v2h4v-2" />
                </svg>
              </div>

              <h3 className="font-display text-sm font-bold text-[#10264b]">
                Don’t see a role that fits?
              </h3>

              <p className="mt-2 max-w-[260px] text-xs leading-5 text-slate-600">
                We’re always looking for talented people. Share your resume
                with us and we’ll keep it on file for future opportunities.
              </p>

              <Link
                href={createMailtoLink()}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ef233c] bg-white px-5 py-2 text-xs font-bold text-[#ef233c] transition hover:bg-[#ef233c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef233c]"
              >
                Send Your Resume
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>
      </div>

      {/* Existing role details dialog */}
      {activeRole ? (
        <RoleDetailModal
          role={activeRole}
          applyHref={createMailtoLink(activeRole.title)}
          onClose={() => setActiveRole(null)}
        />
      ) : null}
    </section>
  );
}
