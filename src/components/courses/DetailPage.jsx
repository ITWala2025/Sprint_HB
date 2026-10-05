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
  ].filter(([, value]) => value);

  return (
    <div className="course-detail program-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{item.title}</span>
      </nav>

      <section className="course-detail-hero">
        <div className="course-detail-hero__copy">
          <p className="courses-eyebrow">{item.badgeLabel || "SPRINT Program"}</p>
          <h1>{item.title}</h1>
          <h2 className="program-detail__headline">{item.tagline || item.headline}</h2>
          <p>{item.description}</p>

          <Link
            className="course-detail-hero__cta"
            href="#rise-curriculum"
          >
            Explore curriculum
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="course-detail-hero__art">
          <Image
            src={item.image || "/images/courses/abstract-code.svg"}
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
            id="rise-curriculum"
            aria-labelledby="rise-curriculum-heading"
          >
            <p className="courses-eyebrow">Curriculum</p>
            <h2 id="rise-curriculum-heading">Program Stage</h2>
            <p>
              Learning Board topics and activities have not yet been provided.
            </p>
            <CourseCurriculum curriculum={item.curriculum} />
          </section>
        </main>

        <aside
          className="course-detail-aside program-detail__aside"
          aria-labelledby="rise-facts-heading"
        >
          <div>
            <h2 id="rise-facts-heading">Program facts</h2>
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
      </div>
    </div>
  );
}

function FlagshipDetailPage({ item }) {
  const stages = item.roadmap?.length ? item.roadmap : item.curriculum || [];
  return (
    <div className="course-detail program-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{item.title}</span>
      </nav>

      <section className="course-detail-hero">
        <div className="course-detail-hero__copy">
          <p className="courses-eyebrow">{item.badgeLabel || "Flagship Program"}</p>
          <h1>{item.title}</h1>
          {item.tagline ? <h2 className="program-detail__headline">{item.tagline}</h2> : null}
          <p>{item.description}</p>
          <div className="course-detail-hero__facts">
            {item.duration ? <span><Clock3 size={18} />{item.duration}</span> : null}
            {item.trainingMode ? <span><GraduationCap size={18} />{item.trainingMode}</span> : null}
          </div>
          <Link className="course-detail-hero__cta" href="#rise-curriculum">
            Explore roadmap <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="course-detail-hero__art">
          <Image src={item.image || "/images/courses/abstract-code.svg"} alt="" fill priority className="object-cover" />
        </div>
      </section>

      <div className="course-detail-layout program-detail__layout">
        <main>
          <section className="course-detail-section" id="rise-curriculum" aria-labelledby="flagship-roadmap-heading">
            <p className="courses-eyebrow">Roadmap</p>
            <h2 id="flagship-roadmap-heading">A structured path to industry readiness</h2>
            {stages.length ? <CourseCurriculum curriculum={stages} /> : <p>Program roadmap coming soon.</p>}
          </section>
          {item.highlights?.length ? <section className="course-detail-section">
            <p className="courses-eyebrow">Program Highlights</p>
            <h2>What makes this pathway distinctive</h2>
            <ul className="course-outcomes">{item.highlights.map((highlight) => <li key={highlight}><CheckCircle2 size={19} />{highlight}</li>)}</ul>
          </section> : null}
          {item.longDescription ? <section className="course-detail-section"><p className="courses-eyebrow">Program Vision</p><h2>Designed for sustained progress</h2><p>{item.longDescription}</p></section> : null}
        </main>
        <aside className="course-detail-aside program-detail__aside" aria-label="Program information">
          <div><h2>Program information</h2><dl>
            {item.duration ? <div><dt>Duration</dt><dd>{item.duration}</dd></div> : null}
            {item.trainingMode ? <div><dt>Training mode</dt><dd>{item.trainingMode}</dd></div> : null}
            {item.eligibility ? <div><dt>Eligibility</dt><dd>{item.eligibility}</dd></div> : null}
            {item.audienceLabel ? <div><dt>Target audience</dt><dd>{item.audienceLabel}</dd></div> : null}
          </dl><Link href="/register">Register interest <ArrowRight size={16} /></Link></div>
        </aside>
      </div>
    </div>
  );
}

export default async function DetailPage({ item, searchParams }) {
  if (item.kind === "program") {
    return <ProgramDetailPage item={item} />;
  }
  if (item.kind === "flagship") {
    return <FlagshipDetailPage item={item} />;
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
          {item.kind !== "bundle" ? <p className="courses-eyebrow">{item.badgeLabel || "Course"}</p> : null}
          {item.kind === "bundle" ? (
            <p className="courses-eyebrow">{label} · {item.category}</p>
          ) : null}

          <h1>{item.title}</h1>

          <p>{item.description}</p>

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
            src={item.image || "/images/courses/abstract-code.svg"}
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <div className="course-detail-layout">
        <main>
          <section className="course-detail-section">
            <p className="courses-eyebrow">Overview</p>
            <h2>Learn with purpose and practical context.</h2>
            <p>{item.longDescription || item.description}</p>
          </section>

          <section className="course-detail-section">
            <p className="courses-eyebrow">Course pathway</p>
            <h2>{item.pathway}</h2>
            <p>
              This learning route is designed to give you a clear next step at
              every stage.
            </p>
          </section>

          {item.tools?.length ? <section className="course-detail-section"><p className="courses-eyebrow">Tools</p><h2>Tools you will use</h2><ul className="course-outcomes">{item.tools.map((tool) => <li key={tool}><CheckCircle2 size={19} />{tool}</li>)}</ul></section> : null}
          {item.targetRoles?.length ? <section className="course-detail-section"><p className="courses-eyebrow">Target roles</p><h2>Roles this course supports</h2><ul className="course-outcomes">{item.targetRoles.map((role) => <li key={role}><CheckCircle2 size={19} />{role}</li>)}</ul></section> : null}

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
                <dd>{item.delivery || "Guided learning"}</dd>
              </div>

              <div>
                <dt>Duration</dt>
                <dd>{item.duration}</dd>
              </div>

              <div>
                <dt>Prerequisites</dt>
                <dd>{item.prerequisites}</dd>
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