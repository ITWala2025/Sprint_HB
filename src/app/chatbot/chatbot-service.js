const DEMO_CONTACT = {
  phone: "+91 85212 83184/85",
  email: "info@sprint.naturalelements.co.in",
  address: "SPRINT Centre, Hazaribagh, Jharkhand - 825301, India",
};

const isSafeActionHref = (href) =>
  typeof href === "string" &&
  (/^\/(?!\/)/.test(href) ||
    /^https:\/\//i.test(href) ||
    /^tel:/i.test(href) ||
    /^mailto:/i.test(href));

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
    reply: `I’m still learning how to answer that. I can help with courses, programs, eligibility, fees, duration, or contact details.${currentPage}`,
    suggestions: ["Explore courses", "Tell me about SPRINT RISE", "Contact admissions"],
  };
}

function normalizeApiAction(action) {
  if (
    !action ||
    typeof action.label !== "string" ||
    !action.label.trim() ||
    !isSafeActionHref(action.href)
  ) {
    return null;
  }

  return { label: action.label.trim(), href: action.href };
}

export async function getChatbotReply({ message, history = [], pathname = "/" }) {
  const endpoint = process.env.NEXT_PUBLIC_CHATBOT_API_URL;

  if (!endpoint) {
    return getDemoChatbotReply(message, pathname);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-12),
      pathname,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chatbot request failed (${response.status}).`);
  }

  const payload = await response.json();
  if (!payload || typeof payload.reply !== "string" || !payload.reply.trim()) {
    throw new Error("The chatbot API returned an invalid response.");
  }

  return {
    reply: payload.reply.trim(),
    action: normalizeApiAction(payload.action),
    suggestions: Array.isArray(payload.suggestions)
      ? payload.suggestions.filter(
          (suggestion) => typeof suggestion === "string" && suggestion.trim(),
        )
      : [],
  };
}
