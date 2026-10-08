import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LearningPathDetailPage({ path }) {
  return (
    <div className="learning-path-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">&gt;</span>
        <Link href="/courses#role-pathways-heading">Role-Based Learning Paths</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{path.role}</span>
      </nav>

      <header className="learning-path-detail__hero">
        <p className="courses-eyebrow">Career Pathway</p>
        <h1>{path.role}</h1>
        <p className="learning-path-detail__summary">
          Three learning stages ·{" "}
          {path.courses.reduce(
            (total, course) =>
              total + Number.parseInt(course.duration, 10),
            0,
          )}{" "}
          total learning hours
        </p>
      </header>

      <section
        className="learning-path-detail__stages"
        aria-label={`${path.role} curriculum`}
      >
        {path.courses.map((course, index) => (
          <article
            className="learning-path-detail__stage"
            key={course.title}
          >
            <span className="learning-path-detail__stage-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="learning-path-detail__stage-content">
              <div className="learning-path-detail__stage-heading">
                <h2>{course.title}</h2>
                <span className="learning-path-detail__duration">
                  {course.duration}
                </span>
              </div>
              <h3>What You&apos;ll Learn</h3>
              <p>{course.learn}</p>
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
          {path.courses.map((course) => (
            <li key={course.title}>
              <span>
                {course.title}: {course.certification}
              </span>
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
