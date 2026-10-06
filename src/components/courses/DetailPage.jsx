import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Route,
} from "lucide-react";
import CourseCurriculum from "./CourseDetail";
import { audienceOptions } from "@/data/courses";

function ProgramDetailPage({ item }) {
  const facts = [
    ["Duration", item.duration],
    ["Level", item.level],
    ["Delivery", item.delivery],
    ["Credential", item.certification],
    ["Designed for", item.audience],
  ].filter(([, value]) => value);
  const curriculumAnchor = item.curriculumAnchor ?? "program-curriculum";
  const curriculumHeading = item.curriculum?.[0]?.label ?? "Program Stage";

  return (
    <div className="course-detail program-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{item.title}</span>
      </nav>

      <section className="course-detail-hero">
        <div className="course-detail-hero__copy">
          <p className="courses-eyebrow">SPRINT Program</p>
          <h1>{item.title}</h1>
          <h2 className="program-detail__headline">{item.headline}</h2>
          <p>{item.description}</p>

          <Link className="course-detail-hero__cta" href={`#${curriculumAnchor}`}>
            Explore curriculum
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="course-detail-hero__art">
          <Image
            src={item.image}
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <div className="course-detail-layout program-detail__layout">
        <main>
          <section
            className="course-detail-section"
            id={curriculumAnchor}
            aria-labelledby={`${curriculumAnchor}-heading`}
          >
            <p className="courses-eyebrow">Curriculum</p>
            <h2 id={`${curriculumAnchor}-heading`}>{curriculumHeading}</h2>
            <p>
              Learning Board topics and activities have not yet been provided.
            </p>
            <CourseCurriculum curriculum={item.curriculum} />
          </section>
        </main>

        {facts.length > 0 ? (
          <aside
            className="course-detail-aside program-detail__aside"
            aria-labelledby="program-facts-heading"
          >
            <div>
              <h2 id="program-facts-heading">Program facts</h2>
              <dl>
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export default async function DetailPage({ item, searchParams }) {
  if (item.kind === "program") {
    return <ProgramDetailPage item={item} />;
  }

  const label = item.kind === "bundle" ? "Learning package" : "Course";

  const query =
    item.kind === "bundle" || !searchParams ? {} : await searchParams;

  const audienceValue =
    typeof query.audience === "string" ? query.audience : null;

  const audienceLabel = audienceOptions.find(
    (option) => option.value === audienceValue
  )?.label;

  return (
    <div className="course-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span>&gt;</span>

        {item.kind === "bundle" || !audienceLabel ? (
          <span>{label}</span>
        ) : (
          <>
            <span>{audienceLabel}</span>
            <span>&gt;</span>
            <span>{item.category}</span>
          </>
        )}
      </nav>

      <section className="course-detail-hero">
        <div className="course-detail-hero__copy">
          {item.kind === "bundle" ? (
            <p className="courses-eyebrow">
              {label} · {item.category}
            </p>
          ) : null}

          <h1>{item.title}</h1>

          <p>{item.longDescription}</p>

          <div className="course-detail-hero__facts">
            <span>
              <Clock3 size={18} />
              {item.duration}
            </span>

            <span>
              <GraduationCap size={18} />
              {item.level}
            </span>

            {item.certificate ? (
              <span>
                <Award size={18} />
                Certificate included
              </span>
            ) : null}
          </div>

          <Link
            className="course-detail-hero__cta"
            href="/register"
          >
            Sign up for this{" "}
            {item.kind === "bundle" ? "package" : "course"}
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="course-detail-hero__art">
          <Image
            src={item.image}
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <div className="course-detail-layout">
        <main>
          {/* <section className="course-detail-section">
            <p className="courses-eyebrow">Overview</p>
            <h2>Learn with purpose and practical context.</h2>
            <p>{item.description}</p>
          </section> */}

          <section className="course-detail-section">
            <p className="courses-eyebrow">Course pathway</p>
            <h2>{item.pathway}</h2>
            <p>
              This learning route is designed to give you a clear next step at
              every stage.
            </p>
          </section>

          <section className="course-detail-section">
            <p className="courses-eyebrow">Curriculum</p>
            <h2>What you will work through</h2>
            <CourseCurriculum curriculum={item.curriculum} />
          </section>

          <section className="course-detail-section">
            <p className="courses-eyebrow">Outcomes</p>
            <h2>What you can take forward</h2>

            <ul className="course-outcomes">
              {item.outcomes.map((outcome) => (
                <li key={outcome}>
                  <CheckCircle2 size={19} />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className="course-detail-aside">
          <div>
            <h2>At a glance</h2>

            <dl>
              <div>
                <dt>Format</dt>
                <dd>Guided learning</dd>
              </div>

              <div>
                <dt>Duration</dt>
                <dd>{item.duration}</dd>
              </div>

              <div>
                <dt>Prerequisites</dt>
                <dd>{item.prerequisites}</dd>
              </div>

              <div>
                <dt>Price</dt>
                <dd>{item.price}</dd>
              </div>
            </dl>

            <Link href="/register">
              Sign up <ArrowRight size={16} />
            </Link>
          </div>

          <div className="course-detail-aside__next">
            <Route size={22} />
            <h3>Explore the full pathway</h3>
            <p>
              Use this course as a focused next step in your learning journey.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}