"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CourseCurriculum({ curriculum }) {
  const [open, setOpen] = useState(0);
  return <div className="course-curriculum">{curriculum.map((module, index) => <section key={module.title} className="course-curriculum__item"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span><b>Module {String(index + 1).padStart(2, "0")}</b>{module.title}</span><ChevronDown className={open === index ? "is-open" : ""} size={20} /></button>{open === index ? <ul>{module.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}</section>)}</div>;
}
