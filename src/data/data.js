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
  { id: "p2", name: "Amazon", logoUrl: "/images/home/amazon.png" },
  { id: "p3", name: "Google", logoUrl: "/images/home/google.svg" },
  { id: "p4", name: "Microsoft", logoUrl: "/images/home/microsoft.png" },
  { id: "p5", name: "IBM", logoUrl: "/images/home/ibm.svg" },
  { id: "p6", name: "TCS", logoUrl: "/images/home/tcs.svg" },
  { id: "p7", name: "Infosys", logoUrl: "/images/home/infosys.webp" },
  { id: "p8", name: "Capgemini", logoUrl: "/images/home/capgeminiBlue.svg" },
  { id: "p9", name: "Algocirrus", logoUrl: "/images/home/algocirrus.webp" },
  { id: "p10", name: "Eyogi Gurukul", logoUrl: "/images/home/eyogi-gurukul.webp" },
  { id: "p11", name: "Global Medtech Solutions", logoUrl: "/images/home/global-medtech-solutions.webp" },
  { id: "p12", name: "IT-Wala", logoUrl: "/images/home/it-wala.webp" },
  { id: "p13", name: "Kdadks", logoUrl: "/images/home/kdadks.webp" },
  { id: "p14", name: "Swavlamban", logoUrl: "/images/home/swavlamban.png" },
  { id: "p15", name: "Vishal Creations", logoUrl: "/images/home/vishal-creations.webp" },
  { id: "p16", name: "Zupharm Laboratories", logoUrl: "/images/home/zupharm-laboratories.webp" },
  { id: "p17", name: "Dell Technologies", logoUrl: "/images/home/Dell.svg" },
  { id: "p18", name: "Lululemon", logoUrl: "/images/home/lululemon.webp" },
  { id: "p19", name: "HCLTech", logoUrl: "/images/home/hcl.webp" },
  { id: "p20", name: "IQVIA", logoUrl: "/images/home/iqvia.webp" },
  { id: "p21", name: "Sitetracker", logoUrl: "/images/home/sitetracker.webp" },
  { id: "p22", name: "Tessellation Software", logoUrl: "/images/home/tessellation.webp" },
];

// University & College Partners
// export const universityPartners = [
//   // Add verified university/college partners here.
//   // {
//   //   id: "u1",
//   //   name: "University Name",
//   //   logoUrl: "/images/home/university-name.webp",
//   // },
// ];


// Section 6.4 — Featured Course / Program
export const featuredProgramStages = [
  {
    id: "stage-1",
    stageLabel: "STAGE 1",
    title: "Foundation & Onboarding",
    description:
      "Orientation, personality baseline, core tech modules, Personality Development.",
    image: "/images/home/home-featuredprogram-1.png",
    imageAlt: "Programming and software development learning",
  },
  {
    id: "stage-2",
    stageLabel: "STAGE 2",
    title: "Core Technical Competency",
    description: "Cloud & DevOps fundamentals, first workshop, SME connects.",
    image: "/images/home/home-featuredprogram-2.png",
    imageAlt: "Programming and software development learning",
  },
  {
    id: "stage-3",
    stageLabel: "STAGE 3",
    title: "Applied Learning",
    description: "Deeper modules, guest faculty visit, first mock interview.",
    image: "/images/home/home-featuredprogram-3.png",
    imageAlt: "Programming and software development learning",
  },
  {
    id: "stage-4",
    stageLabel: "STAGE 4",
    title: "Real Projects Begin",
    description: "Live team builds start, alongside GenAI & Agentic AI.",
    image: "/images/home/home-featuredprogram-4.png",
    imageAlt: "Programming and software development learning",
  },
  {
    id: "stage-5",
    stageLabel: "STAGE 5",
    title: "Industry Immersion",
    description: "Project reviews, second mock interview, resume overhaul.",
    image: "/images/home/home-featuredprogram-5.png",
    imageAlt: "Programming and software development learning",
  },
  {
    id: "stage-6",
    stageLabel: "STAGE 6",
    title: "Job-Ready",
    description: "Final assessment, placement preparations and internship.",
    image: "/images/home/home-featuredprogram-6.png",
    imageAlt: "Programming and software development learning",
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

/** @typedef {{ id: string, type: "text", name: string, role: string, quote: string, photoUrl: string }} TextTestimonial */
/** @typedef {{ id: string, type: "video", name: string, role: string, videoUrl: string }} VideoTestimonial */
/** @typedef {TextTestimonial | VideoTestimonial} Testimonial */

// Section 6.7 — Student testimonials.
/** @type {Testimonial[]} */

export const videoTestimonials = [
  {
    id: "v1",
    name: "Myank Aman",
    role: "BTech Graduate",
    videoUrl: "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/home-image/myank_aman_testimonial.mp4",
  },
  {
    id: "v2",
    name: "Sarvesh",
    role: "BTech Graduate",
    videoUrl: "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/home-image/sarvesh_testimonial.mp4",
  },

  {
    id: "v3",
    name: "Raman Munda",
    role: "BTech Graduate",
    videoUrl: "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/home-image/Raman_munda%20testimonial.mp4",
  },
   {
    id: "v4",
    name: "Farhat",
    role: "BTech Graduate",
    videoUrl: "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/home-image/Farhat_Afreen%20testimonial.mp4",
  },
];

export const textTestimonials = [
  {
    id: "t1",
    name: "Shabba Kausar",
    role: "BTech Graduate intern at JAK TECHNOLOGIES LTD",
    photoUrl: "",
    quote:
      "SPRINT provides a great learning environment with a strong focus on practical skills.",
  },
  {
    id: "t2",
    name: "Sukumar Gope",
    role: "BTech Graduate intern at Shaip",
    photoUrl: "",
    quote:
      "SPRINT provides excellent practical training, supportive mentors, and valuable guidance to improve students' technical skills.",
  },
  {
    id: "t3",
    name: "Chhavi",
    role: "BTech Graduate intern at UPTITUDE",
    photoUrl: "",
    quote:
  "The structured courses and supportive trainers made programming easier to understand and improved my coding confidence."
  },
  {
  id: "t4",
  name: "Aarav Sharma",
  role: "BTech Graduate",
  photoUrl: "",
  quote:
    "SPRINT helped me improve my technical knowledge through practical assignments, experienced mentors, and a professional learning environment focused on growth."},
{
  id: "t5",
  name: "Priya Kumari",
  role: "MCA Graduate",
  photoUrl: "",
  quote:
"The trainers are helpful, and the structured sessions made programming easier to understand."
},{
  id: "t6",
  name: "Rohit Verma",
  role: "BTech Graduate",
  photoUrl: "",
  quote:
    "The trainers are helpful, and the structured sessions made programming easier to understand.",
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
