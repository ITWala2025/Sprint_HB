import EnrollmentComingSoon from "../EnrollmentComingSoon";

/** Step 3 — Specialization (scaffolded). Same contract as EducationStep.jsx. */
const UPCOMING_FIELDS = [
  "Preferred program (for example Full Stack or Data & AI)",
  "Specialization track inside that program",
  "Preferred cohort start date",
];

export default function SpecializationStep() {
  return (
    <EnrollmentComingSoon
      note="This is where the program catalogue in src/data/courses.js is offered as a choice."
      fields={UPCOMING_FIELDS}
    />
  );
}
