import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { rolePaths } from "@/data/learningPaths";

function getTotalHours(path) {
  return path.courses.reduce(
    (total, course) => total + Number.parseInt(course.duration, 10),
    0,
  );
}

export default function RoleBasedLearningPaths() {
  return (
    <section
      className="courses-results__group role-pathways"
      aria-labelledby="role-pathways-heading"
    >
      <div className="role-pathways__heading">
        <div>
          <p className="courses-eyebrow">Career-focused pathways</p>
          <h2
            className="courses-results__group-heading"
            id="role-pathways-heading"
          >
            Role-Based Learning Paths
          </h2>
        </div>
        <p>Explore a sequence of learning designed around your target role.</p>
      </div>

      <div className="role-pathways__grid">
        {rolePaths.map((path) => (
          <article className="role-pathway" key={path.slug}>
            <div className="role-pathway__header">
              <span className="role-pathway__eyebrow">Career Pathway</span>
              <h3>{path.role}</h3>
              <span className="role-pathway__count">3 learning stages</span>
            </div>

            <div className="role-pathway__progress" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="role-pathway__hours">
              {getTotalHours(path)} total learning hours
            </p>

            <Link
              className="role-pathway__link"
              href={`/learning-paths/${path.slug}`}
              aria-label={`Explore the ${path.role} learning path`}
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
