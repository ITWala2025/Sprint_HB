import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import StudentsDirectoryTable from "@/app/admin/students/list/StudentsDirectoryTable";
import type { StudentDirectoryEntry } from "@/app/admin/students/list/actions";
import { activateStudent, deactivateStudent } from "@/app/admin/students/list/actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/permissions-context", () => ({
  useAdminPermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("@/app/admin/students/list/actions", () => ({
  activateStudent: vi.fn(),
  deactivateStudent: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

describe("StudentsDirectoryTable", () => {
  const mockStudents: StudentDirectoryEntry[] = [
    {
      id: "99999999-aaaa-bbbb-cccc-111111111111",
      studentId: "SPR-2026-0001",
      name: "Aarav Patel",
      email: "aarav@example.com",
      phone: "+91 9876543210",
      profiles: null,
      courseEnrolled: "Full Stack Web Development",
      activeCourses: [
        { kind: "course", title: "Full Stack Web Development" },
      ],
      status: "active",
      created_at: "2026-10-15T00:00:00.000Z",
      dateOfEnrollment: "15 Oct 2026",
      college: "BIT Sindri",
      registrationNumber: "SPR-2026-0001",
      degree: "B.Tech",
      specialization: "Computer Science",
      semester: "Final Year",
      city: "Dhanbad",
      state: "Jharkhand",
      employmentStatus: "Student",
      organization: "Not provided",
    },
    {
      id: "88888888-dddd-eeee-ffff-222222222222",
      studentId: "SPR-2026-0002",
      name: "Sneha Reddy",
      email: "sneha@example.com",
      phone: "+91 9123456789",
      profiles: null,
      courseEnrolled: "Applied AI & Cloud Engineering",
      activeCourses: [
        { kind: "bundle", title: "Applied AI & Cloud Engineering" },
      ],
      status: "active",
      created_at: "2026-10-20T00:00:00.000Z",
      dateOfEnrollment: "20 Oct 2026",
      college: "NIT Jamshedpur",
      registrationNumber: "SPR-2026-0002",
      degree: "B.Tech",
      specialization: "Electronics",
      semester: "3rd Year",
      city: "Jamshedpur",
      state: "Jharkhand",
      employmentStatus: "Student",
      organization: "Not provided",
    },
    {
      id: "77777777-eeee-ffff-0000-333333333333",
      studentId: "SPR-2026-0003",
      name: "Rohan Verma",
      email: "rohan@example.com",
      phone: "+91 9988776655",
      profiles: null,
      courseEnrolled: "Not enrolled",
      activeCourses: [],
      status: "active",
      created_at: "2026-11-01T00:00:00.000Z",
      dateOfEnrollment: "01 Nov 2026",
      college: "IIT Dhanbad",
      registrationNumber: "SPR-2026-0003",
      degree: "B.Tech",
      specialization: "Mechanical",
      semester: "2nd Year",
      city: "Dhanbad",
      state: "Jharkhand",
      employmentStatus: "Student",
      organization: "Not provided",
    },
  ];

  it("renders all required applicant and enrollment fields", () => {
    const { container } = render(<StudentsDirectoryTable students={mockStudents} />);

    // Check compact table headers
    expect(screen.getByRole("columnheader", { name: "Student ID" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "College / Institution & Degree" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Date of Enrollment" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
    for (const removedColumn of [
      "Specialization / Branch",
      "Semester / Year",
      "City",
      "State",
      "Employment Status",
      "Organization",
      "Enrolled Courses / Bundles",
    ]) {
      expect(screen.queryByRole("columnheader", { name: removedColumn })).not.toBeInTheDocument();
    }

    // Check row data
    expect(screen.getByText("SPR-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Aarav Patel")).toBeInTheDocument();
    expect(screen.getByText("aarav@example.com")).toBeInTheDocument();
    expect(screen.getByText("+91 9876543210")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBe(4);
    expect(screen.getByText("15 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("BIT Sindri")).toBeInTheDocument();
    expect(screen.getAllByText("B.Tech")).toHaveLength(3);

    // Verify mock strings are NOT rendered
    expect(container.textContent).not.toContain("General Technology Track");

    // Verify UUIDs are NEVER rendered in the DOM
    expect(container.textContent).not.toContain("99999999-aaaa-bbbb-cccc-111111111111");
    expect(container.textContent).not.toContain("88888888-dddd-eeee-ffff-222222222222");
    expect(container.textContent).not.toContain("77777777-eeee-ffff-0000-333333333333");
  });

  it("keeps horizontal scrolling inside the bounded table wrapper", () => {
    const { container } = render(<StudentsDirectoryTable students={mockStudents} />);
    const directory = screen.getByRole("region", { name: "Student directory" });
    const scrollContainer = directory.querySelector(".overflow-x-auto");
    const table = screen.getByRole("table");

    expect(directory).toHaveClass("w-full", "max-w-full", "min-w-0", "overflow-hidden");
    expect(scrollContainer).toHaveClass("w-full", "max-w-full", "overflow-x-auto");
    expect(table).toHaveClass("w-full", "table-fixed", "border-collapse");
    expect(table).not.toHaveClass("min-w-max");
    expect(container.querySelectorAll(".overflow-x-auto")).toHaveLength(1);
  });

  it("opens details modal with student information and does not show UUIDs", async () => {
    const user = userEvent.setup();
    const { container } = render(<StudentsDirectoryTable students={mockStudents} />);

    const detailsButton = screen.getByRole("button", { name: "View details for Aarav Patel" });
    await user.click(detailsButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Enrollment & Profile Information")).toBeInTheDocument();
    expect(screen.getAllByText("SPR-2026-0001").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("BIT Sindri")).toHaveLength(2);
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Final Year")).toBeInTheDocument();
    expect(screen.getByText("Dhanbad")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).getByText("Jharkhand")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Not provided")).toBeInTheDocument();
    expect(screen.getAllByText("Full Stack Web Development").length).toBeGreaterThanOrEqual(1);

    // Verify UUID is NOT in modal content
    expect(container.textContent).not.toContain("99999999-aaaa-bbbb-cccc-111111111111");
  });

  it("renders empty state message when student list is empty", () => {
    render(<StudentsDirectoryTable students={[]} />);
    expect(screen.getByText("No students match these filters.")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "No students match these filters." })).toHaveAttribute("colspan", "7");
  });

  it("searches across student fields and paginates filtered rows", async () => {
    const user = userEvent.setup();
    const additionalStudents = Array.from({ length: 13 }, (_, index) => ({
      ...mockStudents[0],
      id: `additional-${index}`,
      name: `Additional Student ${index + 1}`,
      registrationNumber: `SPR-EXTRA-${index + 1}`,
      studentId: `SPR-EXTRA-${index + 1}`,
      created_at: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    }));
    render(<StudentsDirectoryTable students={[...mockStudents, ...additionalStudents]} />);

    expect(screen.getByText("Showing 1–15 of 16 results")).toBeInTheDocument();
    expect(screen.queryByText("Additional Student 1")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "NEXT →" }));
    expect(screen.getByText("Additional Student 1")).toBeInTheDocument();
    expect(screen.getByText("Showing 16–16 of 16 results")).toBeInTheDocument();

    const search = screen.getByRole("searchbox", { name: "Search students" });
    await user.type(search, "SPR-2026-0001");
    expect(screen.getByText("Aarav Patel")).toBeInTheDocument();
    expect(screen.queryByText("Sneha Reddy")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1–1 of 1 results")).toBeInTheDocument();
  });

  it("moves students between active and deactivated views after status actions", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deactivateStudent).mockResolvedValue({
      success: true,
      message: "Student account deactivated.",
    });
    vi.mocked(activateStudent).mockResolvedValue({
      success: true,
      message: "Student account activated.",
    });
    const deactivatedStudent = {
      ...mockStudents[0],
      id: "66666666-ffff-0000-1111-444444444444",
      name: "Deactivated Student",
      status: "deactivated",
    };

    render(<StudentsDirectoryTable students={[mockStudents[0], deactivatedStudent]} />);

    expect(screen.getByRole("button", { name: "Active Students (1)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivated Students (1)" })).toBeInTheDocument();
    expect(screen.getByText("Aarav Patel")).toBeInTheDocument();
    expect(screen.queryByText("Deactivated Student")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deactivate student" }));
    await waitFor(() => expect(deactivateStudent).toHaveBeenCalledWith(mockStudents[0].id));
    await waitFor(() => expect(screen.getByRole("button", { name: "Active Students (0)" })).toBeInTheDocument());
    expect(screen.queryByText("Aarav Patel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deactivated Students (2)" }));
    expect(screen.getByText("Aarav Patel")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Activate student" })[0]);
    await waitFor(() => expect(activateStudent).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("button", { name: "Deactivated Students (1)" })).toBeInTheDocument());
  });
});
