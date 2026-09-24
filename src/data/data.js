/**
 * Placeholder content for the home page.
 *
 * The requirements doc marks almost every content field as TBD (stats,
 * partners, instructors, testimonials, FAQs, featured-program stages).
 * Everything below is realistic placeholder copy so the page renders and
 * reads correctly today — swap each array for real API/CMS data once it's
 * finalized. `featuredCourses` intentionally matches the Course shape from
 * (Section 11.1).
 */
// Section 6.2 — What We Give (4 statistical/value items)
export const stats = [
  { id: "stat-1", value: "500+", label: "Learners upskilled" },
  { id: "stat-2", value: "36+", label: "Industry mentors & SMEs" },
  { id: "stat-3", value: "92%", label: "Job-ready placement rate" },
  { id: "stat-4", value: "40+", label: "Internship partners" },
];

// Section 6.3 — Partner Associations
export const partners = [
  { id: "p1", name: "Accenture", logoUrl: "/images/home/accenture.webp" },
  { id: "p2", name: "Amazon", logoUrl: "/images/home/amazon.webp" },
  { id: "p3", name: "Google", logoUrl: "/images/home/google.webp" },
  { id: "p4", name: "Microsoft", logoUrl: "/images/home/microsoft.webp" },
  { id: "p5", name: "IBM", logoUrl: "/images/home/ibm.webp" },
  { id: "p6", name: "TCS", logoUrl: "/images/home/tcs.webp" },
  { id: "p7", name: "Infosys", logoUrl: "/images/home/infosys.webp" },
  { id: "p8", name: "Capgemini", logoUrl: "/images/home/capgemini.webp" },
];

// Section 6.4 — Featured Course / Program (one program, 3–4 stages)
export const featuredProgramStages = [
  {
    id: "stage-1",
    stageLabel: "Stage 1",
    title: "Foundations",
    description:
      "Core programming, data structures, and problem-solving fundamentals taught live by working engineers.",
  },
  {
    id: "stage-2",
    stageLabel: "Stage 2",
    title: "Specialization",
    description:
      "Choose a track — full-stack, data, or cloud — and go deep with project-based modules.",
  },
  {
    id: "stage-3",
    stageLabel: "Stage 3",
    title: "Industry Capstone",
    description:
      "Build a production-grade project reviewed by mentors from partner companies.",
  },
  {
    id: "stage-4",
    stageLabel: "Stage 4",
    title: "Placement Sprint",
    description:
      "Resume reviews, mock interviews, and direct referrals into partner hiring pipelines.",
  },
];

// Sections 6.4 / 6.5 — Featured Course + More Courses share the Course shape
export const featuredCourse = {
  courseId: "crs-001",
  title: "SPRINT RISE Program (Fast-Track Employability)",
  shortDescription:
    "Designed for pre-final and final year BCA/MCA/B.Tech students needing production-grade portfolio projects, Git workflows, and mock technical defense.",
  thumbnailUrl: "/images/courses/abstract-code.svg",
  instructorName: "Ananya Rao",
  category: "Software Engineering",
  difficultyLevel: "Beginner",
  duration: "6 months",
  rating: 4.8,
  reviewCount: 1240,
  currentPrice: 24999,
  originalPrice: 49999,
  discountPercentage: 50,
  courseUrl: "/courses/full-stack-engineering",
};

// Section 6.7 — Student Testimonials (4–6, text-based for now; videoUrl is
// optional so a testimonial can be upgraded to video without a type change)
export const testimonials = [
  {
    id: "t1",
    name: "Ishaan Verma",
    role: "BTech Graduate → SDE-1 at Orion Cloud",
    quote:
      "The mentors made hard concepts click. I had two offers before the program even ended.",
    photoUrl: "/testimonials/ishaan-verma.jpg",
  },
  {
    id: "t2",
    name: "Sneha Kulkarni",
    role: "MCA Graduate → Data Analyst at Falcon Data Labs",
    quote:
      "Live sessions with working engineers felt nothing like a recorded course. Genuinely different.",
    photoUrl: "/testimonials/sneha-kulkarni.jpg",
  },
  {
    id: "t3",
    name: "Arjun Nair",
    role: "Career Switcher → Cloud Engineer at Vertex Systems",
    quote:
      "I switched from a non-tech background in eight months. The capstone project is what got me hired.",
    photoUrl: "/testimonials/arjun-nair.jpg",
  },
  {
    id: "t4",
    name: "Meera Pillai",
    role: "Working Professional → Product Manager at Meridian Bank",
    quote:
      "I could learn around my job and still get direct feedback from industry mentors every week.",
    photoUrl: "/testimonials/meera-pillai.jpg",
  },
  {
    id: "t5",
    name: "Vikram Das",
    role: "BTech Graduate → SDE-2 at Harbor Robotics",
    quote:
      "The placement sprint alone was worth it — mock interviews with real hiring managers.",
    photoUrl: "/testimonials/vikram-das.jpg",
  },
];

// Section 6.8 — FAQs
export const faqs = [
  {
    id: "faq-1",
    question: "Who are SPRINT's programs designed for?",
    answer:
      "SPRINT is built for BTech and MCA students, recent graduates, working professionals, and career switchers who want structured, mentor-led training with a clear path to employment.",
  },
  {
    id: "faq-2",
    question: "Do I need prior experience to enroll?",
    answer:
      "No. Most programs start from fundamentals and assume no prior experience, though some intermediate tracks recommend basic programming familiarity — this is noted on each course page.",
  },
  {
    id: "faq-3",
    question: "Who teaches the courses?",
    answer:
      "All instructors are working professionals from partner companies, chosen for both technical depth and teaching ability.",
  },
  {
    id: "faq-4",
    question: "Is placement support included?",
    answer:
      "Flagship programs include resume reviews, mock interviews, and referrals into our partner hiring pipelines as part of the program.",
  },
  {
    id: "faq-5",
    question: "Can I learn while working full-time?",
    answer:
      "Yes. Live sessions are scheduled on evenings and weekends, and every session is recorded for later viewing.",
  },
];
