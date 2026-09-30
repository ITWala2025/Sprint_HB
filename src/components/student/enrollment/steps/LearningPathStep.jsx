import EnrollmentComingSoon from "../EnrollmentComingSoon";

/** Step 4 — Learning Path (scaffolded). Same contract as EducationStep.jsx. */
const UPCOMING_FIELDS = [
  "Online, offline or hybrid classroom",
  "Weekday or weekend batch",
  "Weekly hours you can commit",
];

export default function LearningPathStep() {
  return (
    <EnrollmentComingSoon
      note="The learning path decides your batch timings, mentor group and class format."
      fields={UPCOMING_FIELDS}
    />
  );
}
