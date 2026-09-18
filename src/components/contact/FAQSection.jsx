"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  UsersRound,
} from "lucide-react";

const FAQ_DATA = [
  // =========================
  // STUDENTS — 8
  // =========================
  {
    id: 1,
    category: "student",
    categoryLabel: "Students",
    question: "What courses and programs does SPRINT offer?",
    answer:
      "SPRINT offers professional studies and information technology programs designed to help students build practical skills, improve career readiness and prepare for professional opportunities.",
  },
  {
    id: 2,
    category: "student",
    categoryLabel: "Students",
    question: "How can I enquire about a course or program?",
    answer:
      "You can submit an enquiry through the Contact Us form. Select Student, choose your interested course or program and share your details. The SPRINT team can then connect with you regarding your enquiry.",
  },
  {
    id: 3,
    category: "student",
    categoryLabel: "Students",
    question: "Who can join SPRINT's professional programs?",
    answer:
      "Students and learners who want to develop professional, technical or career-oriented skills can enquire about programs relevant to their goals and eligibility.",
  },
  {
    id: 4,
    category: "student",
    categoryLabel: "Students",
    question: "Can I visit the SPRINT campus before enrolling?",
    answer:
      "Yes. You can contact the SPRINT team to enquire about visiting the campus for a guided tour, counselling session or other assistance.",
  },
  {
    id: 5,
    category: "student",
    categoryLabel: "Students",
    question: "Will I receive guidance before selecting a program?",
    answer:
      "You can discuss your learning goals and requirements with the SPRINT team before selecting a suitable program.",
  },
  {
    id: 6,
    category: "student",
    categoryLabel: "Students",
    question: "How do I know which program is suitable for my career goal?",
    answer:
      "Share your education background, interests and career objectives with the SPRINT team. The team can help you understand available program options relevant to your requirements.",
  },
  {
    id: 7,
    category: "student",
    categoryLabel: "Students",
    question: "How can I get information about admissions?",
    answer:
      "You can submit an enquiry through the Contact Us section and mention that you need admission information. The SPRINT team can provide the relevant details.",
  },
  {
    id: 8,
    category: "student",
    categoryLabel: "Students",
    question: "Can I contact SPRINT for course-related questions?",
    answer:
      "Yes. You can use the enquiry form or available contact channels to ask questions related to courses, programs, admissions or other academic requirements.",
  },

  // =========================
  // WORKING PROFESSIONALS — 8
  // =========================
  {
    id: 9,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "Does SPRINT offer programs for working professionals?",
    answer:
      "Yes. Working professionals can enquire about professional and skill-development programs based on their current role, experience and career objectives.",
  },
  {
    id: 10,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "Can I enquire about a program based on my current job role?",
    answer:
      "Yes. The enquiry form allows working professionals to share their current company, designation, experience and interested program so that their requirements can be understood.",
  },
  {
    id: 11,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "Can professionals enquire about skill development?",
    answer:
      "Yes. Working professionals can contact SPRINT regarding skill-development requirements and discuss programs that may align with their professional goals.",
  },
  {
    id: 12,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "Can I discuss my requirements before choosing a course?",
    answer:
      "Yes. You can mention your current role, experience and learning objectives in the enquiry form and discuss your requirements with the SPRINT team.",
  },
  {
    id: 13,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "What information should I provide as a working professional?",
    answer:
      "You can provide your name, email, phone number, current company, current designation, experience and interested program along with your specific learning requirement.",
  },
  {
    id: 14,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "Can I enquire about professional development programs?",
    answer:
      "Yes. You can use the enquiry form to share your professional development requirements and discuss suitable program options with SPRINT.",
  },
  {
    id: 15,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "Can SPRINT be contacted for corporate skill requirements?",
    answer:
      "Yes. Companies and professionals can contact SPRINT to discuss training and skill-development requirements.",
  },
  {
    id: 16,
    category: "professional",
    categoryLabel: "Working Professionals",
    question: "How can I request more information about a professional program?",
    answer:
      "Select Working Professional in the enquiry form, choose the relevant program and provide your contact details and requirements.",
  },

  // =========================
  // INSTITUTES — 7
  // =========================
  {
    id: 17,
    category: "institute",
    categoryLabel: "Institutes",
    question: "Can institutes contact SPRINT for training programs?",
    answer:
      "Yes. Institutes can contact SPRINT to discuss training, workshops and course-related requirements.",
  },
  {
    id: 18,
    category: "institute",
    categoryLabel: "Institutes",
    question: "What information should an institute provide in an enquiry?",
    answer:
      "Institutes can provide the institute name, contact person, official email and phone number, website, required service, preferred contact time and training or requirement details.",
  },
  {
    id: 19,
    category: "institute",
    categoryLabel: "Institutes",
    question: "Can institutes enquire about workshops?",
    answer:
      "Yes. Workshops can be selected as a service in the Institute enquiry form.",
  },
  {
    id: 20,
    category: "institute",
    categoryLabel: "Institutes",
    question: "Can institutes discuss customized training requirements?",
    answer:
      "Yes. Institutes can describe their training requirements in the enquiry message so the SPRINT team can understand the expected requirement.",
  },
  {
    id: 21,
    category: "institute",
    categoryLabel: "Institutes",
    question: "Can I specify a preferred contact time?",
    answer:
      "Yes. The Institute enquiry form includes a Preferred Contact Time field so institutes can share a suitable time for communication.",
  },
  {
    id: 22,
    category: "institute",
    categoryLabel: "Institutes",
    question: "Can institutes enquire about multiple services?",
    answer:
      "Yes. The enquiry form supports selecting relevant services such as Training, Workshop and Course.",
  },
  {
    id: 23,
    category: "institute",
    categoryLabel: "Institutes",
    question: "Can an institute contact SPRINT for student-focused programs?",
    answer:
      "Yes. Institutes can share their student training or development requirements through the Institute enquiry form.",
  },

  // =========================
  // COMPANY / ENTERPRISE — 7
  // =========================
  {
    id: 24,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "Can companies contact SPRINT for corporate training?",
    answer:
      "Yes. Companies and enterprises can contact SPRINT to discuss professional training and skill-development requirements.",
  },
  {
    id: 25,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "Can companies enquire about hiring or recruitment partnerships?",
    answer:
      "Yes. Companies can select Hiring as a purpose type in the Company / Enterprise enquiry form and share their requirements.",
  },
  {
    id: 26,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "Can companies discuss internship opportunities?",
    answer:
      "Yes. Companies can select Internships as a purpose type and provide relevant details through the enquiry form.",
  },
  {
    id: 27,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "Can companies enquire about personality development programs?",
    answer:
      "Yes. Personality Development can be selected as a purpose type in the Company / Enterprise enquiry form.",
  },
  {
    id: 28,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "Can companies discuss SME skill-development requirements?",
    answer:
      "Yes. SME Skill Development is available as a purpose type for Company / Enterprise enquiries.",
  },
  {
    id: 29,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "What information should a company provide?",
    answer:
      "Companies can provide their company name, domain, contact person, role, official email, phone number, website, available time, purpose and requirement details.",
  },
  {
    id: 30,
    category: "company",
    categoryLabel: "Companies / Enterprise",
    question: "Can enterprises discuss partnership opportunities with SPRINT?",
    answer:
      "Yes. Companies and enterprises can select Partnership and provide their requirements through the Company / Enterprise enquiry form.",
  },
];

const CATEGORY_CONFIG = {
  student: {
    label: "Students",
    icon: GraduationCap,
    visibleCount: 2,
    cta: "View All Student FAQs",
  },
  professional: {
    label: "Working Professionals",
    icon: BriefcaseBusiness,
    visibleCount: 2,
    cta: "View All Professional FAQs",
  },
  institute: {
    label: "Institutes",
    icon: Building2,
    visibleCount: 2,
    cta: "View All Institute FAQs",
  },
  company: {
    label: "Companies / Enterprise",
    icon: UsersRound,
    visibleCount: 2,
    cta: "View All Enterprise FAQs",
  },
};

export default function FAQSection() {
  const [activeId, setActiveId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState("student");

  const visibleFAQs = useMemo(() => {
    const filteredFAQs = FAQ_DATA.filter(
      (faq) => faq.category === activeCategory
    );

    if (showAll) {
      return filteredFAQs;
    }

    return filteredFAQs.slice(
      0,
      CATEGORY_CONFIG[activeCategory].visibleCount
    );
  }, [activeCategory, showAll]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveId(null);
    setShowAll(false);
  };

  const handleViewAll = () => {
    setShowAll((current) => !current);
    setActiveId(null);
  };

  const toggleFAQ = (id) => {
    setActiveId((currentId) =>
      currentId === id ? null : id
    );
  };

  const getCTA = () => {
    return CATEGORY_CONFIG[activeCategory].cta;
  };

  const getDescription = () => {
    return `Explore more frequently asked questions for ${CATEGORY_CONFIG[activeCategory].label.toLowerCase()}.`;
  };

  return (
    <section
      className="faq-section"
      id="faq"
      aria-labelledby="faq-title"
    >
      <div className="faq-section__container">

        {/* =========================
            HEADER
            ========================= */}
        <div className="faq-section__header">

          <h2 className="faq-section__eyebrow">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          {/* <h2 id="faq-title">
            Got Questions?{" "}
            <span>We&apos;re Here to Help.</span>
          </h2> */}

          <p>
            Find answers to common questions about SPRINT programs,
            professional learning and enquiries.
          </p>

        </div>

        {/* =========================
            CATEGORY FILTER
            ========================= */}
        <div
          className="faq-categories"
          role="tablist"
          aria-label="FAQ categories"
        >

          {Object.entries(CATEGORY_CONFIG).map(
            ([category, config]) => {
              const Icon = config.icon;

              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={`faq-category ${
                    activeCategory === category
                      ? "faq-category--active"
                      : ""
                  }`}
                  onClick={() =>
                    handleCategoryChange(category)
                  }
                >
                  <Icon aria-hidden="true" />
                  <span>{config.label}</span>
                </button>
              );
            }
          )}

        </div>

        {/* =========================
            FAQ LIST
            ========================= */}
        <div className="faq-list">

          {visibleFAQs.map((faq) => {
            const isOpen = activeId === faq.id;

            return (
              <article
                className={`faq-item ${
                  isOpen ? "faq-item--open" : ""
                }`}
                key={faq.id}
              >

                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="faq-question__text">
                    {faq.question}
                  </span>

                  <span
                    className="faq-question__icon"
                    aria-hidden="true"
                  >
                    <ArrowDown />
                  </span>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  className="faq-answer"
                  hidden={!isOpen}
                >
                  <div className="faq-answer__content">

                    <span className="faq-answer__category">
                      {faq.categoryLabel}
                    </span>

                    <p>{faq.answer}</p>

                  </div>
                </div>

              </article>
            );
          })}

        </div>

        {/* =========================
            CTA
            ========================= */}
        <div className="faq-view-all">

          <button
            type="button"
            className="faq-view-all__button"
            onClick={handleViewAll}
            aria-expanded={showAll}
          >
            <span>
              {showAll ? "Show Less FAQs" : getCTA()}
            </span>

            <span
              className="faq-view-all__icon"
              aria-hidden="true"
            >
              {showAll ? (
                <ArrowDown className="faq-view-all__icon--up" />
              ) : (
                <ArrowRight />
              )}
            </span>
          </button>

          <p>
            {getDescription()}
          </p>

        </div>

      </div>
    </section>
  );
}