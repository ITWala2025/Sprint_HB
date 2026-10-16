const visualByCategory = {
  "Artificial Intelligence": "/images/courses/abstract-ai.svg",
  "Cloud Computing": "/images/courses/abstract-cloud.svg",
  "DevOps & Containers": "/images/courses/abstract-devops.svg",
  "Data Analytics": "/images/courses/abstract-data.svg",
  "Full-Stack Web": "/images/courses/abstract-web.svg",
  "Programming Fundamentals": "/images/courses/abstract-code.svg",
  Cybersecurity: "/images/courses/abstract-security.svg",
  "Professional Skills": "/images/courses/abstract-people.svg",
};

export function getCourseFallbackImage(category) {
  const normalizedCategory = String(category || "").toLowerCase();

  if (
    normalizedCategory.includes("artificial") ||
    normalizedCategory.includes("machine learning") ||
    normalizedCategory.includes("ai")
  ) {
    return visualByCategory["Artificial Intelligence"];
  }
  if (normalizedCategory.includes("cloud")) {
    return visualByCategory["Cloud Computing"];
  }
  if (
    normalizedCategory.includes("devops") ||
    normalizedCategory.includes("container")
  ) {
    return visualByCategory["DevOps & Containers"];
  }
  if (normalizedCategory.includes("data")) {
    return visualByCategory["Data Analytics"];
  }
  if (
    normalizedCategory.includes("web") ||
    normalizedCategory.includes("software") ||
    normalizedCategory.includes("engineering")
  ) {
    return visualByCategory["Full-Stack Web"];
  }
  if (
    normalizedCategory.includes("cyber") ||
    normalizedCategory.includes("security")
  ) {
    return visualByCategory["Cybersecurity"];
  }
  if (normalizedCategory.includes("professional")) {
    return visualByCategory["Professional Skills"];
  }

  return visualByCategory["Programming Fundamentals"];
}

export function normalizeDatabaseCourse(course) {
  const rawAudience = course.audience_type || course.audience || "undergraduate";
  const audienceValue = String(rawAudience).toLowerCase().replaceAll(" ", "_");
  const audience = Array.isArray(rawAudience)
    ? rawAudience
    : audienceValue === "undergraduate" || audienceValue === "student"
      ? ["student"]
      : audienceValue === "working_professional"
        ? ["it-pro", "non-it"]
        : [audienceValue];

  return {
    ...course,
    kind: "course",
    audience,
    category: course.category || "Software Engineering",
    level: course.difficulty_level || course.difficulty || "Beginner",
    difficulty_level: course.difficulty_level || course.difficulty || "Beginner",
    delivery_method: course.delivery_method || course.mode || "Hybrid",
    duration: course.duration || "Duration to be announced",
    description: course.description || "A practical SPRINT technology pathway.",
    tools: Array.isArray(course.tools) ? course.tools : [],
    certificate: course.certificate_included === true,
    image: course.thumbnail_url || course.image || null,
  };
}

const audienceCopy = {
  student: {
    title: "Structured pathways for your first technology career",
    description:
      "Build foundations, complete guided labs, and progress through focused programs alongside your studies.",
  },

  "it-pro": {
    title: "Upskill for the systems and teams you lead",
    description:
      "Focused, practical modules for engineers who need to move quickly in high-impact domains.",
  },

  "non-it": {
    title: "Practical digital skills for modern work",
    description:
      "Build confidence with tools, workflows, and communication - without unnecessary programming prerequisites.",
  },
};

export function createDefaultProgramStages({
  title,
  tools = [],
  description = "",
  duration = "",
}) {
  const durationMatch = String(duration).match(
    /(\d+)\s*(weeks?|months?|days?)/i,
  );
  const durationAmount = durationMatch ? Number(durationMatch[1]) : 6;
  const durationUnit = durationMatch?.[2].toLowerCase() ?? "weeks";
  const weeks = durationUnit.startsWith("month")
    ? durationAmount * 4
    : durationUnit.startsWith("day")
      ? Math.ceil(durationAmount / 5)
      : durationAmount;
  const totalHours = Math.max(10, weeks * 10);
  const coreHours = Math.round(totalHours * 0.5);
  const practiceHours = Math.round(totalHours * 0.2);
  const projectHours = Math.round(totalHours * 0.2);
  const assessmentHours = totalHours - coreHours - practiceHours - projectHours;
  const primaryTool = tools[0] || title;
  const secondaryTool = tools[1] || "guided exercises";
  const thirdTool = tools[2] || "course workspace";
  const context = description.split(/[.!?]/)[0] || title;
  const learningBoard = (id, topics) => ({
    id: `${id}-learning-board`,
    label: "Learning Board",
    title: "",
    topics,
  });
  const stage = (id, title, topics) => ({
    id,
    label: "Program Stage",
    title,
    children: [learningBoard(id, topics)],
  });

  return [
    stage("day-one", "Day One", [
      `Course goals and learning path for ${title}`,
      `Set up ${primaryTool} and the learning workspace`,
      `Try a first guided task: ${context.toLowerCase()}`,
    ]),
    stage("core-sessions", `Core Sessions (${coreHours} hours)`, [
      `Core concepts and terminology for ${title}`,
      `How ${primaryTool} supports ${context.toLowerCase()}`,
      `Key workflows using ${secondaryTool}`,
    ]),
    stage("hands-on-practice", `Hands-on Practice (${practiceHours} hours)`, [
      `Guided ${primaryTool} lab`,
      `Practice with ${secondaryTool} and ${thirdTool}`,
      "Troubleshoot a realistic task with feedback",
    ]),
    stage("project-work", `Project Work (${projectHours} hours)`, [
      `Plan a practical ${title} project`,
      `Build a project using ${primaryTool} and ${secondaryTool}`,
      "Document and present the project outcome",
    ]),
    stage(
      "assessment-certification",
      `Assessment & Certification (${assessmentHours} hours)`,
      [
        "Apply course concepts to a practical scenario",
        "Review the final deliverable against course outcomes",
        "Prepare for certification and next steps",
      ],
    ),
  ];
}

const createCourse = ({
  slug,
  title,
  audience,
  category,
  level,
  duration,
  description,
  tools,
  certificate = true,
  pathway,
  outcomes,
  prerequisites = "No formal prerequisites",
  role,
  programStages = null,
}) => ({
  slug,
  title,
  kind: "course",
  audience,
  category,
  level,
  duration,
  description,
  tools,
  certificate,
  pathway,
  outcomes,
  prerequisites,
  role,
  image:
    visualByCategory[category] || visualByCategory["Programming Fundamentals"],
  programStages,
  price: "Contact for fee details",
});

export const courses = [
  createCourse({
    slug: "python-and-ai-foundations",
    title: "Python & AI Foundations",
    audience: ["student", "non-it"],
    category: "Artificial Intelligence",
    level: "Beginner",
    duration: "8 weeks",
    description:
      "Learn Python, data thinking, and the practical building blocks behind modern AI.",
    tools: ["Python", "Jupyter", "AI tools"],
    pathway: "SPRINT Foundations",
    outcomes: [
      "Write practical Python programs",
      "Understand AI workflows",
      "Build a small automation",
    ],
    role: "Aspiring developer",
  }),

  createCourse({
    slug: "machine-learning-essentials",
    title: "Machine Learning Essentials",
    audience: ["student", "it-pro"],
    category: "Artificial Intelligence",
    level: "Intermediate",
    duration: "6 weeks",
    description:
      "Move from data preparation to model evaluation with guided machine-learning labs.",
    tools: ["Python", "scikit-learn", "Pandas"],
    prerequisites: "Python fundamentals and basic statistics",
    pathway: "AI/ML pathway",
    outcomes: [
      "Prepare datasets",
      "Train baseline models",
      "Explain model results",
    ],
    role: "AI/ML learner",
  }),

  createCourse({
    slug: "generative-ai-for-work",
    title: "Generative AI for Work",
    audience: ["it-pro", "non-it"],
    category: "Artificial Intelligence",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Use generative AI responsibly to improve research, communication, and daily workflows.",
    tools: ["Prompt patterns", "AI assistants", "Workflow templates"],
    pathway: "Digital productivity",
    outcomes: [
      "Create reliable prompts",
      "Evaluate generated output",
      "Design an AI-assisted workflow",
    ],
    role: "Working professional",
  }),

  createCourse({
    slug: "cloud-fundamentals",
    title: "Cloud Fundamentals",
    audience: ["student", "it-pro"],
    category: "Cloud Computing",
    level: "Beginner",
    duration: "6 weeks",
    description:
      "Understand cloud services, deployment models, networking, and cost-aware architecture.",
    tools: ["AWS concepts", "Linux", "Cloud console"],
    pathway: "Cloud pathway",
    outcomes: [
      "Explain core cloud services",
      "Deploy a basic workload",
      "Follow cloud security basics",
    ],
    role: "Cloud learner",
  }),

  createCourse({
    slug: "aws-architecture-practice",
    title: "AWS Architecture Practice",
    audience: ["it-pro"],
    category: "Cloud Computing",
    level: "Advanced",
    duration: "8 weeks",
    description:
      "Design resilient cloud systems using architecture patterns, security controls, and cost trade-offs.",
    tools: ["AWS", "IAM", "VPC"],
    prerequisites: "Cloud fundamentals and Linux basics",
    pathway: "Cloud specialization",
    outcomes: [
      "Design cloud architectures",
      "Apply security controls",
      "Prepare for certification study",
    ],
    role: "Cloud engineer",
  }),

  createCourse({
    slug: "docker-and-kubernetes",
    title: "Docker & Kubernetes",
    audience: ["student", "it-pro"],
    category: "DevOps & Containers",
    level: "Intermediate",
    duration: "6 weeks",
    description:
      "Package applications, manage containers, and deploy workloads with Kubernetes fundamentals.",
    tools: ["Docker", "Kubernetes", "Git"],
    prerequisites: "Linux command line and basic programming",
    pathway: "DevOps pathway",
    outcomes: [
      "Containerize an application",
      "Deploy to Kubernetes",
      "Troubleshoot common issues",
    ],
    role: "DevOps learner",
  }),

  createCourse({
    slug: "cicd-and-gitops",
    title: "CI/CD & GitOps",
    audience: ["it-pro"],
    category: "DevOps & Containers",
    level: "Advanced",
    duration: "5 weeks",
    description:
      "Automate software delivery using versioned infrastructure and reliable deployment pipelines.",
    tools: ["GitHub Actions", "Git", "Argo CD"],
    prerequisites: "Git and container fundamentals",
    pathway: "DevOps specialization",
    outcomes: [
      "Build a delivery pipeline",
      "Use GitOps practices",
      "Improve release reliability",
    ],
    role: "Platform engineer",
  }),

  createCourse({
    slug: "full-stack-web-foundations",
    title: "Full-Stack Web Foundations",
    audience: ["student"],
    category: "Full-Stack Web",
    level: "Beginner",
    duration: "10 weeks",
    description:
      "Build responsive web applications from interface fundamentals through server-side APIs.",
    tools: ["HTML/CSS", "JavaScript", "React"],
    pathway: "SPRINT Ignite",
    outcomes: [
      "Build responsive interfaces",
      "Create API-backed features",
      "Publish a portfolio project",
    ],
    role: "Aspiring web developer",
  }),

  createCourse({
    slug: "react-and-nextjs",
    title: "React & Next.js Applications",
    audience: ["student", "it-pro"],
    category: "Full-Stack Web",
    level: "Intermediate",
    duration: "6 weeks",
    description:
      "Build production-minded web experiences with components, routing, and modern rendering patterns.",
    tools: ["React", "Next.js", "Git"],
    prerequisites: "JavaScript and HTML/CSS fundamentals",
    pathway: "Full-stack pathway",
    outcomes: [
      "Compose reusable components",
      "Build routed applications",
      "Deploy a web project",
    ],
    role: "Frontend developer",
  }),

  createCourse({
    slug: "java-programming-foundations",
    title: "Java Programming Foundations",
    audience: ["student"],
    category: "Programming Fundamentals",
    level: "Beginner",
    duration: "8 weeks",
    description:
      "Develop problem-solving habits through Java, object-oriented programming, and structured practice.",
    tools: ["Java", "IDE", "Git"],
    pathway: "SPRINT Foundations",
    outcomes: [
      "Write structured programs",
      "Use object-oriented concepts",
      "Solve foundational problems",
    ],
    role: "Student",
  }),

  createCourse({
    slug: "sql-and-database-systems",
    title: "SQL & Database Systems",
    audience: ["student", "non-it"],
    category: "Data Analytics",
    level: "Beginner",
    duration: "5 weeks",
    description:
      "Turn business questions into useful queries, reports, and structured data workflows.",
    tools: ["SQL", "PostgreSQL", "Spreadsheets"],
    pathway: "Data pathway",
    outcomes: [
      "Query relational data",
      "Design useful reports",
      "Understand data quality",
    ],
    role: "Data learner",
  }),

  createCourse({
    slug: "data-analytics-with-power-bi",
    title: "Data Analytics with Power BI",
    audience: ["student", "non-it"],
    category: "Data Analytics",
    level: "Beginner",
    duration: "6 weeks",
    description:
      "Create clear dashboards and make data-informed decisions with practical business datasets.",
    tools: ["Power BI", "Excel", "DAX"],
    pathway: "Analytics pathway",
    outcomes: ["Clean data", "Build dashboards", "Communicate insights"],
    role: "Analyst",
  }),

  createCourse({
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    audience: ["student", "non-it"],
    category: "Cybersecurity",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Recognize cyber risks, strengthen digital hygiene, and understand secure working practices.",
    tools: ["Security awareness", "Password tools", "Risk checklists"],
    pathway: "Digital safety",
    outcomes: [
      "Identify common threats",
      "Apply secure practices",
      "Respond to basic incidents",
    ],
    role: "Professional",
  }),

  createCourse({
    slug: "application-security-testing",
    title: "Application Security Testing",
    audience: ["it-pro"],
    category: "Cybersecurity",
    level: "Advanced",
    duration: "6 weeks",
    description:
      "Explore practical testing methods, vulnerability reporting, and secure development practices.",
    tools: ["OWASP", "Burp Suite", "Security testing"],
    prerequisites: "Web development or systems experience",
    pathway: "Security specialization",
    outcomes: [
      "Assess common risks",
      "Document findings",
      "Improve secure development",
    ],
    role: "Security engineer",
  }),

  createCourse({
    slug: "excel-and-workflow-automation",
    title: "Excel & Workflow Automation",
    audience: ["non-it"],
    category: "Data Analytics",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Reduce manual work with formulas, structured data, dashboards, and repeatable processes.",
    tools: ["Excel", "Power Query", "Templates"],
    pathway: "Workplace productivity",
    outcomes: [
      "Build reliable workbooks",
      "Automate repeat tasks",
      "Present clear reports",
    ],
    role: "Operations professional",
  }),

  createCourse({
    slug: "digital-office-workflows",
    title: "Digital Office Workflows",
    audience: ["non-it"],
    category: "Professional Skills",
    level: "Beginner",
    duration: "3 weeks",
    description:
      "Modernize document, communication, and file-management practices for a faster workplace.",
    tools: ["Collaboration tools", "Document systems", "Templates"],
    pathway: "Workplace productivity",
    outcomes: [
      "Organize shared work",
      "Improve documentation",
      "Use digital workflows confidently",
    ],
    role: "Public-sector professional",
  }),

  createCourse({
    slug: "professional-communication",
    title: "Professional Communication",
    audience: ["non-it", "student"],
    category: "Professional Skills",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Build clarity, confidence, and structure for workplace communication and presentations.",
    tools: ["Presentation frameworks", "Writing templates", "Practice reviews"],
    pathway: "Career readiness",
    outcomes: [
      "Write clearer messages",
      "Present with confidence",
      "Handle professional conversations",
    ],
    role: "Career starter",
  }),

  createCourse({
    slug: "linux-and-system-administration",
    title: "Linux & System Administration",
    audience: ["student", "it-pro"],
    category: "DevOps & Containers",
    level: "Intermediate",
    duration: "5 weeks",
    description:
      "Work confidently with Linux systems, permissions, services, and practical administration tasks.",
    tools: ["Linux", "Bash", "SSH"],
    prerequisites: "Basic computing and command-line familiarity",
    pathway: "Cloud and DevOps pathway",
    outcomes: ["Navigate Linux", "Manage services", "Automate routine tasks"],
    role: "Systems learner",
  }),

  createCourse({
    slug: "agritech-data-and-mapping",
    title: "Agritech Data & Mapping",
    audience: ["non-it"],
    category: "Data Analytics",
    level: "Beginner",
    duration: "5 weeks",
    description:
      "Use practical mapping and data practices to improve agricultural records and field decisions.",
    tools: ["Spreadsheets", "Mapping basics", "Dashboards"],
    pathway: "Industry digital pathway",
    outcomes: [
      "Organize field data",
      "Read basic maps",
      "Create useful reports",
    ],
    role: "Agricultural officer",
  }),

  createCourse({
    slug: "api-and-backend-services",
    title: "API & Backend Services",
    audience: ["student", "it-pro"],
    category: "Full-Stack Web",
    level: "Intermediate",
    duration: "6 weeks",
    description:
      "Design dependable server-side APIs, data access, and authentication for modern applications.",
    tools: ["Node.js", "REST APIs", "PostgreSQL"],
    prerequisites: "JavaScript fundamentals",
    pathway: "Full-stack pathway",
    outcomes: [
      "Build APIs",
      "Connect data stores",
      "Apply basic authentication",
    ],
    role: "Backend developer",
  }),
];

const createBundle = ({
  slug,
  title,
  audience,
  description,
  courses: included,
  pathway,
  outcomes,
  imageCategory = "Artificial Intelligence",
}) => {
  const includedCourseTitles = included.map((courseSlug) => {
    const course = courses.find((entry) => entry.slug === courseSlug);
    if (!course) {
      throw new Error(
        `Bundle "${slug}" references unknown course "${courseSlug}".`,
      );
    }
    return course.title;
  });

  return {
    slug,
    title,
    kind: "bundle",
    audience,
    category: "Career Package",
    level: "Curated pathway",
    duration: "Guided multi-course path",
    description,
    longDescription: `${description} This package groups connected learning into a clear sequence, with the flexibility to focus on each stage as you progress.`,
    tools: ["Guided pathway", "Practice projects", "Mentor support"],
    certificate: true,
    pathway,
    outcomes,
    prerequisites: "See the included course requirements",
    role: "Career pathway",
    image: visualByCategory[imageCategory],
    courses: included,
    curriculum: [
      {
        title: "Foundation",
        topics: ["Build essential knowledge", "Complete guided practice"],
      },
      {
        title: "Specialize",
        topics: includedCourseTitles,
      },
      {
        title: "Apply",
        topics: outcomes,
      },
    ],
    price: "Contact for package fee details",
  };
};

export const bundles = [
  createBundle({
    slug: "core-it-employability",
    title: "Core IT Employability",
    audience: ["student"],
    description:
      "Build web foundations, cloud knowledge, and modern container skills.",
    courses: [
      "full-stack-web-foundations",
      "cloud-fundamentals",
      "docker-and-kubernetes",
    ],
    pathway: "Student career package",
    outcomes: [
      "Build responsive web applications",
      "Understand cloud and container fundamentals",
      "Prepare for entry-level IT roles",
    ],
    imageCategory: "Full-Stack Web",
  }),

  createBundle({
    slug: "non-it-to-tech-transition",
    title: "Non-IT to Tech Transition",
    audience: ["student", "non-it"],
    description:
      "Develop Python and AI foundations, learn SQL, and turn data into clear insights.",
    courses: [
      "python-and-ai-foundations",
      "sql-and-database-systems",
      "data-analytics-with-power-bi",
    ],
    pathway: "Career transition package",
    outcomes: [
      "Build a foundation in Python and AI",
      "Query and understand relational data",
      "Create useful Power BI reports",
    ],
    imageCategory: "Data Analytics",
  }),

  createBundle({
    slug: "school-web-essentials",
    title: "School + Web Essentials",
    audience: ["student"],
    description:
      "Start with Python and AI concepts, then apply your skills to building for the web.",
    courses: ["python-and-ai-foundations", "full-stack-web-foundations"],
    pathway: "School and web foundations",
    outcomes: [
      "Understand programming and AI fundamentals",
      "Build and publish responsive web projects",
    ],
    imageCategory: "Artificial Intelligence",
  }),
];

export const catalogueItems = [...courses, ...bundles];

export const audienceOptions = [
  {
    value: "student",
    label: "Students",
  },
  {
    value: "it-pro",
    label: "IT Professionals",
  },
  {
    value: "non-it",
    label: "Non-IT Professionals",
  },
];

export const categories = [
  ...new Set(courses.map((course) => course.category)),
];

export { audienceCopy };

export function getCourse(slug) {
  return courses.find((course) => course.slug === slug);
}

export function getBundle(slug) {
  return bundles.find((bundle) => bundle.slug === slug);
}
