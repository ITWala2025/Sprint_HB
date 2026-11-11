"use client";

import { usePathname } from "next/navigation";

const legalRoutes = new Set(["/privacy", "/terms"]);

export default function ConditionalCampusNewsTicker({ children }) {
  const pathname = usePathname();

  if (legalRoutes.has(pathname)) {
    return null;
  }

  return children;
}