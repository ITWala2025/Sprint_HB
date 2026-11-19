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
      profiles: null,
      courseEnrolled: "Full Stack Web Development",
      activeCourses: [
        { kind: "course", title: "Full Stack Web Development" },
      ],
      status: "active",
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

    // Check table headers
    expect(screen.getByRole("columnheader", { name: "Student ID" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Full Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Phone Number" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "College / Institution" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Degree" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Specialization / Branch" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Semester / Year" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "City" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "State" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Employment Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Organization" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Enrolled Courses / Bundles" })).toBeInTheDocument();
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
    expect(screen.getAllByText("BIT Sindri")).toHaveLength(2);

    // Verify UUID is NOT in modal content
    expect(container.textContent).not.toContain("99999999-aaaa-bbbb-cccc-111111111111");
  });

  it("renders empty state message when student list is empty", () => {
    render(<StudentsDirectoryTable students={[]} />);
    expect(screen.getByText("No verified active students are available.")).toBeInTheDocument();
  });
});
