/**
 * Shared date formatting for the Student Portal widgets.
 * One locale (en-IN) keeps the portal consistent with the public pages.
 */

const SHORT_DATE_OPTIONS = { day: "numeric", month: "short", year: "numeric" };

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** e.g. "15 Jul 2026" */
export const formatShortDate = (value) => {
  const date = toDate(value);
  return date ? date.toLocaleDateString("en-IN", SHORT_DATE_OPTIONS) : "—";
};

/** e.g. "1 Jul 2026 → 15 Jan 2027" */
export const formatDateRange = (start, end, separator = " → ") =>
  `${formatShortDate(start)}${separator}${formatShortDate(end)}`;
