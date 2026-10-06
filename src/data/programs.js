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

const careerAcceleratorPhases = [
  { id: "phase-1-foundations", title: "Phase 1 — Foundations" },
  { id: "phase-2-ignite", title: "Phase 2 — Ignite" },
  { id: "phase-3-outperform", title: "Phase 3 — Outperform" },
];

export const programs = [
  {
    slug: "sprint-rise",
    kind: "program",
    title: "SPRINT RISE",
    headline: "Campus to Corporate in 6 Months",
    curriculumAnchor: "rise-curriculum",
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
    slug: "career-accelerator",
    kind: "program",
    title: "SPRINT Career Accelerator",
    headline: "From campus to corporate, with confidence.",
    description:
      "A career-development program for B.Tech and MCA students, progressing through the phases of Foundations, Ignite, and Outperform.",
    audience: "B.Tech and MCA students",
    curriculumAnchor: "career-accelerator-curriculum",
    image: "/images/courses/abstract-code.svg",
    curriculum: careerAcceleratorPhases.map((phase) => ({
      ...phase,
      label: "Program Phase",
      children: [
        {
          id: `${phase.id}-learning-board`,
          label: "Learning Board",
          title: "",
          children: [],
        },
      ],
    })),
  },
];

export function getProgram(slug) {
  return programs.find((program) => program.slug === slug);
}
