import Link from "next/link";

type CourseApplicationFormProps = {
  slug: string;
  audience?: string;
  buttonLabel?: string;
  className?: string;
};

export default function CourseApplicationForm({
  slug,
  audience,
  buttonLabel = "Enroll for this course",
  className,
}: CourseApplicationFormProps) {
  const searchParams = new URLSearchParams({ course: slug });
  if (audience) searchParams.set("audience", audience);

  return (
    <Link
      href={`/student/enroll?${searchParams.toString()}`}
      className={className ?? "course-detail-hero__cta"}
    >
      {buttonLabel}
    </Link>
  );
}
