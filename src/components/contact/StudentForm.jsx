"use client";

import { useEffect, useRef, useState } from "react";
import { submitContactEnquiry } from "@/components/contact/contactSubmission";

const courses = [
  "Artificial Intelligence",
  "Full Stack Development",
  "Data Science",
  "Cloud Computing",
  "Cyber Security",
];

const generateMessage = (selectedCourses) => {
  if (selectedCourses.length === 0) {
    return "";
  }

  let courseText;

  if (selectedCourses.length === 1) {
    courseText = selectedCourses[0];
  } else if (selectedCourses.length === 2) {
    courseText = `${selectedCourses[0]} and ${selectedCourses[1]}`;
  } else {
    courseText = `${selectedCourses.slice(0, -1).join(", ")} and ${
      selectedCourses[selectedCourses.length - 1]
    }`;
  }

  return `I'm interested in the ${courseText} course${
    selectedCourses.length > 1 ? "s" : ""
  }. I would like to know more about the course details, eligibility, fees and upcoming batches.`;
};

export default function StudentForm({ audience = "student" }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    courses: [],
    message: "",
    privacy: false,
  });

  const [courseOpen, setCourseOpen] = useState(false);
  const [messageEdited, setMessageEdited] = useState(false);
  const [submission, setSubmission] = useState({ status: "idle", message: "" });
  const courseDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target)
      ) {
        setCourseOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCourseChange = (course) => {
    setFormData((previous) => {
      const alreadySelected = previous.courses.includes(course);

      const updatedCourses = alreadySelected
        ? previous.courses.filter((item) => item !== course)
        : [...previous.courses, course];

      const generatedMessage = generateMessage(updatedCourses);

      return {
        ...previous,
        courses: updatedCourses,
        message: messageEdited
          ? previous.message
          : generatedMessage,
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmission({ status: "loading", message: "Sending your enquiry..." });

    try {
      const result = await submitContactEnquiry({
        audience,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        course: formData.courses,
        message: formData.message,
        privacy: formData.privacy,
      });
      setSubmission({ status: "success", message: result.message });
      setFormData((previous) => ({
        ...previous,
        fullName: "",
        email: "",
        phone: "",
        courses: [],
        message: "",
        privacy: false,
      }));
      setMessageEdited(false);
    } catch (error) {
      setSubmission({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to send your enquiry.",
      });
    }
  };

  const selectedCourseText =
    formData.courses.length === 0
      ? "Select course(s)"
      : formData.courses.length === 1
        ? formData.courses[0]
        : `${formData.courses.length} courses selected`;

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      {/* Full Name */}
      <div className="student-form__field">
        <label htmlFor="student-full-name">
          Full Name <span aria-hidden="true">*</span>
        </label>

        <input
          id="student-full-name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Email */}
      <div className="student-form__field">
        <label htmlFor="student-email">
          Email Address <span aria-hidden="true">*</span>
        </label>

        <input
          id="student-email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* Phone */}
      <div className="student-form__field">
        <label htmlFor="student-phone">
          Phone Number <span aria-hidden="true">*</span>
        </label>

        <input
          id="student-phone"
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* Interested Courses */}
      <div className="student-form__field student-form__course-field">
        <label id="student-course-label">
          Interested Course(s) <span aria-hidden="true">*</span>
        </label>

        <div className="contact-multiselect" ref={courseDropdownRef}>
          <button
            type="button"
            className={`contact-multiselect__trigger ${
              courseOpen ? "contact-multiselect__trigger--open" : ""
            }`}
            onClick={() => setCourseOpen((previous) => !previous)}
            aria-expanded={courseOpen}
            aria-haspopup="listbox"
            aria-labelledby="student-course-label"
          >
            <span
              className={`contact-multiselect__selected ${
                formData.courses.length > 0
                  ? "contact-multiselect__selected--active"
                  : ""
              }`}
            >
              {selectedCourseText}
            </span>

            <span
              className={`contact-multiselect__arrow ${
                courseOpen ? "contact-multiselect__arrow--open" : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {courseOpen && (
            <div
              className="contact-multiselect__menu"
              role="listbox"
              aria-multiselectable="true"
            >
              {courses.map((course) => {
                const selected = formData.courses.includes(course);

                return (
                  <label
                    key={course}
                    className={`contact-multiselect__option ${
                      selected
                        ? "contact-multiselect__option--selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleCourseChange(course)}
                      className="contact-multiselect__checkbox"
                    />

                    <span
                      className={`contact-multiselect__checkmark ${
                        selected
                          ? "contact-multiselect__checkmark--checked"
                          : ""
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? "✓" : ""}
                    </span>

                    <span className="contact-multiselect__option-text">
                      {course}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="student-form__field">
        <label htmlFor="student-message">
          Message / Query
        </label>

        <textarea
          id="student-message"
          name="message"
          rows="3"
          maxLength="1000"
          placeholder="Tell us how we can help you..."
          value={formData.message}
          onChange={handleMessageChange}
        />

        <div className="student-form__counter">
          {formData.message.length}/1000
        </div>
      </div>

      {/* Privacy */}
      <div className="student-form__privacy">
        <input
          id="student-privacy"
          name="privacy"
          type="checkbox"
          checked={formData.privacy}
          onChange={handleChange}
          required
        />

        <label htmlFor="student-privacy">
          By submitting this form, you agree that SPRINT may contact you
          regarding your enquiry. Please read our Privacy Policy.
        </label>
      </div>

      {/* Submit */}
      {submission.status === "loading" && (
        <div className="contact-form__alert contact-form__alert--loading" role="status">
          {submission.message}
        </div>
      )}
      {submission.status === "success" && (
        <div className="contact-form__alert contact-form__alert--success" role="status">
          {submission.message}
        </div>
      )}
      {submission.status === "error" && (
        <div className="contact-form__alert contact-form__alert--error" role="alert">
          {submission.message}
        </div>
      )}
      <button
        type="submit"
        className="student-form__submit"
        disabled={submission.status === "loading"}
      >
        {submission.status === "loading" ? "Sending..." : "Submit Enquiry →"}
      </button>
    </form>
  );
}