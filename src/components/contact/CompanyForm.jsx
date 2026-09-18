"use client";

import { useState } from "react";

const purposeTypes = [
  "Partnership",
  "Hiring",
  "Internships",
  "Personality Development",
  "SME Skill Development",
];

const generateMessage = (selectedPurposes) => {
  if (selectedPurposes.length === 0) {
    return "";
  }

  let purposeText;

  if (selectedPurposes.length === 1) {
    purposeText = selectedPurposes[0];
  } else if (selectedPurposes.length === 2) {
    purposeText = `${selectedPurposes[0]} and ${selectedPurposes[1]}`;
  } else {
    purposeText = `${selectedPurposes.slice(0, -1).join(", ")} and ${
      selectedPurposes[selectedPurposes.length - 1]
    }`;
  }

  return `We are interested in exploring ${purposeText} opportunities with SPRINT. We would like to discuss the relevant programs, requirements, process and possible collaboration options.`;
};

export default function CompanyForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    domain: "",
    contactPerson: "",
    role: "",
    email: "",
    phone: "",
    website: "",
    availableTime: "",
    purposes: [],
    message: "",
    privacy: false,
  });

  const [purposeOpen, setPurposeOpen] = useState(false);
  const [messageEdited, setMessageEdited] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePurposeChange = (purpose) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.purposes.includes(purpose);

      const updatedPurposes = alreadySelected
        ? previous.purposes.filter((item) => item !== purpose)
        : [...previous.purposes, purpose];

      return {
        ...previous,
        purposes: updatedPurposes,
        message: messageEdited
          ? previous.message
          : generateMessage(updatedPurposes),
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

    console.log("Company / Enterprise enquiry:", formData);
  };

  const selectedPurposeText =
    formData.purposes.length === 0
      ? "Select purpose(s)"
      : formData.purposes.length === 1
        ? formData.purposes[0]
        : `${formData.purposes.length} purposes selected`;

  return (
    <form
      className="company-form"
      onSubmit={handleSubmit}
    >
      {/* COMPANY NAME */}
      <div className="company-form__field">
        <label htmlFor="company-name">
          Company Name <span aria-hidden="true">*</span>
        </label>

        <input
          id="company-name"
          name="companyName"
          type="text"
          placeholder="Enter company name"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
      </div>

      {/* DOMAIN */}
      <div className="company-form__field">
        <label htmlFor="company-domain">
          Domain
        </label>

        <input
          id="company-domain"
          name="domain"
          type="text"
          placeholder="e.g. IT, Finance, Healthcare"
          value={formData.domain}
          onChange={handleChange}
        />
      </div>

      {/* CONTACT PERSON */}
      <div className="company-form__field">
        <label htmlFor="company-contact-person">
          Contact Person Name{" "}
          <span aria-hidden="true">*</span>
        </label>

        <input
          id="company-contact-person"
          name="contactPerson"
          type="text"
          placeholder="Enter contact person name"
          value={formData.contactPerson}
          onChange={handleChange}
          required
        />
      </div>

      {/* ROLE */}
      <div className="company-form__field">
        <label htmlFor="company-role">
          Role
        </label>

        <input
          id="company-role"
          name="role"
          type="text"
          placeholder="Enter your role"
          value={formData.role}
          onChange={handleChange}
        />
      </div>

      {/* EMAIL */}
      <div className="company-form__field">
        <label htmlFor="company-email">
          Official Email Address{" "}
          <span aria-hidden="true">*</span>
        </label>

        <input
          id="company-email"
          name="email"
          type="email"
          placeholder="Enter official email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* PHONE */}
      <div className="company-form__field">
        <label htmlFor="company-phone">
          Official Phone Number{" "}
          <span aria-hidden="true">*</span>
        </label>

        <input
          id="company-phone"
          name="phone"
          type="tel"
          placeholder="Enter official phone number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* WEBSITE */}
      <div className="company-form__field">
        <label htmlFor="company-website">
          Company Website
        </label>

        <input
          id="company-website"
          name="website"
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      {/* AVAILABLE TIME */}
      <div className="company-form__field">
        <label htmlFor="company-available-time">
          Available Time <span aria-hidden="true">*</span>
        </label>

        <select
          id="company-available-time"
          name="availableTime"
          value={formData.availableTime}
          onChange={handleChange}
          required
        >
          <option value="">
            Select preferred time
          </option>
          <option value="9:00 AM - 11:00 AM">
            9:00 AM – 11:00 AM
          </option>
          <option value="11:00 AM - 1:00 PM">
            11:00 AM – 1:00 PM
          </option>
          <option value="1:00 PM - 3:00 PM">
            1:00 PM – 3:00 PM
          </option>
          <option value="3:00 PM - 5:00 PM">
            3:00 PM – 5:00 PM
          </option>
          <option value="5:00 PM - 7:00 PM">
            5:00 PM – 7:00 PM
          </option>
        </select>
      </div>

      {/* PURPOSE TYPE */}
      <div className="company-form__field company-form__field--full">
        <label>
          Purpose Type <span aria-hidden="true">*</span>
        </label>

        <div className="company-purpose-selector">
          <button
            type="button"
            className="company-purpose-selector__trigger"
            onClick={() =>
              setPurposeOpen((previous) => !previous)
            }
            aria-expanded={purposeOpen}
            aria-haspopup="listbox"
          >
            <span>{selectedPurposeText}</span>

            <span
              className={`company-purpose-selector__arrow ${
                purposeOpen
                  ? "company-purpose-selector__arrow--open"
                  : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {purposeOpen && (
            <div
              className="company-purpose-selector__menu"
              role="listbox"
              aria-multiselectable="true"
            >
              {purposeTypes.map((purpose) => {
                const selected =
                  formData.purposes.includes(purpose);

                return (
                  <label
                    key={purpose}
                    className="company-purpose-selector__option"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handlePurposeChange(purpose)
                      }
                    />

                    <span>{purpose}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE */}
      <div className="company-form__field company-form__field--full">
        <label htmlFor="company-message">
          Message
        </label>

        <textarea
          id="company-message"
          name="message"
          rows="3"
          maxLength="1000"
          placeholder="Tell us about your business requirement..."
          value={formData.message}
          onChange={handleMessageChange}
        />

        <div className="company-form__counter">
          {formData.message.length}/1000
        </div>
      </div>

      {/* PRIVACY */}
      <div className="company-form__privacy">
        <input
          id="company-privacy"
          name="privacy"
          type="checkbox"
          checked={formData.privacy}
          onChange={handleChange}
          required
        />

        <label htmlFor="company-privacy">
          By submitting this form, you agree that SPRINT may
          contact you regarding your enquiry. Please read our
          Privacy Policy.
        </label>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="company-form__submit"
      >
        Submit Enquiry →
      </button>
    </form>
  );
}