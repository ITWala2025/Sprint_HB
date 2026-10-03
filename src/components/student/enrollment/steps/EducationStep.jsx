import { useEffect, useMemo, useState } from "react";
import { BookOpen, Briefcase, CalendarDays, GraduationCap } from "lucide-react";

import AuthField from "@/components/student/auth/AuthField";
import { catalogueItems } from "@/data/courses";
import { createClient } from "@/lib/supabase/client";

import {
  COURSE_FIELD_MESSAGES,
  COURSE_STATUS,
  resolveCourseOptions,
} from "../enrollment-course-options";

/**
 * Step 2 — Education & Career Profile (optional).
 *
 * Four profile fields, nothing required: `courseDegree` and `semesterYear` are
 * free text, `currentRole` is a fixed dropdown, and `course` is a dropdown fed
 * from the same source of truth the SPRINT Course page uses — the Supabase
 * `courses` table first, the local catalogue in `src/data/courses.js` as the
 * fallback (see `enrollment-course-options.js`). No course names are written
 * here, so a course published through Course Management appears automatically.
 * The stored `course` value is the course id the backend expects.
 *
 * Every field accepts an empty string, so an untouched step always passes
 * Continue and "Skip for now" needs no special case. Whatever *is* chosen stays
 * in the shared `education` slice when the student moves on — skipping never
 * discards partial answers, and re-visiting the step preloads them.
 *
 * Field ids follow the wizard's `${idPrefix}-${fieldName}` convention.
 */

/**
 * The career-role choices, exported so the tests reuse the one list.
 * `employment_status` in the schema is free text, so the labels are stored
 * as-is — readable in the success summary and safe for the database.
 */
export const CURRENT_ROLE_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "IT Professional", label: "IT Professional" },
  { value: "Non-IT Professional", label: "Non-IT Professional" },
  { value: "Working Professional", label: "Working Professional" },
];

export default function EducationStep({ idPrefix, values = {}, errors = {}, onChange }) {
  // Same client the Course page uses — one Supabase project, one `courses` table.
  const supabase = useMemo(() => createClient(), []);
  // `loading` only exists before the first fetch settles; afterwards the state
  // carries `ready` (with options) or `empty`/`error` (without).
  const [courseField, setCourseField] = useState({
    status: COURSE_STATUS.LOADING,
    options: [],
  });

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      let dbRows = null;
      let dbError = null;
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, title, slug")
          .eq("is_published", true)
          .order("title");
        dbRows = data;
        dbError = error;
      } catch (caught) {
        // A temporary API failure must never break the step.
        dbError = caught;
      }

      if (!active) return;
      setCourseField(resolveCourseOptions({ dbRows, dbError, localItems: catalogueItems }));
    }

    void loadCourses();
    return () => {
      active = false;
    };
  }, [supabase]);

  const courseStatusMessage = COURSE_FIELD_MESSAGES[courseField.status];
  // Keep the control a <select> in every state (an empty options array would
  // make AuthField fall back to a text input) — while the list is unavailable
  // the single placeholder option carries the status and the field is disabled.
  const courseSelectOptions = courseField.options.length
    ? courseField.options
    : [{ value: "__course_status__", label: courseStatusMessage ?? "Select a course" }];

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
          id={`${idPrefix}-courseDegree`}
          name="courseDegree"
          label="Course / Degree"
          value={values.courseDegree ?? ""}
          onChange={onChange("courseDegree")}
          error={errors.courseDegree}
          placeholder="e.g. B.Tech Computer Science, BCA, MCA, B.Sc Mathematics"
          autoComplete="organization-title"
          icon={<BookOpen aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-semesterYear`}
          name="semesterYear"
          label="Semester / Year"
          value={values.semesterYear ?? ""}
          onChange={onChange("semesterYear")}
          error={errors.semesterYear}
          placeholder="e.g. 3rd Semester, Final Year, 2026 Passout"
          icon={<CalendarDays aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-currentRole`}
          name="currentRole"
          label="Current Role"
          value={values.currentRole ?? ""}
          onChange={onChange("currentRole")}
          error={errors.currentRole}
          placeholder="Select your current role"
          options={CURRENT_ROLE_OPTIONS}
          icon={<Briefcase aria-hidden="true" className="size-4.5" />}
        />

        <AuthField
          id={`${idPrefix}-course`}
          name="course"
          label="Course"
          value={values.course ?? ""}
          onChange={onChange("course")}
          error={errors.course}
          placeholder="Select a course"
          options={courseSelectOptions}
          disabled={!courseField.options.length}
          icon={<GraduationCap aria-hidden="true" className="size-4.5" />}
          hint={courseStatusMessage}
        />
      </div>

    </div>
  );
}

