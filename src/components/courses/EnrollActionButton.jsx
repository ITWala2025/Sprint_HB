"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CourseApplicationForm from "@/components/courses/CourseApplicationForm";

export default function EnrollActionButton({ slug, kind, label = "Enroll Now", className }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (active) {
          setIsAuthenticated(!!session && !error);
        }
      } catch {
        if (active) setIsAuthenticated(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  if (kind === "learning_path") {
    const href = `/student/enroll?learning_path=${encodeURIComponent(slug)}`;
    return (
      <Link href={href} className={className}>
        {label}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    );
  }

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    const param = kind === "program" ? "bundle" : kind;
    const href = `/student/enroll?${param}=${encodeURIComponent(slug)}`;
    return (
      <Link href={href} className={className}>
        {label}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    );
  }

  const applyKind = kind === "program" ? "bundle" : kind;
  return (
    <CourseApplicationForm
      slug={slug}
      kind={applyKind}
      buttonLabel={label}
      className={className}
    />
  );
}
