const DEMO_CONTACT = {
  phone: "+91 85212 83184/85",
  email: "info@sprint.naturalelements.co.in",
  address: "SPRINT Centre, Hazaribagh, Jharkhand - 825301, India",
};

const createAction = (label, href) => ({ label, href });

export function getDemoChatbotReply(message, pathname = "/") {
  const text = message.toLowerCase();

  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
    return {
      reply:
        "Hello! I can help you explore SPRINT courses and programs, understand how to get started, or find the right page.",
      suggestions: ["Explore courses", "Tell me about SPRINT RISE", "Contact admissions"],
    };
  }

  if (
    /\b(career guidance|career advice|best course|best program|course for me|right course|help me choose|help me pick|which course should i|course recommendation)\b/.test(
      text,
    )
  ) {
    return {
      reply: text.includes("career")
        ? "Absolutely—I’d be happy to help you explore your options. What kind of work or subjects interest you, and what experience do you already have?"
        : "Absolutely—I can help you find a course that fits. What are you hoping to do next, and how much experience do you have in tech so far?",
      suggestions: [
        "I’m a student or just starting out",
        "I’m already working in tech",
        "I’m new to tech and exploring",
      ],
    };
  }

  if (/\b(fee|fees|price|pricing|scholarship|cost)\b/.test(text)) {
    return {
      reply:
        "Course fee details are shared by the admissions team. Get in touch with them for current pricing and any available fee options.",
      action: createAction("Ask about fees", "/contact"),
    };
  }

  if (/\b(eligib|qualif|prerequisite|who can|beginner)\b/.test(text)) {
    return {
      reply:
        "SPRINT has learning options for students, IT professionals, and non-IT learners. For example, SPRINT RISE is beginner to intermediate, while individual courses list their prerequisites on the course page.",
      action: createAction("Browse courses", "/courses"),
    };
  }

  if (/\b(intern|placement|job|employment)\b/.test(text)) {
    return {
      reply:
        "SPRINT RISE includes a 90-hour internship stage as part of its six-month program. For current internship or career-support details, the admissions team can guide you.",
      action: createAction("Explore SPRINT RISE", "/programs/sprint-rise"),
      suggestions: ["Contact admissions"],
    };
  }

  if (/\b(duration|long|months?|weeks?|how long)\b/.test(text)) {
    return {
      reply:
        "SPRINT RISE is a six-month program. Individual courses vary in length; for example, Python & AI Foundations is 8 weeks and Cloud Fundamentals is 6 weeks.",
      action: createAction("See courses", "/courses"),
      suggestions: ["Tell me about SPRINT RISE"],
    };
  }

  if (/\b(contact|phone|email|address|location|where|directions|reach)\b/.test(text)) {
    return {
      reply: `You can reach SPRINT at ${DEMO_CONTACT.phone} or ${DEMO_CONTACT.email}. The centre is at ${DEMO_CONTACT.address}.`,
      action: createAction("Open contact page", "/contact"),
    };
  }

  if (/\b(courses?|learn|training|topics|cloud|devops|machine learning|artificial intelligence|ai\/ml)\b/.test(text)) {
    return {
      reply:
        "SPRINT offers practical learning in areas including AI/ML, cloud, DevOps, web development, data analytics, cybersecurity, and professional skills. Browse the catalogue to see course details and prerequisites.",
      action: createAction("Browse all courses", "/courses"),
      suggestions: ["How long are the courses?", "What are the fees?"],
    };
  }

  if (/\b(rise|program|accelerator|career)\b/.test(text)) {
    return {
      reply:
        "SPRINT RISE is a six-month, online + in-campus program for beginner to intermediate learners. It covers areas such as Cloud, AI, and DevOps, with a 90-hour internship stage. The Career Accelerator is designed for B.Tech and MCA students and moves through Foundations, Ignite, and Outperform.",
      action: createAction("Explore SPRINT RISE", "/programs/sprint-rise"),
      suggestions: ["Tell me about SPRINT RISE", "Who can apply?"],
    };
  }

  if (/\b(pages?|website|navigate|menu)\b/.test(text)) {
    return {
      reply:
        "You can explore SPRINT’s courses and programs, learn about the institute, or contact the team from the pages below. Tell me what you’re looking for and I’ll point you in the right direction.",
      action: createAction("Explore courses", "/courses"),
      suggestions: ["Programs page", "About SPRINT", "Contact page"],
    };
  }

  if (/\b(about|sprint|institute|what do you do)\b/.test(text)) {
    return {
      reply:
        "SPRINT is a training hub in Hazaribagh, Jharkhand, focused on hands-on, production-level learning in emerging technologies such as AI/ML, Cloud, and DevOps.",
      action: createAction("About SPRINT", "/about"),
      suggestions: ["Explore courses", "Explore programs"],
    };
  }

  const currentPage = pathname !== "/" ? ` You’re currently browsing ${pathname}.` : "";
  return {
    reply: `Of course—I can help. What are you hoping to learn or work toward? A little about your interests or experience will help me point you to relevant SPRINT options.${currentPage}`,
    suggestions: ["Explore courses", "Tell me about SPRINT RISE", "Contact admissions"],
  };
}
