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
  { id: "stat-1", value: "200+", label: "Learners upskilled" },
  { id: "stat-2", value: "30+", label: "Industry mentors & SMEs" },
  { id: "stat-3", value: "82%", label: "Job-ready placement rate" },
  { id: "stat-4", value: "40+", label: "Industry partners" },
];

// Section 6.3 — Partner Associations
// Every entry maps 1:1 to a file in public/images/home/. Display order
// deliberately alternates institutional/industry partners with the larger
// technology partners so no group reads as a separate block in the marquee.
// The first eight keep their original ids; newly added logos use p9–p22.
export const partners = [
  { id: "p1", name: "Accenture", logoUrl: "/images/home/accenture.svg" },
  { id: "p9", name: "Algocirrus", logoUrl: "/images/home/algocirrus.webp" },
  { id: "p2", name: "Amazon", logoUrl: "/images/home/amazon.png" },
  { id: "p6", name: "TCS", logoUrl: "/images/home/tcs.svg" },
  { id: "p8", name: "Capgemini", logoUrl: "/images/home/capgeminiBlue.svg" },


  { id: "p4", name: "Microsoft", logoUrl: "/images/home/microsoft.png" },
  { id: "p12", name: "IT-Wala", logoUrl: "/images/home/it-wala.webp" },
  { id: "p5", name: "IBM", logoUrl: "/images/home/ibm.svg" },
  { id: "p3", name: "Google", logoUrl: "/images/home/google.svg" },
  { id: "p17", name: "Dell Technologies", logoUrl: "/images/home/Dell.svg" },
  


  {
    id: "p10",
    name: "Eyogi Gurukul",
    logoUrl: "/images/home/eyogi-gurukul.webp",
  },
  { id: "p14", name: "Swavlamban", logoUrl: "/images/home/swavlamban.png" },


  { id: "p13", name: "Kdadks", logoUrl: "/images/home/kdadks.webp" },
  { id: "p7", name: "Infosys", logoUrl: "/images/home/infosys.webp" },
  
  {
    id: "p11",
    name: "Global Medtech Solutions",
    logoUrl: "/images/home/global-medtech-solutions.webp",
  },
  {
    id: "p15",
    name: "Vishal Creations",
    logoUrl: "/images/home/vishal-creations.webp",
  },
  {
    id: "p16",
    name: "Zupharm Laboratories",
    logoUrl: "/images/home/zupharm-laboratories.webp",
  },
  { id: "p18", name: "Lululemon", logoUrl: "/images/home/lululemon.webp" },
  { id: "p19", name: "HCLTech", logoUrl: "/images/home/hcl.webp" },
  { id: "p20", name: "IQVIA", logoUrl: "/images/home/iqvia.webp" },
  { id: "p21", name: "Sitetracker", logoUrl: "/images/home/sitetracker.webp" },
  {
    id: "p22",
    name: "Tessellation Software",
    logoUrl: "/images/home/tessellation.webp",
  },
];

// Section 6.4 — Featured Course / Program
export const featuredProgramStages = [
  {
    id: "stage-1",
    stageLabel: "STAGE 1",
    title: "Foundation & Onboarding",
    description:
      "Orientation, personality baseline, core tech modules, Personality Development begins.",
    image: "/images/home/home-featuredprogram-1.png",
    imageAlt: "Programming and software development learning",
  },
  {
    id: "stage-2",
    stageLabel: "STAGE 2",
    title: "Core Technical Competency",
    description: "Cloud & DevOps fundamentals, first workshop, SME connects.",
  },
  {
    id: "stage-3",
    stageLabel: "STAGE 3",
    title: "Applied Learning",
    description: "Deeper modules, guest faculty visit, first mock interview.",
  },
  {
    id: "stage-4",
    stageLabel: "STAGE 4",
    title: "Real Projects Begin",
    description: "Live team builds start, alongside GenAI & Agentic AI.",
  },
  {
    id: "stage-5",
    stageLabel: "STAGE 5",
    title: "Industry Immersion",
    description: "Project reviews, second mock interview, resume overhaul.",
  },
  {
    id: "stage-6",
    stageLabel: "STAGE 6",
    title: "Job-Ready",
    description: "Final assessment, placement preparations and internship.",
  },
];

// Sections 6.4 / 6.5 — Featured Course + More Courses share the Course shape
export const featuredCourse = {
  courseId: "crs-001",
  title: "SPRINT RISE Program",
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
  },
  {
    id: "t2",
    name: "Sneha Kulkarni",
    role: "MCA Graduate → Data Analyst at Falcon Data Labs",
    quote:
      "Live sessions with working engineers felt nothing like a recorded course. Genuinely different.",
  },
  {
    id: "t3",
    name: "Arjun Nair",
    role: "Career Switcher → Cloud Engineer at Vertex Systems",
    quote:
      "I switched from a non-tech background in eight months. The capstone project is what got me hired.",
  },
  {
    id: "t4",
    name: "Meera Pillai",
    role: "Working Professional → Product Manager at Meridian Bank",
    quote:
      "I could learn around my job and still get direct feedback from industry mentors every week.",
  },
  {
    id: "t5",
    name: "Vikram Das",
    role: "BTech Graduate → SDE-2 at Harbor Robotics",
    quote:
      "The placement sprint alone was worth it — mock interviews with real hiring managers.",
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
