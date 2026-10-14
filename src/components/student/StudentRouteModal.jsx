"use client";

import { useCallback, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { StudentRouteModalContext } from "@/components/student/StudentRouteModalContext";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export default function StudentRouteModal({
  children,
  title,
  contentClassName = "student-route-modal-content",
}) {
  const router = useRouter();
  const { backgroundPath, historyDepth } = useContext(StudentRouteModalContext);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const closeModal = useCallback(() => {
    if (backgroundPath && historyDepth > 0) {
      window.history.go(-historyDepth);
      return;
    }

    router.replace(backgroundPath ?? "/home");
  }, [backgroundPath, historyDepth, router]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
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

      const previousFocus = previousFocusRef.current;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [closeModal]);

  return (
    <div
      className="student-route-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        ref={dialogRef}
        className="student-route-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="student-route-modal-close"
          onClick={closeModal}
          aria-label="Close student page"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className={contentClassName}>{children}</div>
      </section>
    </div>
  );
}
