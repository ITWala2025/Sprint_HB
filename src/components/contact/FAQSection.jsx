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
import { FAQ_DATA } from "@/data/contactFaqs";

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