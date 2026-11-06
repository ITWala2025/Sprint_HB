import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import StudentsDirectoryTable from "@/app/admin/students/list/StudentsDirectoryTable";
import type { StudentDirectoryEntry } from "@/app/admin/students/list/actions";

describe("StudentsDirectoryTable", () => {
  const mockStudents: StudentDirectoryEntry[] = [
    {
      id: "99999999-aaaa-bbbb-cccc-111111111111",
      studentId: "SPR-2026-0001",
      name: "Aarav Patel",
      email: "aarav@example.com",
      phone: "+91 9876543210",
      courseEnrolled: "Full Stack Web Development",
      activeCourses: [
        { kind: "course", title: "Full Stack Web Development" },
      ],
      status: "active",
      dateOfEnrollment: "15 Oct 2026",
      college: "BIT Sindri",
      registrationNumber: "SPR-2026-0001",
    },
    {
      id: "88888888-dddd-eeee-ffff-222222222222",
      studentId: "SPR-2026-0002",
      name: "Sneha Reddy",
      email: "sneha@example.com",
      phone: "+91 9123456789",
      courseEnrolled: "Applied AI & Cloud Engineering",
      activeCourses: [
        { kind: "bundle", title: "Applied AI & Cloud Engineering" },
      ],
      status: "active",
      dateOfEnrollment: "20 Oct 2026",
      college: "NIT Jamshedpur",
      registrationNumber: "SPR-2026-0002",
    },
    {
      id: "77777777-eeee-ffff-0000-333333333333",
      studentId: "SPR-2026-0003",
      name: "Rohan Verma",
      email: "rohan@example.com",
      phone: "+91 9988776655",
      courseEnrolled: "Not enrolled",
      activeCourses: [],
      status: "active",
      dateOfEnrollment: "01 Nov 2026",
      college: "IIT Dhanbad",
      registrationNumber: "SPR-2026-0003",
    },
  ];

  it("renders all required columns: Student ID, Name, Contact, Course enrolled in, status, date of enrollment", () => {
    const { container } = render(<StudentsDirectoryTable students={mockStudents} />);

    // Check table headers
    expect(screen.getByRole("columnheader", { name: "Student ID" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Course Enrolled In" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Date of Enrollment" })).toBeInTheDocument();

    // Check row data
    expect(screen.getByText("SPR-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Aarav Patel")).toBeInTheDocument();
    expect(screen.getByText("aarav@example.com")).toBeInTheDocument();
    expect(screen.getByText("+91 9876543210")).toBeInTheDocument();
    expect(screen.getByText("Full Stack Web Development")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBe(3);
    expect(screen.getByText("15 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("Not enrolled")).toBeInTheDocument();

    // Verify mock strings are NOT rendered
    expect(container.textContent).not.toContain("General Technology Track");

    // Verify UUIDs are NEVER rendered in the DOM
    expect(container.textContent).not.toContain("99999999-aaaa-bbbb-cccc-111111111111");
    expect(container.textContent).not.toContain("88888888-dddd-eeee-ffff-222222222222");
    expect(container.textContent).not.toContain("77777777-eeee-ffff-0000-333333333333");
  });

  it("opens details modal with student information and does not show UUIDs", async () => {
    const user = userEvent.setup();
    const { container } = render(<StudentsDirectoryTable students={mockStudents} />);

    const detailsButton = screen.getByRole("button", { name: "View details for Aarav Patel" });
    await user.click(detailsButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Enrollment & Profile Information")).toBeInTheDocument();
    expect(screen.getAllByText("SPR-2026-0001").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("BIT Sindri")).toBeInTheDocument();

    // Verify UUID is NOT in modal content
    expect(container.textContent).not.toContain("99999999-aaaa-bbbb-cccc-111111111111");
  });

  it("renders empty state message when student list is empty", () => {
    render(<StudentsDirectoryTable students={[]} />);
    expect(screen.getByText("No verified active students are available.")).toBeInTheDocument();
  });
});
