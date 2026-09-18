"use client";

import { usePathname } from "next/navigation";
import CampusNewsTicker from "./CampusNewsTicker";

const legalRoutes = new Set(["/privacy", "/terms"]);

export default function ConditionalCampusNewsTicker() {
  const pathname = usePathname();

  if (legalRoutes.has(pathname)) {
    return null;
  }

  return <CampusNewsTicker />;
}