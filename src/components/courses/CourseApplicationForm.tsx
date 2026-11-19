"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { applyForCourseAction } from "@/app/courses/actions";

type CourseApplicationFormProps = {
  slug: string;
  kind?: "course" | "bundle";
  buttonLabel?: string;
  className?: string;
};

function SubmitButton({
  buttonLabel,
  className,
}: {
  buttonLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className ?? "course-detail-hero__cta"}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Submitting..." : buttonLabel}
    </button>
  );
}

export default function CourseApplicationForm({
  slug,
  kind = "course",
  buttonLabel = "Enroll for this course",
  className,
}: CourseApplicationFormProps) {
  const [state, formAction] = useActionState(applyForCourseAction, {});

  useEffect(() => {
    if (state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state.redirectTo]);

  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="kind" value={kind} />
      <SubmitButton buttonLabel={buttonLabel} className={className} />
      {state.error ? (
        <p className="mt-2 text-sm text-brand-red" role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
