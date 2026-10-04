"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

function CurriculumList({ items, depth = 0, initialOpenIndex = -1 }) {
  const [openIndex, setOpenIndex] = useState(initialOpenIndex);
  const listId = useId();

  return (
    <div className="course-curriculum">
      {items.map((item, index) => {
        const children = Array.isArray(item.children) ? item.children : [];
        const topics = Array.isArray(item.topics) ? item.topics : [];
        const hasContent = children.length > 0 || topics.length > 0;
        const isOpen = openIndex === index;
        const itemId = `${listId}-item-${index}`;
        const isLegacyModule =
          depth === 0 && !item.label && Array.isArray(item.topics);
        const hierarchyLabel =
          item.label ??
          (isLegacyModule
            ? `Module ${String(index + 1).padStart(2, "0")}`
            : null);

        return (
          <section
            key={item.id ?? `${hierarchyLabel ?? "item"}-${item.title}`}
            className="course-curriculum__item"
          >
            {hasContent ? (
              <>
                <button
                  id={`${itemId}-trigger`}
                  type="button"
                  onClick={() =>
                    setOpenIndex((currentIndex) =>
                      currentIndex === index ? -1 : index,
                    )
                  }
                  aria-expanded={isOpen}
                  aria-controls={`${itemId}-content`}
                >
                  <span>
                    {hierarchyLabel ? <b>{hierarchyLabel}</b> : null}
                    {item.title}
                  </span>

                  <ChevronDown
                    className={isOpen ? "is-open" : ""}
                    size={20}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`${itemId}-content`}
                  aria-labelledby={`${itemId}-trigger`}
                  hidden={!isOpen}
                >
                  {topics.length > 0 ? (
                    <ul>
                      {topics.map((topic, topicIndex) => (
                        <li key={`${topic}-${topicIndex}`}>{topic}</li>
                      ))}
                    </ul>
                  ) : null}
                  {children.length > 0 ? (
                    <CurriculumList
                      items={children}
                      depth={depth + 1}
                    />
                  ) : null}
                </div>
              </>
            ) : (
              <div>
                <span>
                  {hierarchyLabel ? <b>{hierarchyLabel}</b> : null}
                  {item.title}
                </span>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default function CourseCurriculum({ curriculum = [] }) {
  return (
    <CurriculumList
      items={curriculum}
      depth={0}
      initialOpenIndex={0}
    />
  );
}
