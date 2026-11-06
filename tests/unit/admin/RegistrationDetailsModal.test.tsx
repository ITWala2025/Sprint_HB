import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEnrollmentRegistrationDetails: vi.fn(),
}));

vi.mock("@/app/admin/students/enrollments/actions", () => ({
  getEnrollmentRegistrationDetails: mocks.getEnrollmentRegistrationDetails,
}));

import RegistrationDetailsModal from "@/app/admin/students/enrollments/RegistrationDetailsModal";

describe("RegistrationDetailsModal", () => {
  it("renders Application ID in SPR-APP-YYMM-XXXX format and Linked Student Account ID as Student ID, never as UUID", async () => {
    mocks.getEnrollmentRegistrationDetails.mockResolvedValue({
      registration: {
        id: "77777777-1111-2222-3333-444444444444",
        application_id: "SPR-APP-2611-0012",
        application_number: "SPR-APP-2611-0012",
        student_id: "SPR-2026-0099",
        linked_student_id: "SPR-2026-0099",
        full_name: "Pooja Verma",
        email: "pooja@example.com",
        phone: "+91 9988776655",
        college_institution: "Ranchi University",
        course_degree: "B.Tech Computer Science",
        specialization_branch: "CSE",
        year_semester: "4th Semester",
        city: "Ranchi",
        state: "Jharkhand",
        employment_status: "Student",
        organization_name: null,
        source_of_info: "Social Media",
        terms_accepted: true,
        communication_consent: true,
        admin_notes: null,
        created_at: "2026-11-06T08:00:00Z",
        updated_at: "2026-11-06T08:00:00Z",
        status: "approved",
      },
      course: {
        title: "Full Stack Web Development",
        category: "Technology",
        difficulty_level: "Intermediate",
        duration: "16 Weeks",
        delivery_method: "Hybrid",
      },
      bundle: null,
      batch: null,
      enrollments: [],
    });

    const { container } = render(
      <RegistrationDetailsModal
        registrationId="77777777-1111-2222-3333-444444444444"
        onClose={vi.fn()}
      />
    );

    // Wait for data load
    expect(await screen.findByText("Personal Information")).toBeInTheDocument();

    // Verify Application ID has the required format
    expect(screen.getByText("Application ID")).toBeInTheDocument();
    expect(screen.getByText("SPR-APP-2611-0012")).toBeInTheDocument();

    // Verify Linked Student Account ID shows Student ID, NOT UUID
    expect(screen.getByText("Linked Student Account ID")).toBeInTheDocument();
    expect(screen.getByText("SPR-2026-0099")).toBeInTheDocument();

    // Verify NO raw UUID is leaked in the modal text
    expect(container.textContent).not.toContain("77777777-1111-2222-3333-444444444444");
    expect(container.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it("handles unlinked student accounts by displaying 'Not linked' rather than a UUID", async () => {
    mocks.getEnrollmentRegistrationDetails.mockResolvedValue({
      registration: {
        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        application_id: "SPR-APP-2611-0005",
        application_number: "SPR-APP-2611-0005",
        student_id: null,
        linked_student_id: "Not linked",
        full_name: "Vikram Malhotra",
        email: "vikram@example.com",
        phone: "+91 9876543210",
        college_institution: null,
        course_degree: null,
        specialization_branch: null,
        year_semester: null,
        city: null,
        state: null,
        employment_status: null,
        organization_name: null,
        source_of_info: null,
        terms_accepted: true,
        communication_consent: true,
        admin_notes: null,
        created_at: "2026-11-06T08:00:00Z",
        updated_at: "2026-11-06T08:00:00Z",
        status: "pending",
      },
      course: null,
      bundle: null,
      batch: null,
      enrollments: [],
    });

    const { container } = render(
      <RegistrationDetailsModal
        registrationId="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
        onClose={vi.fn()}
      />
    );

    expect(await screen.findByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Linked Student Account ID")).toBeInTheDocument();
    expect(screen.getByText("Not linked")).toBeInTheDocument();

    expect(container.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });
});
