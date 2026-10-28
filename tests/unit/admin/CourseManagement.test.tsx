import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseManagementPage from "@/app/admin/courses/page";
import { generateSlug, normalizeBundle } from "@/lib/course-utils";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({ from: mocks.from }),
}));

vi.mock("@/app/admin/permissions-context", () => ({
    useAdminPermissions: () => ({ hasPermission: () => true }),
}));

const course = {
    id: "course-1",
    slug: "applied-machine-learning",
    title: "Applied Machine Learning",
    category: "Artificial Intelligence & ML",
    difficulty_level: "Intermediate",
    audience: "undergraduate",
    audience_type: "undergraduate",
    delivery_method: "Hybrid",
    duration: "8 weeks",
    description: "Build practical machine learning skills.",
    long_description: "",
    prerequisites: "Python fundamentals",
    tools: ["Python"],
    curriculum: [{ title: "Model foundations", sessions: 4 }],
    outcomes: ["Train baseline models"],
    is_featured: false,
    is_published: true,
    pathway: null,
    target_role: null,
    certificate_included: true,
    thumbnail_url: null,
};

describe("CourseManagementPage", () => {
    beforeEach(() => {
        mocks.from.mockImplementation((table: string) => ({
            select: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({
                    data: table === "courses" ? [course] : [],
                    error: null,
                }),
            })),
            update: mocks.update,
            insert: mocks.insert,
            delete: vi.fn(() => ({ eq: mocks.eq })),
        }));
        mocks.eq.mockResolvedValue({ error: null });
        mocks.single.mockResolvedValue({ data: { ...course, id: "new-course" }, error: null });
        mocks.update.mockReturnValue({ eq: mocks.eq });
        mocks.insert.mockReturnValue({ select: () => ({ single: mocks.single }) });
    });

    it("normalizes course titles into editable URL slugs", () => {
        expect(generateSlug("  Applied Machine Learning! ")).toBe("applied-machine-learning");
    });

    it("normalizes bundle audience aliases in the requested precedence order", () => {
        expect(normalizeBundle({
            slug: "career-package",
            audience_type: "working_professional",
            target_audience: "undergraduate",
        }).audience).toBe("working_professional");
    });

    it("creates courses with both audience columns and a difficulty fallback", async () => {
        const user = userEvent.setup();
        render(<CourseManagementPage />);

        await user.click(screen.getByRole("button", { name: /add course/i }));
        await user.type(screen.getByPlaceholderText("e.g. Docker & Kubernetes"), "Docker & Kubernetes");
        await user.type(screen.getByPlaceholderText("e.g. 12 weeks"), "12 weeks");
        await user.type(screen.getByPlaceholderText("A concise overview for course cards"), "Container platform foundations.");
        await user.click(screen.getByRole("button", { name: "Save Course" }));

        await waitFor(() => expect(mocks.insert).toHaveBeenCalled());
        const insertedCourse = mocks.insert.mock.calls[0][0];
        expect(insertedCourse.audience).toBe("undergraduate");
        expect(insertedCourse.audience_type).toBe("undergraduate");
        expect(insertedCourse.difficulty_level).toBe("Beginner");
        expect(await screen.findByRole("status")).toHaveTextContent("created successfully");
    });

    it("filters the loaded list immediately by title and updates featured status", async () => {
        const user = userEvent.setup();
        render(<CourseManagementPage />);

        expect(await screen.findByText("Applied Machine Learning")).toBeInTheDocument();
        expect(screen.getByText("Course", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText(course.description)).toHaveClass("course-tile__description");
        expect(screen.getByText("Python", { selector: "span" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Toggle Publish" }));
        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ is_published: false }));
        await user.click(screen.getByRole("button", { name: "Table view" }));
        expect(screen.getByRole("columnheader", { name: "Target Audience" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Mode & Level" })).toBeInTheDocument();
        expect(screen.getByText("Undergraduate", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText(/Hybrid.*Intermediate/)).toBeInTheDocument();
        expect(screen.queryByRole("columnheader", { name: /price/i })).not.toBeInTheDocument();
        await user.type(screen.getByRole("searchbox"), "kubernetes");
        expect(screen.getByText("No courses match these filters.")).toBeInTheDocument();

        await user.clear(screen.getByRole("searchbox"));
        await user.click(screen.getByRole("button", { name: "Feature Applied Machine Learning" }));

        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ is_featured: true }));
        expect(await screen.findByRole("status")).toHaveTextContent("featured");
    });

    it("creates and publishes learning paths with stage hours derived from free-text values", async () => {
        const user = userEvent.setup();
        render(<CourseManagementPage />);
        await user.click(screen.getByRole("tab", { name: /role-based learning paths/i }));
        await user.click(screen.getByRole("button", { name: /add learning path/i }));
        await user.type(screen.getByLabelText("Title"), "AI Engineer");
        await user.click(screen.getByRole("button", { name: "Add Stage" }));
        await user.type(screen.getByPlaceholderText("Applied Machine Learning & Scikit-Learn"), "Applied Machine Learning & Scikit-Learn");
        await user.type(screen.getByPlaceholderText("60 Hours"), "60 Hours");
        await user.type(screen.getByPlaceholderText("Core statistical modeling, regression, classification..."), "Core statistical modeling, regression");
        await user.click(screen.getByRole("button", { name: "Add Certification Requirement" }));
        await user.type(screen.getByPlaceholderText("Stage title: Passing score on the practical assessment."), "Applied Machine Learning: Passing score on the practical assessment.");
        await user.click(screen.getByRole("button", { name: "Save Learning Path" }));

        await waitFor(() => expect(mocks.from).toHaveBeenCalledWith("learning_paths"));
        expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
            title: "AI Engineer",
            slug: "ai-engineer",
            total_hours: 60,
            stages: [expect.objectContaining({ title: "Applied Machine Learning & Scikit-Learn", hours: "60 Hours" })],
            certifications: ["Applied Machine Learning: Passing score on the practical assessment."],
        }));
    });
});