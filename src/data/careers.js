/**
 * Careers & Internships — Static content for the Careers page.
 * Replace with CMS/API data when available.
 */

export const careerRoles = [
  {
    id: "role-1",
    title: "Agentic AI Developer",
    type: "internship",
    location: "Hazaribagh, Jharkhand (Hybrid)",
    description:
      "Design and prototype autonomous AI agents that assist learners and mentors across the SPRINT platform. Work with LLMs, tool-use frameworks, and evaluation pipelines to ship features that scale.",
    requirements: [
      "Strong Python and TypeScript skills",
      "Experience with LLM APIs (OpenAI, Anthropic, or open-source)",
      "Familiarity with LangChain, LangGraph, or similar agent frameworks",
      "Understanding of RAG, function calling, and eval methodologies",
    ],
    duration: "6 months",
    stipend: "₹20,000/month",
    postedDate: "2025-08-15",
  },
  {
    id: "role-2",
    title: "Business Development Executive",
    type: "full-time",
    location: "Hazaribagh, Jharkhand (On-site)",
    description:
      "Drive partnership growth with colleges, universities, and corporate clients. Own the pipeline from outreach to signed MoUs, representing SPRINT's programs to decision-makers across the region.",
    requirements: [
      "1–3 years B2B sales or business development experience",
      "Excellent communication skills (English/Hindi)",
      "Proven track record of closing deals in education/ed-tech preferred",
      "Willingness to travel for campus visits and industry events",
    ],
    duration: "Full-time",
    stipend: "₹30,000–45,000/month + performance incentives",
    postedDate: "2025-08-10",
  },
];

export const whyJoinContent = [
  {
    id: "para-1",
    content:
      "At SPRINT, <span className=\"text-brand-red\">learning meets impact</span> every single day. We are not building another content library — we are building the bridge between academic theory and industry reality. Every program we design, every mentor we onboard, and every project we ship is measured by one outcome: does it accelerate a learner's journey from classroom to career?"
  },
  {
    id: "para-2",
    content:
      "Our team operates at the intersection of <span className=\"text-brand-red\">engineering excellence</span> and <span className=\"text-brand-red\">educational purpose</span>. Whether you are an engineer shipping agentic AI features, a faculty member designing capstone projects, or a business developer forging university partnerships, your work directly shapes how the next generation of technologists enters the workforce. We value output over hours, mentorship over management, and mission over metrics."
  },
  {
    id: "para-3",
    content:
      "Joining SPRINT means joining a <span className=\"text-brand-red\">community of builders</span> who believe the academic–industry gap is solvable — not with more content, but with better context. You will have access to our full course library, weekly tech talks with partner-company engineers, and a network of alumni now placed at leading tech companies. Your growth here doesn't stop at your role; it compounds through every learner you help succeed."
  },
];

export const hiringProcessSteps = [
  {
    id: "step-1",
    number: "01",
    title: "Apply",
    description:
      "Submit your application with resume, portfolio/GitHub, and a brief note on why SPRINT. We review every application personally.",
  },
  {
    id: "step-2",
    number: "02",
    title: "Screening",
    description:
      "Shortlisted candidates complete a take-home assignment or technical assessment relevant to the role (2–4 hours max).",
  },
  {
    id: "step-3",
    number: "03",
    title: "Interview",
    description:
      "Two rounds: a technical deep-dive with a mentor, and a culture/values conversation with the team lead.",
  },
  {
    id: "step-4",
    number: "04",
    title: "Onboarding",
    description:
      "Successful candidates receive an offer within 7 days. Onboarding includes platform access, mentor pairing, project kickoff, and a 30-day ramp plan tailored to your role.",
  },
];

export const applicationFormConfig = {
  roles: careerRoles.map((r) => ({ value: r.id, label: r.title })),
  defaultRole: "role-1",
  submissionEmail: "info@sprint.naturalelements.co.in",
  subjectPrefix: "SPRINT Careers Application",
};