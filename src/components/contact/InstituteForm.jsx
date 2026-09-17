"use client";

import { useState } from "react";

const services = [
  "Training",
  "Workshop",
  "Course",
];

const generateMessage = (selectedServices) => {
  if (selectedServices.length === 0) {
    return "";
  }

  let serviceText;

  if (selectedServices.length === 1) {
    serviceText = selectedServices[0];
  } else if (selectedServices.length === 2) {
    serviceText = `${selectedServices[0]} and ${selectedServices[1]}`;
  } else {
    serviceText = `${selectedServices.slice(0, -1).join(", ")} and ${
      selectedServices[selectedServices.length - 1]
    }`;
  }

  return `We are interested in ${serviceText} services for our institute. We would like to know more about the available programs, duration, pricing and delivery options.`;
};

export default function InstituteForm() {
  const [formData, setFormData] = useState({
    instituteName: "",
    contactPerson: "",
    designation: "",
    email: "",
    phone: "",
    website: "",
    services: [],
    contactTime: "",
    message: "",
    privacy: false,
  });

  const [serviceOpen, setServiceOpen] = useState(false);
  const [messageEdited, setMessageEdited] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.services.includes(service);

      const updatedServices = alreadySelected
        ? previous.services.filter((item) => item !== service)
        : [...previous.services, service];

      return {
        ...previous,
        services: updatedServices,
        message: messageEdited
          ? previous.message
          : generateMessage(updatedServices),
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

    console.log("Institute enquiry:", formData);
  };

  const selectedServiceText =
    formData.services.length === 0
      ? "Select service(s)"
      : formData.services.length === 1
        ? formData.services[0]
        : `${formData.services.length} services selected`;

  return (
    <form
      className="institute-form"
      onSubmit={handleSubmit}
    >
      {/* INSTITUTE NAME */}
      <div className="institute-form__field">
        <label htmlFor="institute-name">
          Institute Name <span aria-hidden="true">*</span>
        </label>

        <input
          id="institute-name"
          name="instituteName"
          type="text"
          placeholder="Enter institute name"
          value={formData.instituteName}
          onChange={handleChange}
          required
        />
      </div>

      {/* CONTACT PERSON */}
      <div className="institute-form__field">
        <label htmlFor="institute-contact-person">
          Contact Person Name{" "}
          <span aria-hidden="true">*</span>
        </label>

        <input
          id="institute-contact-person"
          name="contactPerson"
          type="text"
          placeholder="Enter contact person name"
          value={formData.contactPerson}
          onChange={handleChange}
          required
        />
      </div>

      {/* DESIGNATION */}
      <div className="institute-form__field">
        <label htmlFor="institute-designation">
          Designation / Role
        </label>

        <input
          id="institute-designation"
          name="designation"
          type="text"
          placeholder="Enter designation or role"
          value={formData.designation}
          onChange={handleChange}
        />
      </div>

      {/* EMAIL */}
      <div className="institute-form__field">
        <label htmlFor="institute-email">
          Official Email <span aria-hidden="true">*</span>
        </label>

        <input
          id="institute-email"
          name="email"
          type="email"
          placeholder="Enter official email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* PHONE */}
      <div className="institute-form__field">
        <label htmlFor="institute-phone">
          Phone Number <span aria-hidden="true">*</span>
        </label>

        <input
          id="institute-phone"
          name="phone"
          type="tel"
          placeholder="Enter official phone number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* WEBSITE */}
      <div className="institute-form__field">
        <label htmlFor="institute-website">
          Institute Website
        </label>

        <input
          id="institute-website"
          name="website"
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      {/* SERVICES */}
      <div className="institute-form__field institute-form__field--full">
        <label>
          Services <span aria-hidden="true">*</span>
        </label>

        <div className="institute-service-selector">
          <button
            type="button"
            className="institute-service-selector__trigger"
            onClick={() =>
              setServiceOpen((previous) => !previous)
            }
            aria-expanded={serviceOpen}
            aria-haspopup="listbox"
          >
            <span>{selectedServiceText}</span>

            <span
              className={`institute-service-selector__arrow ${
                serviceOpen
                  ? "institute-service-selector__arrow--open"
                  : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {serviceOpen && (
            <div
              className="institute-service-selector__menu"
              role="listbox"
              aria-multiselectable="true"
            >
              {services.map((service) => {
                const selected =
                  formData.services.includes(service);

                return (
                  <label
                    key={service}
                    className="institute-service-selector__option"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handleServiceChange(service)
                      }
                    />

                    <span>{service}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PREFERRED CONTACT TIME */}
      <div className="institute-form__field">
        <label htmlFor="institute-contact-time">
          Preferred Contact Time{" "}
          <span aria-hidden="true">*</span>
        </label>

        <select
          id="institute-contact-time"
          name="contactTime"
          value={formData.contactTime}
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

      {/* MESSAGE */}
      <div className="institute-form__field institute-form__field--full">
        <label htmlFor="institute-message">
          Training / Requirement Message
        </label>

        <textarea
          id="institute-message"
          name="message"
          rows="5"
          maxLength="1000"
          placeholder="Tell us about your training or institutional requirements..."
          value={formData.message}
          onChange={handleMessageChange}
        />

        <div className="institute-form__counter">
          {formData.message.length}/1000
        </div>
      </div>

      {/* PRIVACY */}
      <div className="institute-form__privacy">
        <input
          id="institute-privacy"
          name="privacy"
          type="checkbox"
          checked={formData.privacy}
          onChange={handleChange}
          required
        />

        <label htmlFor="institute-privacy">
          By submitting this form, you agree that SPRINT may
          contact you regarding your enquiry. Please read our
          Privacy Policy.
        </label>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="institute-form__submit"
      >
        Submit Enquiry →
      </button>
    </form>
  );
}