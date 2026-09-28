"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  X,
} from "lucide-react";

/**
 * Role Detail Modal — bottom sheet on mobile, centered dialog from `sm` up.
 *
 * Opened from an OpenPositions card (the card body or its Apply action) and
 * dismissible three ways: the close button, a click on the backdrop, and the
 * Escape key. Focus moves into the dialog on open, stays inside it while
 * tabbing, and returns to the triggering card on close.
 *
 * Styling reuses the shared brand tokens (navy/red/surfaces/borders), the
 * `font-display` heading face, `rounded-2xl` panels and the site's existing
 * modal shell idiom used by the admin dialogs.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/* Shared with the OpenPositions cards so badge label/colour never drift. */
export const roleTypeLabel = (type) =>
  type === "internship" ? "Internship" : "Full-time";

export const roleTypeBadgeClass = (type) =>
  type === "internship"
    ? "bg-sky-500/15 text-sky-700"
    : "bg-violet-500/15 text-violet-700";

export const formatPostedDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently posted";

function DetailList({ heading, items }) {
  if (!items?.length) return null;

  return (
    <section className="mt-6">
      <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-brand-red">
        {heading}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2.5 text-sm leading-relaxed text-brand-text-secondary"
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-brand-red"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RoleDetailModal({ role, applyHref, onClose }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  const titleId = `${role.id}-detail-title`;
  const descriptionId = `${role.id}-detail-description`;
  const postedDate = formatPostedDate(role.postedDate);

  const meta = [
    { label: "Duration", value: role.duration, Icon: Clock },
    { label: "Salary / Stipend", value: role.stipend, Icon: IndianRupee },
    { label: "Posted on", value: postedDate, Icon: CalendarDays },
  ].filter((item) => Boolean(item.value));

  /* Escape dismisses the dialog; Tab is kept inside it while it is open. */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !panelRef.current.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /* Lock the page behind the dialog, focus inside it, restore focus on close. */
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-brand-white shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-brand-border px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${roleTypeBadgeClass(
                role.type,
              )}`}
            >
              {roleTypeLabel(role.type)}
            </span>
            <h2
              id={titleId}
              className="mt-3 font-display text-xl font-bold text-brand-navy sm:text-2xl"
            >
              {role.title}
            </h2>
            <p className="mt-2 flex items-start gap-1.5 text-sm text-brand-text-secondary">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-brand-red"
                aria-hidden="true"
              />
              <span>{role.location}</span>
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="sprint-focus flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-border text-brand-text-muted transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <dl className="grid gap-3 sm:grid-cols-3">
            {meta.map(({ label, value, Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-brand-border bg-brand-off-white p-3.5"
              >
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
                  <Icon className="size-3.5 text-brand-red" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-brand-navy">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <section className="mt-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-brand-red">
              About the role
            </h3>
            <p
              id={descriptionId}
              className="mt-3 text-sm leading-relaxed text-brand-text-secondary sm:text-base"
            >
              {role.description}
            </p>
          </section>

          <DetailList heading="Responsibilities" items={role.responsibilities} />
          <DetailList heading="Requirements" items={role.requirements} />
        </div>

        <footer className="border-t border-brand-border bg-brand-off-white px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-brand-text-muted">
              Opens your email app with this role pre-filled.
            </p>
            <a
              href={applyHref}
              className="sprint-focus inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-base font-semibold text-white shadow-brand-cta transition-colors hover:bg-brand-red-dark sm:w-auto"
            >
              Apply for this role
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
