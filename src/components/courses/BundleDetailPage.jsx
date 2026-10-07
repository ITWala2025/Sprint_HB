import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import CourseCard from "@/components/cards/CourseCard";
import { audienceOptions } from "@/data/courses";

function getAudienceLabels(audience) {
  return audience
    .map(
      (value) =>
        audienceOptions.find((option) => option.value === value)?.label,
    )
    .filter(Boolean);
}

export default function BundleDetailPage({ item, includedCourses }) {
  const tools = [...new Set(includedCourses.flatMap((course) => course.tools))];
  const audiences = getAudienceLabels(item.audience);

  return (
    <div className="course-detail">
      <nav className="course-breadcrumb" aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">&gt;</span>
        <span>Career Bundles</span>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{item.title}</span>
      </nav>

      <section className="course-detail-hero">
        <div className="course-detail-hero__copy">
          {/* <p className="courses-eyebrow">CAREER BUNDLE</p> */}
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <div className="course-detail-hero__facts">
            <span>{item.duration}</span>
            <span>{item.level}</span>
            {audiences.map((audience) => (
              <span key={audience}>{audience}</span>
            ))}
          </div>
          <Link className="course-detail-hero__cta" href="/contact">
            Ask about this bundle
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

      <div className="course-detail-layout">
        <main>
          <section className="course-detail-section">
            <p className="courses-eyebrow">What You&apos;ll Learn</p>
            <h2>Topics and tools across the package</h2>
            {tools.length ? (
              <ul className="course-outcomes">
                {tools.map((tool) => (
                  <li key={tool}>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    {tool}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section
            className="course-detail-section"
            aria-labelledby="bundle-courses-heading"
          >
            <p className="courses-eyebrow">Included courses</p>
            <h2 id="bundle-courses-heading">
              Courses Included in This Package
            </h2>
            <div className="course-grid mt-6">
              {includedCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>

          <section className="course-detail-section">
            <p className="courses-eyebrow">What You&apos;ll Achieve</p>
            <h2>Outcomes from this package</h2>
            <ul className="course-outcomes">
              {item.outcomes.map((outcome) => (
                <li key={outcome}>
                  <CheckCircle2 size={19} aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section className="course-detail-section">
            <p className="courses-eyebrow">Who Is This For?</p>
            <h2>Designed for</h2>
            <ul className="course-outcomes">
              {audiences.map((audience) => (
                <li key={audience}>
                  <CheckCircle2 size={19} aria-hidden="true" />
                  {audience}
                </li>
              ))}
            </ul>
          </section>

          <section className="course-detail-section">
            <p className="courses-eyebrow">Package Information</p>
            <h2>Plan your next step</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Pathway", item.pathway],
                ["Duration", item.duration],
                ["Level", item.level],
                ["Prerequisites", item.prerequisites],
                ["Package fee", item.price],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-brand-border bg-brand-white p-4"
                >
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-brand-text">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </main>
      </div>

      <section className="courses-cta">
        <div>
          <p className="courses-eyebrow">Ready to get started?</p>
          <h2>Talk with SPRINT about {item.title}</h2>
          <p>Connect with our team to learn more about this career bundle.</p>
        </div>
        <Link href="/contact">
          Contact SPRINT
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
