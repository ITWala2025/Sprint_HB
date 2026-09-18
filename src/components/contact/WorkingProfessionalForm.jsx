"use client";

import { useState } from "react";

const programs = [
  "Artificial Intelligence",
  "Full Stack Development",
  "Data Science",
  "Cloud Computing",
  "Cyber Security",
];

const generateMessage = (selectedPrograms) => {
  if (selectedPrograms.length === 0) {
    return "";
  }

  let programText;

  if (selectedPrograms.length === 1) {
    programText = selectedPrograms[0];
  } else if (selectedPrograms.length === 2) {
    programText = `${selectedPrograms[0]} and ${selectedPrograms[1]}`;
  } else {
    programText = `${selectedPrograms.slice(0, -1).join(", ")} and ${
      selectedPrograms[selectedPrograms.length - 1]
    }`;
  }

  return `I'm interested in the ${programText} ${
    selectedPrograms.length > 1 ? "programs" : "program"
  } as a working professional. I would like to know about the curriculum, duration, schedule and learning options.`;
};

export default function WorkingProfessionalForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    designation: "",
    experience: "",
    email: "",
    phone: "",
    programs: [],
    message: "",
    privacy: false,
  });

  const [programOpen, setProgramOpen] = useState(false);
  const [messageEdited, setMessageEdited] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProgramChange = (program) => {
    setFormData((previous) => {
      const alreadySelected = previous.programs.includes(program);

      const updatedPrograms = alreadySelected
        ? previous.programs.filter((item) => item !== program)
        : [...previous.programs, program];

      return {
        ...previous,
        programs: updatedPrograms,
        message: messageEdited
          ? previous.message
          : generateMessage(updatedPrograms),
      };
    });
  };

  const handleMessageChange = (event) => {
    setMessageEdited(true);

    setFormData((previous) => ({
      ...previous,
      message: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Working professional enquiry:", formData);
  };

  const selectedProgramText =
    formData.programs.length === 0
      ? "Select program(s)"
      : formData.programs.length === 1
        ? formData.programs[0]
        : `${formData.programs.length} programs selected`;

  return (
    <form
      className="professional-form"
      onSubmit={handleSubmit}
    >
      {/* FULL NAME */}
      <div className="professional-form__field">
        <label htmlFor="professional-full-name">
          Full Name <span aria-hidden="true">*</span>
        </label>

        <input
          id="professional-full-name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      {/* CURRENT COMPANY */}
      <div className="professional-form__field">
        <label htmlFor="professional-company">
          Current Company
        </label>

        <input
          id="professional-company"
          name="company"
          type="text"
          placeholder="Enter your company name"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      {/* CURRENT DESIGNATION */}
      <div className="professional-form__field">
        <label htmlFor="professional-designation">
          Current Designation <span aria-hidden="true">*</span>
        </label>

        <input
          id="professional-designation"
          name="designation"
          type="text"
          placeholder="Enter your current role"
          value={formData.designation}
          onChange={handleChange}
          required
        />
      </div>

      {/* TOTAL EXPERIENCE */}
      <div className="professional-form__field">
        <label htmlFor="professional-experience">
          Total Experience
        </label>

        <select
          id="professional-experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
        >
          <option value="">Select experience</option>
          <option value="0-1 years">0–1 years</option>
          <option value="1-3 years">1–3 years</option>
          <option value="3-5 years">3–5 years</option>
          <option value="5-10 years">5–10 years</option>
          <option value="10+ years">10+ years</option>
        </select>
      </div>

      {/* EMAIL */}
      <div className="professional-form__field">
        <label htmlFor="professional-email">
          Email Address <span aria-hidden="true">*</span>
        </label>

        <input
          id="professional-email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* PHONE */}
      <div className="professional-form__field">
        <label htmlFor="professional-phone">
          Phone Number <span aria-hidden="true">*</span>
        </label>

        <input
          id="professional-phone"
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* INTERESTED PROGRAMS */}
      <div className="professional-form__field professional-form__field--full">
        <label>
          Interested Program / Course{" "}
          <span aria-hidden="true">*</span>
        </label>

        <div className="professional-program-selector">
          <button
            type="button"
            className="professional-program-selector__trigger"
            onClick={() =>
              setProgramOpen((previous) => !previous)
            }
            aria-expanded={programOpen}
            aria-haspopup="listbox"
          >
            <span>{selectedProgramText}</span>

            <span
              className={`professional-program-selector__arrow ${
                programOpen
                  ? "professional-program-selector__arrow--open"
                  : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {programOpen && (
            <div
              className="professional-program-selector__menu"
              role="listbox"
              aria-multiselectable="true"
            >
              {programs.map((program) => {
                const selected =
                  formData.programs.includes(program);

                return (
                  <label
                    key={program}
                    className="professional-program-selector__option"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handleProgramChange(program)
                      }
                    />

                    <span>{program}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE */}
      <div className="professional-form__field professional-form__field--full">
        <label htmlFor="professional-message">
          Message / Query
        </label>

        <textarea
          id="professional-message"
          name="message"
          rows="3"
          maxLength="1000"
          placeholder="Tell us about your learning or career goals..."
          value={formData.message}
          onChange={handleMessageChange}
        />

        <div className="professional-form__counter">
          {formData.message.length}/1000
        </div>
      </div>

      {/* PRIVACY */}
      <div className="professional-form__privacy">
        <input
          id="professional-privacy"
          name="privacy"
          type="checkbox"
          checked={formData.privacy}
          onChange={handleChange}
          required
        />

        <label htmlFor="professional-privacy">
          By submitting this form, you agree that SPRINT may
          contact you regarding your enquiry. Please read our
          Privacy Policy.
        </label>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="professional-form__submit"
      >
        Submit Enquiry →
      </button>
    </form>
  );
}