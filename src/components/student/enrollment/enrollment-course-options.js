/**
 * Course options for Step 2's "Course" dropdown.
 *
 * One source of truth, mirroring the SPRINT Course page exactly: the Supabase
 * `courses` table (published rows) is fetched by the step, and this module
 * decides what the dropdown shows from that result — with the local catalogue
 * (`src/data/courses.js`, the same `items` array CourseCatalogue starts from)
 * as the fallback when the API errors or is empty. Course names never live
 * here: options are always built from whichever of those two sources answered.
 *
 * The statuses cover every state the field can be in while the step is on
 * screen, so the select can never crash the page on a temporary API failure.
 */
export const COURSE_STATUS = {
  LOADING: "loading",
  READY: "ready",
  EMPTY: "empty",
  ERROR: "error",
};

/** Copy for the non-ready states, shown as the field's hint. */
export const COURSE_FIELD_MESSAGES = {
  loading: "Loading courses...",
  empty: "No courses available",
  error: "Unable to load courses. Please try again.",
};

/** Database rows → options; the value is the course id the backend expects. */
export function toCourseOptions(rows = []) {
  return rows
    .filter((row) => row?.id && row?.title)
    .map((row) => ({ value: row.id, label: row.title }));
}

/** Local catalogue courses → options (static items carry a slug, not a UUID). */
export function toLocalCourseOptions(items = []) {
  return items
    .filter((item) => item?.kind === "course" && item?.title)
    .map((item) => ({ value: item.slug ?? item.id, label: item.title }));
}

/**
 * Decide the dropdown's state from the fetch result.
 *
 * Same precedence as CourseCatalogue: published database rows win; otherwise
 * the local catalogue keeps the page working when the API is down or empty;
 * only when *both* sources have nothing does the field report empty/error —
 * and even then the step renders, it just has nothing to offer.
 *
 * @returns {{ status: string, options: { value: string, label: string }[] }}
 */
export function resolveCourseOptions({ dbRows, dbError, localItems = [] } = {}) {
  if (!dbError && Array.isArray(dbRows) && dbRows.length) {
    const options = toCourseOptions(dbRows);
    if (options.length) return { status: COURSE_STATUS.READY, options };
  }

  const localOptions = toLocalCourseOptions(localItems);
  if (localOptions.length) return { status: COURSE_STATUS.READY, options: localOptions };

  return {
    status: dbError ? COURSE_STATUS.ERROR : COURSE_STATUS.EMPTY,
    options: [],
  };
}
