"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import StudentLoginPage from "@/app/student/login/page";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export default function StudentPortalModal({ onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      } else {
        document
          .querySelector(".sprint-site-header button[aria-label='Open navigation menu']")
          ?.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      className="student-portal-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="student-portal-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Student Portal sign in"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="student-portal-modal-close"
          onClick={onClose}
          aria-label="Close Student Portal"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <StudentLoginPage isModal />
      </section>
    </div>
  );
}
