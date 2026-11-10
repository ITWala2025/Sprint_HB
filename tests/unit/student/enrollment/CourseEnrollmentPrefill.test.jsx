import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CourseApplicationForm from "@/components/courses/CourseApplicationForm";
import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";
import EducationStep from "@/components/student/enrollment/steps/EducationStep";
import StudentEnrollPage from "@/app/student/enroll/page";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  profile: vi.fn(),
  courseRows: vi.fn(),
  checkEnrollmentEmailAction: vi.fn(),
  submitStudentEnrollmentAction: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.routerPush }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: (table) => ({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: table === "courses" ? mocks.courseRows() : null,
              error: null,
            }),
          maybeSingle: () =>
            Promise.resolve({
              data: table === "profiles" ? mocks.profile() : null,
              error: null,
            }),
        }),
      }),
    }),
    auth: {
      getSession: mocks.getSession,
    },
  }),
}));

vi.mock("@/app/student/enroll/actions", () => ({
  checkEnrollmentEmailAction: mocks.checkEnrollmentEmailAction,
  submitStudentEnrollmentAction: mocks.submitStudentEnrollmentAction,
}));

function EducationStepHarness({ courseSlug }) {
  const [course, setCourse] = useState("");
  const onChange = (field) => (event) => {
    if (field === "course") setCourse(event.target.value);
  };

  return (
    <EducationStep
      idPrefix="education"
      values={{ course }}
      errors={{}}
      onChange={onChange}
      courseSlug={courseSlug}
    />
  );
}

describe("course enrollment prefill", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.profile.mockReturnValue(null);
    mocks.courseRows.mockReturnValue([]);
    mocks.checkEnrollmentEmailAction.mockResolvedValue({
      success: true,
      exists: false,
    });
    mocks.submitStudentEnrollmentAction.mockResolvedValue({
      success: true,
      applicationId: "SPR-APP-TEST",
      message: "Registration saved.",
      hasCourseEnrollment: false,
    });
  });

  it.each([
    ["java-programming-foundations", "student"],
    ["cloud-fundamentals", undefined],
  ])("links %s to enrollment with the new CTA text", (slug, audience) => {
    render(<CourseApplicationForm slug={slug} audience={audience} />);

    const link = screen.getByRole("link", { name: "Enroll for this course" });
    const query = new URLSearchParams({ course: slug });
    if (audience) query.set("audience", audience);
    expect(link).toHaveAttribute("href", `/student/enroll?${query.toString()}`);
  });

  it("passes the enrollment URL course slug into the wizard", async () => {
    const page = await StudentEnrollPage({
      searchParams: Promise.resolve({ course: "java-programming-foundations" }),
    });

    expect(page.props.courseSlug).toBe("java-programming-foundations");
  });

  it("preselects a matching local course and leaves an unknown slug empty", async () => {
    mocks.courseRows.mockReturnValue([
      {
        id: "java-course-id",
        title: "Java Programming Foundations",
        slug: "java-programming-foundations",
      },
    ]);
    const { unmount } = render(
      <EducationStepHarness courseSlug="java-programming-foundations" />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Course$/)).toHaveValue("java-course-id");
    });

    unmount();
    mocks.courseRows.mockReturnValue([
      {
        id: "react-db-id",
        title: "React and Next.js Applications",
        slug: "react-and-nextjs-applications",
      },
    ]);
    render(<EducationStepHarness courseSlug="react-and-nextjs-applications" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/^Course$/)).toHaveValue("");
    });
  });

  it("lets a matching database-only URL course override a draft once and preserves later manual changes", async () => {
    const courseRows = [
      {
        id: "draft-course-id",
        title: "Draft Course",
        slug: "draft-course",
      },
      {
        id: "url-course-id",
        title: "URL Course",
        slug: "database-only-url-course",
      },
      {
        id: "manual-course-id",
        title: "Manual Course",
        slug: "manual-course",
      },
    ];
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "student-1",
            email: "student@example.com",
            email_confirmed_at: "2026-01-01T00:00:00.000Z",
          },
        },
      },
      error: null,
    });
    mocks.profile.mockReturnValue({
      full_name: "Student Example",
      email: "student@example.com",
    });
    mocks.courseRows.mockReturnValue(courseRows);
    window.sessionStorage.setItem(
      "student_enrollment_draft",
      JSON.stringify({
        values: {
          personal: {
            firstName: "Student",
            lastName: "Example",
            email: "student@example.com",
            dob: "2000-01-01",
            country: "India",
            state: "Jharkhand",
            phone: "9876543210",
          },
          education: {
            collegeInstitution: "",
            courseDegree: "",
            semesterYear: "",
            currentRole: "",
            course: "draft-course-id",
          },
        },
      }),
    );

    const user = userEvent.setup();
    const firstRender = render(
      <EnrollmentWizard courseSlug="database-only-url-course" />,
    );
    expect(await screen.findByText(/email verified\. you can continue/i)).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: /^continue$/i }));
    const courseSelect = await screen.findByLabelText(/^Course$/);

    await waitFor(() => expect(courseSelect).toHaveValue("url-course-id"));
    await user.selectOptions(courseSelect, "manual-course-id");
    await waitFor(() => {
      const savedDraft = JSON.parse(
        window.sessionStorage.getItem("student_enrollment_draft"),
      );
      expect(savedDraft.values.education.course).toBe("manual-course-id");
    });

    firstRender.unmount();
    render(<EnrollmentWizard courseSlug="database-only-url-course" />);
    expect(await screen.findByText(/email verified\. you can continue/i)).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: /^continue$/i }));
    expect(await screen.findByLabelText(/^Course$/)).toHaveValue(
      "manual-course-id",
    );
  });

  it("prefills a verified student's profile and skips OTP and password setup", async () => {
    const user = userEvent.setup();
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "student-1",
            email: "ananya@example.com",
            email_confirmed_at: "2026-01-01T00:00:00.000Z",
          },
        },
      },
      error: null,
    });
    mocks.profile.mockReturnValue({
      full_name: "Ananya Sharma",
      email: "ananya@example.com",
      phone: "+91 9876543210",
      dob: "2004-06-15",
      country: "India",
      state: "Jharkhand",
      college: "SPRINT College",
      degree: "B.Tech",
      semester: "Third Year",
    });

    const firstRender = render(
      <EnrollmentWizard courseSlug="java-programming-foundations" />,
    );

    expect(await screen.findByLabelText(/First Name/i)).toHaveValue("Ananya");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Sharma");
    expect(screen.getByLabelText(/email address/i)).toHaveValue(
      "ananya@example.com",
    );
    expect(screen.getByLabelText(/email address/i)).toBeEnabled();
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue("2004-06-15");
    expect(screen.getByLabelText(/^state/i)).toHaveValue("Jharkhand");
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("9876543210");
    expect(
      screen.queryByRole("button", { name: /send verification code/i }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText(/email verified\. you can continue/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(
      await screen.findByRole("heading", {
        name: "Education & Career Profile",
      }),
    ).toBeInTheDocument();
    const courseSelect = await screen.findByLabelText(/^Course$/);
    await user.selectOptions(courseSelect, "cloud-fundamentals");
    await waitFor(() => {
      expect(
        JSON.parse(
          window.sessionStorage.getItem("student_enrollment_draft"),
        ).values.education.course,
      ).toBe("cloud-fundamentals");
    });

    firstRender.unmount();
    render(<EnrollmentWizard courseSlug="java-programming-foundations" />);
    expect(await screen.findByText(/email verified\. you can continue/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(await screen.findByLabelText(/^Course$/)).toHaveValue(
      "cloud-fundamentals",
    );

    expect(
      screen.queryByRole("heading", { name: /create your password/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the OTP option for logged-out users without sending a code", async () => {
    render(<EnrollmentWizard />);
    fireEvent.change(await screen.findByLabelText(/email address/i), {
      target: { value: "new.student@example.com" },
    });

    expect(
      await screen.findByRole("button", { name: /send verification code/i }),
    ).toBeInTheDocument();
  });
});
