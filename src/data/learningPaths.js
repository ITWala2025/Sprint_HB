export const rolePaths = [
  {
    slug: "ai-engineer",
    role: "AI Engineer",
    courses: [
      {
        title: "Applied Machine Learning & Scikit-Learn",
        duration: "60 Hours",
        learn:
          "Core statistical modeling, regression, classification, clustering, data preprocessing, and model evaluation techniques using scikit-learn and Python.",
        certification:
          "Passing score (≥70%) on the End-of-Course Practical ML Assessment & Case Study.",
      },
      {
        title: "Deep Learning, Computer Vision & NLP",
        duration: "90 Hours",
        learn:
          "Neural network foundations, ANNs, CNNs, RNNs, and Transformer model architectures.",
        certification:
          "Passing score (≥70%) on the Deep Learning Neural Model Design Exam.",
      },
      {
        title: "Generative AI & Autonomous Agent Systems",
        duration: "75 Hours",
        learn:
          "LLMs, prompt engineering frameworks, LangChain/LangGraph pipelines, ChromaDB vector search (RAG), and multi-agent system orchestration using CrewAI.",
        certification:
          "Passing score (≥70%) on the GenAI Agent Architecture & RAG Pipeline Evaluation Test.",
      },
    ],
  },
  {
    slug: "cloud-engineer",
    role: "Cloud Engineer",
    courses: [
      {
        title: "Cloud Infrastructure Foundations (AWS Core)",
        duration: "50 Hours",
        learn:
          "Core cloud principles, EC2, VPC, S3/EBS, IAM, and security groups.",
        certification:
          "Passing score (≥75%) on the Cloud Infrastructure Hands-on Practical Exam.",
      },
      {
        title: "Microservices Architecture & Cloud Backend",
        duration: "65 Hours",
        learn:
          "Service decomposition, Docker Compose, REST APIs, asynchronous message queues, and cloud backend deployment.",
        certification:
          "Passing score (≥70%) on the Microservices Deployment & API Design Test.",
      },
      {
        title: "Enterprise Cloud Operations & Administration",
        duration: "45 Hours",
        learn:
          "Enterprise cloud resource scaling, automated backups, cross-region replication, IAM role governance, and resource billing monitoring.",
        certification:
          "Passing score (≥70%) on the Cloud Operations & Systems Administration Exam.",
      },
    ],
  },
  {
    slug: "devops-engineer",
    role: "DevOps Engineer",
    courses: [
      {
        title: "Containerization & Orchestration (Docker & Kubernetes)",
        duration: "70 Hours",
        learn:
          "Container lifecycle management, multi-stage Docker builds, Kubernetes clusters, pods, services, ingress, and Helm.",
        certification:
          "Passing score (≥75%) on the Container Orchestration & Cluster Management Lab Exam.",
      },
      {
        title: "Infrastructure as Code (IaC) with Terraform",
        duration: "50 Hours",
        learn:
          "Declarative cloud provisioning, Terraform state management, reusable modules, variable scopes, and automated multi-environment rollouts.",
        certification:
          "Passing score (≥70%) on the Terraform Infrastructure Automation Test.",
      },
      {
        title: "CI/CD Pipeline Automation & GitOps",
        duration: "60 Hours",
        learn:
          "Automated test/deployment workflows using GitHub Actions/GitLab CI, artifact versioning, staging rollouts, and Git/GitHub workflows.",
        certification:
          "Passing score (≥75%) on the End-to-End CI/CD Pipeline Build Assessment.",
      },
    ],
  },
  {
    slug: "software-engineer",
    role: "Software Engineer",
    courses: [
      {
        title: "Object-Oriented Programming & Logic Building",
        duration: "60 Hours",
        learn:
          "Programming logic, algorithm design, data structures, OOP patterns, and file handling.",
        certification:
          "Passing score (≥70%) on the DSA Logic & Coding Proficiency Test.",
      },
      {
        title: "Modern Frontend Web Development",
        duration: "65 Hours",
        learn:
          "Semantic HTML5, CSS3, responsive design, modern JavaScript (ES6+), component architecture, and React UI engineering.",
        certification:
          "Passing score (≥70%) on the Frontend Interactive Application Evaluation.",
      },
      {
        title: "Enterprise Full-Stack Engineering (MERN & Java)",
        duration: "100 Hours",
        learn:
          "End-to-end development using MongoDB/PostgreSQL, Express/Spring Boot, React, Node.js, and CI/CD-driven deployments.",
        certification:
          "Passing score (≥75%) on the Full-Stack Enterprise Capstone Project & Technical Assessment.",
      },
    ],
  },
];

export function getLearningPath(slug) {
  return rolePaths.find((path) => path.slug === slug);
}
