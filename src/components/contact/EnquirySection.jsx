"use client";

import { useState } from "react";
import ContactMethods from "@/components/contact/ContactMethods";
import StudentForm from "@/components/contact/StudentForm";
import WorkingProfessionalForm from "@/components/contact/WorkingProfessionalForm";
import InstituteForm from "@/components/contact/InstituteForm";
import CompanyForm from "@/components/contact/CompanyForm";

const audiences = [
  {
    id: "student",
    label: "Student",
  },
  {
    id: "professional",
    label: "Working Professional",
  },
  {
    id: "institute",
    label: "Institute",
  },
  {
    id: "company",
    label: "Company / Enterprise",
  },
];

export default function EnquirySection() {
  const [audience, setAudience] = useState("student");

  return (
    <section
      className="enquiry-section"
      id="enquiry"
      aria-labelledby="enquiry-title"
    >
      <div className="enquiry-section__container">

        {/* LEFT — REACH US */}
        <div className="enquiry-section__contact">
          <ContactMethods />
        </div>

        {/* RIGHT — ENQUIRY FORM */}
        <div className="enquiry-section__form-wrapper">

          <div className="enquiry-section__form-header">
            <p className="enquiry-section__eyebrow">
              <span aria-hidden="true">›</span> SEND AN ENQUIRY
            </p>

            <h2 id="enquiry-title">
              How Can We Help You?
            </h2>

            <p>
              Select your audience and share your requirements with the
              SPRINT team.
            </p>
          </div>

          {/* AUDIENCE SELECTOR */}
          <div
            className="enquiry-audience"
            role="group"
            aria-label="Select your audience"
          >
            {audiences.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`enquiry-audience__button ${
                  audience === item.id
                    ? "enquiry-audience__button--active"
                    : ""
                }`}
                onClick={() => setAudience(item.id)}
                aria-pressed={audience === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* DYNAMIC FORM */}
          <div className="enquiry-form">

            {/* STUDENT */}
            {audience === "student" && <StudentForm />}

            {/* WORKING PROFESSIONAL */}
            {audience === "professional" && (
              <WorkingProfessionalForm />
            )}

            {/* INSTITUTE */}
            {audience === "institute" && <InstituteForm />}
            
            {/* COMPANY / ENTERPRISE */}
            {audience === "company" && (
              <CompanyForm />
            )}

          </div>

        </div>
      </div>
    </section>
  );
}