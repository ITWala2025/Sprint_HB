import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CourseCurriculum from "@/components/courses/CourseDetail";
import DetailPage from "@/components/courses/DetailPage";
import { bundles, courses } from "@/data/courses";
import { getProgram, programs } from "@/data/programs";

describe("CourseCurriculum", () => {
  it("continues to render the existing course and bundle curriculum format", () => {
    const course = courses[0];
    const bundle = bundles[0];

    render(
      <>
        <CourseCurriculum curriculum={course.curriculum} />
        <CourseCurriculum curriculum={bundle.curriculum} />
      </>,
    );

    expect(
      screen.getByRole("button", { name: /Module 01 Build the foundation/ }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(`How ${course.title} is used in real teams`),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Module 01 Foundation/ }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Build essential knowledge")).toBeVisible();
  });

  it("renders and expands a three-level program curriculum", async () => {
    const user = userEvent.setup();
    const curriculum = [
      {
        label: "Stage",
        title: "Foundations",
        children: [
          {
            label: "Learning Area",
            title: "Programming",
            topics: ["Confirmed programming topic"],
          },
        ],
      },
    ];

    render(<CourseCurriculum curriculum={curriculum} />);

    const stage = screen.getByRole("button", { name: /Stage Foundations/ });
    expect(stage).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Learning Area")).toBeInTheDocument();

    const learningArea = screen.getByRole("button", {
      name: /Learning Area Programming/,
    });
    await user.click(learningArea);

    expect(learningArea).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Confirmed programming topic")).toBeVisible();
  });

  it("renders four hierarchy levels and expands and collapses independently", async () => {
    const user = userEvent.setup();
    const curriculum = [
      {
        label: "Year",
        title: "Year 1 — Foundations",
        children: [
          {
            label: "Term",
            title: "Term 1",
            children: [
              {
                label: "Learning Area",
                title: "Confirmed area",
                topics: ["Confirmed activity"],
              },
            ],
          },
        ],
      },
    ];

    render(<CourseCurriculum curriculum={curriculum} />);

    const year = screen.getByRole("button", {
      name: /Year Year 1 — Foundations/,
    });
    expect(year).toHaveAttribute("aria-expanded", "true");

    const term = screen.getByRole("button", { name: /Term Term 1/ });
    expect(term).toHaveAttribute("aria-expanded", "false");
    await user.click(term);

    const learningArea = screen.getByRole("button", {
      name: /Learning Area Confirmed area/,
    });
    expect(learningArea).toHaveAttribute("aria-expanded", "false");
    await user.click(learningArea);
    expect(screen.getByText("Confirmed activity")).toBeVisible();

    await user.click(year);
    expect(year).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Confirmed activity")).not.toBeVisible();

    await user.click(year);
    expect(year).toHaveAttribute("aria-expanded", "true");
    expect(term).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Confirmed activity")).toBeVisible();
  });

  it("renders confirmed program data without adding curriculum topics", () => {
    const rise = getProgram("sprint-rise");
    const threeYear = getProgram("sprint-3-year-program");

    expect(programs).toHaveLength(2);
    expect(rise.curriculum.map((stage) => stage.title)).toEqual([
      "Day One",
      "Technical Sessions (124 hours)",
      "Personality Development (46 hours)",
      "Industry Ways of Working (40 hours)",
      "Internship (90 hours)",
      "Industry-Ready",
    ]);
    expect(threeYear.curriculum.map((year) => year.title)).toEqual([
      "Year 1 — Foundations",
      "Year 2 — Ignite",
      "Year 3 — Outperform",
    ]);
    expect(
      rise.curriculum.every(
        (stage) =>
          stage.label === "Program Stage" &&
          stage.children.length === 1 &&
          stage.children[0].label === "Learning Board" &&
          stage.children[0].title === "" &&
          stage.children[0].children.length === 0 &&
          !("topics" in stage.children[0]),
      ),
    ).toBe(true);
    expect(
      threeYear.curriculum.every(
        (year) => year.children.length === 0 && !("topics" in year),
      ),
    ).toBe(true);

    render(
      <>
        <CourseCurriculum curriculum={rise.curriculum} />
        <CourseCurriculum curriculum={threeYear.curriculum} />
      </>,
    );

    expect(screen.getAllByText("Program Stage")).toHaveLength(6);
    expect(screen.getAllByText("Learning Board")).toHaveLength(6);
    expect(screen.getAllByText("Year")).toHaveLength(3);
    expect(
      within(screen.getByText("Year 1 — Foundations").parentElement)
        .getByText("Year"),
    ).toBeInTheDocument();
  });

  it("renders the SPRINT RISE program detail from the shared detail component", async () => {
    const program = getProgram("sprint-rise");
    const { container } = render(await DetailPage({ item: program }));

    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toHaveTextContent("Courses>SPRINT RISE");
    expect(
      screen.getByRole("heading", { level: 1, name: "SPRINT RISE" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(program.description),
    ).toBeInTheDocument();
    expect(screen.getByText("Campus to Corporate in 6 Months")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore curriculum" })).toHaveAttribute(
      "href",
      "#rise-curriculum",
    );
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("6 months")).toBeInTheDocument();
    expect(screen.queryByText("Outcomes")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".course-curriculum__item")).toHaveLength(
      program.curriculum.length * 2,
    );
  });

  it("preserves shared course and bundle detail rendering", async () => {
    const course = courses[0];
    const bundle = bundles[0];

    const courseView = render(await DetailPage({ item: course }));
    expect(
      screen.getByRole("heading", { level: 1, name: course.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Course pathway")).toBeInTheDocument();
    courseView.unmount();

    render(await DetailPage({ item: bundle }));
    expect(
      screen.getByRole("heading", { level: 1, name: bundle.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Learning package · Career Package")).toBeInTheDocument();
    expect(screen.getByText("What you can take forward")).toBeInTheDocument();
  });
});
