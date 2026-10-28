import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LearningPathDetailPage({ path }) {
  const stages = path.stages || path.courses.map((course, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: course.title,
    hours: course.duration,
    learn: course.learn,
  }));
  const certifications = path.certifications || path.courses.map(
    (course) => `${course.title}: ${course.certification}`,
  );
  const title = path.title || path.role;
  const totalHours = path.total_hours ?? stages.reduce(
    (total, stage) => total + (Number.parseInt(stage.hours, 10) || 0),
    0,
  );

  return (
    <div className="learning-path-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">&gt;</span>
        <Link href="/courses#role-pathways-heading">Role-Based Learning Paths</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{title}</span>
      </nav>

      <header className="learning-path-detail__hero">
        <p className="courses-eyebrow">{path.eyebrow || "CAREER PATHWAY"}</p>
        <h1>{title}</h1>
        <p className="learning-path-detail__summary">
          {stages.length} learning stages · {totalHours}{" "}
          total learning hours
        </p>
      </header>

      <section
        className="learning-path-detail__stages"
        aria-label={`${title} curriculum`}
      >
        {stages.map((stage, index) => (
          <article
            className="learning-path-detail__stage"
            key={`${stage.number}-${stage.title}`}
          >
            <span className="learning-path-detail__stage-number">
              {stage.number || String(index + 1).padStart(2, "0")}
            </span>
            <div className="learning-path-detail__stage-content">
              <div className="learning-path-detail__stage-heading">
                <h2>{stage.title}</h2>
                <span className="learning-path-detail__duration">
                  {stage.hours}
                </span>
              </div>
              <h3>What You&apos;ll Learn</h3>
              <p>{stage.learn}</p>
            </div>
          </article>
        ))}
      </section>

      <section
        className="course-detail-section learning-path-detail__certification"
        aria-labelledby="learning-path-certification-heading"
      >
        <h2 id="learning-path-certification-heading">CERTIFICATION</h2>
        <ul className="course-outcomes">
          {certifications.map((certification, index) => (
            <li key={`${certification}-${index}`}>
              <span>{certification}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="learning-path-detail__back">
        <Link href="/courses#role-pathways-heading">
          <ArrowLeft size={16} aria-hidden="true" />
          All learning paths
        </Link>
      </p>
    </div>
  );
}
