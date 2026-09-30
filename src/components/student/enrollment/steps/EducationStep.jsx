import {
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Map,
  MapPin,
} from "lucide-react";

import AuthField from "@/components/student/auth/AuthField";

/**
 * Step 2 — Education & Career Profile (optional).
 *
 * Nothing here is required: the eight profile fields accept empty strings and
 * only `graduationYear` has a rule (a filled one must look like a real year),
 * so an untouched step always passes Continue and "Skip for now" needs no
 * special case. Whatever *is* typed stays in the shared `education` slice when
 * the student moves on — skipping never discards partial answers.
 *
 * The specialization picker also lives on this screen (the product wants the
 * career-interest answer alongside the background) but it writes into the
 * `specialization` slice through `onChangeIn("specialization")("track")`, which
 * is what lets Step 3 read the choice when its own form lands.
 *
 * Field ids follow the wizard's `${idPrefix}-${fieldName}` convention so a
 * failed Continue can focus `education-graduationYear` directly.
 */
const EDUCATION_LEVELS = [
  { value: "class-10", label: "High school (Class 10)" },
  { value: "class-12", label: "Senior secondary (Class 12)" },
  { value: "diploma", label: "Diploma / Polytechnic" },
  { value: "bachelors", label: "Bachelor's degree" },
  { value: "masters", label: "Master's degree" },
  { value: "doctorate", label: "Doctorate / PhD" },
  { value: "certification", label: "Professional certification" },
  { value: "other", label: "Other" },
];

/**
 * The tracks offered on this step, exported so Step 3 and the tests reuse the
 * one list instead of re-typing it. "I'm not sure yet" is a first-class answer:
 * an undecided student must never be blocked.
 */
export const SPECIALIZATION_OPTIONS = [
  { value: "ai-engineer", label: "AI Engineer" },
  { value: "cloud-engineer", label: "Cloud Engineer" },
  { value: "devops-engineer", label: "DevOps Engineer" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "data-engineer", label: "Data Engineer" },
  { value: "security-specialist", label: "Security Specialist" },
  { value: "sre", label: "Site Reliability Engineer (SRE)" },
  { value: "solution-architect", label: "Solution Architect" },
  { value: "it-consultant", label: "IT Consultant" },
  { value: "product-engineer", label: "Product Engineer" },
  { value: "not-sure-yet", label: "I'm not sure yet" },
];

export default function EducationStep({
  idPrefix,
  values = {},
  errors = {},
  onChange,
  onChangeIn,
  specialization = {},
}) {
  const track = specialization.track ?? "";
  // Cross-slice writer handed over by the wizard; the guard keeps the step
  // renderable in isolation (storybook-style or a lone unit test).
  const handleTrackChange = onChangeIn ? onChangeIn("specialization")("track") : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-border bg-brand-off-white px-4 py-3">
        <p className="text-xs leading-relaxed text-brand-text-secondary">
          <span className="font-bold uppercase tracking-[0.1em] text-brand-text-muted">
            Optional step
          </span>{" "}
          — answer what you know today. Anything you leave blank can be added later from your
          Student Dashboard, and your answers are kept while you move around the wizard.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          id={`${idPrefix}-level`}
          name="level"
          label="Current education level"
          value={values.level ?? ""}
          onChange={onChange("level")}
          placeholder="Select your current level"
          options={EDUCATION_LEVELS}
          icon={<GraduationCap aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-institution`}
          name="institution"
          label="College / University"
          value={values.institution ?? ""}
          onChange={onChange("institution")}
          placeholder="e.g. RV College of Engineering"
          autoComplete="organization"
          icon={<Building2 aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-degree`}
          name="degree"
          label="Degree / Course"
          value={values.degree ?? ""}
          onChange={onChange("degree")}
          placeholder="e.g. B.Tech Computer Science"
          icon={<BookOpen aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-year`}
          name="year"
          label="Year / Semester"
          value={values.year ?? ""}
          onChange={onChange("year")}
          placeholder="e.g. 3rd year / 5th semester"
          icon={<CalendarDays aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-graduationYear`}
          name="graduationYear"
          label="Graduation year"
          value={values.graduationYear ?? ""}
          onChange={onChange("graduationYear")}
          error={errors.graduationYear}
          placeholder="2027"
          inputMode="numeric"
          maxLength={4}
          icon={<CalendarCheck aria-hidden="true" className="size-4.5" />}
          hint="Four digits — the year you graduated or expect to (for example 2026)."
        />

        <AuthField
          id={`${idPrefix}-city`}
          name="city"
          label="City"
          value={values.city ?? ""}
          onChange={onChange("city")}
          placeholder="e.g. Bengaluru"
          autoComplete="address-level2"
          icon={<MapPin aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-state`}
          name="state"
          label="State"
          value={values.state ?? ""}
          onChange={onChange("state")}
          placeholder="e.g. Karnataka"
          autoComplete="address-level1"
          icon={<Map aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-currentRole`}
          name="currentRole"
          label="Current role"
          value={values.currentRole ?? ""}
          onChange={onChange("currentRole")}
          placeholder="e.g. Student, Intern, Software Engineer"
          icon={<Briefcase aria-hidden="true" className="size-4.5" />}
          hint={'Put "Student" if you are studying full time.'}
        />
      </div>

      <fieldset className="rounded-xl border border-brand-border bg-brand-off-white p-4 sm:p-5">
        <legend className="px-1 text-sm font-semibold text-brand-navy">
          Choose your specialization
        </legend>
        <p className="text-xs leading-relaxed text-brand-text-secondary">
          Pick the track that interests you most — you can change it any time before your cohort
          starts. Not decided yet? Choose &ldquo;I&apos;m not sure yet&rdquo; and a mentor will help you
          pick.
        </p>

        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          {SPECIALIZATION_OPTIONS.map((option) => {
            const optionId = `${idPrefix}-track-${option.value}`;
            const isSelected = track === option.value;

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-brand-white px-3.5 py-3 transition-colors ${
                  isSelected
                    ? "border-brand-red ring-2 ring-brand-red/15"
                    : "border-brand-border hover:border-brand-navy/40"
                }`}
              >
                <input
                  type="radio"
                  id={optionId}
                  name={`${idPrefix}-track`}
                  value={option.value}
                  checked={isSelected}
                  onChange={handleTrackChange}
                  className="sprint-focus mt-0.5 size-4 shrink-0 accent-brand-red"
                />
                <span
                  className={`text-sm leading-snug ${
                    isSelected ? "font-semibold text-brand-navy" : "font-medium text-brand-text"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

