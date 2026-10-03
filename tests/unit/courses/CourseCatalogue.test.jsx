import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseCatalogue from "@/components/courses/CourseCatalogue";
import { catalogueItems } from "@/data/courses";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
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
        mocks.order.mockResolvedValue({
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
            }], error: null
        });
        mocks.eq.mockReturnValue({ order: mocks.order });
        mocks.select.mockReturnValue({ eq: mocks.eq });
        mocks.from.mockReturnValue({ select: mocks.select });
    });

    it("renders and filters published database courses using the public card model", async () => {
        const user = userEvent.setup();
        render(<CourseCatalogue items={catalogueItems} />);

        expect(await screen.findByRole("heading", { name: databaseCourse.title })).toBeInTheDocument();
        expect(mocks.from).toHaveBeenCalledWith("courses");
        expect(mocks.select).toHaveBeenCalledWith("*");
        expect(mocks.eq).toHaveBeenCalledWith("is_published", true);
        expect(mocks.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(screen.getByText("Course", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText("12 weeks")).toBeInTheDocument();
        expect(screen.getByText("Intermediate", { selector: ".course-tile__chips span" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: `Know more about ${databaseCourse.title}` })).toHaveAttribute("href", `/courses/${databaseCourse.slug}?audience=student`);

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
        mocks.order.mockResolvedValueOnce({ data: [], error: null });
        render(<CourseCatalogue items={catalogueItems} />);

        await waitFor(() => expect(screen.getByRole("heading", { name: "Python & AI Foundations" })).toBeInTheDocument());
    });

    it("renders the six SPRINT RISE journey milestones in order", () => {
        render(<CourseCatalogue items={catalogueItems} />);

        const journey = screen.getByRole("region", { name: "Program Journey" });
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
        ).toHaveAttribute("href", "#individual-modular-courses");
    });

    it("renders the SPRINT 3-Year journey stages in order with their year labels", () => {
        render(<CourseCatalogue items={catalogueItems} />);

        const programName = screen.getByText("SPRINT 3-Year Program");
        const panel = programName.closest(
            ".courses-signature-programs__panel--three-year",
        );

        expect(panel).not.toBeNull();
        expect(
            within(panel).getByRole("heading", {
                name: "A three-year learning journey",
            }),
        ).toBeInTheDocument();
        expect(
            within(panel).getByText(
                "Progress through Foundations in Year 1, Ignite in Year 2, and Outperform in Year 3.",
            ),
        ).toBeInTheDocument();
        expect(
            within(panel).getByRole("link", { name: /Explore Program/ }),
        ).toHaveAttribute("href", "#individual-modular-courses");
        const journey = within(panel).getByRole("region", {
            name: "3-Year Program Journey",
        });
        const stages = within(journey).getByRole("list", {
            name: "SPRINT 3-Year Program stages",
        });
        const stageCards = within(stages).getAllByRole("listitem");

        expect(
            stageCards.map((card) => card.textContent.replace(/\s+/g, " ").trim()),
        ).toEqual([
            "Foundations · Year 1",
            "Ignite · Year 2",
            "Outperform · Year 3",
        ]);
        expect(stages.querySelectorAll("img")).toHaveLength(3);
    });
});