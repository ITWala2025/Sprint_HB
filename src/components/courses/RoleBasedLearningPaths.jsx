import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { rolePaths } from "@/data/learningPaths";
import { normalizeLearningPath } from "@/lib/course-utils";

export default function RoleBasedLearningPaths({ paths = rolePaths.map(normalizeLearningPath) }) {
  return (
    <section
      className="courses-results__group role-pathways"
      aria-labelledby="role-pathways-heading"
    >
      <div className="role-pathways__heading">
        <div>
          {/* <p className="courses-eyebrow">Career-focused pathways</p> */}
          <h2
            className="courses-results__group-heading"
            id="role-pathways-heading"
          >
            Role-Based Learning Paths
          </h2>
        </div>
        {/* <p>Explore a sequence of learning designed around your target role.</p> */}
      </div>

      <div className="role-pathways__grid">
        {paths.map((path) => (
          <article className="role-pathway" key={path.slug}>
            <div className="role-pathway__header">
              <span className="role-pathway__eyebrow">{path.eyebrow || "CAREER PATHWAY"}</span>
              <h3>{path.title || path.role}</h3>
              <span className="role-pathway__count">{path.stages.length} learning stages</span>
            </div>

            <div className="role-pathway__progress" aria-hidden="true">
              {path.stages.map((stage, index) => <span key={`${stage.number}-${index}`} />)}
            </div>
            <p className="role-pathway__hours">
              {path.total_hours} total learning hours
            </p>

            <Link
              className="role-pathway__link"
              href={`/learning-paths/${path.slug}`}
              aria-label={`Explore the ${path.title || path.role} learning path`}
            >
              Explore Learning Path
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
