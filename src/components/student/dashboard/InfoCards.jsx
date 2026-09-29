import { Activity, BookOpen, GraduationCap, Users } from "lucide-react";

import {
  mockEnrollment,
  mockLearningProgress,
  mockMentors,
} from "@/data/student";
import { formatDateRange } from "@/utils/dates";

/**
 * Info cards row — Current Course, Cohort, Learning Status, Mentors.
 * Same card treatment as the public site's ProfileCard/SkillCard.
 */
export default function InfoCards() {
  const cards = [
    {
      id: "current-course",
      label: "Current Course",
      value: mockEnrollment.courseTitle,
      hint: mockEnrollment.domain,
      Icon: BookOpen,
    },
    {
      id: "cohort",
      label: "Cohort",
      value: mockEnrollment.cohortName,
      hint: formatDateRange(mockEnrollment.cohortStart, mockEnrollment.cohortEnd),
      Icon: Users,
    },
    {
      id: "learning-status",
      label: "Learning Status",
      value: mockLearningProgress.status,
      hint: `${mockLearningProgress.completionPercent}% overall completion`,
      Icon: Activity,
    },
    {
      id: "mentors",
      label: "Mentors",
      value: mockMentors.map((mentor) => mentor.name).join(" · "),
      hint: mockMentors.map((mentor) => mentor.expertise).join(" · "),
      Icon: GraduationCap,
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ id, label, value, hint, Icon }) => (
        <li key={id}>
          <div className="sprint-card-interactive flex h-full flex-col rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm hover:shadow-brand-card">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-red-light text-brand-red">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
              {label}
            </p>
            <p className="mt-1.5 font-display text-base font-bold leading-snug text-brand-navy">
              {value}
            </p>
            {hint ? (
              <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">
                {hint}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
