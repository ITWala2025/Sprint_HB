const riseStages = [
  { id: "day-one", title: "Day One" },
  { id: "technical-sessions", title: "Technical Sessions (124 hours)" },
  {
    id: "personality-development",
    title: "Personality Development (46 hours)",
  },
  {
    id: "industry-ways-of-working",
    title: "Industry Ways of Working (40 hours)",
  },
  { id: "internship", title: "Internship (90 hours)" },
  { id: "industry-ready", title: "Industry-Ready" },
];

const threeYearStages = [
  { id: "year-1", title: "Year 1 — Foundations" },
  { id: "year-2", title: "Year 2 — Ignite" },
  { id: "year-3", title: "Year 3 — Outperform" },
];

export const programs = [
  {
    slug: "sprint-rise",
    kind: "program",
    title: "SPRINT RISE",
    headline: "Campus to Corporate in 6 Months",
    description:
      "An intensive, industry-focused program to build in-demand skills in Cloud, AI, DevOps and more with hands-on projects and expert mentorship.",
    duration: "6 months",
    level: "Beginner to Intermediate",
    delivery: "Online + In Campus",
    certification: "Certification",
    image: "/images/courses/abstract-code.svg",
    curriculum: riseStages.map((stage) => ({
      ...stage,
      label: "Program Stage",
      children: [
        {
          id: `${stage.id}-learning-board`,
          label: "Learning Board",
          title: "",
          children: [],
        },
      ],
    })),
  },
  {
    slug: "sprint-3-year-program",
    kind: "program",
    title: "SPRINT 3-Year Program",
    headline: "A three-year learning journey",
    description:
      "Progress through Foundations in Year 1, Ignite in Year 2, and Outperform in Year 3.",
    image: "/images/courses/abstract-code.svg",
    curriculum: threeYearStages.map((stage) => ({
      ...stage,
      label: "Year",
      children: [],
    })),
  },
];

export function getProgram(slug) {
  return programs.find((program) => program.slug === slug);
}
