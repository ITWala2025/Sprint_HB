import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EducationStep, {
  CURRENT_ROLE_OPTIONS,
} from "@/components/student/enrollment/steps/EducationStep";
import {
  COURSE_FIELD_MESSAGES,
  COURSE_STATUS,
  resolveCourseOptions,
} from "@/components/student/enrollment/enrollment-course-options";
import { catalogueItems } from "@/data/courses";

// Same Supabase mock shape the Course page's tests use — the step queries the
// `courses` table through this chain, never a course list of its own.
const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mocks.from }),
}));

const databaseCourses = [
  {
    id: "course-id-1",
    slug: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    is_published: true,
  },
  {
    id: "course-id-2",
    slug: "cloud-automation",
    title: "Cloud Automation",
    is_published: true,
  },
];

/** The first real course the local catalogue would serve as a fallback. */
const firstLocalCourse = catalogueItems.find((item) => item.kind === "course");

/**
 * A miniature copy of the wizard's shared-state contract: a stateful harness
 * that records every write (`[slice, field, value]`) *and* feeds the new value
 * back into the component, exactly like `EnrollmentWizard` does — so typing
 * accumulates. Every write belongs to this step's own `education` slice; the
 * wizard's cross-slice `onChangeIn` is handed over like it is in the real
 * wizard and only recorded, because this step no longer writes into another
 * step's state.
 */
const renderStep = ({ values: initialValues = {}, errors = {} } = {}) => {
  const writes = [];

  function Harness() {
    const [values, setValues] = useState(initialValues);

    const onChange = (field) => (event) => {
      writes.push(["education", field, event.target.value]);
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
    };

    const onChangeIn = (sliceId) => (field) => (event) => {
      writes.push([sliceId, field, event.target.value]);
    };

    return (
      <EducationStep
        idPrefix="education"
        values={values}
        errors={errors}
        onChange={onChange}
        onChangeIn={onChangeIn}
      />
    );
  }

  render(<Harness />);
  return { writes };
};

describe("EducationStep", () => {
  beforeEach(() => {
    // Default: the table answers but is empty, so the step falls back to the
    // local catalogue — the same behaviour as the Course page.
    mocks.order.mockResolvedValue({ data: [], error: null });
    mocks.eq.mockReturnValue({ order: mocks.order });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
  });

  it("renders the four profile fields as labelled, optional controls", async () => {
    renderStep();

    [/course \/ degree/i, /semester \/ year/i, /^current role/i, /^course$/i].forEach(
      (label) => {
        expect(screen.getByLabelText(label), String(label)).toBeInTheDocument();
      },
    );

    // Nothing on this step is mandatory: no `required` attribute anywhere.
    screen.getAllByRole("textbox").forEach((control) => expect(control).not.toBeRequired());
    screen.getAllByRole("combobox").forEach((control) => expect(control).not.toBeRequired());

    // The course list settles without blocking the rest of the step.
    await waitFor(() => expect(screen.getByLabelText(/^course$/i)).toBeEnabled());
  });

  it("drops College / University, Graduation Year, City, State and the old education fields", () => {
    renderStep();

    [
      /college \/ university/i,
      /graduation year/i,
      /^city/i,
      /^state/i,
      /current education level/i,
      /degree \/ course/i,
      /year \/ semester/i,
      /choose your specialization/i,
    ].forEach((label) => {
      expect(screen.queryByLabelText(label), String(label)).not.toBeInTheDocument();
    });

    // The specialization picker is no longer part of this screen.
    expect(
      screen.queryByRole("group", { name: /choose your specialization/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("offers exactly the four agreed Current Role choices", () => {
    renderStep();

    const roleSelect = screen.getByLabelText(/^current role/i);
    expect(roleSelect.tagName).toBe("SELECT");

    const labels = within(roleSelect)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(labels).toEqual([
      "Select your current role",
      "Student",
      "IT Professional",
      "Non-IT Professional",
      "Working Professional",
    ]);
    expect(CURRENT_ROLE_OPTIONS).toHaveLength(4);
  });

  it("says Loading courses... while the course list is still being fetched", () => {
    // A fetch that never settles keeps the field in its loading state.
    mocks.order.mockReturnValue(new Promise(() => {}));
    renderStep();

    const courseSelect = screen.getByLabelText(/^course$/i);
    expect(courseSelect).toBeDisabled();
    expect(document.getElementById("education-course-hint")).toHaveTextContent(
      COURSE_FIELD_MESSAGES.loading,
    );
    expect(screen.getAllByText(COURSE_FIELD_MESSAGES.loading).length).toBeGreaterThan(0);
  });

  it("lists the published courses from the Course page's database source", async () => {
    const user = userEvent.setup();
    mocks.order.mockResolvedValue({ data: databaseCourses, error: null });
    const { writes } = renderStep();

    const courseSelect = await screen.findByLabelText(/^course$/i);
    await waitFor(() => expect(courseSelect).toBeEnabled());

    // Database rows win over the local fallback — one source, no duplicates.
    expect(within(courseSelect).getByText("Machine Learning Foundations")).toBeInTheDocument();
    expect(within(courseSelect).queryByText(firstLocalCourse.title)).not.toBeInTheDocument();

    await user.selectOptions(courseSelect, "course-id-1");
    expect(courseSelect).toHaveValue("course-id-1");
    expect(writes.at(-1)).toEqual(["education", "course", "course-id-1"]);
  });

  it("falls back to the local catalogue when the API fails, exactly like the Course page", async () => {
    mocks.order.mockResolvedValue({ data: null, error: new Error("network down") });
    renderStep();

    const courseSelect = await screen.findByLabelText(/^course$/i);
    await waitFor(() => expect(courseSelect).toBeEnabled());

    expect(within(courseSelect).getByText(firstLocalCourse.title)).toBeInTheDocument();
    expect(document.getElementById("education-course-hint")).toBeNull();
  });

  it("reports every unavailable state with the agreed copy", () => {
    expect(resolveCourseOptions({ dbRows: [], dbError: null, localItems: [] })).toEqual({
      status: COURSE_STATUS.EMPTY,
      options: [],
    });

    expect(
      resolveCourseOptions({ dbRows: null, dbError: new Error("down"), localItems: [] }),
    ).toEqual({ status: COURSE_STATUS.ERROR, options: [] });

    expect(COURSE_FIELD_MESSAGES.loading).toBe("Loading courses...");
    expect(COURSE_FIELD_MESSAGES.empty).toBe("No courses available");
    expect(COURSE_FIELD_MESSAGES.error).toBe("Unable to load courses. Please try again.");
  });

  it("keeps typed answers as controlled values that survive a re-render", async () => {
    mocks.order.mockResolvedValue({ data: databaseCourses, error: null });
    renderStep({
      values: {
        courseDegree: "B.Tech Computer Science",
        semesterYear: "Final Year",
        currentRole: "IT Professional",
        course: "course-id-1",
      },
    });

    expect(screen.getByLabelText(/course \/ degree/i)).toHaveValue("B.Tech Computer Science");
    expect(screen.getByLabelText(/semester \/ year/i)).toHaveValue("Final Year");
    expect(screen.getByLabelText(/^current role/i)).toHaveValue("IT Professional");

    // The saved course id shows as the selected course once the list lands.
    const courseSelect = await screen.findByLabelText(/^course$/i);
    await waitFor(() => expect(courseSelect).toHaveValue("course-id-1"));
  });

  it("reports profile edits against the education slice", async () => {
    const user = userEvent.setup();
    const { writes } = renderStep();

    await user.type(screen.getByLabelText(/course \/ degree/i), "MCA");
    expect(writes.at(-1)).toEqual(["education", "courseDegree", "MCA"]);

    await user.selectOptions(screen.getByLabelText(/^current role/i), "Student");
    expect(writes.at(-1)).toEqual(["education", "currentRole", "Student"]);
  });

  it("marks the step as optional in its own guidance", () => {
    renderStep();

    expect(screen.getByText("Optional step")).toBeInTheDocument();
    expect(screen.getByText(/can be added later from your Student Dashboard/i)).toBeInTheDocument();
  });
});
