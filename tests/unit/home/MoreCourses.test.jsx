import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MoreCourses from "@/components/Home/MoreCourses";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mocks.from }),
}));

const databaseCourses = [
  {
    slug: "latest-ai-course",
    title: "Latest AI Course",
    category: "Artificial Intelligence",
    description: "A current course with a remote thumbnail.",
    thumbnail_url: "https://images.example.org/latest-ai.jpg",
    duration: "8 weeks",
    difficulty_level: "Intermediate",
    delivery_method: "Online",
    certificate_included: false,
    rating: 5,
    review_count: 0,
    audience_type: "student",
  },
  {
    slug: "cloud-course",
    title: "Cloud Course",
    category: "Cloud Computing",
    description: "A cloud course description.",
    thumbnail_url: null,
    image: "/images/courses/abstract-code.svg",
    duration: "6 weeks",
    difficulty_level: "Beginner",
    delivery_method: "Hybrid",
    certificate_included: true,
    rating: 4.5,
    review_count: 12,
    audience_type: "student",
  },
  {
    slug: "security-course",
    title: "Security Course",
    category: "Cybersecurity",
    description: "A security course description.",
    thumbnail_url: null,
    duration: "4 weeks",
    difficulty_level: "Advanced",
    delivery_method: "Offline",
    audience_type: "student",
  },
];

describe("MoreCourses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limit.mockResolvedValue({ data: databaseCourses, error: null });
    mocks.order.mockReturnValue({ limit: mocks.limit });
    mocks.eq.mockReturnValue({ order: mocks.order });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
  });

  it("loads the latest published courses and renders navigable responsive cards", async () => {
    const { container } = render(<MoreCourses />);

    expect(await screen.findByRole("heading", { name: "Latest AI Course" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cloud Course" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Security Course" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(mocks.from).toHaveBeenCalledWith("courses");
    expect(mocks.select).toHaveBeenCalledWith("*");
    expect(mocks.eq).toHaveBeenCalledWith("is_published", true);
    expect(mocks.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(mocks.limit).toHaveBeenCalledWith(3);

    const latestCard = screen.getByRole("link", {
      name: "Know more about Latest AI Course",
    });
    expect(latestCard).toHaveAttribute("href", "/courses/latest-ai-course");
    expect(latestCard).toHaveTextContent("8 weeks");
    expect(latestCard).toHaveTextContent("Intermediate");
    expect(latestCard).toHaveTextContent("Online");
    expect(latestCard).not.toHaveTextContent("Certificate");
    expect(latestCard).not.toHaveTextContent("5");
    expect(
      screen.getByLabelText("4.5 out of 5 from 12 reviews"),
    ).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toHaveClass("text-brand-blue");
    expect(latestCard.querySelector(".bg-brand-red")).toHaveTextContent("Know More");
    expect(latestCard.querySelector(".flex.flex-wrap")).toHaveTextContent("Online");
    expect(latestCard.querySelector(".flex.flex-wrap")).toHaveTextContent("Intermediate");

    const image = screen.getByAltText("Latest AI Course course thumbnail");
    expect(image).toHaveAttribute("src", "https://images.example.org/latest-ai.jpg");
    fireEvent.error(image);
    await waitFor(() =>
      expect(image).toHaveAttribute("src", "/images/courses/abstract-ai.svg"),
    );
    expect(screen.getByAltText("Cloud Course course thumbnail")).toHaveAttribute(
      "src",
      "/images/courses/abstract-code.svg",
    );

    expect(container.querySelector(".max-w-\\[1200px\\]")).toBeInTheDocument();
    expect(container.querySelector(".sm\\:grid-cols-2.lg\\:grid-cols-3")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "View All Courses" })
        .every((link) => link.getAttribute("href") === "/courses"),
    ).toBe(true);
  });

  it("shows an empty state when no published courses are returned", async () => {
    mocks.limit.mockResolvedValue({ data: [], error: null });
    render(<MoreCourses />);

    expect(await screen.findByText("New learning paths are coming soon.")).toBeInTheDocument();
  });

  it("shows a graceful message when Supabase returns an error", async () => {
    mocks.limit.mockResolvedValue({ data: null, error: new Error("Database unavailable") });
    render(<MoreCourses />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Courses are temporarily unavailable.",
    );
  });
});