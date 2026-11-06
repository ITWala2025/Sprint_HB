import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseCatalogue from "@/components/courses/CourseCatalogue";
import { catalogueItems } from "@/data/courses";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    results: {},
    queries: [],
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({ from: mocks.from }),
}));

const databaseCourse = {
    id: "database-course-1",
    slug: "mathematics-for-machine-learning",
    title: "Mathematics for Machine Learning",
    category: "Artificial Intelligence & ML",
    audience: "undergraduate",
    audience_type: "undergraduate",
    delivery_method: "Hybrid",
    difficulty_level: "Intermediate",
    duration: "12 weeks",
    description: "Build the mathematical foundations behind machine learning.",
    tools: ["Python", "NumPy"],
    thumbnail_url: null,
    is_published: true,
};

describe("CourseCatalogue Supabase integration", () => {
    beforeEach(() => {
        window.history.replaceState({}, "", "/courses");
        mocks.results = {};
        mocks.queries = [];
        mocks.results.courses = {
            data: [databaseCourse, {
                ...databaseCourse,
                id: "database-course-2",
                slug: "cloud-automation",
                title: "Cloud Automation",
                category: "Cloud & DevOps",
                audience: "working_professional",
                audience_type: "working_professional",
                difficulty_level: "Beginner",
                description: "Automate cloud operations with practical workflows.",
                tools: ["Terraform"],
            }],
            error: null,
        };
        mocks.results.learning_paths = { data: [], error: null };
        mocks.results.course_bundles = { data: [], error: null };
        mocks.from.mockImplementation((table) => {
            mocks.queries.push(table);
            return {
                select: (columns) => {
                    expect(columns).toBe("*");
                    return {
                        eq: (column, value) => {
                            expect(column).toBe("is_published");
                            expect(value).toBe(true);
                            return {
                                order: () => Promise.resolve(mocks.results[table]),
                            };
                        },
                    };
                },
            };
        });
    });

    it("renders and filters published database courses using the public card model", async () => {
        const user = userEvent.setup();
        render(<CourseCatalogue items={catalogueItems} />);

        expect(await screen.findByRole("heading", { name: databaseCourse.title })).toBeInTheDocument();
        expect(mocks.queries).toEqual(expect.arrayContaining(["courses", "learning_paths", "course_bundles"]));
        expect(screen.getByText("Course", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText("12 weeks")).toBeInTheDocument();
        expect(screen.getByText("Intermediate", { selector: ".course-tile__chips span" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: `Know more about ${databaseCourse.title}` })).toHaveAttribute("href", `/courses/${databaseCourse.slug}?audience=student`);

        await user.click(screen.getByRole("button", { name: /filter & sort/i }));
        await user.click(screen.getByRole("checkbox", { name: databaseCourse.category }));
        expect(screen.getByRole("heading", { name: databaseCourse.title })).toBeInTheDocument();
        await user.click(screen.getByRole("radio", { name: "Intermediate" }));
        expect(screen.queryByRole("heading", { name: "Cloud Automation" })).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Clear filters" }));
        await user.click(screen.getByRole("tab", { name: "IT Professionals" }));
        expect(await screen.findByRole("heading", { name: "Cloud Automation" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: databaseCourse.title })).not.toBeInTheDocument();
    });

    it("falls back to local catalogue courses when the database is empty", async () => {
        mocks.results.courses = { data: [], error: null };
        render(<CourseCatalogue items={catalogueItems} />);

        await waitFor(() => expect(screen.getByRole("heading", { name: "Python & AI Foundations" })).toBeInTheDocument());
    });

    it("renders published database learning paths and signature programs", async () => {
        mocks.results.learning_paths = {
            data: [{
                id: "path-1",
                slug: "data-engineer",
                title: "Data Engineer",
                eyebrow: "CAREER PATHWAY",
                target_audience: "undergraduate",
                total_hours: 90,
                stages: [{ number: "01", title: "Data Foundations", hours: "90 Hours", learn: "Build data skills." }],
                certifications: ["Pass the assessment."],
                is_published: true,
                is_featured: false,
            }],
            error: null,
        };
        mocks.results.course_bundles = {
            data: [{
                id: "program-1",
                slug: "ai-signature",
                title: "Industry AI Program",
                program_type: "signature",
                audience: "undergraduate",
                tagline: "Learn by building.",
                description: "A live signature program.",
                roadmap: [{ stage: "PROGRAM STAGE", title: "Build", hours: "90 Hours", topics: ["AI"] }],
                is_published: true,
            }],
            error: null,
        };
        render(<CourseCatalogue items={catalogueItems} />);

        expect(await screen.findByRole("heading", { name: "Data Engineer" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Explore the Data Engineer learning path" })).toHaveAttribute("href", "/learning-paths/data-engineer");
        expect(await screen.findByText("Industry AI Program")).toBeInTheDocument();
        const industryProgram = screen.getByText("Industry AI Program").closest("article");
        expect(industryProgram).not.toBeNull();
        expect(within(industryProgram).getByRole("link", { name: /Explore Program/ })).toHaveAttribute("href", "/programs/ai-signature");
    });

    it("does not render the 3-Year Degree-Integrated signature section", async () => {
        mocks.results.course_bundles = {
            data: [{
                id: "degree-program-1",
                slug: "sprint-3-year-program",
                title: "SPRINT 3-Year Degree-Integrated Program",
                program_type: "signature",
                audience: "undergraduate",
                tagline: "Long-Term Academic & Industry Co-op",
                description: "A degree-integrated technology pathway.",
                roadmap: [],
                is_published: true,
            }],
            error: null,
        };
        render(<CourseCatalogue items={catalogueItems} />);

        await waitFor(() => {
            expect(screen.queryByText("SPRINT 3-Year Degree-Integrated Program")).not.toBeInTheDocument();
            expect(screen.queryByText("Long-Term Academic & Industry Co-op")).not.toBeInTheDocument();
        });
        expect(screen.getByText("SPRINT Career Accelerator")).toBeInTheDocument();
    });

    it("renders the six SPRINT RISE journey milestones in order", () => {
        render(<CourseCatalogue items={catalogueItems} />);

        const journey = screen.getByRole("region", { name: "SPRINT RISE Journey" });
        const milestones = within(journey).getByRole("list", {
            name: "Program milestones",
        });
        const titles = within(milestones)
            .getAllByRole("heading", { level: 4 })
            .map((heading) => heading.textContent);

        expect(titles).toEqual([
            "Day One",
            "Technical Sessions (124 hours)",
            "Personality Development (46 hours)",
            "Industry Ways of Working (40 hours)",
            "Internship (90 hours)",
            "Industry-Ready",
        ]);
        expect(
            within(
                screen
                    .getByText("SPRINT RISE")
                    .closest(".courses-signature-programs__panel"),
            ).getByRole("link", { name: /Explore Program/ }),
        ).toHaveAttribute("href", "/programs/sprint-rise");
    });

    it("renders the Career Accelerator phases and links to its detail page", () => {
        render(<CourseCatalogue items={catalogueItems} />);

        const programName = screen.getByText("SPRINT Career Accelerator");
        const panel = programName.closest(
            ".courses-signature-programs__panel--three-year",
        );

        expect(panel).not.toBeNull();
        expect(
            within(panel).getByRole("heading", {
                name: "From campus to corporate, with confidence.",
            }),
        ).toBeInTheDocument();
        expect(
            within(panel).getByText(/career-development program for B\.Tech and MCA students/),
        ).toBeInTheDocument();
        expect(
            within(panel).getByRole("link", { name: /Explore Program/ }),
        ).toHaveAttribute("href", "/programs/career-accelerator");
        const journey = within(panel).getByRole("region", {
            name: "Career Accelerator Journey",
        });
        const stages = within(journey).getByRole("list", {
            name: "SPRINT Career Accelerator phases",
        });
        const stageCards = within(stages).getAllByRole("listitem");

        expect(
            stageCards.map((card) => card.textContent.replace(/\s+/g, " ").trim()),
        ).toEqual([
            "Phase 1 — Foundations",
            "Phase 2 — Ignite",
            "Phase 3 — Outperform",
        ]);
        expect(stages.querySelectorAll("img")).toHaveLength(3);
    });

    it("keeps the audience selector above signature programs and separates catalogue groups", () => {
        render(<CourseCatalogue items={catalogueItems} />);

        const root = document.querySelector(".courses-page");
        const sectionOrder = Array.from(root.children)
            .map((element) => element.classList[0])
            .filter((className) =>
                [
                    "courses-hero",
                    "course-audience",
                    "courses-signature-programs",
                    "courses-content",
                    "courses-cta",
                ].includes(className),
            );
        const groups = Array.from(
            root.querySelectorAll(".courses-results__group-heading"),
        ).map((heading) => heading.textContent);

        expect(sectionOrder).toEqual([
            "courses-hero",
            "course-audience",
            "courses-signature-programs",
            "courses-content",
            "courses-cta",
        ]);
        expect(groups).toEqual(["Role-Based Learning Paths", "Career Bundles", "Individual & Modular Courses"]);
        expect(root.querySelectorAll(".course-audience")).toHaveLength(1);
    });

    it("filters distinct courses specifically for IT Professionals and Non-IT Professionals", async () => {
        const user = userEvent.setup();
        mocks.results.courses = {
            data: [
                {
                    ...databaseCourse,
                    id: "it-course",
                    slug: "advanced-k8s",
                    title: "Advanced Kubernetes in Production",
                    audience: "it-pro",
                    audience_type: "it-pro",
                },
                {
                    ...databaseCourse,
                    id: "non-it-course",
                    slug: "excel-to-python",
                    title: "Excel to Python Automation",
                    audience: "non-it",
                    audience_type: "non-it",
                },
            ],
            error: null,
        };

        render(<CourseCatalogue items={catalogueItems} />);

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: "Advanced Kubernetes in Production" })).not.toBeInTheDocument();
            expect(screen.queryByRole("heading", { name: "Excel to Python Automation" })).not.toBeInTheDocument();
        });

        await user.click(screen.getByRole("tab", { name: "IT Professionals" }));
        expect(await screen.findByRole("heading", { name: "Advanced Kubernetes in Production" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Excel to Python Automation" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Non-IT Professionals" }));
        expect(await screen.findByRole("heading", { name: "Excel to Python Automation" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Advanced Kubernetes in Production" })).not.toBeInTheDocument();
    });
});